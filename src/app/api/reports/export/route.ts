import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

interface ProcedureExport {
  auditTitle: string;
  auditStatus: string;
  procedureId: string;
  phase: string;
  procedureTitle: string | null;
  preparedBy: string | null;
  preparedDate: string | number | null;
  reviewedBy: string | null;
  reviewedDate: string | number | null;
  assignedToName: string | null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profile = searchParams.get('profile') || 'standard';
    const session = await getSession();
    if (!session || session.user.role !== 'Business Operations') {
      return NextResponse.json({ error: 'Unauthorized. Business Operations only.' }, { status: 403 });
    }

    const procedures = await prisma.$queryRawUnsafe<ProcedureExport[]>(
      `SELECT 
        a.title as auditTitle,
        a.status as auditStatus,
        p.id as procedureId,
        p.phase,
        p.title as procedureTitle,
        p.preparedBy,
        p.preparedDate,
        p.reviewedBy,
        p.reviewedDate,
        t.name as assignedToName
      FROM Procedure p
      JOIN Audit a ON p.auditId = a.id
      LEFT JOIN TeamMember t ON p.assignedToId = t.id
      ORDER BY a.createdAt DESC, p.phase, p.displayOrder ASC`
    );

    const reportData = procedures.map(p => {
      const prepDate = p.preparedDate ? new Date(p.preparedDate) : null;
      const revDate = p.reviewedDate ? new Date(p.reviewedDate) : null;
      
      let reviewLag = '';
      if (prepDate && revDate) {
        const diffTime = Math.abs(revDate.getTime() - prepDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        reviewLag = diffDays.toString();
      }

      let status = 'Not Started';
      if (p.reviewedBy && p.reviewedDate) status = 'Completed';
      else if (p.preparedBy && p.preparedDate) status = 'Pending Review';
      else if (p.assignedToName) status = 'In Progress';

      return {
        'Audit Title': p.auditTitle,
        'Audit Status': p.auditStatus,
        'Phase': p.phase,
        'Procedure Title': p.procedureTitle || 'Untitled',
        'Status': status,
        'Assigned To': p.assignedToName || 'Unassigned',
        'Prepared By': p.preparedBy || '',
        'Prepared Date': p.preparedDate ? new Date(p.preparedDate).toLocaleDateString() : '',
        'Reviewed By': p.reviewedBy || '',
        'Reviewed Date': p.reviewedDate ? new Date(p.reviewedDate).toLocaleDateString() : '',
        'Review Lag (Days)': reviewLag
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Global Procedures');

    const questionCitations = await prisma.procedureQuestionCitation.findMany({
      include: {
        procedureQuestion: {
          include: {
            procedure: {
              include: {
                audit: true,
              },
            },
          },
        },
      },
      orderBy: [{ standardType: 'asc' }, { reference: 'asc' }],
    });

    const isaCoverageRows = questionCitations
      .filter((citation) => citation.standardType === 'ISA' || citation.standardType === 'ISQM')
      .map((citation) => ({
        'Audit': citation.procedureQuestion.procedure.audit.title,
        'Phase': citation.procedureQuestion.procedure.phase,
        'Procedure': citation.procedureQuestion.procedure.title || 'Untitled',
        'Question Prompt': citation.procedureQuestion.prompt,
        'Standard Type': citation.standardType,
        'Reference': citation.reference,
      }));
    const isaCoverageSheet = XLSX.utils.json_to_sheet(isaCoverageRows);
    XLSX.utils.book_append_sheet(workbook, isaCoverageSheet, 'ISA Coverage');

    const unresolvedExceptions = await prisma.procedureQuestion.findMany({
      where: {
        OR: [
          { exceptionFlag: true, validationStatus: { not: 'Resolved' } },
          { isRequired: true, responseText: null, responseBoolean: null, responseNumber: null, responseDate: null, responseSelection: null },
        ],
      },
      include: {
        procedure: {
          include: {
            audit: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const exceptionRows = unresolvedExceptions.map((question) => ({
      'Audit': question.procedure.audit.title,
      'Phase': question.procedure.phase,
      'Procedure': question.procedure.title || 'Untitled',
      'Question Prompt': question.prompt,
      'Exception Flag': question.exceptionFlag ? 'Yes' : 'No',
      'Validation Status': question.validationStatus,
      'Reviewer Status': question.reviewerStatus,
    }));
    const exceptionsSheet = XLSX.utils.json_to_sheet(exceptionRows);
    XLSX.utils.book_append_sheet(workbook, exceptionsSheet, 'Compliance Exceptions');

    const templateApplications = await prisma.templateApplication.findMany({
      include: {
        audit: true,
        template: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
    const applicationRows = templateApplications.map((item) => ({
      'Audit': item.audit.title,
      'Template': item.template.name,
      'Template Version': item.templateVersion,
      'Applied Phase': item.appliedPhase || 'All',
      'Applied By': item.appliedBy || 'Unknown',
      'Applied At': item.appliedAt.toISOString(),
    }));
    const applicationsSheet = XLSX.utils.json_to_sheet(applicationRows);
    XLSX.utils.book_append_sheet(workbook, applicationsSheet, 'Template Applications');

    const overrideLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { details: { contains: 'unlocked for editing' } },
          { details: { contains: 'override' } },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });
    const overrideRows = overrideLogs.map((log) => ({
      'Timestamp': log.timestamp.toISOString(),
      'Action': log.action,
      'Entity Type': log.entityType,
      'Entity ID': log.entityId,
      'Performed By': log.performedBy || 'Unknown',
      'Details': log.details,
    }));
    const overrideSheet = XLSX.utils.json_to_sheet(overrideRows);
    XLSX.utils.book_append_sheet(workbook, overrideSheet, 'Reviewer Override Log');

    const colWidths = [
      { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 15 },
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
    ];
    worksheet['!cols'] = colWidths;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = profile === 'certification'
      ? 'OpenWorkpaper_Certification_Pack.xlsx'
      : 'OpenWorkpaper_Global_Report.xlsx';

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: unknown) {
    console.error('[API/Export] Export Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate report', details: message }, { status: 500 });
  }
}
