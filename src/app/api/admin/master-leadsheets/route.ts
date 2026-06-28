import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type EntityTypeSet = 'UNIVERSAL' | 'COMMERCIAL' | 'NGO';
type FsStatement = 'SOFP' | 'PROFIT_LOSS' | 'EQUITY' | 'CASHFLOW';

const ENTITY_SETS: EntityTypeSet[] = ['UNIVERSAL', 'COMMERCIAL', 'NGO'];
const FS_STATEMENTS: FsStatement[] = ['SOFP', 'PROFIT_LOSS', 'EQUITY', 'CASHFLOW'];

function isEntitySet(value: unknown): value is EntityTypeSet {
  return typeof value === 'string' && ENTITY_SETS.includes(value as EntityTypeSet);
}

function isFsStatement(value: unknown): value is FsStatement {
  return typeof value === 'string' && FS_STATEMENTS.includes(value as FsStatement);
}

async function requireBusinessOps() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'Business Operations') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

export async function GET(req: Request) {
  const auth = await requireBusinessOps();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const entitySetParam = searchParams.get('entitySet');
  const where = isEntitySet(entitySetParam) ? { entitySet: entitySetParam } : {};

  const leadsheets = await prisma.masterLeadsheet.findMany({
    where,
    orderBy: [{ entitySet: 'asc' }, { sortOrder: 'asc' }, { reference: 'asc' }],
    include: {
      groupings: {
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      },
    },
  });

  return NextResponse.json(leadsheets);
}

export async function POST(req: Request) {
  const auth = await requireBusinessOps();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'createLeadsheet') {
    const entitySet = body.entitySet;
    const reference = typeof body.reference === 'string' ? body.reference.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const fsCaption = typeof body.fsCaption === 'string' ? body.fsCaption.trim() : '';
    const fsStatement = body.fsStatement;
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;

    if (!isEntitySet(entitySet) || !reference || !name || !fsCaption || !isFsStatement(fsStatement)) {
      return NextResponse.json({ error: 'Invalid leadsheet payload.' }, { status: 400 });
    }

    const leadsheet = await prisma.masterLeadsheet.create({
      data: {
        entitySet,
        reference,
        name,
        fsCaption,
        fsStatement,
        sortOrder,
        active: body.active !== false,
      },
      include: {
        groupings: {
          orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'MASTER_LEADSHEET',
        entityId: leadsheet.id,
        details: `Created master leadsheet ${entitySet}:${reference} (${name})`,
        performedBy: auth.session.user.username,
      },
    });

    return NextResponse.json(leadsheet);
  }

  if (action === 'createGrouping') {
    const masterLeadsheetId = typeof body.masterLeadsheetId === 'string' ? body.masterLeadsheetId : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;

    if (!masterLeadsheetId || !code || !name) {
      return NextResponse.json({ error: 'Invalid grouping payload.' }, { status: 400 });
    }

    const grouping = await prisma.masterGrouping.create({
      data: {
        masterLeadsheetId,
        code,
        name,
        sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'MASTER_GROUPING',
        entityId: grouping.id,
        details: `Created master grouping ${code} (${name})`,
        performedBy: auth.session.user.username,
      },
    });

    return NextResponse.json(grouping);
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}

export async function PUT(req: Request) {
  const auth = await requireBusinessOps();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'updateLeadsheet') {
    const id = typeof body.id === 'string' ? body.id : '';
    const updateData: Record<string, unknown> = {};

    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    if (typeof body.reference === 'string') updateData.reference = body.reference.trim();
    if (typeof body.name === 'string') updateData.name = body.name.trim();
    if (typeof body.fsCaption === 'string') updateData.fsCaption = body.fsCaption.trim();
    if (isFsStatement(body.fsStatement)) updateData.fsStatement = body.fsStatement;
    if (isEntitySet(body.entitySet)) updateData.entitySet = body.entitySet;
    if (typeof body.active === 'boolean') updateData.active = body.active;
    if (Number.isFinite(Number(body.sortOrder))) updateData.sortOrder = Number(body.sortOrder);

    const leadsheet = await prisma.masterLeadsheet.update({
      where: { id },
      data: updateData,
      include: {
        groupings: {
          orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'MASTER_LEADSHEET',
        entityId: leadsheet.id,
        details: `Updated master leadsheet ${leadsheet.entitySet}:${leadsheet.reference}`,
        performedBy: auth.session.user.username,
      },
    });

    return NextResponse.json(leadsheet);
  }

  if (action === 'updateGrouping') {
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (typeof body.code === 'string') updateData.code = body.code.trim();
    if (typeof body.name === 'string') updateData.name = body.name.trim();
    if (Number.isFinite(Number(body.sortOrder))) updateData.sortOrder = Number(body.sortOrder);

    const grouping = await prisma.masterGrouping.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'MASTER_GROUPING',
        entityId: grouping.id,
        details: `Updated master grouping ${grouping.code}`,
        performedBy: auth.session.user.username,
      },
    });

    return NextResponse.json(grouping);
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const auth = await requireBusinessOps();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required.' }, { status: 400 });
  }

  if (action === 'deleteGrouping') {
    const deleted = await prisma.masterGrouping.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'MASTER_GROUPING',
        entityId: id,
        details: `Deleted master grouping ${deleted.code}`,
        performedBy: auth.session.user.username,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === 'deleteLeadsheet') {
    const deleted = await prisma.masterLeadsheet.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'MASTER_LEADSHEET',
        entityId: id,
        details: `Deleted master leadsheet ${deleted.entitySet}:${deleted.reference}`,
        performedBy: auth.session.user.username,
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
