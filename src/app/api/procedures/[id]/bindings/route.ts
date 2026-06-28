import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessProcedure } from '@/lib/audit-access';
import { refreshBindingCache, refreshProcedureBindingCache } from '@/lib/field-bindings';
import type { BindType } from '@prisma/client';

const VALID_BIND_TYPES: BindType[] = ['LEADSHEET_TOTAL', 'GROUPING_TOTAL', 'ACCOUNT', 'PRIOR_YEAR'];

async function assertBindingScope(
  auditId: string,
  payload: { leadsheetId?: string | null; groupingId?: string | null; accountId?: string | null }
): Promise<void> {
  if (payload.leadsheetId) {
    const leadsheet = await prisma.leadsheet.findFirst({
      where: { id: payload.leadsheetId, auditId },
      select: { id: true },
    });
    if (!leadsheet) throw new Error('Invalid leadsheet scope for binding.');
  }

  if (payload.groupingId) {
    const grouping = await prisma.grouping.findFirst({
      where: { id: payload.groupingId, leadsheet: { auditId } },
      select: { id: true },
    });
    if (!grouping) throw new Error('Invalid grouping scope for binding.');
  }

  if (payload.accountId) {
    const account = await prisma.trialBalanceAccount.findFirst({
      where: { id: payload.accountId, import: { auditId } },
      select: { id: true },
    });
    if (!account) throw new Error('Invalid account scope for binding.');
  }
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: procedureId } = await props.params;
    const allowed = await canAccessProcedure(session.user, procedureId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const bindings = await prisma.fieldBinding.findMany({
      where: { procedureId },
      orderBy: [{ questionRef: 'asc' }],
      include: {
        leadsheet: { select: { id: true, reference: true, name: true } },
        grouping: { select: { id: true, code: true, name: true } },
        account: { select: { id: true, accountCode: true, accountName: true } },
      },
    });

    return NextResponse.json({ bindings });
  } catch (error) {
    console.error('[Procedure Bindings API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load bindings.' }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: procedureId } = await props.params;
    const allowed = await canAccessProcedure(session.user, procedureId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const questionRef = typeof body.questionRef === 'string' ? body.questionRef.trim() : '';
    const bindType = body.bindType as BindType;
    const leadsheetId = typeof body.leadsheetId === 'string' ? body.leadsheetId : null;
    const groupingId = typeof body.groupingId === 'string' ? body.groupingId : null;
    const accountId = typeof body.accountId === 'string' ? body.accountId : null;

    if (!questionRef || !VALID_BIND_TYPES.includes(bindType)) {
      return NextResponse.json({ error: 'questionRef and valid bindType are required.' }, { status: 400 });
    }

    const procedure = await prisma.procedure.findUnique({
      where: { id: procedureId },
      select: { auditId: true },
    });
    if (!procedure) {
      return NextResponse.json({ error: 'Procedure not found.' }, { status: 404 });
    }

    await assertBindingScope(procedure.auditId, { leadsheetId, groupingId, accountId });

    const binding = await prisma.fieldBinding.create({
      data: {
        procedureId,
        questionRef,
        bindType,
        leadsheetId,
        groupingId,
        accountId,
      },
    });

    await refreshBindingCache(binding.id);

    return NextResponse.json({ success: true, bindingId: binding.id });
  } catch (error) {
    console.error('[Procedure Bindings API] POST error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create binding.' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: procedureId } = await props.params;
    const allowed = await canAccessProcedure(session.user, procedureId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'refreshAll') {
      await refreshProcedureBindingCache(procedureId);
      return NextResponse.json({ success: true });
    }

    const bindingId = typeof body.bindingId === 'string' ? body.bindingId : '';
    if (!bindingId) {
      return NextResponse.json({ error: 'bindingId is required.' }, { status: 400 });
    }

    const binding = await prisma.fieldBinding.findFirst({
      where: { id: bindingId, procedureId },
      include: { procedure: { select: { auditId: true } } },
    });
    if (!binding) {
      return NextResponse.json({ error: 'Binding not found for this procedure.' }, { status: 404 });
    }

    if (action === 'delete') {
      await prisma.fieldBinding.delete({ where: { id: bindingId } });
      return NextResponse.json({ success: true });
    }

    const bindType = body.bindType as BindType | undefined;
    const leadsheetId = typeof body.leadsheetId === 'string' ? body.leadsheetId : null;
    const groupingId = typeof body.groupingId === 'string' ? body.groupingId : null;
    const accountId = typeof body.accountId === 'string' ? body.accountId : null;

    if (bindType && !VALID_BIND_TYPES.includes(bindType)) {
      return NextResponse.json({ error: 'Invalid bindType.' }, { status: 400 });
    }

    await assertBindingScope(binding.procedure.auditId, { leadsheetId, groupingId, accountId });

    await prisma.fieldBinding.update({
      where: { id: bindingId },
      data: {
        bindType: bindType || binding.bindType,
        leadsheetId,
        groupingId,
        accountId,
      },
    });

    await refreshBindingCache(bindingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Procedure Bindings API] PUT error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update binding.' }, { status: 500 });
  }
}
