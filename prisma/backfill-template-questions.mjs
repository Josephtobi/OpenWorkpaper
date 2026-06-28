import * as prismaClientPkg from '@prisma/client';
import * as prismaAdapterPkg from '@prisma/adapter-better-sqlite3';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { PrismaClient } = prismaClientPkg;
const { PrismaBetterSqlite3 } = prismaAdapterPkg;

const dbUrl = process.env.DATABASE_URL || 'file:prisma/data/dev.db';
const sqliteInput = { url: dbUrl.replace(/^file:/, '') };
const adapter = new PrismaBetterSqlite3(sqliteInput);
const prisma = new PrismaClient({ adapter });

function inferStandardType(reference) {
  const upper = reference.toUpperCase();
  if (upper.startsWith('ISA')) return 'ISA';
  if (upper.startsWith('ISQM')) return 'ISQM';
  if (upper.startsWith('IFRS') || upper.startsWith('IAS') || upper.startsWith('IFRIC')) return 'IFRS';
  if (upper.includes('CAMA') || upper.includes('NTA') || upper.includes('FRCN') || upper.includes('PENCOM')) return 'NIGERIA_REGULATION';
  return 'OTHER';
}

function parseBracketCitations(text) {
  if (!text) return [];
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1]
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((reference) => ({
      standardType: inferStandardType(reference),
      reference,
    }));
}

function stripCitationSuffix(text) {
  if (!text) return '';
  return text.replace(/\[[^\]]+\]\s*$/, '').trim();
}

function normalizeKey(value) {
  return (value || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function inferQuestionType(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('yes/no') || lower.includes('state yes/no') || lower.includes('yes/no and')) {
    return 'yes_no_na';
  }
  if (lower.includes('rate') && (lower.includes('high') || lower.includes('medium') || lower.includes('low'))) {
    return 'selection';
  }
  if (lower.includes('date')) return 'date';
  if (lower.includes('number') || lower.includes('amount') || lower.includes('ratio') || lower.includes('%')) {
    return 'numeric';
  }
  return 'narrative';
}

async function loadPrefillMap() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.PREFILL_QUESTIONS_FILE,
    path.resolve(process.cwd(), 'Prefill_Questions_All.md'),
    path.resolve(process.cwd(), 'OpenWorkpaper', 'Prefill_Questions_All.md'),
    path.resolve(process.cwd(), '..', 'Prefill_Questions_All.md'),
    path.resolve(scriptDir, '..', 'Prefill_Questions_All.md'),
  ].filter(Boolean);

  let markdown = null;
  for (const candidate of candidates) {
    try {
      markdown = await fs.readFile(candidate, 'utf8');
      console.log(`[Backfill] Loaded prefill questions from: ${candidate}`);
      break;
    } catch {
      // Try next candidate.
    }
  }

  if (!markdown) {
    const attempted = candidates.map((candidate) => path.resolve(candidate)).join(', ');
    console.warn(
      `[Backfill] Prefill_Questions_All.md not found. Tried: ${attempted}. Falling back to default single-question generation.`
    );
    return new Map();
  }

  const map = new Map();
  const lines = markdown.split(/\r?\n/);
  let currentTemplate = null;
  let currentGroup = null;
  let currentProcedure = null;
  let sectionPrefix = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('# TEMPLATE:')) {
      currentTemplate = line.replace('# TEMPLATE:', '').trim();
      currentGroup = null;
      currentProcedure = null;
      sectionPrefix = '';
      continue;
    }
    if (line.startsWith('## GROUP:')) {
      currentGroup = line.replace('## GROUP:', '').trim();
      currentProcedure = null;
      sectionPrefix = '';
      continue;
    }
    if (line.startsWith('### ')) {
      currentProcedure = line.replace('### ', '').trim();
      sectionPrefix = '';
      continue;
    }
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (!currentTemplate || !currentGroup || !currentProcedure) continue;
      let prompt = numberMatch[1].trim();
      if (sectionPrefix) {
        prompt = `${sectionPrefix} — ${prompt}`;
      }

      const key = `${normalizeKey(currentTemplate)}|${normalizeKey(currentGroup)}|${normalizeKey(currentProcedure)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(prompt);
      continue;
    }

    if (/^[A-Z0-9][^:]{3,}:$/.test(line)) {
      sectionPrefix = line.replace(/:$/, '').trim();
      continue;
    }
  }

  return map;
}

async function backfillTemplateQuestions() {
  const prefillMap = await loadPrefillMap();

  const procedures = await prisma.templateProcedure.findMany({
    include: {
      template: true,
      group: true,
      questions: true,
    },
  });

  let createdTemplateQuestions = 0;
  let replacedTemplateQuestions = 0;
  for (const procedure of procedures) {
    const key = `${normalizeKey(procedure.template.name)}|${normalizeKey(procedure.group?.title || '')}|${normalizeKey(procedure.title)}`;
    const prefillQuestions = prefillMap.get(key) || [];

    if (prefillQuestions.length > 0) {
      if (procedure.questions.length > 0) {
        const questionIds = procedure.questions.map((q) => q.id);
        if (questionIds.length > 0) {
          await prisma.templateQuestionCitation.deleteMany({
            where: { templateQuestionId: { in: questionIds } },
          });
        }
        await prisma.templateProcedureQuestion.deleteMany({
          where: { templateProcedureId: procedure.id },
        });
      }
      const citations = parseBracketCitations(procedure.purpose);
      for (const [index, prompt] of prefillQuestions.entries()) {
        const question = await prisma.templateProcedureQuestion.create({
          data: {
            templateProcedureId: procedure.id,
            prompt,
            guidance: procedure.purpose,
            questionType: inferQuestionType(prompt),
            isRequired: true,
            expectedEvidenceCount: 1,
            riskRating: 'Moderate',
            controlType: 'Substantive',
            displayOrder: index,
          },
        });
        if (citations.length > 0) {
          await prisma.templateQuestionCitation.createMany({
            data: citations.map((citation, citationIndex) => ({
              templateQuestionId: question.id,
              standardType: citation.standardType,
              reference: citation.reference,
              displayOrder: citationIndex,
            })),
          });
        }
      }
      replacedTemplateQuestions += prefillQuestions.length;
      continue;
    }

    if (procedure.questions.length > 0) continue;
    const question = await prisma.templateProcedureQuestion.create({
      data: {
        templateProcedureId: procedure.id,
        prompt: stripCitationSuffix(procedure.purpose) || procedure.title,
        guidance: procedure.purpose,
        questionType: 'narrative',
        isRequired: true,
        expectedEvidenceCount: 1,
        riskRating: 'Moderate',
        controlType: 'Substantive',
        displayOrder: 0,
      },
    });
    const citations = parseBracketCitations(procedure.purpose);
    if (citations.length > 0) {
      await prisma.templateQuestionCitation.createMany({
        data: citations.map((citation, index) => ({
          templateQuestionId: question.id,
          standardType: citation.standardType,
          reference: citation.reference,
          displayOrder: index,
        })),
      });
    }
    createdTemplateQuestions++;
  }

  const liveProcedures = await prisma.procedure.findMany({
    include: { questions: true },
  });
  let createdProcedureQuestions = 0;
  for (const procedure of liveProcedures) {
    if (procedure.questions.length > 0) continue;
    const question = await prisma.procedureQuestion.create({
      data: {
        procedureId: procedure.id,
        prompt: stripCitationSuffix(procedure.purpose) || procedure.title || 'Document procedure response.',
        guidance: procedure.purpose,
        questionType: 'narrative',
        isRequired: true,
        expectedEvidenceCount: 1,
        riskRating: 'Moderate',
        controlType: 'Substantive',
        displayOrder: 0,
      },
    });
    const citations = parseBracketCitations(procedure.purpose);
    if (citations.length > 0) {
      await prisma.procedureQuestionCitation.createMany({
        data: citations.map((citation, index) => ({
          procedureQuestionId: question.id,
          standardType: citation.standardType,
          reference: citation.reference,
          displayOrder: index,
        })),
      });
    }
    createdProcedureQuestions++;
  }

  console.log(
    `[Backfill] Replaced ${replacedTemplateQuestions} template questions from prefill list, created ${createdTemplateQuestions} fallback template questions, and created ${createdProcedureQuestions} procedure questions.`
  );
}

backfillTemplateQuestions()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
