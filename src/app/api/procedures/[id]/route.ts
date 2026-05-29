import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getProcedureComplianceStatus } from '@/lib/compliance-gates';

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
          const payload = {
            prompt: question.prompt,
            guidance: question.guidance,
            questionType: question.questionType,
            isRequired: question.isRequired,
            expectedEvidenceCount: question.expectedEvidenceCount,
            expectedEvidenceTypes: question.expectedEvidenceTypes,
            assertionTags: question.assertionTags,
            riskRating: question.riskRating,
            controlType: question.controlType,
            responseText: question.responseText,
            responseBoolean: question.responseBoolean,
            responseNumber: question.responseNumber,
            responseDate: question.responseDate ? new Date(question.responseDate) : null,
            responseSelection: question.responseSelection,
            exceptionFlag: question.exceptionFlag,
            exceptionNarrative: question.exceptionNarrative,
            validationStatus: question.validationStatus,
            reviewerStatus: question.reviewerStatus,
            displayOrder: question.displayOrder ?? index,
          };

          if (question.id) {
            await tx.procedureQuestion.update({
              where: { id: question.id },
              data: payload,
            });
          } else if (question.prompt?.trim()) {
            await tx.procedureQuestion.create({
              data: {
                procedureId: params.id,
                prompt: question.prompt.trim(),
                ...payload,
              },
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
