import { prisma } from '@/lib/prisma';
import type { AuditStageOverride, AuditStageProgress, EngagementStageKey, StageStatus } from '@prisma/client';
import { getCompletionSummary } from '@/lib/completion';

export const STAGE_SEQUENCE: EngagementStageKey[] = [
  'ACCEPTANCE',
  'UNDERSTANDING',
  'RISK',
  'MATERIALITY',
  'SAMPLING',
  'FIELDWORK',
  'COMPLETION',
  'OPINION',
];

export interface StageGateIssue {
  code: string;
  message: string;
  severity: 'warning' | 'blocker';
  canOverride: boolean;
}

export interface StageEvaluation {
  stage: EngagementStageKey;
  status: StageStatus;
  tailoringNotes: string | null;
  gateIssues: StageGateIssue[];
  unresolvedBlockers: StageGateIssue[];
  overrides: Pick<AuditStageOverride, 'id' | 'gateCode' | 'reason' | 'overriddenBy' | 'createdAt'>[];
}

type StageWithOverrides = AuditStageProgress & {
  overrides: AuditStageOverride[];
};

function phaseToBlockingRules(
  stage: EngagementStageKey,
  context: {
    engagementAccepted: boolean;
    engagementLetterSigned: boolean;
    stageMap: Map<EngagementStageKey, StageWithOverrides>;
    reviewedFieldworkProcedures: number;
    significantRiskCount: number;
    linkedSignificantRiskCount: number;
    hasMaterialityProfile: boolean;
    uncorrectedExceedsMateriality: boolean;
    hasOpinionDecision: boolean;
  }
): StageGateIssue[] {
  const issues: StageGateIssue[] = [];

  if (stage === 'FIELDWORK') {
    if (!context.engagementAccepted) {
      issues.push({
        code: 'acceptance-not-confirmed',
        message: 'Engagement acceptance is not confirmed for this audit.',
        severity: 'blocker',
        canOverride: true,
      });
    }
    if (!context.engagementLetterSigned) {
      issues.push({
        code: 'engagement-letter-missing',
        message: 'Signed engagement letter is not confirmed.',
        severity: 'blocker',
        canOverride: true,
      });
    }
  }

  if (stage === 'COMPLETION' || stage === 'OPINION') {
    const fieldworkStage = context.stageMap.get('FIELDWORK');
    if (!fieldworkStage || fieldworkStage.status !== 'COMPLETED') {
      issues.push({
        code: 'fieldwork-not-completed',
        message: 'Fieldwork stage should be completed before completion/opinion stages.',
        severity: 'blocker',
        canOverride: true,
      });
    }
    if (context.reviewedFieldworkProcedures === 0) {
      issues.push({
        code: 'no-reviewed-fieldwork',
        message: 'No reviewed fieldwork procedures found. Complete review before progressing.',
        severity: 'warning',
        canOverride: true,
      });
    }
  }

  if (stage === 'FIELDWORK' || stage === 'COMPLETION' || stage === 'OPINION') {
    if (context.significantRiskCount > 0 && context.linkedSignificantRiskCount < context.significantRiskCount) {
      issues.push({
        code: 'significant-risk-linkage-gap',
        message: 'One or more significant risks are not linked to procedures.',
        severity: 'blocker',
        canOverride: true,
      });
    }
  }

  if (stage === 'SAMPLING' || stage === 'COMPLETION' || stage === 'OPINION') {
    if (!context.hasMaterialityProfile) {
      issues.push({
        code: 'materiality-not-set',
        message: 'Materiality profile is required before sampling and completion stages.',
        severity: 'blocker',
        canOverride: true,
      });
    }
  }

  if (stage === 'OPINION') {
    const completionStage = context.stageMap.get('COMPLETION');
    if (!completionStage || completionStage.status !== 'COMPLETED') {
      issues.push({
        code: 'completion-not-completed',
        message: 'Completion stage should be completed before opinion stage.',
        severity: 'blocker',
        canOverride: true,
      });
    }
    if (context.uncorrectedExceedsMateriality && !context.hasOpinionDecision) {
      issues.push({
        code: 'modified-opinion-decision-required',
        message: 'Uncorrected misstatements exceed overall materiality; explicit modified-opinion decision is required.',
        severity: 'blocker',
        canOverride: true,
      });
    }
  }

  return issues;
}

function unresolvedBlockersForStage(gates: StageGateIssue[], overrides: AuditStageOverride[]): StageGateIssue[] {
  const overriddenCodes = new Set(overrides.map((o) => o.gateCode));
  return gates.filter((gate) => gate.severity === 'blocker' && !overriddenCodes.has(gate.code));
}

export async function getOrCreateAuditStageProgress(auditId: string, stage: EngagementStageKey): Promise<StageWithOverrides> {
  return prisma.auditStageProgress.upsert({
    where: { auditId_stage: { auditId, stage } },
    update: {},
    create: { auditId, stage },
    include: { overrides: { orderBy: { createdAt: 'desc' } } },
  });
}

export async function evaluateAuditStages(auditId: string): Promise<{
  engagementAccepted: boolean;
  engagementLetterSigned: boolean;
  stages: StageEvaluation[];
}> {
  const [audit, progressRows, reviewedFieldworkProcedures, significantRiskCount, linkedSignificantRiskCount, materialityProfile, opinion, completion] = await Promise.all([
    prisma.audit.findUnique({
      where: { id: auditId },
      select: {
        engagementAccepted: true,
        engagementLetterSigned: true,
      },
    }),
    prisma.auditStageProgress.findMany({
      where: { auditId },
      include: {
        overrides: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.procedure.count({
      where: {
        auditId,
        phase: 'Fieldwork',
        reviewedDate: { not: null },
      },
    }),
    prisma.risk.count({
      where: { auditId, isSignificant: true },
    }),
    prisma.risk.count({
      where: {
        auditId,
        isSignificant: true,
        links: { some: {} },
      },
    }),
    prisma.materialityProfile.findUnique({
      where: { auditId },
      select: { id: true, overallMateriality: true },
    }),
    prisma.auditOpinion.findUnique({
      where: { auditId },
      select: { id: true, opinionType: true, requiresModification: true, modifiedDecisionReason: true },
    }),
    getCompletionSummary(auditId),
  ]);

  const exceedsMateriality = completion.materiality.exceeded;
  const hasOpinionDecision =
    Boolean(opinion) &&
    (!exceedsMateriality || (Boolean(opinion?.modifiedDecisionReason) && (opinion?.opinionType || '').length > 0));

  if (!audit) {
    throw new Error('Audit not found.');
  }

  const stageMap = new Map<EngagementStageKey, StageWithOverrides>(
    progressRows.map((row: any) => [row.stage, row as StageWithOverrides])
  );

  const stages = STAGE_SEQUENCE.map((stage): StageEvaluation => {
    const row = stageMap.get(stage) || {
      id: '',
      auditId,
      stage,
      status: 'NOT_STARTED' as StageStatus,
      tailoringNotes: null,
      completedAt: null,
      completedBy: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      overrides: [],
    };

    const gateIssues = phaseToBlockingRules(stage, {
      engagementAccepted: audit.engagementAccepted,
      engagementLetterSigned: audit.engagementLetterSigned,
      stageMap,
      reviewedFieldworkProcedures,
      significantRiskCount,
      linkedSignificantRiskCount,
      hasMaterialityProfile: Boolean(materialityProfile),
      uncorrectedExceedsMateriality: exceedsMateriality,
      hasOpinionDecision,
    });

    return {
      stage,
      status: row.status,
      tailoringNotes: row.tailoringNotes ?? null,
      gateIssues,
      unresolvedBlockers: unresolvedBlockersForStage(gateIssues, row.overrides),
      overrides: row.overrides.map((override) => ({
        id: override.id,
        gateCode: override.gateCode,
        reason: override.reason,
        overriddenBy: override.overriddenBy,
        createdAt: override.createdAt,
      })),
    };
  });

  return {
    engagementAccepted: audit.engagementAccepted,
    engagementLetterSigned: audit.engagementLetterSigned,
    stages,
  };
}
