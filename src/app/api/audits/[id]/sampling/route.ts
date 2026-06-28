import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { computeLeadsheetTotal } from '@/lib/field-bindings';
import { deriveSampleSize, riskReliabilityFactor, toDecimal } from '@/lib/sampling';
import type { RiskRating } from '@prisma/client';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: auditId } = await props.params;
    if (!(await canAccessAudit(session.user, auditId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plans = await prisma.samplingPlan.findMany({
      where: { auditId },
      include: {
        leadsheet: { select: { id: true, reference: true, name: true } },
        risk: { select: { id: true, reference: true, description: true, likelihood: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('[Sampling API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load sampling plans.' }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: auditId } = await props.params;
    if (!(await canAccessAudit(session.user, auditId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const areaLabel = typeof body.areaLabel === 'string' ? body.areaLabel.trim() : '';
    const leadsheetId = typeof body.leadsheetId === 'string' ? body.leadsheetId : null;
    const riskId = typeof body.riskId === 'string' ? body.riskId : null;
    const overrideReason = typeof body.overrideReason === 'string' ? body.overrideReason.trim() : null;

    if (!areaLabel) {
      return NextResponse.json({ error: 'areaLabel is required.' }, { status: 400 });
    }

    if (leadsheetId) {
      const leadsheet = await prisma.leadsheet.findFirst({
        where: { id: leadsheetId, auditId },
        select: { id: true },
      });
      if (!leadsheet) {
        return NextResponse.json({ error: 'Leadsheet not found for this audit.' }, { status: 404 });
      }
    }

    const profile = await prisma.materialityProfile.findUnique({ where: { auditId } });
    if (!profile) {
      return NextResponse.json({ error: 'Materiality profile is required before creating sampling plans.' }, { status: 422 });
    }

    const linkedRisk = riskId
      ? await prisma.risk.findFirst({
          where: { id: riskId, auditId },
          select: { id: true, likelihood: true },
        })
      : null;
    if (riskId && !linkedRisk) {
      return NextResponse.json({ error: 'Risk not found for this audit.' }, { status: 404 });
    }

    const riskRating: RiskRating = linkedRisk?.likelihood || 'MEDIUM';
    const populationValue = leadsheetId ? await computeLeadsheetTotal(leadsheetId) : toNumber(body.populationValue);
    const performanceMateriality = Number(profile.performanceMateriality.toString());
    const reliabilityFactor = riskReliabilityFactor(riskRating);
    const suggestedSampleSize = deriveSampleSize({
      populationValue,
      performanceMateriality,
      riskRating,
      reliabilityFactor,
    });

    const selectedSampleSizeRaw = body.selectedSampleSize !== undefined ? toNumber(body.selectedSampleSize) : suggestedSampleSize;
    const selectedSampleSize = Math.max(1, Math.round(selectedSampleSizeRaw));

    const plan = await prisma.samplingPlan.create({
      data: {
        auditId,
        areaLabel,
        leadsheetId,
        riskId: linkedRisk?.id || null,
        populationValue: toDecimal(populationValue),
        tolerableMisstatement: toDecimal(performanceMateriality),
        expectedMisstatement: toDecimal(toNumber(body.expectedMisstatement)),
        confidencePercent: Math.max(50, Math.min(99, Math.round(toNumber(body.confidencePercent) || 95))),
        reliabilityFactor: toDecimal(reliabilityFactor),
        suggestedSampleSize,
        selectedSampleSize,
        overrideReason: selectedSampleSize !== suggestedSampleSize ? (overrideReason || 'Manual adjustment') : null,
        status: 'Draft',
        createdBy: session.user.username,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'SAMPLING_PLAN',
        entityId: plan.id,
        details: `Sampling plan created for ${areaLabel} (suggested ${suggestedSampleSize}, selected ${selectedSampleSize})`,
        performedBy: session.user.username,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[Sampling API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create sampling plan.' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: auditId } = await props.params;
    if (!(await canAccessAudit(session.user, auditId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const planId = typeof body.planId === 'string' ? body.planId : '';
    if (!planId) {
      return NextResponse.json({ error: 'planId is required.' }, { status: 400 });
    }
    const action = typeof body.action === 'string' ? body.action : 'update';

    const plan = await prisma.samplingPlan.findFirst({
      where: { id: planId, auditId },
      select: { id: true, suggestedSampleSize: true },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Sampling plan not found.' }, { status: 404 });
    }

    if (action === 'delete') {
      await prisma.samplingPlan.delete({ where: { id: planId } });
      return NextResponse.json({ success: true });
    }

    const selectedSampleSize = body.selectedSampleSize !== undefined
      ? Math.max(1, Math.round(toNumber(body.selectedSampleSize)))
      : undefined;
    const status = typeof body.status === 'string' ? body.status : undefined;
    const overrideReason = typeof body.overrideReason === 'string' ? body.overrideReason.trim() : undefined;

    if (selectedSampleSize !== undefined && selectedSampleSize !== plan.suggestedSampleSize && !overrideReason) {
      return NextResponse.json({ error: 'Override reason is required when selected sample size differs from suggested size.' }, { status: 400 });
    }

    await prisma.samplingPlan.update({
      where: { id: planId },
      data: {
        ...(selectedSampleSize !== undefined ? { selectedSampleSize } : {}),
        ...(status ? { status } : {}),
        ...(overrideReason !== undefined
          ? { overrideReason: overrideReason || null }
          : selectedSampleSize !== undefined && selectedSampleSize !== plan.suggestedSampleSize
          ? { overrideReason: 'Manual adjustment' }
          : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Sampling API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update sampling plan.' }, { status: 500 });
  }
}
