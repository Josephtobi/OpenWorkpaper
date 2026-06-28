import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { evaluateAuditStages, getOrCreateAuditStageProgress } from '@/lib/engagement-gates';

type EngagementStageKey =
  | 'ACCEPTANCE'
  | 'UNDERSTANDING'
  | 'RISK'
  | 'MATERIALITY'
  | 'SAMPLING'
  | 'FIELDWORK'
  | 'COMPLETION'
  | 'OPINION';

const VALID_STAGES: EngagementStageKey[] = [
  'ACCEPTANCE',
  'UNDERSTANDING',
  'RISK',
  'MATERIALITY',
  'SAMPLING',
  'FIELDWORK',
  'COMPLETION',
  'OPINION',
];

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const stage = body.stage as EngagementStageKey;
    const gateCode = typeof body.gateCode === 'string' ? body.gateCode.trim() : '';
    const gateMessage = typeof body.gateMessage === 'string' ? body.gateMessage.trim() : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage value' }, { status: 400 });
    }
    if (!gateCode) {
      return NextResponse.json({ error: 'gateCode is required' }, { status: 400 });
    }
    if (reason.length < 10) {
      return NextResponse.json({ error: 'Override reason must be at least 10 characters.' }, { status: 400 });
    }

    const stageProgress = await getOrCreateAuditStageProgress(auditId, stage);
    await prisma.auditStageOverride.create({
      data: {
        auditId,
        stageProgressId: stageProgress.id,
        gateCode,
        gateMessage: gateMessage || gateCode,
        reason,
        overriddenBy: session.user.username,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'AUDIT_STAGE_OVERRIDE',
        entityId: auditId,
        details: `Override added for stage ${stage} gate ${gateCode}`,
        performedBy: session.user.username,
      },
    });

    const refreshed = await evaluateAuditStages(auditId);
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error('[Stage Override API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create stage override' }, { status: 500 });
  }
}
