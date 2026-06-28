import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import type { Assertion, RiskCategory, RiskRating } from '@prisma/client';

const VALID_CATEGORIES: RiskCategory[] = ['FRAUD', 'ERROR', 'GOING_CONCERN', 'COMPLIANCE', 'RELATED_PARTY', 'ESTIMATE'];
const VALID_RATINGS: RiskRating[] = ['HIGH', 'MEDIUM', 'LOW'];
const VALID_ASSERTIONS: Assertion[] = [
  'EXISTENCE',
  'COMPLETENESS',
  'VALUATION',
  'RIGHTS_OBLIGATIONS',
  'CUTOFF',
  'CLASSIFICATION',
  'PRESENTATION',
  'OCCURRENCE',
  'ACCURACY',
];

async function getRiskPayload(auditId: string) {
  const [risks, procedures] = await Promise.all([
    prisma.risk.findMany({
      where: { auditId },
      orderBy: [{ reference: 'asc' }],
      include: {
        assertions: true,
        links: { include: { procedure: { select: { id: true, title: true, phase: true } } } },
      },
    }),
    prisma.procedure.findMany({
      where: { auditId },
      select: { id: true, title: true, phase: true, status: true },
      orderBy: [{ phase: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  return { risks, procedures };
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: auditId } = await props.params;
    if (!(await canAccessAudit(session.user, auditId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(await getRiskPayload(auditId));
  } catch (error) {
    console.error('[Risk API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load risks.' }, { status: 500 });
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
    const action = typeof body.action === 'string' ? body.action : 'create';

    if (action === 'bootstrapPresumed') {
      const existing = await prisma.risk.findMany({
        where: { auditId, isPresumed: true },
        select: { reference: true },
      });
      const existingRefs = new Set(existing.map((item) => item.reference));

      const toCreate = [
        {
          reference: 'FR-REV',
          description: 'Presumed fraud risk: improper revenue recognition',
          category: 'FRAUD' as RiskCategory,
        },
        {
          reference: 'FR-MGT',
          description: 'Presumed fraud risk: management override of controls',
          category: 'FRAUD' as RiskCategory,
        },
      ].filter((risk) => !existingRefs.has(risk.reference));

      if (toCreate.length > 0) {
        await prisma.risk.createMany({
          data: toCreate.map((risk) => ({
            auditId,
            reference: risk.reference,
            description: risk.description,
            category: risk.category,
            isSignificant: true,
            isPresumed: true,
            likelihood: 'HIGH',
            magnitude: 'HIGH',
          })),
        });
      }

      return NextResponse.json(await getRiskPayload(auditId));
    }

    const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = body.category as RiskCategory;
    const likelihood = body.likelihood as RiskRating;
    const magnitude = body.magnitude as RiskRating;

    if (!reference || !description || !VALID_CATEGORIES.includes(category) || !VALID_RATINGS.includes(likelihood) || !VALID_RATINGS.includes(magnitude)) {
      return NextResponse.json({ error: 'Invalid risk payload.' }, { status: 400 });
    }

    await prisma.risk.create({
      data: {
        auditId,
        reference,
        description,
        category,
        likelihood,
        magnitude,
        isSignificant: Boolean(body.isSignificant),
        isPresumed: Boolean(body.isPresumed),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'RISK',
        entityId: auditId,
        details: `Created risk ${reference}`,
        performedBy: session.user.username,
      },
    });

    return NextResponse.json(await getRiskPayload(auditId));
  } catch (error) {
    console.error('[Risk API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create/bootstrap risks.' }, { status: 500 });
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
    const action = typeof body.action === 'string' ? body.action : '';
    const riskId = typeof body.riskId === 'string' ? body.riskId : '';

    if (!riskId) {
      return NextResponse.json({ error: 'riskId is required.' }, { status: 400 });
    }

    const risk = await prisma.risk.findFirst({
      where: { id: riskId, auditId },
      select: { id: true, isPresumed: true },
    });
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found.' }, { status: 404 });
    }

    if (action === 'delete') {
      if (risk.isPresumed) {
        return NextResponse.json({ error: 'Presumed risks cannot be deleted.' }, { status: 400 });
      }
      await prisma.risk.delete({ where: { id: riskId } });
      return NextResponse.json(await getRiskPayload(auditId));
    }

    if (action === 'setAssertions') {
      const assertions = Array.isArray(body.assertions) ? (body.assertions as Assertion[]) : [];
      const uniqueAssertions = [...new Set(assertions.filter((item) => VALID_ASSERTIONS.includes(item)))];

      await prisma.$transaction(async (tx) => {
        await tx.riskAssertion.deleteMany({ where: { riskId } });
        if (uniqueAssertions.length > 0) {
          await tx.riskAssertion.createMany({
            data: uniqueAssertions.map((assertion) => ({ riskId, assertion })),
          });
        }
      });
      return NextResponse.json(await getRiskPayload(auditId));
    }

    if (action === 'setLinks') {
      const procedureIds = Array.isArray(body.procedureIds) ? (body.procedureIds as string[]) : [];
      const validProcedures = await prisma.procedure.findMany({
        where: { auditId, id: { in: procedureIds } },
        select: { id: true },
      });
      const validIds = validProcedures.map((item) => item.id);

      await prisma.$transaction(async (tx) => {
        await tx.riskProcedureLink.deleteMany({ where: { riskId } });
        if (validIds.length > 0) {
          await tx.riskProcedureLink.createMany({
            data: validIds.map((procedureId) => ({ riskId, procedureId })),
          });
        }
      });
      return NextResponse.json(await getRiskPayload(auditId));
    }

    const category = body.category as RiskCategory | undefined;
    const likelihood = body.likelihood as RiskRating | undefined;
    const magnitude = body.magnitude as RiskRating | undefined;
    const reference = typeof body.reference === 'string' ? body.reference.trim() : undefined;
    const description = typeof body.description === 'string' ? body.description.trim() : undefined;
    const isSignificant = typeof body.isSignificant === 'boolean' ? body.isSignificant : undefined;

    if ((category && !VALID_CATEGORIES.includes(category)) || (likelihood && !VALID_RATINGS.includes(likelihood)) || (magnitude && !VALID_RATINGS.includes(magnitude))) {
      return NextResponse.json({ error: 'Invalid category or rating value.' }, { status: 400 });
    }

    await prisma.risk.update({
      where: { id: riskId },
      data: {
        ...(category ? { category } : {}),
        ...(likelihood ? { likelihood } : {}),
        ...(magnitude ? { magnitude } : {}),
        ...(reference ? { reference } : {}),
        ...(description ? { description } : {}),
        ...(isSignificant !== undefined ? { isSignificant } : {}),
      },
    });

    return NextResponse.json(await getRiskPayload(auditId));
  } catch (error) {
    console.error('[Risk API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update risk.' }, { status: 500 });
  }
}
