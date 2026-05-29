import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'prisma/schema.prisma',
  'prisma/seed.mjs',
  'src/lib/compliance.ts',
  'src/lib/compliance-gates.ts',
  'src/app/api/audits/[id]/apply-template/route.ts',
  'src/app/api/procedures/[id]/route.ts',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function run() {
  for (const file of requiredFiles) {
    assert(fs.existsSync(path.join(root, file)), `Required file missing: ${file}`);
  }

  const schema = read('prisma/schema.prisma');
  assert(schema.includes('model TemplateProcedureQuestion'), 'Schema missing TemplateProcedureQuestion model');
  assert(schema.includes('model ProcedureQuestion'), 'Schema missing ProcedureQuestion model');
  assert(schema.includes('model TemplateApplication'), 'Schema missing TemplateApplication model');

  const seed = read('prisma/seed.mjs');
  assert(seed.includes('templateProcedureQuestion.create'), 'Seed file does not create structured template questions');
  assert(seed.includes('templateQuestionCitation.createMany'), 'Seed file does not create question citations');

  const procedureRoute = read('src/app/api/procedures/[id]/route.ts');
  assert(
    procedureRoute.includes('failed ISA/ISQM compliance gate'),
    'Procedure route missing review-time compliance gate enforcement'
  );

  console.log('Compliance regression checks passed.');
}

try {
  run();
} catch (error) {
  console.error('Compliance regression failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}
