import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { buildDefaultQuestionFromProcedure, parseBracketCitations } from '@/lib/compliance';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auditId = searchParams.get('auditId');
    const phase = searchParams.get('phase');

    const procedures = await prisma.procedure.findMany({
      where: {
        ...(auditId ? { auditId } : {}),
        ...(phase ? { phase } : {}),
      },
      include: {
        assignedTo: true,
        _count: { select: { attachments: true, messages: true } }
      },
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json(procedures);
  } catch (error: unknown) {
    console.error('Fetch procedures error:', error);
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { auditId, phase, groupId, title, purpose } = data;

    const aggregate = await prisma.procedure.aggregate({
      where: { auditId, phase, groupId: groupId || null },
      _max: { displayOrder: true }
    });
    
    const nextOrder = (aggregate._max.displayOrder || 0) + 1;

    const procedure = await prisma.procedure.create({
      data: {
        auditId,
        phase,
        groupId: groupId || null,
        title: title || 'New Procedure',
        purpose: purpose || '',
        status: 'Not Started',
        displayOrder: nextOrder,
      }
    });

    const defaultQuestion = buildDefaultQuestionFromProcedure({
      title: procedure.title,
      purpose: procedure.purpose,
    });
    const createdQuestion = await prisma.procedureQuestion.create({
      data: {
        procedureId: procedure.id,
        prompt: defaultQuestion.prompt,
        guidance: defaultQuestion.guidance || null,
        questionType: defaultQuestion.questionType || 'narrative',
        isRequired: true,
        expectedEvidenceCount: defaultQuestion.expectedEvidenceCount || 0,
        riskRating: defaultQuestion.riskRating || 'Moderate',
        controlType: defaultQuestion.controlType || 'Substantive',
        displayOrder: 0,
      }
    });
    const citations = parseBracketCitations(procedure.purpose);
    if (citations.length > 0) {
      await prisma.procedureQuestionCitation.createMany({
        data: citations.map((citation, index) => ({
          procedureQuestionId: createdQuestion.id,
          standardType: citation.standardType,
          reference: citation.reference,
          jurisdiction: citation.jurisdiction || null,
          displayOrder: index,
        })),
      });
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'PROCEDURE',
          entityId: procedure.id,
          details: `Created new procedure: ${procedure.title}`,
          performedBy: session.user.username,
        }
      });
    } catch {
      // ignore log errors
    }

    return NextResponse.json(procedure);
  } catch (error: unknown) {
    console.error('Create procedure error:', error);
    const message = error instanceof Error ? error.message : 'Creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
