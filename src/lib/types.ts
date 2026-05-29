import type { Audit, Procedure, Attachment, TeamMember, ProcedureMessage, ProcedureGroup } from '@prisma/client';

export interface ProcedureQuestionCitation {
  id: string;
  standardType: string;
  reference: string;
  jurisdiction?: string | null;
  displayOrder: number;
}

export interface ProcedureQuestion {
  id: string;
  procedureId: string;
  prompt: string;
  guidance?: string | null;
  questionType: string;
  isRequired: boolean;
  expectedEvidenceCount: number;
  expectedEvidenceTypes?: string | null;
  assertionTags?: string | null;
  riskRating?: string | null;
  controlType?: string | null;
  responseText?: string | null;
  responseBoolean?: boolean | null;
  responseNumber?: number | null;
  responseDate?: string | Date | null;
  responseSelection?: string | null;
  exceptionFlag: boolean;
  exceptionNarrative?: string | null;
  validationStatus: string;
  reviewerStatus: string;
  displayOrder: number;
  citations: ProcedureQuestionCitation[];
}

export type ProcedureWithRelations = Procedure & { 
  displayOrder?: number,
  attachments: Attachment[],
  messages: ProcedureMessage[],
  assignedTo?: TeamMember | null,
  questions?: ProcedureQuestion[]
};

export type ProcedureGroupWithRelations = ProcedureGroup & {
  procedures: ProcedureWithRelations[]
};

export type AuditWithRelations = Audit & { 
  procedures: ProcedureWithRelations[],
  procedureGroups: ProcedureGroupWithRelations[],
  teamMembers: TeamMember[] 
};
