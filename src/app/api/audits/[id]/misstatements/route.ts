import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import type { Assertion } from '@prisma/client';
import { getCompletionSummary } from '@/lib/completion';
import { toDecimal } from '@/lib/sampling';

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
const VALID_DIRECTIONS = ['UNDERSTATEMENT', 'OVERSTATEMENT'];

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function assertAuditAccess(auditId: string) {
  const session = await getSession();
  if (!session?.user) return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const allowed = await canAccessAudit(session.user, auditId);
  if (!allowed) return { session, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session, response: null };
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: auditId } = await props.params;
    const { response } = await assertAuditAccess(auditId);
    if (response) return response;

    const [misstatements, summary] = await Promise.all([
      prisma.misstatement.findMany({
        where: { auditId },
        include: {
          procedure: { select: { id: true, title: true, phase: true } },
          leadsheet: { select: { id: true, reference: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
      getCompletionSummary(auditId),
    ]);

    return NextResponse.json({ misstatements, summary });
  } catch (error) {
    console.error('[Misstatement API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load misstatements.' }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: auditId } = await props.params;
    const { session, response } = await assertAuditAccess(auditId);
    if (response || !session?.user) return response;

    const body = await req.json();
    const accountLabel = typeof body.accountLabel === 'string' ? body.accountLabel.trim() : '';
    const assertion = body.assertion as Assertion;
    const amount = toNumber(body.amount);
    const direction = typeof body.direction === 'string' ? body.direction.trim().toUpperCase() : 'UNDERSTATEMENT';
    const isCorrected = Boolean(body.isCorrected);
    const description = typeof body.description === 'string' ? body.description : null;
    const procedureId = typeof body.procedureId === 'string' ? body.procedureId : null;
    const leadsheetId = typeof body.leadsheetId === 'string' ? body.leadsheetId : null;

    if (!accountLabel || !VALID_ASSERTIONS.includes(assertion)) {
      return NextResponse.json({ error: 'accountLabel and valid assertion are required.' }, { status: 400 });
    }
    if (!VALID_DIRECTIONS.includes(direction)) {
      return NextResponse.json({ error: 'direction must be UNDERSTATEMENT or OVERSTATEMENT.' }, { status: 400 });
    }

    if (procedureId) {
      const procedure = await prisma.procedure.findFirst({
        where: { id: procedureId, auditId },
        select: { id: true },
      });
      if (!procedure) return NextResponse.json({ error: 'Procedure not found for this audit.' }, { status: 404 });
    }

    if (leadsheetId) {
      const leadsheet = await prisma.leadsheet.findFirst({
        where: { id: leadsheetId, auditId },
        select: { id: true },
      });
      if (!leadsheet) return NextResponse.json({ error: 'Leadsheet not found for this audit.' }, { status: 404 });
    }

    await prisma.misstatement.create({
      data: {
        auditId,
        procedureId,
        leadsheetId,
        accountLabel,
        assertion,
        amount: toDecimal(amount),
        direction,
        isCorrected,
        description,
        createdBy: session.user.username,
      },
    });

    return GET(req, props);
  } catch (error) {
    console.error('[Misstatement API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create misstatement.' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: auditId } = await props.params;
    const { response } = await assertAuditAccess(auditId);
    if (response) return response;

    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action : 'update';
    const misstatementId = typeof body.misstatementId === 'string' ? body.misstatementId : '';
    if (!misstatementId) {
      return NextResponse.json({ error: 'misstatementId is required.' }, { status: 400 });
    }

    const existing = await prisma.misstatement.findFirst({
      where: { id: misstatementId, auditId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Misstatement not found for this audit.' }, { status: 404 });
    }

    if (action === 'delete') {
      await prisma.misstatement.delete({ where: { id: misstatementId } });
      return GET(req, props);
    }

    const updateData: {
      isCorrected?: boolean;
      amount?: ReturnType<typeof toDecimal>;
      description?: string | null;
      direction?: string;
    } = {};
    if (typeof body.isCorrected === 'boolean') updateData.isCorrected = body.isCorrected;
    if (body.amount !== undefined) updateData.amount = toDecimal(toNumber(body.amount));
    if (body.description !== undefined) updateData.description = typeof body.description === 'string' ? body.description : null;
    if (typeof body.direction === 'string') {
      const normalized = body.direction.trim().toUpperCase();
      if (!VALID_DIRECTIONS.includes(normalized)) {
        return NextResponse.json({ error: 'direction must be UNDERSTATEMENT or OVERSTATEMENT.' }, { status: 400 });
      }
      updateData.direction = normalized;
    }

    await prisma.misstatement.update({
      where: { id: misstatementId },
      data: updateData,
    });

    return GET(req, props);
  } catch (error) {
    console.error('[Misstatement API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update misstatement.' }, { status: 500 });
  }
}
