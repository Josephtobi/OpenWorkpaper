/**
 * FEMI DAVIES & CO. — OPENWORKPAPER TEMPLATE SEEDER
 * ===================================================
 * Populates the Program Library with all 5 audit templates:
 *   1. Universal — Planning & Reporting (All Industries)
 *   2. Fieldwork — Manufacturing
 *   3. Fieldwork — Oil & Gas Services
 *   4. Fieldwork — Hospitality & Restaurant
 *   5. Fieldwork — Consulting
 *
 * HOW TO RUN:
 * -----------
 * Option A — On Railway (recommended):
 *   1. Install Railway CLI: npm install -g @railway/cli
 *   2. railway login
 *   3. railway link  (select your OpenWorkpaper project)
 *   4. railway run node seed.js
 *
 * Option B — Locally against your cloned repo:
 *   1. Copy this file into the root of your OpenWorkpaper clone
 *   2. npm install
 *   3. node seed.js
 *
 * NOTE: If you see field name errors, check your Prisma schema at
 * prisma/schema.prisma and adjust the field names below to match.
 * The logic and data are correct — only field names may differ.
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

const dbUrl = process.env.DATABASE_URL || 'file:/app/prisma/data/dev.db';

const libsql = createClient({
  url: dbUrl.startsWith('file:') ? dbUrl : `file:${dbUrl}`
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });
// ─────────────────────────────────────────────
// DATA: All 5 Templates
// ─────────────────────────────────────────────

const TEMPLATES = [

  // ═══════════════════════════════════════════
  // TEMPLATE 1: UNIVERSAL — PLANNING & REPORTING
  // ═══════════════════════════════════════════
  {
    label: 'Universal — Planning & Reporting (All Industries)',
    definition: 'Engagement acceptance, risk assessment, materiality, audit strategy, completion procedures, and audit reporting. Import into every engagement regardless of industry.',
    phases: [
      {
        phase: 'PLANNING',
        groups: [
          {
            name: 'Engagement Acceptance & Continuance',
            procedures: [
              {
                title: 'Client Acceptance / Continuance Assessment',
                purpose: 'To assess whether the firm should accept or continue the engagement in accordance with ISQM 1 and ISA 220, including evaluation of client integrity, management character, and any threats to independence.',
                source: 'ISQM 1; ISA 220.25; ICAN Code of Ethics',
              },
              {
                title: 'Independence Assessment — Firm & Engagement Team',
                purpose: 'To confirm that all engagement team members and the firm are independent of the client in compliance with the ICAN Code of Ethics (IFAC-aligned) and ISA 220.15.',
                source: 'ISA 220.15; ICAN Code of Ethics Part B; ISQM 1.29',
              },
              {
                title: 'Conflict of Interest Review',
                purpose: 'To identify and document any actual or potential conflicts of interest between the firm, engagement team members, and the client or its related parties.',
                source: 'ICAN Code of Ethics s.220; ISA 220',
              },
              {
                title: 'Engagement Letter — Execution and Filing',
                purpose: 'To confirm that the terms of the audit engagement have been agreed in writing with management or those charged with governance, in accordance with ISA 210.',
                source: 'ISA 210.10; CAMA 2020 s.402',
              },
              {
                title: 'Management Representation Agreement',
                purpose: 'To document that management acknowledges its responsibility for the financial statements and for providing the auditor with all relevant information, per ISA 580.',
                source: 'ISA 580.10',
              },
              {
                title: 'Prior Year Audit File Review',
                purpose: 'To review the prior year audit conclusions, adjusting entries, carry-forward matters, and any unresolved issues that may affect the current year engagement.',
                source: 'ISA 300.13; ISA 510',
              },
            ],
          },
          {
            name: 'Understanding the Entity',
            procedures: [
              {
                title: 'Business Understanding — Industry, Operations & Regulatory Environment',
                purpose: 'To obtain and document a thorough understanding of the client\'s business, industry dynamics, competitive environment, and applicable regulatory framework, in accordance with ISA 315.11.',
                source: 'ISA 315.11–315.19',
              },
              {
                title: 'Ownership Structure & Related Parties — Identification',
                purpose: 'To identify all related parties, including ultimate beneficial owners, subsidiaries, associates, and key management personnel, to support related party testing under ISA 550 and IAS 24.',
                source: 'ISA 550.13; IAS 24',
              },
              {
                title: 'Legal & Regulatory Framework Applicable to Client',
                purpose: 'To document all laws and regulations that have a direct effect on the financial statements, including CAMA 2020, NTA 2025, PENCOM, NSITF, sector-specific regulations, and applicable IFRS standards, per ISA 250.',
                source: 'ISA 250.13; CAMA 2020; NTA 2025; PENCOM Act 2014; NSITF Act',
              },
              {
                title: 'Going Concern Assessment — Preliminary',
                purpose: 'To perform a preliminary assessment of the entity\'s ability to continue as a going concern for at least 12 months from the reporting date, identifying any indicators of financial distress, per ISA 570.',
                source: 'ISA 570.10',
              },
              {
                title: 'Prior Year Financial Statements & Audit Report Review',
                purpose: 'To review the prior year signed financial statements and audit report to identify accounting policies, prior year adjustments, emphasis of matter paragraphs, and any matters requiring follow-up in the current year.',
                source: 'ISA 300.13; ISA 510; IAS 1',
              },
              {
                title: 'Key Accounting Policies Assessment',
                purpose: 'To document and evaluate the appropriateness of the client\'s significant accounting policies under IFRS, including any changes in policy or estimates from the prior year per IAS 8.',
                source: 'ISA 315.19; IAS 1.117; IAS 8',
              },
              {
                title: 'Organisational Structure & IT Environment Overview',
                purpose: 'To understand the client\'s organisational chart, key personnel, authorisation levels, and IT systems used for financial reporting, as inputs to the risk assessment and internal controls evaluation per ISA 315.',
                source: 'ISA 315.19; ISA 315.A56',
              },
            ],
          },
          {
            name: 'Risk Assessment',
            procedures: [
              {
                title: 'Entity-Level Risk Assessment',
                purpose: 'To identify and assess risks at the financial statement level that may result from a weak control environment, management override, or pervasive misstatement, per ISA 315.26.',
                source: 'ISA 315.26',
              },
              {
                title: 'Significant Risks Identification — Including Fraud Risks',
                purpose: 'To identify risks that require special audit consideration, including the presumed fraud risks of management override of controls and improper revenue recognition, per ISA 240 and ISA 315.28.',
                source: 'ISA 315.28; ISA 240.26',
              },
              {
                title: 'Inherent Risk Assessment by Financial Statement Area',
                purpose: 'To assess the inherent risk of material misstatement at the assertion level for all material account balances and transaction classes, to determine the nature, timing and extent of further audit procedures per ISA 315.',
                source: 'ISA 315.31',
              },
              {
                title: 'Related Party Transactions — Risk Assessment',
                purpose: 'To assess the risk that related party transactions and balances have not been completely identified, properly authorised, and appropriately disclosed in the financial statements, per ISA 550 and IAS 24.',
                source: 'ISA 550.13; IAS 24',
              },
              {
                title: 'IT Environment & General IT Controls Assessment',
                purpose: 'To understand and document the client\'s IT general controls (access controls, change management, operations) and assess the risk of material misstatement arising from IT system weaknesses, per ISA 315.',
                source: 'ISA 315.A56–A67',
              },
              {
                title: 'Fraud Risk Assessment — Discussion & Documentation',
                purpose: 'To conduct and document the engagement team discussion on the susceptibility of the financial statements to material misstatement due to fraud, including identification of fraud risk factors, per ISA 240.15.',
                source: 'ISA 240.15; ISA 240.26',
              },
              {
                title: 'Analytical Procedures — Planning',
                purpose: 'To apply analytical procedures at the planning stage to identify unusual transactions, balances, or trends that may indicate areas of higher risk requiring focused audit attention, per ISA 520.',
                source: 'ISA 520.3; ISA 315.6',
              },
            ],
          },
          {
            name: 'Materiality',
            procedures: [
              {
                title: 'Overall Materiality Determination',
                purpose: 'To determine the overall materiality threshold for the financial statements as a whole, based on an appropriate benchmark (PBT, revenue, total assets, or net assets) and the needs of the primary users of the financial statements, per ISA 320.10.',
                source: 'ISA 320.10; FDC Audit Manual s.3.1',
              },
              {
                title: 'Performance Materiality',
                purpose: 'To set performance materiality at a level below overall materiality to reduce to an appropriately low level the probability that the aggregate of uncorrected and undetected misstatements exceeds overall materiality, per ISA 320.11.',
                source: 'ISA 320.11',
              },
              {
                title: 'Trivial Amount Threshold',
                purpose: 'To establish the threshold below which identified misstatements will not be accumulated for evaluation, typically set at 5% of overall materiality, per ISA 450.',
                source: 'ISA 450.A2',
              },
              {
                title: 'Specific Materiality for Sensitive Items',
                purpose: 'To determine whether a lower materiality threshold applies to specific classes of transactions or disclosures — including related party transactions, directors\' remuneration, regulatory compliance items, and any politically sensitive amounts — per ISA 320.10.',
                source: 'ISA 320.10; CAMA 2020 s.394',
              },
              {
                title: 'Materiality Basis Justification & Documentation',
                purpose: 'To document the rationale for the chosen materiality benchmark, the quantitative threshold selected, and any qualitative factors considered, ensuring the basis is appropriate given the client\'s industry, size, and financial profile per ISA 320.',
                source: 'ISA 320; ISA 230',
              },
            ],
          },
          {
            name: 'Audit Strategy & Plan',
            procedures: [
              {
                title: 'Overall Audit Strategy Document',
                purpose: 'To establish the overall audit strategy that sets the scope, timing, and direction of the audit, and guides the development of the audit plan, per ISA 300.7.',
                source: 'ISA 300.7',
              },
              {
                title: 'Audit Plan — Scope and Timing by Area',
                purpose: 'To document the detailed audit plan describing the nature, timing, and extent of planned risk assessment procedures and further audit procedures at the assertion level for each material financial statement area, per ISA 300.9.',
                source: 'ISA 300.9; ISA 330',
              },
              {
                title: 'Engagement Team Briefing Notes',
                purpose: 'To document the briefing of the engagement team on the client\'s business, significant risks, fraud risks, materiality, key accounting issues, and each team member\'s responsibilities, per ISA 300.11 and ISA 240.15.',
                source: 'ISA 300.11; ISA 240.15',
              },
              {
                title: 'Allocation of Work — Team Assignments',
                purpose: 'To document the assignment of audit areas to specific team members, including the responsible preparer and reviewer for each section, ensuring appropriate experience levels are matched to risk areas per ISA 220.',
                source: 'ISA 220.32',
              },
              {
                title: 'Use of Specialists — Assessment',
                purpose: 'To assess whether the engagement requires the use of an auditor\'s expert and to document the basis for any such decision and the planned oversight procedures, per ISA 620.',
                source: 'ISA 620',
              },
              {
                title: 'Engagement Milestone & Deadline Schedule',
                purpose: 'To establish and document key engagement milestones including fieldwork start and end dates, draft financial statements receipt, management letter issuance, and target audit report signing date, to support timely delivery per ISA 300.',
                source: 'ISA 300; CAMA 2020 s.374',
              },
            ],
          },
          {
            name: 'Internal Controls Assessment',
            procedures: [
              {
                title: 'Control Environment Assessment',
                purpose: 'To evaluate the overall control environment including management\'s philosophy, organisational structure, assignment of authority, and commitment to competence, as the foundation for assessing control risk across all audit areas, per ISA 315.',
                source: 'ISA 315.A68',
              },
              {
                title: 'Revenue Cycle Controls Walkthrough',
                purpose: 'To document and evaluate the design and implementation of controls over the revenue cycle, from order/contract initiation through invoicing, cash collection, and ledger posting, to determine whether reliance on controls is appropriate per ISA 330.',
                source: 'ISA 330.13; ISA 315.26',
              },
              {
                title: 'Expenditure Cycle Controls Walkthrough',
                purpose: 'To document and evaluate the design and implementation of controls over the purchase-to-pay cycle, including procurement authorisation, supplier onboarding, invoice approval, and payment processing, per ISA 330.',
                source: 'ISA 330.13',
              },
              {
                title: 'Payroll Cycle Controls Walkthrough',
                purpose: 'To document and evaluate controls over the payroll process including new hire authorisation, changes to standing data, payroll computation, PAYE/PENCOM deductions, and bank transfer authorisation, per ISA 330 and ISA 240.',
                source: 'ISA 330.13; ISA 240; PENCOM Act 2014',
              },
              {
                title: 'Cash & Treasury Controls Walkthrough',
                purpose: 'To document and evaluate controls over cash receipts, cash payments, bank account management, reconciliation procedures, and authorisation of transfers, given the elevated fraud risk associated with cash per ISA 240.',
                source: 'ISA 330.13; ISA 240',
              },
              {
                title: 'IT General Controls (ITGC) Review',
                purpose: 'To assess the general IT controls environment including logical access controls, user provisioning, change management procedures, and IT operations controls, to determine the reliability of system-generated reports and data per ISA 315.',
                source: 'ISA 315.A56',
              },
              {
                title: 'Control Testing Approach — Reliance Decision',
                purpose: 'To document the engagement team\'s decision on whether to adopt a controls reliance strategy or a purely substantive approach for each audit area, based on the walkthrough results, efficiency considerations, and assessed control risk per ISA 330.8.',
                source: 'ISA 330.8',
              },
            ],
          },
          {
            name: 'PBC Requests & Opening Balances',
            procedures: [
              {
                title: 'PBC Master List — Issue to Client',
                purpose: 'To prepare and issue a comprehensive list of all documents, schedules, confirmations, and information required from the client (Provided By Client list) prior to and during fieldwork, ensuring timely receipt of evidence and minimising disruption to client operations.',
                source: 'ISA 300; ISA 330; FDC Audit Manual',
              },
              {
                title: 'Opening Balances Agreement — Prior Year Closing',
                purpose: 'To confirm that opening balances for the current period correctly reflect the closing balances of the prior period, and that prior year accounting policies have been consistently applied, per ISA 510.',
                source: 'ISA 510',
              },
              {
                title: 'Comparative Figures Review',
                purpose: 'To confirm that comparative figures presented in the current year financial statements agree to the prior year signed financial statements or have been appropriately restated with adequate disclosure, per IAS 1 and ISA 710.',
                source: 'ISA 710; IAS 1.38',
              },
              {
                title: 'Predecessor Auditor Communication',
                purpose: 'To document communication with the predecessor auditor (where applicable) to obtain information relevant to the current engagement including prior year working papers access, reasons for change of auditor, and any unresolved matters, per ISA 510 and ICAN ethical requirements.',
                source: 'ISA 510.6; ICAN Code of Ethics s.320',
              },
              {
                title: 'Engagement Progress Tracker — PBC Status',
                purpose: 'To monitor and document the receipt status of all PBC items throughout the engagement, tracking outstanding items, responsible client personnel, and escalation of overdue requests to engagement management.',
                source: 'ISA 300; ISA 230',
              },
            ],
          },
        ],
      },
      {
        phase: 'REPORTING',
        groups: [
          {
            name: 'Completion Procedures',
            procedures: [
              {
                title: 'Final Going Concern Assessment',
                purpose: 'To perform a final assessment of the entity\'s ability to continue as a going concern for at least 12 months from the reporting date, evaluating all evidence obtained during the audit including subsequent events, financing arrangements, and management\'s plans, per ISA 570.16.',
                source: 'ISA 570.16',
              },
              {
                title: 'Subsequent Events — Active Search Procedures',
                purpose: 'To perform procedures designed to identify all events occurring between the reporting date and the date of the auditor\'s report that may require adjustment to or disclosure in the financial statements, per ISA 560.10.',
                source: 'ISA 560.10; IAS 10',
              },
              {
                title: 'Overall Analytical Review — Final Reasonableness',
                purpose: 'To perform overall analytical procedures at the completion stage to confirm that the financial statements as a whole are consistent with the auditor\'s understanding of the entity, and to identify any previously undetected risks of material misstatement, per ISA 520.6.',
                source: 'ISA 520.6',
              },
              {
                title: 'Evaluation of Identified Misstatements',
                purpose: 'To accumulate all misstatements identified during the audit, evaluate whether the aggregate effect is material, and determine the appropriate response including communication to management and those charged with governance, per ISA 450.',
                source: 'ISA 450',
              },
              {
                title: 'Summary of Uncorrected Misstatements',
                purpose: 'To document all misstatements that management has declined to correct, evaluate whether individually or in aggregate they cause the financial statements to be materially misstated, and obtain management\'s reasons for non-correction, per ISA 450.14.',
                source: 'ISA 450.14',
              },
              {
                title: 'Summary of Corrected Misstatements',
                purpose: 'To document all misstatements identified and corrected by management during the audit, including audit adjusting journal entries, reclassifications, and disclosure corrections, to support the final opinion and demonstrate audit quality.',
                source: 'ISA 450; ISA 230',
              },
              {
                title: 'Final Materiality Review',
                purpose: 'To reassess whether the overall materiality and performance materiality levels established at planning remain appropriate in light of the actual financial results, and to revise if necessary and consider the impact on audit procedures performed, per ISA 320.13.',
                source: 'ISA 320.13',
              },
              {
                title: 'Fraud Risk — Final Assessment',
                purpose: 'To perform a final evaluation of whether the accumulated results of audit procedures indicate a previously unrecognised risk of material misstatement due to fraud, and to document conclusions on fraud risk for the engagement, per ISA 240.34.',
                source: 'ISA 240.34',
              },
            ],
          },
          {
            name: 'Communications',
            procedures: [
              {
                title: 'Management Letter — Preparation & Issuance',
                purpose: 'To prepare and issue a management letter communicating significant deficiencies and material weaknesses in internal controls identified during the audit, together with practical recommendations for improvement, per ISA 265.',
                source: 'ISA 265',
              },
              {
                title: 'Written Representations — Obtain and File',
                purpose: 'To obtain a signed written representation letter from management confirming their responsibilities for the financial statements, completeness of information provided, and specific representations on matters material to the audit, per ISA 580. Refusal to provide representations constitutes a scope limitation.',
                source: 'ISA 580',
              },
              {
                title: 'Communication with Those Charged with Governance',
                purpose: 'To document all significant matters arising from the audit that are required to be communicated to those charged with governance, including the auditor\'s responsibilities, planned scope and timing, significant findings, key accounting judgements, and any difficulties encountered during the audit, per ISA 260.',
                source: 'ISA 260',
              },
              {
                title: 'Matters Arising — Resolution Log',
                purpose: 'To maintain a complete log of all significant matters arising during the engagement, including queries raised with management, management responses, auditor conclusions, and the impact on the audit opinion, ensuring all outstanding matters are resolved before the audit report is signed.',
                source: 'ISA 260; ISA 230',
              },
            ],
          },
          {
            name: 'Financial Statements Review',
            procedures: [
              {
                title: 'Draft Financial Statements — IFRS & FRCN Compliance Review',
                purpose: 'To review the draft financial statements for compliance with applicable IFRS standards and FRCN requirements, including proper presentation of all primary statements, adequacy of accounting policy disclosures, and compliance with IAS 1 minimum disclosure requirements.',
                source: 'IAS 1; FRCN Act; ISA 700',
              },
              {
                title: 'Statement of Financial Position — Assertion Mapping',
                purpose: 'To confirm that all balances presented in the statement of financial position are supported by audit evidence, properly classified between current and non-current, and agree to the audited trial balance and underlying working papers at the assertion level.',
                source: 'IAS 1.54; ISA 330',
              },
              {
                title: 'Statement of Profit or Loss — Assertion Mapping',
                purpose: 'To confirm that all income and expense items presented in the statement of profit or loss are supported by audit evidence, correctly classified, and agree to the audited trial balance, with particular attention to cut-off, completeness, and accuracy assertions.',
                source: 'IAS 1.82; ISA 330',
              },
              {
                title: 'Statement of Changes in Equity — Review',
                purpose: 'To verify that all movements in equity during the year including profit for the period, dividends declared, share issuances, and other comprehensive income items are complete, accurately stated, and properly authorised in accordance with CAMA 2020 and applicable IFRS standards.',
                source: 'IAS 1.106; CAMA 2020 s.424',
              },
              {
                title: 'Statement of Cash Flows — Review',
                purpose: 'To verify that the statement of cash flows has been correctly prepared under the indirect or direct method per IAS 7, with proper classification of operating, investing, and financing activities, and agreement of opening and closing cash balances to the audited bank reconciliations.',
                source: 'IAS 7; ISA 330',
              },
              {
                title: 'Notes to the Financial Statements — Adequacy Review',
                purpose: 'To review all notes to the financial statements for completeness, accuracy, and compliance with IFRS disclosure requirements, ensuring that all significant accounting policies, judgements, estimates, and required quantitative disclosures are adequately presented per IAS 1.112.',
                source: 'IAS 1.112; IFRS standards applicable to client',
              },
              {
                title: 'CAMA 2020 — Statutory Disclosure Compliance',
                purpose: 'To confirm that all disclosures required by the Companies and Allied Matters Act 2020 are included in the financial statements and directors\' report, including directors\' remuneration, related party transactions, share capital movements, dividends, and auditor appointment, per CAMA 2020 s.374–s.423.',
                source: 'CAMA 2020 s.374–s.423',
              },
              {
                title: 'Comparative Figures — Consistency & Restatement Review',
                purpose: 'To confirm that comparative figures are consistent with the prior year signed financial statements or have been appropriately restated with full disclosure of the nature, reason, and financial impact of any restatement in accordance with IAS 8.',
                source: 'IAS 8.49; ISA 710',
              },
            ],
          },
          {
            name: 'Quality Control & Archiving',
            procedures: [
              {
                title: 'Engagement Quality Review (EQR)',
                purpose: 'To document the engagement quality reviewer\'s objective evaluation of the significant judgements made by the engagement team and the conclusions reached in formulating the auditor\'s report, per ISQM 1 and ISA 220.34. EQR is mandatory for audits of public interest entities and recommended for high-risk engagements. The audit report must not be signed before the EQR is complete.',
                source: 'ISQM 1; ISA 220.34',
              },
              {
                title: 'Hot Review Completion Checklist',
                purpose: 'To perform a final pre-issuance review of the complete audit file confirming that all procedures are documented and signed off, all review points are cleared, all misstatements are resolved, written representations are obtained, the management letter is issued, and the file is in a condition fit for cold file review, per ISA 220 and ISQM 1.',
                source: 'ISA 220; ISQM 1; FDC Audit Manual',
              },
              {
                title: 'Partner Final Sign-Off — All Phases',
                purpose: 'To document the engagement partner\'s final review and approval of the complete audit file across all three phases, confirming that sufficient appropriate audit evidence has been obtained to support the audit opinion, that all significant matters have been resolved, and that the financial statements give a true and fair view, per ISA 220.31.',
                source: 'ISA 220.31',
              },
              {
                title: 'Audit File Assembly & Archiving — 60-Day Rule',
                purpose: 'To assemble and archive the final audit file within 60 days of the date of the auditor\'s report, ensuring all documentation is complete, properly indexed, and securely stored in accordance with ISA 230.14. Files must be retained for a minimum of 5 years from the date of the audit report per ISA 230.',
                source: 'ISA 230.14',
              },
              {
                title: 'Client Communication — Audit Report Delivery',
                purpose: 'To document the formal delivery of the signed audit report and audited financial statements to the client, including the date of delivery, recipient, and any accompanying communications such as the management letter, to complete the audit engagement record.',
                source: 'ISA 700; CAMA 2020 s.408',
              },
            ],
          },
          {
            name: 'Audit Reports',
            procedures: [
              {
                title: 'Independent Auditor\'s Report — Draft & Final',
                purpose: 'To prepare and finalise the independent auditor\'s report in accordance with ISA 700, ensuring the report correctly identifies the financial statements audited, the applicable financial reporting framework, the scope of the audit, and the basis for the opinion. The report must comply with ICAN-prescribed format and reference CAMA 2020 s.402.',
                source: 'ISA 700; CAMA 2020 s.402; ICAN reporting standards',
              },
              {
                title: 'Key Audit Matters — Identification & Documentation',
                purpose: 'To identify and communicate key audit matters being those matters that, in the auditor\'s professional judgement, were of most significance in the audit of the financial statements, per ISA 701. Applicable to audits of listed entities and public interest entities.',
                source: 'ISA 701',
              },
              {
                title: 'Emphasis of Matter & Other Matter Paragraphs',
                purpose: 'To determine whether any Emphasis of Matter or Other Matter paragraphs are required in the auditor\'s report, including material uncertainties relating to going concern, significant subsequent events, prior period restatements, or other matters requiring user attention without modifying the opinion, per ISA 706.',
                source: 'ISA 706',
              },
              {
                title: 'Modified Opinion — Basis & Documentation',
                purpose: 'To document the basis for any modification to the audit opinion including the nature and pervasiveness of the matter giving rise to the modification, whether the modification arises from a limitation of scope or a disagreement with management, and the precise wording of the qualified, adverse, or disclaimer opinion, per ISA 705.',
                source: 'ISA 705',
              },
              {
                title: 'Going Concern Paragraph — Assessment & Wording',
                purpose: 'To document the assessment of whether a material uncertainty related to going concern exists and requires disclosure in the auditor\'s report, and to confirm that the wording of any going concern paragraph accurately reflects the nature and extent of the uncertainty disclosed in the financial statements, per ISA 570.22.',
                source: 'ISA 570.22',
              },
              {
                title: 'Audit Report Sign-Off — Date & Authority Confirmation',
                purpose: 'To confirm that the audit report is dated no earlier than the date on which sufficient appropriate audit evidence has been obtained, including evidence that the financial statements have been prepared and that those with recognised authority have taken responsibility for them, per ISA 700.41 and CAMA 2020.',
                source: 'ISA 700.41; CAMA 2020 s.402',
              },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════
  // TEMPLATE 2: FIELDWORK — MANUFACTURING
  // ═══════════════════════════════════════════
  {
    label: 'Fieldwork — Manufacturing',
    definition: 'Substantive procedures for manufacturing clients. Covers revenue, inventory (IAS 2), PPE (IAS 16), payroll, taxation (NTA 2025), and regulatory compliance (SON, NAFDAC, ITF, NESREA).',
    phases: [
      {
        phase: 'FIELDWORK',
        groups: [
          {
            name: 'Revenue',
            procedures: [
              { title: 'Revenue Recognition Policy Assessment', purpose: 'To evaluate whether the client\'s revenue recognition policy complies with IFRS 15, including correct application of the 5-step model: identify the contract, identify performance obligations, determine transaction price, allocate transaction price, and recognise revenue when/as performance obligations are satisfied.', source: 'IFRS 15' },
              { title: 'Completeness of Revenue — Cut-Off Testing', purpose: 'To obtain evidence that all revenue transactions relating to the period have been recorded and that no pre or post period revenue has been included, by testing transactions around the reporting date against despatch records, delivery notes, and customer acknowledgements of receipt.', source: 'ISA 330; IFRS 15.31' },
              { title: 'Occurrence — Revenue Transaction Testing', purpose: 'To verify that recorded revenue transactions represent actual sales of goods to legitimate customers during the period, by selecting a sample from the revenue ledger and agreeing to sales invoices, delivery documentation, customer purchase orders, and cash receipts.', source: 'ISA 330' },
              { title: 'Revenue Journal Entry Testing', purpose: 'To identify and test unusual or irregular journal entries posted to revenue accounts, including manual journals, late adjustments, and entries posted by senior personnel, to address the presumed fraud risk of improper revenue recognition per ISA 240.32.', source: 'ISA 240.32' },
              { title: 'Contract Liability and Deferred Revenue Assessment', purpose: 'To verify that amounts received from customers for performance obligations not yet satisfied are correctly recognised as contract liabilities rather than revenue, per IFRS 15.106.', source: 'IFRS 15.106' },
              { title: 'Related Party Revenue Assessment', purpose: 'To identify all revenue transactions with related parties, confirm they are transacted at arm\'s length or that any non-arm\'s length terms are adequately disclosed, per ISA 550 and IAS 24.', source: 'ISA 550; IAS 24' },
              { title: 'VAT on Revenue — Compliance Review', purpose: 'To verify that VAT has been correctly charged at 7.5% on all taxable supplies, that VAT returns reconcile to the revenue ledger, and that VAT remittances are current with no outstanding liabilities per the Nigeria Tax Act 2025.', source: 'NTA 2025; FIRS regulations' },
              { title: 'Export Revenue — Foreign Currency & Variable Consideration', purpose: 'To verify that export revenue is correctly translated at the transaction date spot rate per IAS 21, that variable consideration elements are estimated and constrained appropriately per IFRS 15.56, and that foreign currency debtors are retranslated at the closing rate.', source: 'IFRS 15.56; IAS 21' },
            ],
          },
          {
            name: 'Trade and Other Receivables',
            procedures: [
              { title: 'Debtors Ledger Reconciliation', purpose: 'To reconcile the trade receivables ledger to the general ledger control account and confirm the year-end balance is accurately stated.', source: 'ISA 330' },
              { title: 'Debtors Circularisation / External Confirmation', purpose: 'To obtain direct written confirmation from a sample of debtors of the amounts owed to the client at the year-end date, per ISA 505.', source: 'ISA 505' },
              { title: 'Aged Debtors Analysis', purpose: 'To review the aged receivables listing to identify overdue balances, disputed amounts, and balances requiring impairment assessment under the ECL model.', source: 'IFRS 9; ISA 540' },
              { title: 'Impairment Assessment — ECL Model', purpose: 'To verify that the expected credit loss provision has been calculated in accordance with IFRS 9, using the simplified approach (provision matrix) or general approach as appropriate, and that the provision is adequate given the ageing profile and credit history of debtors.', source: 'IFRS 9.5.5; ISA 540' },
              { title: 'WHT Receivable Reconciliation', purpose: 'To reconcile withholding tax credits receivable to WHT certificates received from customers and confirm the balance is recoverable or has been applied against tax liabilities.', source: 'NTA 2025; FIRS regulations' },
              { title: 'Related Party Receivables', purpose: 'To identify all receivables from related parties, confirm they are supported by proper documentation, bear market-related terms, and are adequately disclosed per IAS 24.', source: 'ISA 550; IAS 24' },
            ],
          },
          {
            name: 'Inventories',
            procedures: [
              { title: 'Attendance at Physical Stock Count', purpose: 'To attend the client\'s physical inventory count to observe counting procedures, test count accuracy, and assess the adequacy of controls over the count process per ISA 501.', source: 'ISA 501' },
              { title: 'Stock Count Results — Reconciliation to Books', purpose: 'To reconcile the results of the physical count to the inventory records and general ledger, and investigate any significant variances.', source: 'ISA 501; IAS 2' },
              { title: 'Raw Materials — Purchase Price Variance Analysis', purpose: 'To analyse purchase price variances to identify any unusual movements in raw material costs and confirm inventory is recorded at the lower of cost and NRV per IAS 2.', source: 'IAS 2.9' },
              { title: 'Work-in-Progress — Stage of Completion Verification', purpose: 'To verify WIP quantities and the percentage of completion applied, including review of production records, to ensure WIP is correctly valued at cost of conversion to date.', source: 'IAS 2.12' },
              { title: 'Finished Goods — Standard vs Actual Cost Reconciliation', purpose: 'To review the costing method applied to finished goods, reconcile standard costs to actual production costs, and assess whether variances have been appropriately treated.', source: 'IAS 2.21' },
              { title: 'Production Overhead Absorption Rate', purpose: 'To verify that production overheads have been systematically allocated to inventory using a rate based on normal production capacity, in accordance with IAS 2.12.', source: 'IAS 2.12' },
              { title: 'Net Realisable Value Assessment', purpose: 'To assess whether inventory is carried at the lower of cost and NRV by reviewing selling prices, current replacement costs, and write-down history, per IAS 2.9.', source: 'IAS 2.9' },
              { title: 'Obsolete and Slow-Moving Stock Assessment', purpose: 'To identify slow-moving, obsolete, or damaged inventory items and confirm that appropriate write-downs have been recorded, with adequate documentation of management\'s assessment.', source: 'IAS 2.28' },
              { title: 'Consignment and Third-Party Held Inventory', purpose: 'To verify the existence and ownership of inventory held at third party locations or on consignment, through confirmation or physical inspection per ISA 501.', source: 'ISA 501; IAS 2' },
            ],
          },
          {
            name: 'Property, Plant and Equipment',
            procedures: [
              { title: 'PPE Lead Schedule Reconciliation', purpose: 'To reconcile the detailed PPE schedule (opening balance, additions, disposals, depreciation, closing balance) to the general ledger and prior year audited financial statements.', source: 'IAS 16; ISA 330' },
              { title: 'Additions — Capex vs Opex Assessment', purpose: 'To verify that capital additions meet the recognition criteria of IAS 16.7, have been properly authorised, and that expenditure incorrectly capitalised as capex or charged to opex has been identified.', source: 'IAS 16.7' },
              { title: 'Disposals — Gain/Loss Calculation Verification', purpose: 'To verify the accuracy of gains or losses on disposal of PPE, confirm proper derecognition of the asset and accumulated depreciation, and check that sale proceeds have been received and recorded.', source: 'IAS 16.67' },
              { title: 'Depreciation Computation Verification', purpose: 'To verify that depreciation has been calculated using the correct method, rates, and bases for each asset class, and that the useful life estimates and residual values remain appropriate.', source: 'IAS 16.43' },
              { title: 'Physical Verification — Sample', purpose: 'To physically inspect a sample of assets on the PPE schedule to confirm their existence, condition, and use in the business, and to check assets in use are on the schedule.', source: 'ISA 501; IAS 16' },
              { title: 'Impairment Assessment', purpose: 'To assess whether any indicators of impairment exist and, where they do, verify that an impairment test has been performed and any impairment loss correctly recognised and disclosed per IAS 36.', source: 'IAS 36' },
              { title: 'Asset Componentisation Review', purpose: 'To assess whether significant components of major assets with different useful lives have been separately identified and depreciated per IAS 16.43.', source: 'IAS 16.43' },
              { title: 'Right-of-Use Assets (IFRS 16) — Completeness', purpose: 'To identify all leases to which IFRS 16 applies, confirm that right-of-use assets and lease liabilities have been recognised for all qualifying leases, and verify the calculation of initial and subsequent measurement.', source: 'IFRS 16' },
            ],
          },
          {
            name: 'Cash and Bank',
            procedures: [
              { title: 'Bank Reconciliations — All Accounts', purpose: 'To obtain and review bank reconciliations for all bank accounts at the year-end date, agree the bank balance per reconciliation to bank statements, and investigate all reconciling items.', source: 'ISA 330' },
              { title: 'Bank Confirmation Letters', purpose: 'To obtain direct confirmation from the client\'s bankers of balances, facilities, and security arrangements at the year-end date per ISA 505.', source: 'ISA 505' },
              { title: 'Petty Cash Count', purpose: 'To count petty cash floats at or near the year-end date and reconcile to the recorded balance to confirm completeness and accuracy.', source: 'ISA 501' },
              { title: 'Unusual and Large Cash Transactions', purpose: 'To identify and investigate unusual, large, or irregular cash transactions that may indicate fraud, error, or undisclosed related party transactions, per ISA 240.', source: 'ISA 240' },
              { title: 'Foreign Currency Balances — Translation', purpose: 'To verify that foreign currency cash and bank balances have been retranslated at the closing exchange rate and that any translation gains or losses have been correctly recognised in profit or loss per IAS 21.', source: 'IAS 21' },
            ],
          },
          {
            name: 'Trade and Other Payables',
            procedures: [
              { title: 'Creditors Ledger Reconciliation', purpose: 'To reconcile the trade payables ledger to the general ledger control account at year-end to confirm completeness and accuracy of recorded payables.', source: 'ISA 330' },
              { title: 'Supplier Statements Reconciliation', purpose: 'To obtain and reconcile supplier statements for a sample of significant creditors to the client\'s payables ledger and investigate material differences.', source: 'ISA 330' },
              { title: 'Accruals Assessment — Completeness', purpose: 'To assess whether all material accruals for expenses incurred but not yet invoiced are recognised at year-end, through review of subsequent payments, post year-end invoices, and contracts.', source: 'IAS 37; ISA 330' },
              { title: 'Unrecorded Liabilities — Subsequent Payments Testing', purpose: 'To review payments made after the reporting date to identify any invoices relating to the audit period that were not accrued, to test for completeness of liabilities.', source: 'ISA 330' },
              { title: 'Related Party Payables', purpose: 'To identify all payables to related parties, confirm they are supported by proper documentation and commercial terms, and are adequately disclosed per IAS 24.', source: 'ISA 550; IAS 24' },
              { title: 'VAT Payable Reconciliation', purpose: 'To reconcile the VAT payable balance to VAT returns filed with FIRS, confirm timely remittance, and identify any penalties or interest for late payment per the Nigeria Tax Act 2025.', source: 'NTA 2025' },
            ],
          },
          {
            name: 'Payroll and Employee Benefits',
            procedures: [
              { title: 'Payroll Reconciliation — Gross to Net', purpose: 'To reconcile total gross payroll to net pay, statutory deductions (PAYE, pension, NSITF), and employer costs, and agree to the general ledger payroll expense account.', source: 'ISA 330; NTA 2025' },
              { title: 'PAYE Reconciliation and Remittance Compliance', purpose: 'To verify that PAYE deductions have been correctly computed under the Personal Income Tax Act (as incorporated in NTA 2025), remitted to the relevant State Internal Revenue Service within 10 working days, and that there are no outstanding PAYE liabilities.', source: 'NTA 2025; PITA' },
              { title: 'PENCOM Contributions — Verification', purpose: 'To verify that employer (minimum 10%) and employee (minimum 8%) pension contributions have been correctly computed on monthly emolument, remitted to the respective PFAs within 7 working days of salary payment, and reconcile to PENCOM remittance schedules per the Pension Reform Act 2014.', source: 'Pension Reform Act 2014' },
              { title: 'NSITF Contribution Compliance', purpose: 'To verify that the employer has remitted 1% of total monthly payroll to NSITF in accordance with the Employee Compensation Act 2010, and that there are no outstanding contributions.', source: 'Employee Compensation Act 2010' },
              { title: 'ITF Levy Compliance', purpose: 'To verify that the Industrial Training Fund levy of 1% of annual payroll has been remitted where applicable (employers with 5 or more employees or ₦50m+ turnover), and to assess whether the entity qualifies for a refund based on qualifying training expenditure.', source: 'ITF Act 2011' },
              { title: 'Staff Entitlements — Accrued Leave and Gratuity', purpose: 'To verify that accruals for employee entitlements including annual leave, long service awards, and gratuity are correctly calculated and recognised in accordance with IAS 19 Employee Benefits.', source: 'IAS 19' },
              { title: 'Payroll Journal Entry Testing', purpose: 'To identify and test manual journal entries to payroll expense accounts for unusual items, late postings, or entries made by personnel outside the payroll function, to address fraud risk per ISA 240.', source: 'ISA 240.32' },
            ],
          },
          {
            name: 'Borrowings and Finance Costs',
            procedures: [
              { title: 'Loan Agreements Review', purpose: 'To obtain and review all loan agreements to confirm the key terms (principal, interest rate, maturity, security, covenants) and ensure proper classification of current and non-current portions.', source: 'IFRS 9; IAS 1' },
              { title: 'Interest Computation Verification — EIR Method', purpose: 'To verify that interest expense has been calculated using the effective interest rate method per IFRS 9 and agrees to the loan amortisation schedule.', source: 'IFRS 9.5.4' },
              { title: 'Loan Covenant Compliance', purpose: 'To review compliance with financial and non-financial covenants in loan agreements and assess the impact of any breach on the current/non-current classification of the liability per IAS 1.', source: 'IAS 1.69; IFRS 9' },
              { title: 'IFRS 16 Lease Liability Calculation Verification', purpose: 'To verify the completeness of leases recognised under IFRS 16, review the incremental borrowing rate applied, and re-perform the present value calculation for significant leases.', source: 'IFRS 16' },
              { title: 'Finance Cost Capitalisation Assessment', purpose: 'To assess whether any borrowing costs directly attributable to the acquisition or construction of qualifying assets have been capitalised in accordance with IAS 23.', source: 'IAS 23' },
            ],
          },
          {
            name: 'Taxation',
            procedures: [
              { title: 'Companies Income Tax Computation', purpose: 'To verify the CIT computation under the Nigeria Tax Act 2025, including application of the correct rate (0% / 20% / 30% based on turnover threshold), allowable deductions, capital allowances, and minimum tax provisions.', source: 'NTA 2025; CITA' },
              { title: 'Deferred Tax Assessment', purpose: 'To verify that deferred tax assets and liabilities have been correctly identified, measured, and recognised for all temporary differences between the carrying amounts of assets and liabilities and their tax bases, per IAS 12.', source: 'IAS 12' },
              { title: 'WHT Compliance Review — Rates and Remittance', purpose: 'To verify that withholding tax has been deducted at the correct rate on applicable payments (dividends 10%, rent 10%, professional fees 5%, contracts 5%), remitted to FIRS within the prescribed period, and that credit notes have been issued to payees.', source: 'NTA 2025; FIRS WHT regulations' },
              { title: 'Tax Assessments and Open Disputes', purpose: 'To obtain details of all open tax assessments, disputes, and objections, assess the likelihood of outcome, and confirm that appropriate provisions or disclosures have been made per IAS 37 and IAS 12.', source: 'IAS 37; IAS 12; NTA 2025' },
              { title: 'Transfer Pricing Considerations', purpose: 'To assess whether the entity has related party transactions that require compliance with FIRS Transfer Pricing Regulations 2018, including disclosure requirements and maintenance of contemporaneous TP documentation.', source: 'FIRS TP Regulations 2018' },
            ],
          },
          {
            name: 'Equity and Capital',
            procedures: [
              { title: 'Share Capital Verification', purpose: 'To verify the authorised, issued, and paid-up share capital agrees to the CAC filings, board resolutions, and share register, and complies with minimum capital requirements under CAMA 2020.', source: 'CAMA 2020 s.27' },
              { title: 'Retained Earnings Reconciliation', purpose: 'To reconcile the movement in retained earnings from opening balance through profit for the year, dividends declared, and any other adjustments to the closing balance per the financial statements.', source: 'IAS 1.106' },
              { title: 'Dividends — Board Authority and Payment Compliance', purpose: 'To verify that all dividends declared during the year were authorised by the board or shareholders as required by CAMA 2020, correctly recorded, and paid within the statutory timeframe with proper WHT deducted.', source: 'CAMA 2020 s.424; NTA 2025' },
              { title: 'Other Reserves Movement', purpose: 'To verify the nature, opening balance, movements, and closing balance of all other reserves including revaluation surplus, share premium, and other components of equity.', source: 'IAS 1.106; IAS 16' },
            ],
          },
          {
            name: 'Related Parties',
            procedures: [
              { title: 'Complete Related Party List — Identification', purpose: 'To compile and confirm the complete list of related parties including subsidiaries, associates, joint ventures, directors, key management personnel, and entities controlled by them, per ISA 550.13 and IAS 24.', source: 'ISA 550.13; IAS 24.9' },
              { title: 'Related Party Transactions — Completeness', purpose: 'To obtain and review all related party transactions during the year, confirm they are completely recorded, and identify any transactions not disclosed by management using procedures including journal entry review and inquiry per ISA 550.', source: 'ISA 550' },
              { title: 'Arm\'s Length Assessment', purpose: 'To assess whether related party transactions have been conducted on terms equivalent to those prevailing in an arm\'s length transaction or, where they have not, to confirm that appropriate disclosure has been made per IAS 24.', source: 'IAS 24.23' },
              { title: 'Disclosure Adequacy Review', purpose: 'To review the related party disclosures in the financial statements for completeness and accuracy, confirming that all required disclosures under IAS 24 are included including the nature of relationships, amounts of transactions, and outstanding balances.', source: 'IAS 24.17' },
            ],
          },
          {
            name: 'Commitments, Contingencies and Subsequent Events',
            procedures: [
              { title: 'Capital Commitments', purpose: 'To obtain details of all capital expenditure contracted for but not yet incurred at the reporting date, confirm adequate disclosure in the financial statements, and assess whether any impairment indicators arise from committed projects.', source: 'IAS 16; IAS 1.137' },
              { title: 'Operating Commitments', purpose: 'To identify all significant operating commitments including long-term supply contracts, service agreements, and lease commitments, and confirm adequate disclosure where not already recognised under IFRS 16.', source: 'IFRS 16; IAS 1.137' },
              { title: 'Legal Claims and Contingent Liabilities', purpose: 'To obtain details of all pending or threatened legal claims, tax disputes, and regulatory proceedings, assess the probability of outflow per IAS 37, and confirm that provisions or disclosures are appropriate.', source: 'IAS 37; ISA 501' },
              { title: 'Events After the Reporting Date', purpose: 'To identify all adjusting and non-adjusting events after the reporting date through inquiry of management, review of board minutes, and review of subsequent financial information, per IAS 10 and ISA 560.', source: 'ISA 560; IAS 10' },
              { title: 'Directors\' Loans — CAMA 2020 Compliance', purpose: 'To identify any loans to directors or related parties and confirm they have been properly authorised in accordance with CAMA 2020 s.173 and adequately disclosed in the financial statements.', source: 'CAMA 2020 s.173' },
            ],
          },
          {
            name: 'Other Disclosures',
            procedures: [
              { title: 'Segment Reporting Assessment', purpose: 'To assess whether the entity meets the thresholds for segment reporting under IFRS 8 and, where applicable, verify the accuracy and completeness of segment information disclosed.', source: 'IFRS 8' },
              { title: 'Significant Accounting Judgements and Estimates', purpose: 'To review the disclosures of significant accounting judgements and key sources of estimation uncertainty required by IAS 1.122 and 1.125, and confirm they are complete, accurate, and consistent with the evidence obtained during the audit.', source: 'IAS 1.122; IAS 1.125' },
            ],
          },
          {
            name: 'Regulatory Compliance — Manufacturing',
            procedures: [
              { title: 'SON Compliance — Standards Organisation of Nigeria', purpose: 'To verify that the entity holds current product certification from SON for all manufactured goods subject to mandatory standards, and that there are no pending enforcement actions or product recalls that may give rise to provisions or contingent liabilities.', source: 'SON Act; ISA 250' },
              { title: 'NAFDAC Registration — Food & Pharmaceutical Products', purpose: 'To verify that all food, drug, cosmetic, or related manufactured products have valid NAFDAC registrations, that registration fees are current, and that any compliance issues have been properly disclosed per ISA 250.', source: 'NAFDAC Act; ISA 250' },
              { title: 'Import Duty and Customs Clearance — Inventory Impact', purpose: 'To verify that import duties, levies, and customs clearing costs have been correctly included in the cost of imported raw materials and components per IAS 2.10.', source: 'IAS 2.10; Customs & Excise Act' },
              { title: 'Environmental Compliance — NESREA Permits', purpose: 'To confirm that the entity holds valid environmental permits from NESREA, that environmental impact assessments are current, and that any environmental remediation obligations have been recognised as provisions per IAS 37.', source: 'NESREA Act 2007; IAS 37; ISA 250' },
              { title: 'ITF Levy — Verification and Refund Assessment', purpose: 'To verify that the 1% ITF levy on annual payroll has been correctly computed and remitted, and assess whether the entity is entitled to a refund of up to 50% based on qualifying training expenditure during the year.', source: 'ITF Act 2011' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════
  // TEMPLATE 3: FIELDWORK — OIL & GAS SERVICES
  // ═══════════════════════════════════════════
  {
    label: 'Fieldwork — Oil & Gas Services',
    definition: 'Substantive procedures for oil and gas service companies. Covers IFRS 6 E&E assets, PPT computation, NUPRC compliance, ARO decommissioning provisions (IAS 37), NDDC levy, and NOGICD Act local content requirements.',
    phases: [
      {
        phase: 'FIELDWORK',
        groups: [
          {
            name: 'Revenue — Oil & Gas Services',
            procedures: [
              { title: 'Revenue Recognition for Service Contracts', purpose: 'To assess whether revenue from oil and gas service contracts is recognised over time (as the customer receives and consumes benefits) or at a point in time, based on the specific terms of each contract per IFRS 15.35.', source: 'IFRS 15.35' },
              { title: 'Lifting Entitlements — Reconciliation', purpose: 'To reconcile oil liftings during the period to the production allocation, confirm revenue is recognised on the entitlement method, and identify any lifting imbalances that require accrual or deferral.', source: 'IFRS 15; industry practice' },
              { title: 'PPT Treatment — Revenue Net of Royalties', purpose: 'To verify that Petroleum Profits Tax and royalties have been correctly treated in the financial statements, and assess whether the entity presents revenue gross or net of government take in accordance with IFRS 15.B34.', source: 'IFRS 15.B34; PPTA as modified by NTA 2025' },
              { title: 'Signature Bonuses — Amortisation', purpose: 'To verify that signature bonuses paid for licence awards are capitalised and amortised over the licence period on a systematic basis, consistent with the entity\'s accounting policy.', source: 'IFRS 6; IAS 38' },
              { title: 'Foreign Currency Revenue — Translation', purpose: 'To verify that USD-denominated revenue and receivables are translated at the correct exchange rate per IAS 21, and that translation gains/losses are recognised in profit or loss.', source: 'IAS 21' },
            ],
          },
          {
            name: 'Exploration & Evaluation Assets (IFRS 6)',
            procedures: [
              { title: 'E&E Assets — Recognition and Classification', purpose: 'To verify that exploration and evaluation expenditures meet the recognition criteria under the entity\'s accounting policy per IFRS 6.9, and are correctly classified as intangible or tangible E&E assets.', source: 'IFRS 6.9' },
              { title: 'E&E Impairment Assessment', purpose: 'To assess whether any triggering events for impairment of E&E assets exist per IFRS 6.20, and where they do, verify that an impairment test has been performed at the appropriate CGU level and any impairment loss correctly recognised.', source: 'IFRS 6.18' },
              { title: 'Licence Acquisition Costs — Allocation', purpose: 'To verify that costs of acquiring exploration licences have been correctly allocated to the relevant licence areas and that any abandoned or relinquished licences have been written off.', source: 'IFRS 6; IAS 38' },
              { title: 'Reclassification from E&E to Development Assets', purpose: 'To confirm that E&E assets reclassified to development assets or PPE during the year meet the criteria for reclassification (commercial viability confirmed), and that the transfer is at carrying value with appropriate impairment testing at the date of transfer.', source: 'IFRS 6.17' },
            ],
          },
          {
            name: 'PPE — Oil & Gas Specific',
            procedures: [
              { title: 'DD&A — Units of Production Method', purpose: 'To verify that depletion, depreciation, and amortisation for oil and gas assets has been calculated using the units of production method based on proved (or proved and probable) reserves, and that reserve estimates are adequately supported.', source: 'IAS 16; IFRS 6' },
              { title: 'Oil Well Costs — Capitalisation Criteria', purpose: 'To assess whether costs incurred on oil wells (dry hole costs, completion costs) have been correctly capitalised or expensed in accordance with the entity\'s accounting policy and IFRS 6.', source: 'IFRS 6' },
              { title: 'Decommissioning Provision — ARO Calculation', purpose: 'To verify that asset retirement obligations (AROs) have been recognised for all wells and facilities with decommissioning obligations, that the provision is calculated as the present value of expected decommissioning costs per IAS 37, and that the unwinding of discount is recognised as a finance cost.', source: 'IAS 37; IFRIC 1' },
              { title: 'Impairment Testing — CGU Definition', purpose: 'To confirm that impairment testing has been performed at the appropriate CGU level (typically individual licence area or field) and that value in use or fair value less costs to sell calculations are based on supportable reserve estimates and price assumptions per IAS 36.', source: 'IAS 36' },
            ],
          },
          {
            name: 'Taxation — Oil & Gas',
            procedures: [
              { title: 'Petroleum Profits Tax Computation', purpose: 'To verify the PPT computation under the applicable provisions of the NTA 2025, including the correct tax rate (65.75% for PSC and JOA, 85% for non-PSC deepwater), allowed deductions, investment tax credit, and any minimum tax provisions.', source: 'NTA 2025; PPTA' },
              { title: 'Investment Tax Credit / Allowance Verification', purpose: 'To verify that investment tax credits or allowances have been correctly claimed in the PPT computation, supported by qualifying capital expenditure documentation.', source: 'PPTA; NTA 2025' },
              { title: 'Gas Transfer Pricing', purpose: 'To assess whether the entity has applied the regulated gas transfer price in its tax computation where applicable, and whether any deviations require disclosure or could give rise to tax exposure.', source: 'FIRS Gas TP regulations' },
              { title: 'NDDC Levy — 3% of Operating Expenditure', purpose: 'To verify that the NDDC (Niger Delta Development Commission) levy of 3% of annual operating budget has been correctly computed and remitted, and any outstanding balance properly accrued.', source: 'NDDC Act' },
            ],
          },
          {
            name: 'Regulatory Compliance — Oil & Gas',
            procedures: [
              { title: 'NUPRC Annual Reports — Filing Status', purpose: 'To confirm that all required annual reports and returns to the Nigerian Upstream Petroleum Regulatory Commission (NUPRC) have been filed within the prescribed timelines, and any penalties for late filing are adequately provided for.', source: 'PIA 2021; ISA 250' },
              { title: 'NUPRC Production Reporting Reconciliation', purpose: 'To reconcile production volumes reported to NUPRC to the volumes recorded in the financial statements and used as the basis for revenue recognition and DD&A calculations.', source: 'PIA 2021; ISA 315' },
              { title: 'Local Content Compliance — NOGICD Act', purpose: 'To assess compliance with Nigerian Oil and Gas Industry Content Development (NOGICD) Act requirements including local content targets, first consideration for Nigerian companies, and Nigerian Content Development and Monitoring Board (NCDMB) reporting.', source: 'NOGICD Act 2010; ISA 250' },
              { title: 'NAPIMS Reporting Obligations', purpose: 'To confirm that reporting obligations to NAPIMS (National Petroleum Investment Management Services) have been fulfilled where the entity has NNPCL as a joint venture partner, and that government participation interests are correctly reflected in the accounts.', source: 'PIA 2021' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // TEMPLATE 4: FIELDWORK — HOSPITALITY & RESTAURANT
  // ═══════════════════════════════════════════════
  {
    label: 'Fieldwork — Hospitality & Restaurant',
    definition: 'Substantive procedures for hotels and restaurants. Covers POS revenue reconciliation, F&B inventory, IFRS 15 loyalty programmes, IFRS 16 leases, NTDC and state tourism licensing compliance.',
    phases: [
      {
        phase: 'FIELDWORK',
        groups: [
          {
            name: 'Revenue — Hospitality',
            procedures: [
              { title: 'Room Revenue Recognition — Daily Basis & Cut-Off', purpose: 'To verify that room revenue is recognised on a daily basis as accommodation is provided (performance obligation satisfied over time per IFRS 15), and that cut-off is correct with no revenue recognised for periods after the reporting date.', source: 'IFRS 15.35; ISA 330' },
              { title: 'F&B Revenue — POS System Reconciliation', purpose: 'To reconcile total food and beverage revenue per the POS system to the general ledger, investigate significant variances, and confirm the completeness of revenue capture from all outlets and shifts.', source: 'ISA 330; IFRS 15' },
              { title: 'Banqueting and Events Revenue', purpose: 'To verify that revenue from banqueting, conferences, and events is recognised when the event takes place (performance obligation satisfied at a point in time or over the event period) and that deposits received in advance are deferred as contract liabilities per IFRS 15.', source: 'IFRS 15; ISA 330' },
              { title: 'Loyalty Points and Gift Vouchers — Liability Assessment', purpose: 'To assess whether the entity has material outstanding loyalty point obligations or unredeemed gift voucher liabilities, verify these are recognised as contract liabilities per IFRS 15.B39, and review the breakage assumption applied.', source: 'IFRS 15.B39' },
              { title: 'Third-Party OTA Commission and Net Revenue', purpose: 'To review bookings made through online travel agencies (Booking.com, Expedia etc.), confirm whether revenue is recognised gross or net per IFRS 15.B34 (principal vs agent), and reconcile OTA commission charges to amounts recorded.', source: 'IFRS 15.B34' },
              { title: 'Cash Revenue Controls and Fraud Risk Assessment', purpose: 'To assess the heightened fraud risk associated with cash revenue in hospitality, review segregation of duties between cashiering and recording functions, and perform directional testing to identify potential understatement of cash sales per ISA 240.', source: 'ISA 240; ISA 315' },
            ],
          },
          {
            name: 'Inventories — F&B',
            procedures: [
              { title: 'Food Inventory — Count and Valuation', purpose: 'To attend or observe the count of food inventory at the reporting date, reconcile count results to inventory records, and confirm food inventory is valued at the lower of cost and NRV with appropriate provisions for perishable or slow-moving items per IAS 2.', source: 'ISA 501; IAS 2' },
              { title: 'Beverage Inventory — Liquor Stock Count and Wastage', purpose: 'To verify the completeness and accuracy of beverage inventory through count observation, compare to par levels, and analyse the wastage/spillage provision to assess whether it is reasonable relative to industry norms.', source: 'ISA 501; IAS 2' },
              { title: 'Operating Supplies Inventory', purpose: 'To confirm that operating supplies (linens, guest amenities, cleaning materials, crockery) are correctly classified as inventory or expensed on consumption, and that balances are reasonable relative to the scale of operations.', source: 'IAS 2; IAS 16' },
              { title: 'Food Cost Percentage Benchmarking', purpose: 'To perform analytical procedures comparing the food cost percentage to prior year and industry benchmarks (typically 28–35% for hotels), and investigate significant variances as potential indicators of theft, wastage, or pricing errors.', source: 'ISA 520; ISA 240' },
            ],
          },
          {
            name: 'PPE — Hospitality',
            procedures: [
              { title: 'FF&E Componentisation and Useful Lives', purpose: 'To verify that furniture, fixtures, and equipment have been componentised where significant parts have different useful lives (e.g. soft furnishings vs. structural elements), and that depreciation rates reflect the actual pattern of consumption per IAS 16.43.', source: 'IAS 16.43' },
              { title: 'Renovation and Refurbishment — Capex vs Opex', purpose: 'To assess whether renovation and refurbishment expenditure meets the IAS 16.7 recognition criteria for capitalisation (enhancing future economic benefits beyond original specification) or should be expensed, with particular attention to cyclical maintenance programmes.', source: 'IAS 16.7' },
              { title: 'Property Lease — IFRS 16 Calculation', purpose: 'To verify the completeness of the lease portfolio under IFRS 16, review the incremental borrowing rate applied, re-perform the right-of-use asset and lease liability calculations for material leases, and confirm that short-term and low-value lease exemptions applied are appropriate.', source: 'IFRS 16' },
            ],
          },
          {
            name: 'Cash Controls — Hospitality',
            procedures: [
              { title: 'Cash Float Reconciliation — Front Desk', purpose: 'To count and reconcile all cash floats held at front desk, restaurant, and bar cashier points at or near the reporting date, and confirm the recorded float balances are accurate.', source: 'ISA 501' },
              { title: 'POS End-of-Day Reconciliation to Cash and Card', purpose: 'To review the process for end-of-day POS reconciliation, test a sample of daily reconciliations to confirm that cash and card receipts per POS agree to physical cash and card settlement reports.', source: 'ISA 330; ISA 240' },
              { title: 'Cash Banking Frequency and Timeliness', purpose: 'To verify that cash collections are banked frequently and intact (complete and unaltered), review banking records for the year, and identify any unusual gaps or shortfalls in banking that may indicate misappropriation.', source: 'ISA 240' },
              { title: 'Tipping Policy — Payroll Tax Treatment', purpose: 'To review the entity\'s policy for handling tips and service charges, confirm that amounts passed to employees are correctly included in payroll and subjected to PAYE deductions per the applicable tax legislation.', source: 'NTA 2025; PITA' },
            ],
          },
          {
            name: 'Regulatory Compliance — Hospitality',
            procedures: [
              { title: 'Hotel and Tourism Licensing — NTDC and State Tourism Board', purpose: 'To confirm that the entity holds a valid hotel licence from the Nigerian Tourism Development Corporation (NTDC) and the relevant State Tourism Board, that licences are current, and that licence fees are correctly expensed.', source: 'NTDC Act; state tourism laws; ISA 250' },
              { title: 'Fire Safety and Health Certificate', purpose: 'To confirm that current fire safety certificates and health inspection certificates are held, that there are no outstanding improvement notices, and that any required remediation expenditure has been appropriately provided for.', source: 'ISA 250; IAS 37' },
              { title: 'NAFDAC Compliance for Food Handling', purpose: 'To verify that food handling and storage operations comply with NAFDAC regulations, that relevant staff have valid food handler certificates, and that there are no outstanding enforcement actions or product recalls.', source: 'NAFDAC Act; ISA 250' },
              { title: 'Local Government and Entertainment Levies', purpose: 'To identify all applicable local government levies, entertainment taxes, and signage fees, confirm they are correctly computed, remitted on time, and any outstanding balances are properly accrued.', source: 'Local Government Finance Law; ISA 250' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════
  // TEMPLATE 5: FIELDWORK — CONSULTING
  // ═══════════════════════════════════════════
  {
    label: 'Fieldwork — Consulting',
    definition: 'Substantive procedures for consulting firms. Covers IFRS 15 contract assets and unbilled WIP, fixed-fee and retainer revenue, staff utilisation, WHT on sub-contractors, and professional body compliance.',
    phases: [
      {
        phase: 'FIELDWORK',
        groups: [
          {
            name: 'Revenue — Consulting',
            procedures: [
              { title: 'Time-and-Materials Contracts — Cut-Off and Hours Billed', purpose: 'To verify that revenue on time-and-materials contracts is recognised as services are performed, test the completeness and accuracy of hours billed near the reporting date, and confirm that rates applied are per the applicable engagement letters or master service agreements per IFRS 15.', source: 'IFRS 15; ISA 330' },
              { title: 'Fixed-Fee Contracts — Stage of Completion', purpose: 'To verify that fixed-fee contract revenue is recognised using an appropriate output or input method reflecting the stage of completion, review the basis for percentage completion estimates, and confirm that estimates are reasonable and consistently applied per IFRS 15.39.', source: 'IFRS 15.39' },
              { title: 'Retainer Revenue — Period Allocation', purpose: 'To verify that retainer fees are allocated to the period in which the related services are rendered, and that any retainers received in advance of service delivery are recognised as deferred revenue / contract liabilities per IFRS 15.', source: 'IFRS 15' },
              { title: 'Unbilled WIP (Contract Assets) — Assessment', purpose: 'To verify the completeness and valuation of unbilled work-in-progress (contract assets), confirm that WIP represents enforceable rights to consideration for services rendered, and assess whether any WIP has become irrecoverable and requires write-off per IFRS 15.107.', source: 'IFRS 15.107' },
              { title: 'Contract Modifications — Variable Consideration', purpose: 'To identify contract modifications (scope changes, additions, cancellations) during the year, assess their accounting treatment as a modification or a new contract per IFRS 15.18, and verify that variable consideration has been constrained appropriately.', source: 'IFRS 15.18; IFRS 15.56' },
              { title: 'Reimbursable Expenses — Gross vs Net Presentation', purpose: 'To assess whether reimbursable expenses (travel, accommodation, third-party costs) are presented gross as revenue or net, applying the principal vs agent guidance of IFRS 15.B34, and confirm consistent application of the policy.', source: 'IFRS 15.B34' },
            ],
          },
          {
            name: 'Trade and Other Receivables — Consulting',
            procedures: [
              { title: 'Aged WIP and Debtors — Project-by-Project Analysis', purpose: 'To review the aged analysis of both billed debtors and unbilled WIP on a project-by-project basis, identify balances at risk of non-recovery, and confirm that provisions reflect specific client credit risk rather than a generic percentage.', source: 'IFRS 9; ISA 540' },
              { title: 'Contract Asset vs Trade Receivable Distinction', purpose: 'To confirm that the distinction between contract assets (right to consideration conditional on completion of further performance obligations) and trade receivables (unconditional right to consideration) has been correctly applied and separately presented per IFRS 15.107.', source: 'IFRS 15.107' },
              { title: 'Debtors Confirmation — Key Client Balances', purpose: 'To obtain external confirmation from significant debtors of the amounts owed at the year-end date, with particular focus on balances where collectability risk is elevated per ISA 505.', source: 'ISA 505' },
            ],
          },
          {
            name: 'Payroll and Sub-Contractors — Consulting',
            procedures: [
              { title: 'Staff Utilisation Analysis', purpose: 'To analyse billed versus unbilled hours by staff member and by engagement to assess the reasonableness of the revenue recognised on time-based contracts, identify idle time or over-runs, and support the valuation of unbilled WIP.', source: 'ISA 520; IFRS 15' },
              { title: 'Bonuses and Commissions — Accrual Basis', purpose: 'To verify that bonuses and commissions payable to staff are correctly accrued at year-end based on achieved performance metrics, and that the accrual basis and amount are consistent with approved schemes and prior year practice per IAS 19.', source: 'IAS 19; ISA 330' },
              { title: 'Sub-Contractor Costs — WHT Deduction Compliance', purpose: 'To verify that withholding tax has been correctly deducted at 5% on payments to sub-contractors and professional service providers, remitted to FIRS, and that sub-contractor costs are recognised in the period in which the related services are received.', source: 'NTA 2025; FIRS WHT regulations' },
              { title: 'Consultants vs Employees — Tax Classification', purpose: 'To assess whether individuals engaged as consultants (subject to WHT at 5%) are in substance employees (subject to PAYE), applying the tests of control and integration, and confirm the tax treatment is appropriate to avoid PAYE exposure.', source: 'NTA 2025; PITA; FIRS guidelines' },
            ],
          },
          {
            name: 'Regulatory Compliance — Consulting',
            procedures: [
              { title: 'Professional Body Membership — Current Year', purpose: 'To confirm that the firm and relevant professional staff hold current membership of applicable professional bodies (ICAN, CIBN, NIM, CIPM, COREN, NSE, etc.), that practising licences are valid, and that annual fees are correctly expensed.', source: 'ISA 250; applicable professional body laws' },
              { title: 'Professional Indemnity Insurance', purpose: 'To confirm that current professional indemnity insurance cover is in place and adequate for the scale of the firm\'s operations, and that premium payments are correctly treated in the financial statements.', source: 'ISA 250' },
              { title: 'NOTAP Registration — Technology Transfer', purpose: 'To confirm that any agreements involving technology transfer, franchise, or technical services fees paid to foreign entities have been registered with the National Office for Technology Acquisition and Promotion (NOTAP) as required, and that related payments have the correct WHT treatment.', source: 'NOTAP Act; NTA 2025; ISA 250' },
            ],
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────
// SEEDER FUNCTION
// ─────────────────────────────────────────────

async function seed() {
  console.log('🌱 FDC OpenWorkpaper Template Seeder');
  console.log('=====================================\n');

  // Try to detect schema field names by inspecting the Prisma client
  // This handles variations in how the developer named fields
  const modelNames = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('📦 Detected Prisma models:', modelNames.join(', '), '\n');

  // Find library/template model (could be named various things)
  const libraryModel = modelNames.find(m =>
    m.toLowerCase().includes('library') ||
    m.toLowerCase().includes('template') ||
    m.toLowerCase().includes('program')
  );

  if (!libraryModel) {
    console.error('❌ Could not find a library/template model in Prisma schema.');
    console.error('   Available models:', modelNames.join(', '));
    console.error('   Please check prisma/schema.prisma and update this script.');
    process.exit(1);
  }

  console.log(`✅ Using model: "${libraryModel}" for templates\n`);

  let totalTemplates = 0;
  let totalGroups = 0;
  let totalProcedures = 0;

  for (const template of TEMPLATES) {
    console.log(`📋 Creating template: ${template.label}`);

    try {
      // Try to create the top-level template/program
      // Field names vary — try common variations
      let createdTemplate;

      try {
        createdTemplate = await prisma[libraryModel].create({
          data: {
            label: template.label,
            definition: template.definition,
          },
        });
      } catch (e1) {
        try {
          createdTemplate = await prisma[libraryModel].create({
            data: {
              name: template.label,
              description: template.definition,
            },
          });
        } catch (e2) {
          try {
            createdTemplate = await prisma[libraryModel].create({
              data: {
                title: template.label,
                description: template.definition,
              },
            });
          } catch (e3) {
            console.error(`   ❌ Failed to create template. Error: ${e1.message}`);
            console.error('   Try checking field names in prisma/schema.prisma');
            continue;
          }
        }
      }

      totalTemplates++;
      console.log(`   ✅ Template created (ID: ${createdTemplate.id})`);

      // Find group model
      const groupModel = modelNames.find(m =>
        m.toLowerCase().includes('group') &&
        (m.toLowerCase().includes('program') || m.toLowerCase().includes('library') || m.toLowerCase().includes('template'))
      ) || modelNames.find(m => m.toLowerCase().includes('group'));

      // Find procedure model
      const procedureModel = modelNames.find(m =>
        m.toLowerCase().includes('procedure') &&
        (m.toLowerCase().includes('program') || m.toLowerCase().includes('library') || m.toLowerCase().includes('template'))
      ) || modelNames.find(m => m.toLowerCase().includes('procedure'));

      if (!groupModel || !procedureModel) {
        console.warn(`   ⚠️  Could not find group/procedure models. Models available: ${modelNames.join(', ')}`);
        console.warn('   You may need to manually add groups and procedures in the UI.');
        continue;
      }

      // Create groups and procedures
      for (const phaseData of template.phases) {
        for (const group of phaseData.groups) {
          let createdGroup;
          try {
            createdGroup = await prisma[groupModel].create({
              data: {
                name: group.name,
                phase: phaseData.phase,
                programId: createdTemplate.id,
              },
            });
          } catch (e) {
            try {
              createdGroup = await prisma[groupModel].create({
                data: {
                  name: group.name,
                  phase: phaseData.phase,
                  libraryId: createdTemplate.id,
                },
              });
            } catch (e2) {
              try {
                createdGroup = await prisma[groupModel].create({
                  data: {
                    name: group.name,
                    phase: phaseData.phase,
                    templateId: createdTemplate.id,
                  },
                });
              } catch (e3) {
                console.warn(`   ⚠️  Could not create group "${group.name}": ${e.message}`);
                continue;
              }
            }
          }

          totalGroups++;

          for (const proc of group.procedures) {
            try {
              await prisma[procedureModel].create({
                data: {
                  title: proc.title,
                  purpose: proc.purpose,
                  source: proc.source || '',
                  groupId: createdGroup.id,
                },
              });
              totalProcedures++;
            } catch (e) {
              try {
                await prisma[procedureModel].create({
                  data: {
                    title: proc.title,
                    purpose: proc.purpose,
                    source: proc.source || '',
                    programGroupId: createdGroup.id,
                  },
                });
                totalProcedures++;
              } catch (e2) {
                console.warn(`      ⚠️  Could not create procedure "${proc.title}": ${e.message}`);
              }
            }
          }

          console.log(`   📁 ${phaseData.phase} > ${group.name} (${group.procedures.length} procedures)`);
        }
      }
    } catch (err) {
      console.error(`   ❌ Error creating template: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`✅ SEEDING COMPLETE`);
  console.log(`   Templates created : ${totalTemplates}`);
  console.log(`   Groups created    : ${totalGroups}`);
  console.log(`   Procedures created: ${totalProcedures}`);
  console.log('═══════════════════════════════════════════\n');

  if (totalProcedures === 0) {
    console.log('⚠️  0 procedures were created. This usually means field names in the');
    console.log('   Prisma schema do not match what this script expects.');
    console.log('\n   TO FIX:');
    console.log('   1. Run: cat prisma/schema.prisma');
    console.log('   2. Find the model names and field names for templates, groups, and procedures');
    console.log('   3. Update the field names in seed.js lines 200-310 to match');
    console.log('   4. Re-run: node seed.js\n');
  }
}

seed()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
