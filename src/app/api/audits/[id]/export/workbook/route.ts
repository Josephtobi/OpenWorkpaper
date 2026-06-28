import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canAccessAudit } from '@/lib/audit-access';
import { getCompletionSummary } from '@/lib/completion';

function cleanSheetName(name: string): string {
  return name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet';
}

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: auditId } = await props.params;
    const allowed = await canAccessAudit(session.user, auditId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [audit, procedures, misstatements, completion] = await Promise.all([
      prisma.audit.findUnique({
        where: { id: auditId },
        include: { teamMembers: true },
      }),
      prisma.procedure.findMany({
        where: { auditId },
        include: {
          questions: { orderBy: { displayOrder: 'asc' } },
          attachments: true,
        },
        orderBy: [{ phase: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.misstatement.findMany({
        where: { auditId },
        include: {
          procedure: { select: { title: true, phase: true } },
          leadsheet: { select: { reference: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
      getCompletionSummary(auditId),
    ]);

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const workbook = XLSX.utils.book_new();

    const indexRows = [
      { Field: 'Audit Title', Value: audit.title },
      { Field: 'Audit Number', Value: audit.auditNumber || '' },
      { Field: 'Category', Value: audit.category || '' },
      { Field: 'Status', Value: audit.status },
      { Field: 'Exported At', Value: new Date().toISOString() },
      { Field: 'Exported By', Value: session.user.username },
    ];
    const indexSheet = XLSX.utils.json_to_sheet(indexRows);
    XLSX.utils.book_append_sheet(workbook, indexSheet, 'Index');

    const completionRows = [
      { Metric: 'Corrected Misstatements', Value: completion.totals.corrected },
      { Metric: 'Uncorrected Misstatements', Value: completion.totals.uncorrected },
      { Metric: 'Total Misstatements', Value: completion.totals.total },
      { Metric: 'Overall Materiality', Value: completion.materiality.overall ?? '' },
      { Metric: 'Performance Materiality', Value: completion.materiality.performance ?? '' },
      { Metric: 'Trivial Threshold', Value: completion.materiality.trivial ?? '' },
      { Metric: 'Uncorrected Exceeds Overall Materiality', Value: completion.materiality.exceeded ? 'Yes' : 'No' },
      {
        Metric: 'Significant Risk Linkage',
        Value: `${completion.significantRiskCoverage.linked}/${completion.significantRiskCoverage.total}`,
      },
      {
        Metric: 'Unlinked Significant Risks',
        Value: completion.significantRiskCoverage.unlinkedReferences.join(', '),
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(completionRows), 'Completion Summary');

    const misstatementRows = misstatements.map((item) => ({
      Account: item.accountLabel,
      Assertion: item.assertion,
      Amount: Number(item.amount.toString()),
      Direction: item.direction,
      Corrected: item.isCorrected ? 'Yes' : 'No',
      Procedure: item.procedure?.title || '',
      Phase: item.procedure?.phase || '',
      Leadsheet: item.leadsheet ? `${item.leadsheet.reference} - ${item.leadsheet.name}` : '',
      Description: item.description || '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(misstatementRows), 'Misstatements');

    const coverageRows = completion.coverageMatrix.map((row) => ({
      Leadsheet: `${row.reference} - ${row.name}`,
      Caption: row.fsCaption,
      Amount: row.amount,
      Material: row.isMaterial ? 'Yes' : 'No',
      CoveredAssertions: row.coveredAssertions.join(', '),
      UncoveredAssertions: row.uncoveredAssertions.join(', '),
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(coverageRows), 'Coverage Matrix');

    const procedureIndexRows: Array<{ Sheet: string; Phase: string; Title: string }> = [];
    for (let i = 0; i < procedures.length; i++) {
      const procedure = procedures[i];
      const sheetName = cleanSheetName(`${procedure.phase.slice(0, 1)}-${i + 1}-${procedure.title || 'Procedure'}`);
      procedureIndexRows.push({ Sheet: sheetName, Phase: procedure.phase, Title: procedure.title || 'Untitled' });

      const questionRows = procedure.questions.map((question) => ({
        Prompt: question.prompt,
        ResponseText: question.responseText || '',
        ResponseBoolean: question.responseBoolean === null ? '' : question.responseBoolean ? 'Yes' : 'No',
        ResponseNumber: question.responseNumber ?? '',
        ResponseSelection: question.responseSelection || '',
        ValidationStatus: question.validationStatus,
        ReviewerStatus: question.reviewerStatus,
      }));

      const metadataRows = [
        { Field: 'Phase', Value: procedure.phase },
        { Field: 'Title', Value: procedure.title || '' },
        { Field: 'Status', Value: procedure.status },
        { Field: 'Prepared By', Value: procedure.preparedBy || '' },
        { Field: 'Reviewed By', Value: procedure.reviewedBy || '' },
        { Field: 'Leadsheet Id', Value: procedure.leadsheetId || '' },
        { Field: 'Attachment Count', Value: procedure.attachments.length },
      ];

      const metaSheet = XLSX.utils.json_to_sheet(metadataRows);
      XLSX.utils.sheet_add_json(metaSheet, questionRows, { origin: 'A10' });
      XLSX.utils.book_append_sheet(workbook, metaSheet, sheetName);
    }
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(procedureIndexRows), 'Working Papers');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const safeTitle = audit.title.replace(/[^a-zA-Z0-9_-]+/g, '_');
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeTitle}_Connected_Workbook.xlsx"`,
      },
    });
  } catch (error) {
    console.error('[Workbook Export API] GET error:', error);
    return NextResponse.json({ error: 'Failed to generate workbook export.' }, { status: 500 });
  }
}
