import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { toDecimal } from '@/lib/sampling';

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

    const profile = await prisma.materialityProfile.findUnique({
      where: { auditId },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Materiality API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load materiality profile.' }, { status: 500 });
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
    const benchmark = typeof body.benchmark === 'string' ? body.benchmark.trim() : '';
    const benchmarkValue = toNumber(body.benchmarkValue);
    const percentage = toNumber(body.percentage);
    const overallMateriality = body.overallMateriality !== undefined
      ? toNumber(body.overallMateriality)
      : benchmarkValue * (percentage / 100);
    const performanceMateriality = body.performanceMateriality !== undefined
      ? toNumber(body.performanceMateriality)
      : overallMateriality * 0.75;
    const trivialThreshold = body.trivialThreshold !== undefined
      ? toNumber(body.trivialThreshold)
      : overallMateriality * 0.05;
    const specificMateriality = body.specificMateriality !== undefined && body.specificMateriality !== null
      ? toNumber(body.specificMateriality)
      : null;
    const notes = typeof body.notes === 'string' ? body.notes : null;

    if (!benchmark) {
      return NextResponse.json({ error: 'benchmark is required.' }, { status: 400 });
    }

    const profile = await prisma.materialityProfile.upsert({
      where: { auditId },
      update: {
        benchmark,
        benchmarkValue: toDecimal(benchmarkValue),
        percentage: toDecimal(percentage),
        overallMateriality: toDecimal(overallMateriality),
        performanceMateriality: toDecimal(performanceMateriality),
        trivialThreshold: toDecimal(trivialThreshold),
        specificMateriality: specificMateriality === null ? null : toDecimal(specificMateriality),
        notes,
        updatedBy: session.user.username,
      },
      create: {
        auditId,
        benchmark,
        benchmarkValue: toDecimal(benchmarkValue),
        percentage: toDecimal(percentage),
        overallMateriality: toDecimal(overallMateriality),
        performanceMateriality: toDecimal(performanceMateriality),
        trivialThreshold: toDecimal(trivialThreshold),
        specificMateriality: specificMateriality === null ? null : toDecimal(specificMateriality),
        notes,
        updatedBy: session.user.username,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'MATERIALITY',
        entityId: auditId,
        details: `Materiality profile updated (${benchmark})`,
        performedBy: session.user.username,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[Materiality API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update materiality profile.' }, { status: 500 });
  }
}
