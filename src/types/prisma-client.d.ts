declare module '@prisma/client' {
  export type TeamMember = {
    id: string;
    auditId: string;
    userId: string | null;
    name: string;
    role: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Attachment = {
    id: string;
    procedureId: string;
    filename: string;
    filepath: string;
    mimetype: string | null;
    size: number | null;
    displayOrder: number | null;
    preparedBy: string | null;
    preparedDate: Date | null;
    reviewedBy: string | null;
    reviewedDate: Date | null;
    createdAt: Date;
  };

  export type ProcedureMessage = {
    id: string;
    procedureId: string;
    text: string;
    sender: string;
    createdAt: Date;
  };

  export type ProcedureGroup = {
    id: string;
    auditId: string;
    phase: string;
    title: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Procedure = {
    id: string;
    auditId: string;
    groupId: string | null;
    phase: string;
    title: string | null;
    purpose: string | null;
    source: string | null;
    scope: string | null;
    methodology: string | null;
    results: string | null;
    conclusions: string | null;
    status: string;
    preparedBy: string | null;
    preparedDate: Date | null;
    reviewedBy: string | null;
    reviewedDate: Date | null;
    assignedToId: string | null;
    leadsheetId: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Audit = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    auditNumber: string | null;
    objective: string | null;
    status: string;
    entityType: 'UNIVERSAL' | 'COMMERCIAL' | 'NGO' | null;
    pbcRequests: string | null;
    fieldworkStartDate: Date | null;
    fieldworkEndDate: Date | null;
    reportIssuedDate: Date | null;
    milestoneAttachmentUrl: string | null;
    milestoneAttachmentName: string | null;
    pbcAttachmentUrl: string | null;
    pbcAttachmentName: string | null;
    engagementAccepted: boolean;
    engagementLetterSigned: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  export type Assertion =
    | 'EXISTENCE'
    | 'COMPLETENESS'
    | 'VALUATION'
    | 'RIGHTS_OBLIGATIONS'
    | 'CUTOFF'
    | 'CLASSIFICATION'
    | 'PRESENTATION'
    | 'OCCURRENCE'
    | 'ACCURACY';

  export type RiskCategory =
    | 'FRAUD'
    | 'ERROR'
    | 'GOING_CONCERN'
    | 'COMPLIANCE'
    | 'RELATED_PARTY'
    | 'ESTIMATE';

  export type RiskRating = 'HIGH' | 'MEDIUM' | 'LOW';

  export type BindType = 'LEADSHEET_TOTAL' | 'GROUPING_TOTAL' | 'ACCOUNT' | 'PRIOR_YEAR';

  export type FsStatement = 'SOFP' | 'PROFIT_LOSS' | 'EQUITY' | 'CASHFLOW';

  export type EngagementStageKey =
    | 'ACCEPTANCE'
    | 'UNDERSTANDING'
    | 'RISK'
    | 'MATERIALITY'
    | 'SAMPLING'
    | 'FIELDWORK'
    | 'COMPLETION'
    | 'OPINION';

  export type StageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

  export type AuditStageOverride = {
    id: string;
    auditId: string;
    stageProgressId: string;
    gateCode: string;
    gateMessage: string;
    reason: string;
    overriddenBy: string | null;
    createdAt: Date;
  };

  export type AuditStageProgress = {
    id: string;
    auditId: string;
    stage: EngagementStageKey;
    status: StageStatus;
    tailoringNotes: string | null;
    completedAt: Date | null;
    completedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  export namespace Prisma {
    export class Decimal {
      constructor(value: string | number);
      toString(): string;
    }

    type TransactionClient = any;

    type ProcedureQuestionUncheckedUpdateInput = Record<string, unknown>;
    type ProcedureQuestionUncheckedCreateInput = Record<string, unknown>;

    export function sql(strings: TemplateStringsArray, ...values: unknown[]): unknown;
  }

  export class PrismaClient {
    constructor(options?: Record<string, unknown>);
    $queryRaw<T = unknown>(query: unknown): Promise<T>;
    $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
    $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
    $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    audit: any;
    teamMember: any;
    procedure: any;
    procedureGroup: any;
    procedureQuestion: any;
    procedureQuestionCitation: any;
    attachment: any;
    auditLog: any;
    auditTemplate: any;
    templateProcedure: any;
    templateGroup: any;
    templateProcedureQuestion: any;
    templateQuestionCitation: any;
    templateApplication: any;
    risk: any;
    riskAssertion: any;
    riskProcedureLink: any;
    materialityProfile: any;
    samplingPlan: any;
    misstatement: any;
    auditOpinion: any;
    auditStageProgress: any;
    auditStageOverride: any;
    trialBalanceImport: any;
    trialBalanceAccount: any;
    leadsheet: any;
    grouping: any;
    fieldBinding: any;
    masterLeadsheet: any;
    masterGrouping: any;
    user: any;
    procedureMessage: any;
    procedureAssertion: any;
  }
}
