type EntityTypeSet = 'UNIVERSAL' | 'COMMERCIAL' | 'NGO';
type TxClient = any;

const MASTER_BASE_SET: EntityTypeSet = 'UNIVERSAL';
const ENGAGEMENT_ENTITY_SETS: EntityTypeSet[] = ['COMMERCIAL', 'NGO'];

export function isEngagementEntityTypeSet(value: unknown): value is EntityTypeSet {
  return typeof value === 'string' && ENGAGEMENT_ENTITY_SETS.includes(value as EntityTypeSet);
}

export async function cloneMasterLeadsheetsToAudit(
  tx: TxClient,
  auditId: string,
  entityType: EntityTypeSet
) {
  const masters = await tx.masterLeadsheet.findMany({
    where: {
      active: true,
      entitySet: {
        in: [MASTER_BASE_SET, entityType],
      },
    },
    include: {
      groupings: {
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { reference: 'asc' }],
  });

  for (const master of masters) {
    const leadsheet = await tx.leadsheet.create({
      data: {
        auditId,
        reference: master.reference,
        name: master.name,
        fsCaption: master.fsCaption,
        fsStatement: master.fsStatement,
      },
    });

    for (const grouping of master.groupings) {
      await tx.grouping.create({
        data: {
          leadsheetId: leadsheet.id,
          code: grouping.code,
          name: grouping.name,
        },
      });
    }
  }
}

export async function cloneLeadsheetsFromAudit(tx: TxClient, sourceAuditId: string, targetAuditId: string) {
  const sourceLeadsheets = await tx.leadsheet.findMany({
    where: { auditId: sourceAuditId },
    include: {
      groupings: {
        orderBy: [{ code: 'asc' }],
      },
    },
    orderBy: [{ reference: 'asc' }],
  });

  for (const sourceLeadsheet of sourceLeadsheets) {
    const clonedLeadsheet = await tx.leadsheet.create({
      data: {
        auditId: targetAuditId,
        reference: sourceLeadsheet.reference,
        name: sourceLeadsheet.name,
        fsCaption: sourceLeadsheet.fsCaption,
        fsStatement: sourceLeadsheet.fsStatement,
      },
    });

    for (const sourceGrouping of sourceLeadsheet.groupings) {
      await tx.grouping.create({
        data: {
          leadsheetId: clonedLeadsheet.id,
          code: sourceGrouping.code,
          name: sourceGrouping.name,
        },
      });
    }
  }
}
