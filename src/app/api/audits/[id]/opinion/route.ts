import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { getCompletionSummary } from '@/lib/completion';

const VALID_OPINION_TYPES = ['UNMODIFIED', 'QUALIFIED', 'ADVERSE', 'DISCLAIMER'];

async function assertAccess(auditId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const allowed = await canAccessAudit(session.user, auditId);
  if (!allowed) {
    return { session, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: auditId } = await props.params;
    const { response } = await assertAccess(auditId);
    if (response) return response;

    const [opinion, completion] = await Promise.all([
      prisma.auditOpinion.findUnique({ where: { auditId } }),
      getCompletionSummary(auditId),
    ]);

    const requiresModifiedDecision = completion.materiality.exceeded;
    return NextResponse.json({
      opinion,
      completion,
      requirements: {
        requiresModifiedDecision,
      },
    });
  } catch (error) {
    console.error('[Opinion API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load opinion data.' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: auditId } = await props.params;
    const { session, response } = await assertAccess(auditId);
    if (response) return response;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const opinionType = typeof body.opinionType === 'string' ? body.opinionType.trim() : '';
    const basis = typeof body.basis === 'string' ? body.basis.trim() : null;
    const requiresModification = Boolean(body.requiresModification);
    const modifiedDecisionReason =
      typeof body.modifiedDecisionReason === 'string' ? body.modifiedDecisionReason.trim() : '';

    if (!opinionType || !VALID_OPINION_TYPES.includes(opinionType)) {
      return NextResponse.json({ error: `opinionType must be one of: ${VALID_OPINION_TYPES.join(', ')}` }, { status: 400 });
    }

    const completion = await getCompletionSummary(auditId);
    if (completion.materiality.exceeded && !modifiedDecisionReason) {
      return NextResponse.json(
        { error: 'Modified decision reason is required when uncorrected misstatements exceed overall materiality.' },
        { status: 422 }
      );
    }

    const opinion = await prisma.auditOpinion.upsert({
      where: { auditId },
      update: {
        opinionType,
        basis,
        requiresModification,
        modifiedDecisionReason: modifiedDecisionReason || null,
        selectedBy: session.user.username,
        selectedAt: new Date(),
      },
      create: {
        auditId,
        opinionType,
        basis,
        requiresModification,
        modifiedDecisionReason: modifiedDecisionReason || null,
        selectedBy: session.user.username,
        selectedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'AUDIT_OPINION',
        entityId: auditId,
        details: `Opinion selected: ${opinionType}`,
        performedBy: session.user.username,
      },
    });

    return NextResponse.json({
      opinion,
      completion,
      requirements: {
        requiresModifiedDecision: completion.materiality.exceeded,
      },
    });
  } catch (error) {
    console.error('[Opinion API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to save opinion decision.' }, { status: 500 });
  }
}
