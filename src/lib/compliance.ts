export const QUESTION_TYPES = [
  'yes_no_na',
  'narrative',
  'numeric',
  'selection',
  'date',
  'document_required',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type CitationInput = {
  standardType: string;
  reference: string;
  jurisdiction?: string | null;
};

export type TemplateQuestionInput = {
  prompt: string;
  guidance?: string | null;
  questionType?: string;
  isRequired?: boolean;
  expectedEvidenceCount?: number;
  expectedEvidenceTypes?: string | null;
  assertionTags?: string | null;
  riskRating?: string | null;
  controlType?: string | null;
  displayOrder?: number;
  citations?: CitationInput[];
};

type ProcedureComplianceQuestion = {
  id: string;
  prompt: string;
  questionType: string;
  isRequired: boolean;
  expectedEvidenceCount: number;
  responseText: string | null;
  responseBoolean: boolean | null;
  responseNumber: number | null;
  responseDate: Date | null;
  responseSelection: string | null;
  exceptionFlag: boolean;
  validationStatus: string;
};

export function normalizeQuestionType(value?: string | null): QuestionType {
  if (value && QUESTION_TYPES.includes(value as QuestionType)) {
    return value as QuestionType;
  }
  return 'narrative';
}

export function inferStandardType(reference: string): string {
  const upper = reference.toUpperCase();
  if (upper.startsWith('ISA')) return 'ISA';
  if (upper.startsWith('ISQM')) return 'ISQM';
  if (upper.startsWith('IFRS') || upper.startsWith('IAS') || upper.startsWith('IFRIC')) return 'IFRS';
  if (upper.includes('CAMA') || upper.includes('NTA') || upper.includes('FRCN') || upper.includes('PENCOM')) {
    return 'NIGERIA_REGULATION';
  }
  return 'OTHER';
}

export function parseBracketCitations(text?: string | null): CitationInput[] {
  if (!text) return [];
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1]
    .split(';')
    .map((ref) => ref.trim())
    .filter(Boolean)
    .map((reference, index) => ({
      standardType: inferStandardType(reference),
      reference: reference.replace(/\s+/g, ' ').trim(),
      jurisdiction: index === 0 ? null : null,
    }));
}

export function stripCitationBrackets(text?: string | null): string {
  if (!text) return '';
  return text.replace(/\[[^\]]+\]\s*$/, '').trim();
}

export function buildDefaultQuestionFromProcedure(input: {
  title?: string | null;
  purpose?: string | null;
}): TemplateQuestionInput {
  const prompt = stripCitationBrackets(input.purpose) || input.title || 'Document procedure conclusion and evidence.';
  return {
    prompt,
    guidance: input.purpose || null,
    questionType: 'narrative',
    isRequired: true,
    expectedEvidenceCount: 1,
    riskRating: 'Moderate',
    controlType: 'Substantive',
    citations: parseBracketCitations(input.purpose),
  };
}

export function evaluateProcedureCompliance(
  questions: ProcedureComplianceQuestion[],
  attachmentCount: number
): {
  isCompliant: boolean;
  blockingIssues: string[];
} {
  const blockingIssues: string[] = [];

  for (const question of questions) {
    if (!question.isRequired) continue;
    const hasAnswer =
      (question.responseText && question.responseText.trim().length > 0) ||
      question.responseBoolean !== null ||
      question.responseNumber !== null ||
      question.responseDate !== null ||
      (question.responseSelection && question.responseSelection.trim().length > 0);

    if (!hasAnswer) {
      blockingIssues.push(`Required question is unanswered: ${question.prompt}`);
      continue;
    }

    if (question.expectedEvidenceCount > 0 && attachmentCount < question.expectedEvidenceCount) {
      blockingIssues.push(
        `Insufficient evidence for question "${question.prompt}". Required: ${question.expectedEvidenceCount}, attached: ${attachmentCount}.`
      );
    }

    if (question.exceptionFlag && question.validationStatus !== 'Resolved') {
      blockingIssues.push(`Unresolved exception exists for question: ${question.prompt}`);
    }
  }

  return {
    isCompliant: blockingIssues.length === 0,
    blockingIssues,
  };
}
