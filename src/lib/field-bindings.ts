import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { BindType } from '@prisma/client';

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return Number(value.toString());
}

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function netAmount(debit: Prisma.Decimal | number, credit: Prisma.Decimal | number): number {
  return toNumber(debit) - toNumber(credit);
}

export async function computeLeadsheetTotal(leadsheetId: string): Promise<number> {
  const accounts = await prisma.trialBalanceAccount.findMany({
    where: { grouping: { leadsheetId }, import: { isCurrentYear: true } },
    select: { debit: true, credit: true },
  });
  return accounts.reduce((sum, account) => sum + netAmount(account.debit, account.credit), 0);
}

export async function computeGroupingTotal(groupingId: string): Promise<number> {
  const accounts = await prisma.trialBalanceAccount.findMany({
    where: { groupingId, import: { isCurrentYear: true } },
    select: { debit: true, credit: true },
  });
  return accounts.reduce((sum, account) => sum + netAmount(account.debit, account.credit), 0);
}

export async function computeAccountTotal(accountId: string): Promise<number> {
  const account = await prisma.trialBalanceAccount.findUnique({
    where: { id: accountId },
    select: { debit: true, credit: true },
  });
  if (!account) return 0;
  return netAmount(account.debit, account.credit);
}

async function computePriorYearCaptionTotal(leadsheetId: string): Promise<number> {
  const leadsheet = await prisma.leadsheet.findUnique({
    where: { id: leadsheetId },
    include: {
      audit: { select: { id: true } },
    },
  });
  if (!leadsheet) return 0;

  const priorYearAccounts = await prisma.trialBalanceAccount.findMany({
    where: {
      grouping: {
        leadsheet: {
          auditId: leadsheet.auditId,
          fsCaption: leadsheet.fsCaption,
        },
      },
      import: { isCurrentYear: false },
    },
    select: { debit: true, credit: true },
  });

  return priorYearAccounts.reduce((sum, account) => sum + netAmount(account.debit, account.credit), 0);
}

export async function computeBindingValue(binding: {
  bindType: BindType;
  leadsheetId: string | null;
  groupingId: string | null;
  accountId: string | null;
}): Promise<number> {
  switch (binding.bindType) {
    case 'LEADSHEET_TOTAL':
      return binding.leadsheetId ? computeLeadsheetTotal(binding.leadsheetId) : 0;
    case 'GROUPING_TOTAL':
      return binding.groupingId ? computeGroupingTotal(binding.groupingId) : 0;
    case 'ACCOUNT':
      return binding.accountId ? computeAccountTotal(binding.accountId) : 0;
    case 'PRIOR_YEAR':
      return binding.leadsheetId ? computePriorYearCaptionTotal(binding.leadsheetId) : 0;
    default:
      return 0;
  }
}

export async function refreshBindingCache(bindingId: string): Promise<void> {
  const binding = await prisma.fieldBinding.findUnique({
    where: { id: bindingId },
    select: {
      id: true,
      bindType: true,
      leadsheetId: true,
      groupingId: true,
      accountId: true,
    },
  });

  if (!binding) {
    throw new Error('Field binding not found.');
  }

  const value = await computeBindingValue(binding);
  await prisma.fieldBinding.update({
    where: { id: binding.id },
    data: {
      cachedValue: toDecimal(value),
      cachedAt: new Date(),
    },
  });
}

export async function refreshProcedureBindingCache(procedureId: string): Promise<void> {
  const bindings = await prisma.fieldBinding.findMany({
    where: { procedureId },
    select: { id: true },
  });

  for (const binding of bindings) {
    await refreshBindingCache(binding.id);
  }
}
