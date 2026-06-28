import { prisma } from '@/lib/prisma';
import type { Assertion } from '@prisma/client';

const ASSERTIONS: Assertion[] = [
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

function normalizeAssertionTag(value: string): Assertion | null {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '_');
  return ASSERTIONS.includes(normalized as Assertion) ? (normalized as Assertion) : null;
}

function parseAssertionTags(tags: string | null | undefined): Assertion[] {
  if (!tags) return [];
  return tags
    .split(/[;,]/)
    .map(normalizeAssertionTag)
    .filter((item): item is Assertion => Boolean(item));
}

function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return Number(value.toString());
}

export interface CompletionSummary {
  totals: {
    corrected: number;
    uncorrected: number;
    total: number;
  };
  materiality: {
    overall: number | null;
    performance: number | null;
    trivial: number | null;
    exceeded: boolean;
  };
  significantRiskCoverage: {
    total: number;
    linked: number;
    unlinkedReferences: string[];
  };
  coverageMatrix: Array<{
    leadsheetId: string;
    reference: string;
    name: string;
    fsCaption: string;
    amount: number;
    isMaterial: boolean;
    coveredAssertions: Assertion[];
    uncoveredAssertions: Assertion[];
  }>;
}

export async function getCompletionSummary(auditId: string): Promise<CompletionSummary> {
  const [misstatements, materiality, significantRisks, leadsheets, tbAccounts, procedures] = await Promise.all([
    prisma.misstatement.findMany({
      where: { auditId },
      select: {
        amount: true,
        isCorrected: true,
      },
    }),
    prisma.materialityProfile.findUnique({
      where: { auditId },
      select: {
        overallMateriality: true,
        performanceMateriality: true,
        trivialThreshold: true,
      },
    }),
    prisma.risk.findMany({
      where: { auditId, isSignificant: true },
      select: { reference: true, links: { select: { id: true } } },
    }),
    prisma.leadsheet.findMany({
      where: { auditId },
      select: {
        id: true,
        reference: true,
        name: true,
        fsCaption: true,
      },
      orderBy: [{ reference: 'asc' }],
    }),
    prisma.trialBalanceAccount.findMany({
      where: {
        import: { auditId, isCurrentYear: true },
        grouping: { leadsheet: { auditId } },
      },
      select: {
        debit: true,
        credit: true,
        grouping: { select: { leadsheetId: true } },
      },
    }),
    prisma.procedure.findMany({
      where: { auditId, leadsheetId: { not: null } },
      select: {
        id: true,
        leadsheetId: true,
        reviewedDate: true,
        assertions: { select: { assertion: true } },
        questions: { select: { assertionTags: true } },
      },
    }),
  ]);

  const corrected = misstatements
    .filter((item) => item.isCorrected)
    .reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0);
  const uncorrected = misstatements
    .filter((item) => !item.isCorrected)
    .reduce((sum, item) => sum + Math.abs(toNumber(item.amount)), 0);

  const overallMateriality = materiality ? toNumber(materiality.overallMateriality) : null;
  const performanceMateriality = materiality ? toNumber(materiality.performanceMateriality) : null;
  const trivialThreshold = materiality ? toNumber(materiality.trivialThreshold) : null;

  const leadsheetTotals = new Map<string, number>();
  for (const account of tbAccounts) {
    const leadsheetId = account.grouping?.leadsheetId;
    if (!leadsheetId) continue;
    const current = leadsheetTotals.get(leadsheetId) || 0;
    leadsheetTotals.set(leadsheetId, current + (toNumber(account.debit) - toNumber(account.credit)));
  }

  const reviewedProcedures = procedures.filter((procedure) => Boolean(procedure.reviewedDate));
  const coverageByLeadsheet = new Map<string, Set<Assertion>>();
  for (const procedure of reviewedProcedures) {
    if (!procedure.leadsheetId) continue;
    if (!coverageByLeadsheet.has(procedure.leadsheetId)) {
      coverageByLeadsheet.set(procedure.leadsheetId, new Set<Assertion>());
    }
    const assertionSet = coverageByLeadsheet.get(procedure.leadsheetId)!;
    for (const assertion of procedure.assertions.map((item) => item.assertion)) {
      assertionSet.add(assertion);
    }
    for (const question of procedure.questions) {
      for (const assertion of parseAssertionTags(question.assertionTags)) {
        assertionSet.add(assertion);
      }
    }
  }

  const coverageMatrix = leadsheets.map((leadsheet) => {
    const coveredSet = coverageByLeadsheet.get(leadsheet.id) || new Set<Assertion>();
    const coveredAssertions = ASSERTIONS.filter((assertion) => coveredSet.has(assertion));
    const uncoveredAssertions = ASSERTIONS.filter((assertion) => !coveredSet.has(assertion));
    const amount = Math.abs(leadsheetTotals.get(leadsheet.id) || 0);
    const threshold = performanceMateriality || overallMateriality || 0;
    const isMaterial = threshold > 0 ? amount >= threshold : amount > 0;

    return {
      leadsheetId: leadsheet.id,
      reference: leadsheet.reference,
      name: leadsheet.name,
      fsCaption: leadsheet.fsCaption,
      amount,
      isMaterial,
      coveredAssertions,
      uncoveredAssertions,
    };
  });

  const linkedSignificantRiskCount = significantRisks.filter((risk) => risk.links.length > 0).length;

  return {
    totals: {
      corrected,
      uncorrected,
      total: corrected + uncorrected,
    },
    materiality: {
      overall: overallMateriality,
      performance: performanceMateriality,
      trivial: trivialThreshold,
      exceeded: overallMateriality !== null ? uncorrected > overallMateriality : false,
    },
    significantRiskCoverage: {
      total: significantRisks.length,
      linked: linkedSignificantRiskCount,
      unlinkedReferences: significantRisks.filter((risk) => risk.links.length === 0).map((risk) => risk.reference),
    },
    coverageMatrix,
  };
}
