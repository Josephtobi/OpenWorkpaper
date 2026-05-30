import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

type SourceAudit = Prisma.AuditGetPayload<{
  include: {
    teamMembers: true;
    templateApplications: true;
    procedureGroups: {
      include: {
        procedures: {
          include: {
            questions: {
              include: {
                citations: true;
              };
            };
          };
        };
      };
    };
    procedures: {
      include: {
        questions: {
          include: {
            citations: true;
          };
        };
      };
    };
  };
}>;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;

  const isGlobalManager = user.role === 'Business Operations';

  let whereClause = {};
  
  if (!isGlobalManager) {
    whereClause = {
      teamMembers: {
        some: {
          userId: user.id
        }
      }
    };
  }

  const audits = await prisma.audit.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(audits);
}

export async function POST(req: Request) {
  const session = await getSession();
  
  const canCreateAudits = session?.user?.role === 'Business Operations';
  
  if (!canCreateAudits) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();
  let audit;

  if (typeof data.carryForwardFromAuditId === 'string' && data.carryForwardFromAuditId.trim()) {
    const sourceAudit = await prisma.audit.findUnique({
      where: { id: data.carryForwardFromAuditId },
      include: {
        teamMembers: {
          orderBy: { createdAt: 'asc' }
        },
        templateApplications: {
          orderBy: { appliedAt: 'asc' }
        },
        procedureGroups: {
          orderBy: [{ phase: 'asc' }, { displayOrder: 'asc' }],
          include: {
            procedures: {
              orderBy: { displayOrder: 'asc' },
              include: {
                questions: {
                  orderBy: { displayOrder: 'asc' },
                  include: {
                    citations: {
                      orderBy: { displayOrder: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        procedures: {
          where: { groupId: null },
          orderBy: [{ phase: 'asc' }, { displayOrder: 'asc' }],
          include: {
            questions: {
              orderBy: { displayOrder: 'asc' },
              include: {
                citations: {
                  orderBy: { displayOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!sourceAudit) {
      return NextResponse.json({ error: 'Source audit not found for carryforward' }, { status: 404 });
    }

    audit = await prisma.$transaction(async (tx) => {
      const createdAudit = await tx.audit.create({
        data: {
          title: data.title || `${sourceAudit.title} (Carryforward)`,
          description: data.description ?? sourceAudit.description,
          category: data.category ?? sourceAudit.category,
          auditNumber: data.auditNumber ?? null,
          objective: data.objective ?? sourceAudit.objective,
          status: data.status || 'In Progress',
          fieldworkStartDate: null,
          fieldworkEndDate: null,
          reportIssuedDate: null,
          milestoneAttachmentUrl: null,
          milestoneAttachmentName: null,
          pbcAttachmentUrl: null,
          pbcAttachmentName: null,
        }
      });

      const teamMemberIdMap = new Map<string, string>();
      for (const member of sourceAudit.teamMembers) {
        const createdMember = await tx.teamMember.create({
          data: {
            auditId: createdAudit.id,
            userId: member.userId,
            name: member.name,
            role: member.role,
            email: member.email,
          }
        });
        teamMemberIdMap.set(member.id, createdMember.id);
      }

      const cloneProcedure = async (
        sourceProcedure: SourceAudit['procedures'][number],
        newGroupId: string | null
      ) => {
        const createdProcedure = await tx.procedure.create({
          data: {
            auditId: createdAudit.id,
            groupId: newGroupId,
            phase: sourceProcedure.phase,
            title: sourceProcedure.title,
            purpose: sourceProcedure.purpose,
            source: sourceProcedure.source,
            scope: sourceProcedure.scope,
            methodology: sourceProcedure.methodology,
            results: null,
            conclusions: null,
            status: 'Not Started',
            preparedBy: null,
            preparedDate: null,
            reviewedBy: null,
            reviewedDate: null,
            assignedToId: sourceProcedure.assignedToId ? (teamMemberIdMap.get(sourceProcedure.assignedToId) || null) : null,
            displayOrder: sourceProcedure.displayOrder,
          }
        });

        for (const question of sourceProcedure.questions) {
          const createdQuestion = await tx.procedureQuestion.create({
            data: {
              procedureId: createdProcedure.id,
              templateQuestionId: question.templateQuestionId,
              prompt: question.prompt,
              guidance: question.guidance,
              questionType: question.questionType,
              isRequired: question.isRequired,
              expectedEvidenceCount: question.expectedEvidenceCount,
              expectedEvidenceTypes: question.expectedEvidenceTypes,
              assertionTags: question.assertionTags,
              riskRating: question.riskRating,
              controlType: question.controlType,
              responseText: null,
              responseBoolean: null,
              responseNumber: null,
              responseDate: null,
              responseSelection: null,
              exceptionFlag: false,
              exceptionNarrative: null,
              validationStatus: 'Pending',
              reviewerStatus: 'Pending',
              displayOrder: question.displayOrder,
            }
          });

          if (question.citations.length > 0) {
            await tx.procedureQuestionCitation.createMany({
              data: question.citations.map((citation) => ({
                procedureQuestionId: createdQuestion.id,
                standardType: citation.standardType,
                reference: citation.reference,
                jurisdiction: citation.jurisdiction,
                displayOrder: citation.displayOrder,
              }))
            });
          }
        }
      };

      for (const sourceGroup of sourceAudit.procedureGroups) {
        const createdGroup = await tx.procedureGroup.create({
          data: {
            auditId: createdAudit.id,
            phase: sourceGroup.phase,
            title: sourceGroup.title,
            displayOrder: sourceGroup.displayOrder,
          }
        });

        for (const sourceProcedure of sourceGroup.procedures) {
          await cloneProcedure(sourceProcedure, createdGroup.id);
        }
      }

      for (const sourceProcedure of sourceAudit.procedures) {
        await cloneProcedure(sourceProcedure, null);
      }

      if (sourceAudit.templateApplications.length > 0) {
        await tx.templateApplication.createMany({
          data: sourceAudit.templateApplications.map((application) => ({
            auditId: createdAudit.id,
            templateId: application.templateId,
            templateVersion: application.templateVersion,
            appliedPhase: application.appliedPhase,
            appliedBy: session?.user?.username || application.appliedBy || 'System',
          }))
        });
      }

      return createdAudit;
    });
  } else {
    audit = await prisma.audit.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        auditNumber: data.auditNumber,
        objective: data.objective,
        status: data.status || 'In Progress',
      }
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'AUDIT',
      entityId: audit.id,
      details: data.carryForwardFromAuditId
        ? `Created audit via carryforward from ${data.carryForwardFromAuditId}: ${audit.title}`
        : `Created audit: ${audit.title}`,
      performedBy: session?.user?.username || 'System',
    }
  });

  return NextResponse.json(audit);
}
