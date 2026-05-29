import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import type { Procedure } from '@prisma/client';
import { buildDefaultQuestionFromProcedure, normalizeQuestionType, parseBracketCitations } from '@/lib/compliance';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { templateId, phase }: { templateId: string, phase?: string } = await req.json();
    
    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    const template = await prisma.auditTemplate.findUnique({
      where: { id: templateId },
      include: { 
        groups: {
          include: {
            procedures: {
              include: {
                questions: {
                  include: { citations: true },
                  orderBy: { displayOrder: 'asc' }
                }
              }
            }
          }
        },
        procedures: {
          where: { groupId: null },
          include: {
            questions: {
              include: { citations: true },
              orderBy: { displayOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const createdProcedures: Procedure[] = [];

    await prisma.$transaction(async (tx) => {
      // 1. Process Groups
      const templateGroups = phase 
        ? template.groups.filter(g => g.phase === phase)
        : template.groups;

      for (const tg of templateGroups) {
        const group = await tx.procedureGroup.create({
          data: {
            auditId: params.id,
            phase: tg.phase,
            title: tg.title,
            displayOrder: tg.displayOrder
          }
        });

        const procs = await Promise.all(
          tg.procedures.map(async (tp) => {
            const created = await tx.procedure.create({
              data: {
                auditId: params.id,
                groupId: group.id,
                phase: tp.phase,
                title: tp.title,
                purpose: tp.purpose,
                source: tp.source,
              }
            });

            const questions = tp.questions.length > 0
              ? tp.questions
              : [buildDefaultQuestionFromProcedure({ title: tp.title, purpose: tp.purpose })];

            for (const [qIndex, question] of questions.entries()) {
              const createdQuestion = await tx.procedureQuestion.create({
                data: {
                  procedureId: created.id,
                  templateQuestionId: 'id' in question ? question.id : null,
                  prompt: question.prompt,
                  guidance: question.guidance || ('guidance' in question ? question.guidance : tp.purpose),
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

              const citations = 'citations' in question && Array.isArray(question.citations)
                ? question.citations
                : parseBracketCitations(tp.purpose);

              if (citations.length > 0) {
                await tx.procedureQuestionCitation.createMany({
                  data: citations.map((citation, cIndex) => ({
                    procedureQuestionId: createdQuestion.id,
                    standardType: citation.standardType,
                    reference: citation.reference,
                    jurisdiction: citation.jurisdiction || null,
                    displayOrder: cIndex,
                  }))
                });
              }
            }

            return created;
          })
        );
        createdProcedures.push(...procs);
      }

      // 2. Process Ungrouped Procedures
      const ungroupedToCopy = phase 
        ? template.procedures.filter(p => p.phase === phase)
        : template.procedures;

      if (ungroupedToCopy.length > 0) {
        const procs = await Promise.all(
          ungroupedToCopy.map(async (tp) => {
            const created = await tx.procedure.create({
              data: {
                auditId: params.id,
                phase: tp.phase,
                title: tp.title,
                purpose: tp.purpose,
                source: tp.source,
              }
            });

            const questions = tp.questions.length > 0
              ? tp.questions
              : [buildDefaultQuestionFromProcedure({ title: tp.title, purpose: tp.purpose })];

            for (const [qIndex, question] of questions.entries()) {
              const createdQuestion = await tx.procedureQuestion.create({
                data: {
                  procedureId: created.id,
                  templateQuestionId: 'id' in question ? question.id : null,
                  prompt: question.prompt,
                  guidance: question.guidance || ('guidance' in question ? question.guidance : tp.purpose),
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

              const citations = 'citations' in question && Array.isArray(question.citations)
                ? question.citations
                : parseBracketCitations(tp.purpose);

              if (citations.length > 0) {
                await tx.procedureQuestionCitation.createMany({
                  data: citations.map((citation, cIndex) => ({
                    procedureQuestionId: createdQuestion.id,
                    standardType: citation.standardType,
                    reference: citation.reference,
                    jurisdiction: citation.jurisdiction || null,
                    displayOrder: cIndex,
                  }))
                });
              }
            }

            return created;
          })
        );
        createdProcedures.push(...procs);
      }

      await tx.templateApplication.create({
        data: {
          auditId: params.id,
          templateId: template.id,
          templateVersion: template.version,
          appliedPhase: phase || null,
          appliedBy: session.user.username,
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'AUDIT',
        entityId: params.id,
        details: `Applied template: ${template.name} (v${template.version})${phase ? ` for phase: ${phase}` : ''}. Created ${createdProcedures.length} procedures.`,
        performedBy: session.user.username,
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: createdProcedures.length,
      procedures: createdProcedures 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Apply template error:', error);
    return NextResponse.json({ error: 'Failed to apply template', details: message }, { status: 500 });
  }
}
