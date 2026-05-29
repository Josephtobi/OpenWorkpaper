import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getProcedureComplianceStatus } from '@/lib/compliance-gates';
import type { Prisma } from '@prisma/client';

interface ProcedureQuestionUpdate {
  id?: string;
  prompt?: string;
  guidance?: string | null;
  questionType?: string;
  isRequired?: boolean;
  expectedEvidenceCount?: number;
  expectedEvidenceTypes?: string | null;
  assertionTags?: string | null;
  riskRating?: string | null;
  controlType?: string | null;
  responseText?: string | null;
  responseBoolean?: boolean | null;
  responseNumber?: number | null;
  responseDate?: string | null;
  responseSelection?: string | null;
  exceptionFlag?: boolean;
  exceptionNarrative?: string | null;
  validationStatus?: string;
  reviewerStatus?: string;
  displayOrder?: number;
}

function asOptionalString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value;
}

function asNullableString(value: string | null | undefined): string | null | undefined {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  return undefined;
}

export async function GET(
  _req: Request, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const procedure = await prisma.procedure.findUnique({
      where: { id: params.id },
      include: {
        attachments: { orderBy: { displayOrder: 'asc' } },
        messages: { orderBy: { createdAt: 'asc' } },
        assignedTo: true,
        questions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            citations: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
    });

    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 });
    }

    return NextResponse.json(procedure);
  } catch (error: unknown) {
    console.error('Fetch procedure error:', error);
    return NextResponse.json({ error: 'Failed to fetch procedure' }, { status: 500 });
  }
}

export async function PUT(
  req: Request, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const data = await req.json();
    const questions: ProcedureQuestionUpdate[] = Array.isArray(data.questions) ? data.questions : [];

    // Map fields from client to Prisma-friendly values
    const updates: Record<string, unknown> = {};
    const stringFields = ['title', 'purpose', 'source', 'scope', 'methodology', 'results', 'conclusions', 'preparedBy', 'reviewedBy', 'status', 'phase'];
    const optionalFields = ['groupId', 'assignedToId', 'preparedDate', 'reviewedDate'];

    // Copy over standard string fields
    stringFields.forEach(field => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    // Handle optional fields: convert empty strings to null
    optionalFields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field] === '' ? null : data[field];
      }
    });

    // Ensure dates are Date objects if they are valid strings/numbers
    if (updates.preparedDate && typeof updates.preparedDate === 'string') {
      const d = new Date(updates.preparedDate);
      if (!isNaN(d.getTime())) updates.preparedDate = d;
    }
    if (updates.reviewedDate && typeof updates.reviewedDate === 'string') {
      const d = new Date(updates.reviewedDate);
      if (!isNaN(d.getTime())) updates.reviewedDate = d;
    }

    // AUTO-FILL: If By is provided but Date is missing, set it to now
    if (updates.preparedBy && !updates.preparedDate) {
      // Only auto-fill if it wasn't already set in the DB or if it's being cleared/reset
      // For simplicity, if the user sends preparedBy and NO preparedDate, we assume they want 'now'
      updates.preparedDate = new Date();
    }
    if (updates.reviewedBy && !updates.reviewedDate) {
      updates.reviewedDate = new Date();
    }

    if (questions.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const [index, question] of questions.entries()) {
          const updatePayload: Prisma.ProcedureQuestionUncheckedUpdateInput = {
            prompt: asOptionalString(question.prompt),
            guidance: asNullableString(question.guidance),
            questionType: asOptionalString(question.questionType),
            isRequired: question.isRequired,
            expectedEvidenceCount: question.expectedEvidenceCount,
            expectedEvidenceTypes: asNullableString(question.expectedEvidenceTypes),
            assertionTags: asNullableString(question.assertionTags),
            riskRating: asOptionalString(question.riskRating),
            controlType: asOptionalString(question.controlType),
            responseText: asNullableString(question.responseText),
            responseBoolean: question.responseBoolean,
            responseNumber: question.responseNumber,
            responseDate: question.responseDate === null
              ? null
              : (typeof question.responseDate === 'string' ? new Date(question.responseDate) : undefined),
            responseSelection: asNullableString(question.responseSelection),
            exceptionFlag: question.exceptionFlag,
            exceptionNarrative: asNullableString(question.exceptionNarrative),
            validationStatus: asOptionalString(question.validationStatus),
            reviewerStatus: asOptionalString(question.reviewerStatus),
            displayOrder: question.displayOrder ?? index,
          };

          if (question.id) {
            await tx.procedureQuestion.update({
              where: { id: question.id },
              data: updatePayload,
            });
          } else if (question.prompt?.trim()) {
            const createPayload: Prisma.ProcedureQuestionUncheckedCreateInput = {
              procedureId: params.id,
              prompt: question.prompt.trim(),
              guidance: question.guidance ?? null,
              questionType: question.questionType || 'narrative',
              isRequired: question.isRequired ?? true,
              expectedEvidenceCount: question.expectedEvidenceCount ?? 0,
              expectedEvidenceTypes: question.expectedEvidenceTypes ?? null,
              assertionTags: question.assertionTags ?? null,
              riskRating: question.riskRating || 'Moderate',
              controlType: question.controlType || 'Substantive',
              responseText: question.responseText ?? null,
              responseBoolean: question.responseBoolean ?? null,
              responseNumber: question.responseNumber ?? null,
              responseDate: question.responseDate ? new Date(question.responseDate) : null,
              responseSelection: question.responseSelection ?? null,
              exceptionFlag: question.exceptionFlag ?? false,
              exceptionNarrative: question.exceptionNarrative ?? null,
              validationStatus: question.validationStatus || 'Pending',
              reviewerStatus: question.reviewerStatus || 'Pending',
              displayOrder: question.displayOrder ?? index,
            };

            await tx.procedureQuestion.create({
              data: createPayload,
            });
          }
        }
      });
    }

    const isTryingToSetReviewed = !!(updates.reviewedBy || updates.reviewedDate);
    if (isTryingToSetReviewed) {
      const compliance = await getProcedureComplianceStatus(params.id);
      if (!compliance.isCompliant) {
        return NextResponse.json(
          {
            error: 'Procedure failed ISA/ISQM compliance gate',
            blockingIssues: compliance.blockingIssues,
          },
          { status: 422 }
        );
      }
    }

    const procedure = await prisma.procedure.update({
      where: { id: params.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: updates as any,
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            citations: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
    });

    return NextResponse.json(procedure);
  } catch (error: unknown) {
    console.error('Update procedure error:', error);
    return NextResponse.json({ error: 'Failed to update procedure' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const body = await req.json();

    if (body.action === 'unlock') {
      const allowedRoles = ['Auditor', 'Audit Manager', 'Audit Director', 'Audit Partner', 'Business Operations', 'Engagement Manager'];
      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to unlock procedure' }, { status: 403 });
      }

      const procedure = await prisma.procedure.update({
        where: { id: params.id },
        data: {
          preparedBy: null,
          preparedDate: null,
          reviewedBy: null,
          reviewedDate: null,
          status: 'In Progress'
        }
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entityType: 'PROCEDURE',
            entityId: params.id,
            details: 'Procedure unlocked for editing (sign-offs cleared)',
            performedBy: session.user.username,
          }
        });
      } catch { /* ignore log error */ }

      return NextResponse.json(procedure);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Unlock procedure error:', error);
    return NextResponse.json({ error: 'Failed to unlock procedure' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request, 
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    await prisma.procedure.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete procedure error:', error);
    return NextResponse.json({ error: 'Failed to delete procedure' }, { status: 500 });
  }
}
