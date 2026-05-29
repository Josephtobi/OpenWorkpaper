import { prisma } from '@/lib/prisma';
import { evaluateProcedureCompliance } from '@/lib/compliance';

export async function getProcedureComplianceStatus(procedureId: string): Promise<{
  isCompliant: boolean;
  blockingIssues: string[];
}> {
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
    include: {
      questions: {
        orderBy: { displayOrder: 'asc' },
      },
      attachments: true,
    },
  });

  if (!procedure) {
    return {
      isCompliant: false,
      blockingIssues: ['Procedure not found for compliance check.'],
    };
  }

  return evaluateProcedureCompliance(procedure.questions, procedure.attachments.length);
}
