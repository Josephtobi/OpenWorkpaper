import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';

type FsStatement = 'SOFP' | 'PROFIT_LOSS' | 'EQUITY' | 'CASHFLOW';

interface ImportRowInput {
  accountCode: string;
  accountName: string;
  debit?: number | string;
  credit?: number | string;
}

function parseNumeric(value: number | string | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseFsStatement(value: string): FsStatement {
  const normalized = value.toUpperCase();
  if (normalized === 'SOFP' || normalized === 'PROFIT_LOSS' || normalized === 'EQUITY' || normalized === 'CASHFLOW') {
    return normalized;
  }
  return 'SOFP';
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [imports, leadsheets, unmappedCount] = await Promise.all([
      prisma.trialBalanceImport.findMany({
        where: { auditId },
        orderBy: [{ importedAt: 'desc' }],
        include: {
          accounts: {
            orderBy: [{ accountCode: 'asc' }],
            include: {
              grouping: {
                include: {
                  leadsheet: {
                    select: {
                      id: true,
                      name: true,
                      reference: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.leadsheet.findMany({
        where: { auditId },
        orderBy: [{ reference: 'asc' }],
        include: {
          groupings: {
            orderBy: [{ code: 'asc' }],
          },
        },
      }),
      prisma.trialBalanceAccount.count({
        where: {
          import: { auditId, isCurrentYear: true },
          groupingId: null,
        },
      }),
    ]);

    return NextResponse.json({
      imports,
      leadsheets,
      unmappedCount,
    });
  } catch (error) {
    console.error('[Trial Balance API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load trial balance data.' }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const periodLabel = typeof body.periodLabel === 'string' ? body.periodLabel.trim() : '';
    const source = typeof body.source === 'string' ? body.source.trim() : 'manual';
    const rows = Array.isArray(body.rows) ? (body.rows as ImportRowInput[]) : [];
    const isCurrentYear = body.isCurrentYear !== false;

    if (!periodLabel) {
      return NextResponse.json({ error: 'periodLabel is required.' }, { status: 400 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: 'At least one trial balance row is required.' }, { status: 400 });
    }

    const normalizedRows = rows
      .map((row) => ({
        accountCode: (row.accountCode || '').trim(),
        accountName: (row.accountName || '').trim(),
        debit: parseNumeric(row.debit),
        credit: parseNumeric(row.credit),
      }))
      .filter((row) => row.accountCode && row.accountName);

    if (normalizedRows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in payload.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      if (isCurrentYear) {
        await tx.trialBalanceImport.updateMany({
          where: { auditId, isCurrentYear: true },
          data: { isCurrentYear: false },
        });
      }

      const createdImport = await tx.trialBalanceImport.create({
        data: {
          auditId,
          periodLabel,
          source,
          isCurrentYear,
          importedBy: session.user.username,
        },
      });

      await tx.trialBalanceAccount.createMany({
        data: normalizedRows.map((row) => ({
          importId: createdImport.id,
          accountCode: row.accountCode,
          accountName: row.accountName,
          debit: row.debit,
          credit: row.credit,
        })),
      });

      return createdImport;
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'TRIAL_BALANCE_IMPORT',
        entityId: result.id,
        details: `Imported ${normalizedRows.length} TB accounts for ${periodLabel}`,
        performedBy: session.user.username,
      },
    });

    return NextResponse.json({ success: true, importId: result.id });
  } catch (error) {
    console.error('[Trial Balance API] POST error:', error);
    return NextResponse.json({ error: 'Failed to import trial balance.' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'createLeadsheet') {
      const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const fsCaption = typeof body.fsCaption === 'string' ? body.fsCaption.trim() : '';
      const fsStatement = parseFsStatement(body.fsStatement || 'SOFP');

      if (!reference || !name || !fsCaption) {
        return NextResponse.json({ error: 'reference, name, and fsCaption are required.' }, { status: 400 });
      }

      const leadsheet = await prisma.leadsheet.create({
        data: {
          auditId,
          reference,
          name,
          fsCaption,
          fsStatement,
        },
      });

      return NextResponse.json({ success: true, leadsheet });
    }

    if (action === 'createGrouping') {
      const leadsheetId = typeof body.leadsheetId === 'string' ? body.leadsheetId : '';
      const code = typeof body.code === 'string' ? body.code.trim() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';

      if (!leadsheetId || !code || !name) {
        return NextResponse.json({ error: 'leadsheetId, code, and name are required.' }, { status: 400 });
      }

      const leadsheet = await prisma.leadsheet.findFirst({
        where: { id: leadsheetId, auditId },
        select: { id: true },
      });
      if (!leadsheet) {
        return NextResponse.json({ error: 'Leadsheet not found for this audit.' }, { status: 404 });
      }

      const grouping = await prisma.grouping.create({
        data: {
          leadsheetId,
          code,
          name,
        },
      });

      return NextResponse.json({ success: true, grouping });
    }

    if (action === 'mapAccount') {
      const accountId = typeof body.accountId === 'string' ? body.accountId : '';
      const groupingId = typeof body.groupingId === 'string' ? body.groupingId : null;

      if (!accountId) {
        return NextResponse.json({ error: 'accountId is required.' }, { status: 400 });
      }

      const account = await prisma.trialBalanceAccount.findFirst({
        where: { id: accountId, import: { auditId } },
        select: { id: true },
      });
      if (!account) {
        return NextResponse.json({ error: 'Account not found for this audit.' }, { status: 404 });
      }

      if (groupingId) {
        const grouping = await prisma.grouping.findFirst({
          where: { id: groupingId, leadsheet: { auditId } },
          select: { id: true },
        });
        if (!grouping) {
          return NextResponse.json({ error: 'Grouping not found for this audit.' }, { status: 404 });
        }
      }

      await prisma.trialBalanceAccount.update({
        where: { id: accountId },
        data: { groupingId },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'lockImport') {
      const importId = typeof body.importId === 'string' ? body.importId : '';
      const locked = body.locked !== false;
      if (!importId) {
        return NextResponse.json({ error: 'importId is required.' }, { status: 400 });
      }
      await prisma.trialBalanceImport.updateMany({
        where: { id: importId, auditId },
        data: { locked },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (error) {
    console.error('[Trial Balance API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update trial balance data.' }, { status: 500 });
  }
}
