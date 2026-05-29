import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

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

async function backfillTemplateQuestions() {
  const procedures = await prisma.templateProcedure.findMany({
    include: {
      questions: true,
    },
  });

  let createdTemplateQuestions = 0;
  for (const procedure of procedures) {
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

  console.log(`Created ${createdTemplateQuestions} template questions and ${createdProcedureQuestions} procedure questions.`);
}

backfillTemplateQuestions()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
