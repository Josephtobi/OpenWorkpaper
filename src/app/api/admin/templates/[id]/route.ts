import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  buildDefaultQuestionFromProcedure,
  normalizeQuestionType,
  parseBracketCitations,
  type CitationInput,
  type TemplateQuestionInput,
} from '@/lib/compliance';

interface TemplateProcedureInput {
  title: string;
  purpose: string | null;
  source?: string | null;
  questions?: TemplateQuestionInput[];
}

interface TemplateGroupInput {
  phase: string;
  title: string;
  procedures: TemplateProcedureInput[];
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  console.log(`[API/Templates/${params.id}] GET request received`);
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const template = await prisma.auditTemplate.findUnique({
      where: { id: params.id },
      include: {
        groups: {
          orderBy: { displayOrder: 'asc' },
          include: {
            procedures: {
              orderBy: { displayOrder: 'asc' },
              include: {
                questions: {
                  orderBy: { displayOrder: 'asc' },
                  include: {
                    citations: { orderBy: { displayOrder: 'asc' } }
                  }
                }
              }
            }
          }
        },
        procedures: {
          where: { groupId: null },
          orderBy: { displayOrder: 'asc' },
          include: {
            questions: {
              orderBy: { displayOrder: 'asc' },
              include: {
                citations: { orderBy: { displayOrder: 'asc' } }
              }
            }
          }
        }
      }
    });

    if (!template) {
      console.warn(`[API/Templates/${params.id}] Template not found`);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    console.log(`[API/Templates/${params.id}] Found template: ${template.name} with ${template.groups.length} groups`);
    return NextResponse.json(template);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API/Templates/${params.id}] GET Error:`, message);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const canManageTemplates = session?.user?.role === 'Business Operations';

  if (!session || !canManageTemplates) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, description, groups }: { name: string, description: string, groups: TemplateGroupInput[] } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const normalizedGroups = (groups || []).map((g) => ({
      ...g,
      title: g.title?.trim() || 'Untitled Group',
      procedures: (g.procedures || []).map((p) => {
        const questions = (p.questions || []).length > 0
          ? p.questions
          : [buildDefaultQuestionFromProcedure({ title: p.title, purpose: p.purpose })];
        return {
          ...p,
          title: p.title?.trim() || 'Untitled Procedure',
          purpose: p.purpose || '',
          source: p.source || '',
          questions,
        };
      }),
    }));

    const result = await prisma.$transaction(async (tx) => {
      // Update template details
      await tx.auditTemplate.update({
        where: { id: params.id },
        data: { name: name.trim(), description, version: { increment: 1 } }
      });

      // Clear existing structure
      await tx.templateProcedure.deleteMany({ where: { templateId: params.id } });
      await tx.templateGroup.deleteMany({ where: { templateId: params.id } });

      // Create new groups and procedures
      if (normalizedGroups.length > 0) {
        for (const [gIndex, g] of normalizedGroups.entries()) {
          const group = await tx.templateGroup.create({
            data: {
              templateId: params.id,
              phase: g.phase,
              title: g.title,
              displayOrder: gIndex
            }
          });

          if (g.procedures && Array.isArray(g.procedures)) {
            for (const [pIndex, p] of g.procedures.entries()) {
              const procedure = await tx.templateProcedure.create({
                data: {
                  templateId: params.id,
                  groupId: group.id,
                  phase: g.phase,
                  title: p.title,
                  purpose: p.purpose,
                  source: p.source || '',
                  displayOrder: pIndex,
                }
              });

              for (const [qIndex, question] of (p.questions || []).entries()) {
                const citations: CitationInput[] = (question.citations && question.citations.length > 0)
                  ? question.citations
                  : parseBracketCitations(question.guidance || p.purpose);

                const createdQuestion = await tx.templateProcedureQuestion.create({
                  data: {
                    templateProcedureId: procedure.id,
                    prompt: question.prompt?.trim() || p.title || 'Untitled control prompt',
                    guidance: question.guidance || null,
                    questionType: normalizeQuestionType(question.questionType),
                    isRequired: question.isRequired ?? true,
                    expectedEvidenceCount: Number(question.expectedEvidenceCount ?? 0),
                    expectedEvidenceTypes: question.expectedEvidenceTypes || null,
                    assertionTags: question.assertionTags || null,
                    riskRating: question.riskRating || 'Moderate',
                    controlType: question.controlType || 'Substantive',
                    displayOrder: question.displayOrder ?? qIndex,
                  }
                });

                if (citations.length > 0) {
                  await tx.templateQuestionCitation.createMany({
                    data: citations.map((citation, citationIndex) => ({
                      templateQuestionId: createdQuestion.id,
                      standardType: citation.standardType,
                      reference: citation.reference,
                      jurisdiction: citation.jurisdiction || null,
                      displayOrder: citationIndex,
                    }))
                  });
                }
              }
            }
          }
        }
      }

      // Fetch and return the fully populated template
      return await tx.auditTemplate.findUnique({
        where: { id: params.id },
        include: {
          groups: {
            orderBy: { displayOrder: 'asc' },
            include: {
              procedures: {
                orderBy: { displayOrder: 'asc' },
                include: {
                  questions: {
                    orderBy: { displayOrder: 'asc' },
                    include: {
                      citations: { orderBy: { displayOrder: 'asc' } }
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    if (!result) {
      return NextResponse.json({ error: 'Template not found after update' }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'TEMPLATE',
        entityId: params.id,
        details: `Updated audit template structure: ${result.name}`,
        performedBy: session.user.username,
      }
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update template error:', error);
    return NextResponse.json({ error: 'Failed to update template', details: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  const canManageTemplates = session?.user?.role === 'Business Operations';

  if (!session || !canManageTemplates) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const template = await prisma.auditTemplate.delete({
      where: { id: params.id }
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'TEMPLATE',
        entityId: params.id,
        details: `Deleted audit template: ${template.name}`,
        performedBy: session.user.username,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete template', details: message }, { status: 500 });
  }
}
