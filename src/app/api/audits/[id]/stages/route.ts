import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { evaluateAuditStages, getOrCreateAuditStageProgress } from '@/lib/engagement-gates';
import type { EngagementStageKey, StageStatus } from '@prisma/client';

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

const VALID_STATUSES: StageStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
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

    const evaluation = await evaluateAuditStages(auditId);
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('[Stage API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load stage status' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
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
    const stage = body.stage as EngagementStageKey | undefined;
    const status = body.status as StageStatus | undefined;
    const tailoringNotes = typeof body.tailoringNotes === 'string' ? body.tailoringNotes.trim() : undefined;
    const engagementAccepted = typeof body.engagementAccepted === 'boolean' ? body.engagementAccepted : undefined;
    const engagementLetterSigned = typeof body.engagementLetterSigned === 'boolean' ? body.engagementLetterSigned : undefined;

    if (engagementAccepted !== undefined || engagementLetterSigned !== undefined) {
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          ...(engagementAccepted !== undefined ? { engagementAccepted } : {}),
          ...(engagementLetterSigned !== undefined ? { engagementLetterSigned } : {}),
        },
      });
    }

    if (stage || status || tailoringNotes !== undefined) {
      if (!stage || !VALID_STAGES.includes(stage)) {
        return NextResponse.json({ error: 'Invalid or missing stage' }, { status: 400 });
      }
      if (status && !VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }

      const existing = await getOrCreateAuditStageProgress(auditId, stage);
      const evaluation = await evaluateAuditStages(auditId);
      const stageInfo = evaluation.stages.find((s) => s.stage === stage);

      if (!stageInfo) {
        return NextResponse.json({ error: 'Unable to evaluate stage state' }, { status: 500 });
      }

      const nextStatus = status || existing.status;
      const nextTailoring = tailoringNotes ?? existing.tailoringNotes ?? '';

      if (nextStatus === 'COMPLETED') {
        if (!nextTailoring.trim()) {
          return NextResponse.json(
            { error: 'Tailoring notes are required before completing a stage.' },
            { status: 422 }
          );
        }
        if (stageInfo.unresolvedBlockers.length > 0) {
          return NextResponse.json(
            {
              error: 'Stage has unresolved blocker gates. Add overrides with reasons before completion.',
              blockers: stageInfo.unresolvedBlockers,
              gateIssues: stageInfo.gateIssues,
            },
            { status: 422 }
          );
        }
      }

      await prisma.auditStageProgress.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          tailoringNotes: nextTailoring || null,
          completedAt: nextStatus === 'COMPLETED' ? new Date() : null,
          completedBy: nextStatus === 'COMPLETED' ? session.user.username : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'AUDIT_STAGE',
          entityId: auditId,
          details: `Stage ${stage} updated to ${nextStatus}`,
          performedBy: session.user.username,
        },
      });
    }

    const refreshed = await evaluateAuditStages(auditId);
    return NextResponse.json(refreshed);
  } catch (error) {
    console.error('[Stage API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update stage status' }, { status: 500 });
  }
}
