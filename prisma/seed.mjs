// seed.mjs
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbUrl = process.env.DATABASE_URL || 'file:prisma/data/dev.db';
const sqliteInput = { url: dbUrl.replace(/^file:/, '') };
const adapter = new PrismaBetterSqlite3(sqliteInput);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// DATA – All 5 templates (converted from original seed.js)
// ============================================================================

const TEMPLATES = [
  // 1. UNIVERSAL – PLANNING & REPORTING
  {
    name: 'Universal — Planning & Reporting (All Industries)',
    description:
      'Engagement acceptance, risk assessment, materiality, audit strategy, completion procedures, and audit reporting. Import into every engagement regardless of industry.',
    phases: [
      {
        phase: 'Planning',
        groups: [
          {
            title: 'Engagement Acceptance & Continuance',
            procedures: [
              { title: 'Client Acceptance / Continuance Assessment', purpose: 'To assess whether the firm should accept or continue the engagement in accordance with ISQM 1 and ISA 220, including evaluation of client integrity, management character, and any threats to independence. [ISQM 1; ISA 220.25; ICAN Code of Ethics]' },
              { title: 'Independence Assessment — Firm & Engagement Team', purpose: 'To confirm that all engagement team members and the firm are independent of the client in compliance with the ICAN Code of Ethics (IFAC-aligned) and ISA 220.15. [ISA 220.15; ICAN Code of Ethics Part B; ISQM 1.29]' },
              { title: 'Conflict of Interest Review', purpose: 'To identify and document any actual or potential conflicts of interest between the firm, engagement team members, and the client or its related parties. [ICAN Code of Ethics s.220; ISA 220]' },
              { title: 'Engagement Letter — Execution and Filing', purpose: 'To confirm that the terms of the audit engagement have been agreed in writing with management or those charged with governance, in accordance with ISA 210. [ISA 210.10; CAMA 2020 s.402]' },
              { title: 'Management Representation Agreement', purpose: 'To document that management acknowledges its responsibility for the financial statements and for providing the auditor with all relevant information, per ISA 580. [ISA 580.10]' },
              { title: 'Prior Year Audit File Review', purpose: 'To review the prior year audit conclusions, adjusting entries, carry-forward matters, and any unresolved issues that may affect the current year engagement. [ISA 300.13; ISA 510]' },
            ],
          },
          {
            title: 'Understanding the Entity',
            procedures: [
              { title: 'Business Understanding — Industry, Operations & Regulatory Environment', purpose: 'To obtain and document a thorough understanding of the client\'s business, industry dynamics, competitive environment, and applicable regulatory framework, in accordance with ISA 315.11. [ISA 315.11-315.19]' },
              { title: 'Ownership Structure & Related Parties — Identification', purpose: 'To identify all related parties, including ultimate beneficial owners, subsidiaries, associates, and key management personnel, to support related party testing under ISA 550 and IAS 24. [ISA 550.13; IAS 24]' },
              { title: 'Legal & Regulatory Framework Applicable to Client', purpose: 'To document all laws and regulations that have a direct effect on the financial statements, including CAMA 2020, NTA 2025, PENCOM, NSITF, sector-specific regulations, and applicable IFRS standards, per ISA 250. [ISA 250.13; CAMA 2020; NTA 2025; PENCOM Act 2014]' },
              { title: 'Going Concern Assessment — Preliminary', purpose: 'To perform a preliminary assessment of the entity\'s ability to continue as a going concern for at least 12 months from the reporting date, identifying any indicators of financial distress, per ISA 570. [ISA 570.10]' },
              { title: 'Prior Year Financial Statements & Audit Report Review', purpose: 'To review the prior year signed financial statements and audit report to identify accounting policies, prior year adjustments, emphasis of matter paragraphs, and any matters requiring follow-up in the current year. [ISA 300.13; ISA 510; IAS 1]' },
              { title: 'Key Accounting Policies Assessment', purpose: 'To document and evaluate the appropriateness of the client\'s significant accounting policies under IFRS, including any changes in policy or estimates from the prior year per IAS 8. [ISA 315.19; IAS 1.117; IAS 8]' },
              { title: 'Organisational Structure & IT Environment Overview', purpose: 'To understand the client\'s organisational chart, key personnel, authorisation levels, and IT systems used for financial reporting, as inputs to the risk assessment and internal controls evaluation per ISA 315. [ISA 315.19; ISA 315.A56]' },
            ],
          },
          {
            title: 'Risk Assessment',
            procedures: [
              { title: 'Entity-Level Risk Assessment', purpose: 'To identify and assess risks at the financial statement level that may result from a weak control environment, management override, or pervasive misstatement, per ISA 315.26. [ISA 315.26]' },
              { title: 'Significant Risks Identification — Including Fraud Risks', purpose: 'To identify risks that require special audit consideration, including the presumed fraud risks of management override of controls and improper revenue recognition, per ISA 240 and ISA 315.28. [ISA 315.28; ISA 240.26]' },
              { title: 'Inherent Risk Assessment by Financial Statement Area', purpose: 'To assess the inherent risk of material misstatement at the assertion level for all material account balances and transaction classes, to determine the nature, timing and extent of further audit procedures per ISA 315. [ISA 315.31]' },
              { title: 'Related Party Transactions — Risk Assessment', purpose: 'To assess the risk that related party transactions and balances have not been completely identified, properly authorised, and appropriately disclosed in the financial statements, per ISA 550 and IAS 24. [ISA 550.13; IAS 24]' },
              { title: 'IT Environment & General IT Controls Assessment', purpose: 'To understand and document the client\'s IT general controls (access controls, change management, operations) and assess the risk of material misstatement arising from IT system weaknesses, per ISA 315. [ISA 315.A56-A67]' },
              { title: 'Fraud Risk Assessment — Discussion & Documentation', purpose: 'To conduct and document the engagement team discussion on the susceptibility of the financial statements to material misstatement due to fraud, including identification of fraud risk factors, per ISA 240.15. [ISA 240.15; ISA 240.26]' },
              { title: 'Analytical Procedures — Planning', purpose: 'To apply analytical procedures at the planning stage to identify unusual transactions, balances, or trends that may indicate areas of higher risk requiring focused audit attention, per ISA 520. [ISA 520.3; ISA 315.6]' },
            ],
          },
          {
            title: 'Materiality',
            procedures: [
              { title: 'Overall Materiality Determination', purpose: 'To determine the overall materiality threshold for the financial statements as a whole, based on an appropriate benchmark (PBT, revenue, total assets, or net assets) and the needs of the primary users of the financial statements, per ISA 320.10. [ISA 320.10]' },
              { title: 'Performance Materiality', purpose: 'To set performance materiality at a level below overall materiality to reduce to an appropriately low level the probability that the aggregate of uncorrected and undetected misstatements exceeds overall materiality, per ISA 320.11. [ISA 320.11]' },
              { title: 'Trivial Amount Threshold', purpose: 'To establish the threshold below which identified misstatements will not be accumulated for evaluation, typically set at 5% of overall materiality, per ISA 450. [ISA 450.A2]' },
              { title: 'Specific Materiality for Sensitive Items', purpose: 'To determine whether a lower materiality threshold applies to specific classes of transactions or disclosures including related party transactions, directors remuneration, and regulatory compliance items, per ISA 320.10. [ISA 320.10; CAMA 2020 s.394]' },
              { title: 'Materiality Basis Justification & Documentation', purpose: 'To document the rationale for the chosen materiality benchmark, the quantitative threshold selected, and any qualitative factors considered, ensuring the basis is appropriate given the client\'s industry, size, and financial profile per ISA 320. [ISA 320; ISA 230]' },
            ],
          },
          {
            title: 'Audit Strategy & Plan',
            procedures: [
              { title: 'Overall Audit Strategy Document', purpose: 'To establish the overall audit strategy that sets the scope, timing, and direction of the audit, and guides the development of the audit plan, per ISA 300.7. [ISA 300.7]' },
              { title: 'Audit Plan — Scope and Timing by Area', purpose: 'To document the detailed audit plan describing the nature, timing, and extent of planned risk assessment procedures and further audit procedures at the assertion level for each material financial statement area, per ISA 300.9. [ISA 300.9; ISA 330]' },
              { title: 'Engagement Team Briefing Notes', purpose: 'To document the briefing of the engagement team on the client\'s business, significant risks, fraud risks, materiality, key accounting issues, and each team member\'s responsibilities, per ISA 300.11 and ISA 240.15. [ISA 300.11; ISA 240.15]' },
              { title: 'Allocation of Work — Team Assignments', purpose: 'To document the assignment of audit areas to specific team members, including the responsible preparer and reviewer for each section, ensuring appropriate experience levels are matched to risk areas per ISA 220. [ISA 220.32]' },
              { title: 'Use of Specialists — Assessment', purpose: 'To assess whether the engagement requires the use of an auditor\'s expert and to document the basis for any such decision and the planned oversight procedures, per ISA 620. [ISA 620]' },
              { title: 'Engagement Milestone & Deadline Schedule', purpose: 'To establish and document key engagement milestones including fieldwork start and end dates, draft financial statements receipt, management letter issuance, and target audit report signing date, to support timely delivery per ISA 300. [ISA 300; CAMA 2020 s.374]' },
            ],
          },
          {
            title: 'Internal Controls Assessment',
            procedures: [
              { title: 'Control Environment Assessment', purpose: 'To evaluate the overall control environment including management\'s philosophy, organisational structure, assignment of authority, and commitment to competence, as the foundation for assessing control risk across all audit areas, per ISA 315. [ISA 315.A68]' },
              { title: 'Revenue Cycle Controls Walkthrough', purpose: 'To document and evaluate the design and implementation of controls over the revenue cycle, from order/contract initiation through invoicing, cash collection, and ledger posting, to determine whether reliance on controls is appropriate per ISA 330. [ISA 330.13; ISA 315.26]' },
              { title: 'Expenditure Cycle Controls Walkthrough', purpose: 'To document and evaluate the design and implementation of controls over the purchase-to-pay cycle, including procurement authorisation, supplier onboarding, invoice approval, and payment processing, per ISA 330. [ISA 330.13]' },
              { title: 'Payroll Cycle Controls Walkthrough', purpose: 'To document and evaluate controls over the payroll process including new hire authorisation, changes to standing data, payroll computation, PAYE/PENCOM deductions, and bank transfer authorisation, per ISA 330 and ISA 240. [ISA 330.13; ISA 240; PENCOM Act 2014]' },
              { title: 'Cash & Treasury Controls Walkthrough', purpose: 'To document and evaluate controls over cash receipts, cash payments, bank account management, reconciliation procedures, and authorisation of transfers, given the elevated fraud risk associated with cash per ISA 240. [ISA 330.13; ISA 240]' },
              { title: 'IT General Controls (ITGC) Review', purpose: 'To assess the general IT controls environment including logical access controls, user provisioning, change management procedures, and IT operations controls, to determine the reliability of system-generated reports and data per ISA 315. [ISA 315.A56]' },
              { title: 'Control Testing Approach — Reliance Decision', purpose: 'To document the engagement team\'s decision on whether to adopt a controls reliance strategy or a purely substantive approach for each audit area, based on the walkthrough results, efficiency considerations, and assessed control risk per ISA 330.8. [ISA 330.8]' },
            ],
          },
          {
            title: 'PBC Requests & Opening Balances',
            procedures: [
              { title: 'PBC Master List — Issue to Client', purpose: 'To prepare and issue a comprehensive list of all documents, schedules, confirmations, and information required from the client (Provided By Client list) prior to and during fieldwork, ensuring timely receipt of evidence and minimising disruption to client operations. [ISA 300; ISA 330]' },
              { title: 'Opening Balances Agreement — Prior Year Closing', purpose: 'To confirm that opening balances for the current period correctly reflect the closing balances of the prior period, and that prior year accounting policies have been consistently applied, per ISA 510. [ISA 510]' },
              { title: 'Comparative Figures Review', purpose: 'To confirm that comparative figures presented in the current year financial statements agree to the prior year signed financial statements or have been appropriately restated with adequate disclosure, per IAS 1 and ISA 710. [ISA 710; IAS 1.38]' },
              { title: 'Predecessor Auditor Communication', purpose: 'To document communication with the predecessor auditor (where applicable) to obtain information relevant to the current engagement including prior year working papers access, reasons for change of auditor, and any unresolved matters, per ISA 510 and ICAN ethical requirements. [ISA 510.6; ICAN Code of Ethics s.320]' },
              { title: 'Engagement Progress Tracker — PBC Status', purpose: 'To monitor and document the receipt status of all PBC items throughout the engagement, tracking outstanding items, responsible client personnel, and escalation of overdue requests to engagement management. [ISA 300; ISA 230]' },
            ],
          },
        ],
      },
      {
        phase: 'Reporting',
        groups: [
          {
            title: 'Completion Procedures',
            procedures: [
              { title: 'Final Going Concern Assessment', purpose: 'To perform a final assessment of the entity\'s ability to continue as a going concern for at least 12 months from the reporting date, evaluating all evidence obtained during the audit including subsequent events, financing arrangements, and management\'s plans, per ISA 570.16. [ISA 570.16]' },
              { title: 'Subsequent Events — Active Search Procedures', purpose: 'To perform procedures designed to identify all events occurring between the reporting date and the date of the auditor\'s report that may require adjustment to or disclosure in the financial statements, per ISA 560.10. [ISA 560.10; IAS 10]' },
              { title: 'Overall Analytical Review — Final Reasonableness', purpose: 'To perform overall analytical procedures at the completion stage to confirm that the financial statements as a whole are consistent with the auditor\'s understanding of the entity, and to identify any previously undetected risks of material misstatement, per ISA 520.6. [ISA 520.6]' },
              { title: 'Evaluation of Identified Misstatements', purpose: 'To accumulate all misstatements identified during the audit, evaluate whether the aggregate effect is material, and determine the appropriate response including communication to management and those charged with governance, per ISA 450. [ISA 450]' },
              { title: 'Summary of Uncorrected Misstatements', purpose: 'To document all misstatements that management has declined to correct, evaluate whether individually or in aggregate they cause the financial statements to be materially misstated, and obtain management\'s reasons for non-correction, per ISA 450.14. [ISA 450.14]' },
              { title: 'Summary of Corrected Misstatements', purpose: 'To document all misstatements identified and corrected by management during the audit, including audit adjusting journal entries, reclassifications, and disclosure corrections, to support the final opinion and demonstrate audit quality. [ISA 450; ISA 230]' },
              { title: 'Final Materiality Review', purpose: 'To reassess whether the overall materiality and performance materiality levels established at planning remain appropriate in light of the actual financial results, and to revise if necessary and consider the impact on audit procedures performed, per ISA 320.13. [ISA 320.13]' },
              { title: 'Fraud Risk — Final Assessment', purpose: 'To perform a final evaluation of whether the accumulated results of audit procedures indicate a previously unrecognised risk of material misstatement due to fraud, and to document conclusions on fraud risk for the engagement, per ISA 240.34. [ISA 240.34]' },
            ],
          },
          {
            title: 'Communications',
            procedures: [
              { title: 'Management Letter — Preparation & Issuance', purpose: 'To prepare and issue a management letter communicating significant deficiencies and material weaknesses in internal controls identified during the audit, together with practical recommendations for improvement, per ISA 265. [ISA 265]' },
              { title: 'Written Representations — Obtain and File', purpose: 'To obtain a signed written representation letter from management confirming their responsibilities for the financial statements, completeness of information provided, and specific representations on matters material to the audit, per ISA 580. Refusal to provide representations constitutes a scope limitation. [ISA 580]' },
              { title: 'Communication with Those Charged with Governance', purpose: 'To document all significant matters arising from the audit that are required to be communicated to those charged with governance, including the auditor\'s responsibilities, planned scope and timing, significant findings, key accounting judgements, and any difficulties encountered during the audit, per ISA 260. [ISA 260]' },
              { title: 'Matters Arising — Resolution Log', purpose: 'To maintain a complete log of all significant matters arising during the engagement, including queries raised with management, management responses, auditor conclusions, and the impact on the audit opinion, ensuring all outstanding matters are resolved before the audit report is signed. [ISA 260; ISA 230]' },
            ],
          },
          {
            title: 'Financial Statements Review',
            procedures: [
              { title: 'Draft Financial Statements — IFRS & FRCN Compliance Review', purpose: 'To review the draft financial statements for compliance with applicable IFRS standards and FRCN requirements, including proper presentation of all primary statements, adequacy of accounting policy disclosures, and compliance with IAS 1 minimum disclosure requirements. [IAS 1; FRCN Act; ISA 700]' },
              { title: 'Statement of Financial Position — Assertion Mapping', purpose: 'To confirm that all balances presented in the statement of financial position are supported by audit evidence, properly classified between current and non-current, and agree to the audited trial balance and underlying working papers at the assertion level. [IAS 1.54; ISA 330]' },
              { title: 'Statement of Profit or Loss — Assertion Mapping', purpose: 'To confirm that all income and expense items presented in the statement of profit or loss are supported by audit evidence, correctly classified, and agree to the audited trial balance, with particular attention to cut-off, completeness, and accuracy assertions. [IAS 1.82; ISA 330]' },
              { title: 'Statement of Changes in Equity — Review', purpose: 'To verify that all movements in equity during the year including profit for the period, dividends declared, share issuances, and other comprehensive income items are complete, accurately stated, and properly authorised in accordance with CAMA 2020 and applicable IFRS standards. [IAS 1.106; CAMA 2020 s.424]' },
              { title: 'Statement of Cash Flows — Review', purpose: 'To verify that the statement of cash flows has been correctly prepared under the indirect or direct method per IAS 7, with proper classification of operating, investing, and financing activities, and agreement of opening and closing cash balances to the audited bank reconciliations. [IAS 7; ISA 330]' },
              { title: 'Notes to the Financial Statements — Adequacy Review', purpose: 'To review all notes to the financial statements for completeness, accuracy, and compliance with IFRS disclosure requirements, ensuring that all significant accounting policies, judgements, estimates, and required quantitative disclosures are adequately presented per IAS 1.112. [IAS 1.112]' },
              { title: 'CAMA 2020 — Statutory Disclosure Compliance', purpose: 'To confirm that all disclosures required by the Companies and Allied Matters Act 2020 are included in the financial statements and directors report, including directors remuneration, related party transactions, share capital movements, dividends, and auditor appointment, per CAMA 2020 s.374 to s.423. [CAMA 2020 s.374-s.423]' },
              { title: 'Comparative Figures — Consistency & Restatement Review', purpose: 'To confirm that comparative figures are consistent with the prior year signed financial statements or have been appropriately restated with full disclosure of the nature, reason, and financial impact of any restatement in accordance with IAS 8. [IAS 8.49; ISA 710]' },
            ],
          },
          {
            title: 'Quality Control & Archiving',
            procedures: [
              { title: 'Engagement Quality Review (EQR)', purpose: 'To document the engagement quality reviewer\'s objective evaluation of the significant judgements made by the engagement team and the conclusions reached in formulating the auditor\'s report, per ISQM 1 and ISA 220.34. EQR is mandatory for audits of public interest entities. The audit report must not be signed before the EQR is complete. [ISQM 1; ISA 220.34]' },
              { title: 'Hot Review Completion Checklist', purpose: 'To perform a final pre-issuance review of the complete audit file confirming that all procedures are documented and signed off, all review points are cleared, all misstatements are resolved, written representations are obtained, the management letter is issued, and the file is fit for cold file review. [ISA 220; ISQM 1]' },
              { title: 'Partner Final Sign-Off — All Phases', purpose: 'To document the engagement partner\'s final review and approval of the complete audit file across all three phases, confirming that sufficient appropriate audit evidence has been obtained to support the audit opinion and that all significant matters have been resolved, per ISA 220.31. [ISA 220.31]' },
              { title: 'Audit File Assembly & Archiving — 60-Day Rule', purpose: 'To assemble and archive the final audit file within 60 days of the date of the auditor\'s report, ensuring all documentation is complete, properly indexed, and securely stored in accordance with ISA 230.14. Files must be retained for a minimum of 5 years from the date of the audit report. [ISA 230.14]' },
              { title: 'Client Communication — Audit Report Delivery', purpose: 'To document the formal delivery of the signed audit report and audited financial statements to the client, including the date of delivery, recipient, and any accompanying communications such as the management letter. [ISA 700; CAMA 2020 s.408]' },
            ],
          },
          {
            title: 'Audit Reports',
            procedures: [
              { title: 'Independent Auditor\'s Report — Draft & Final', purpose: 'To prepare and finalise the independent auditor\'s report in accordance with ISA 700, ensuring the report correctly identifies the financial statements audited, the applicable financial reporting framework, the scope of the audit, and the basis for the opinion. The report must comply with ICAN-prescribed format and reference CAMA 2020 s.402. [ISA 700; CAMA 2020 s.402]' },
              { title: 'Key Audit Matters — Identification & Documentation', purpose: 'To identify and communicate key audit matters being those matters that, in the auditor\'s professional judgement, were of most significance in the audit of the financial statements, per ISA 701. Applicable to audits of listed entities and public interest entities. [ISA 701]' },
              { title: 'Emphasis of Matter & Other Matter Paragraphs', purpose: 'To determine whether any Emphasis of Matter or Other Matter paragraphs are required in the auditor\'s report, including material uncertainties relating to going concern, significant subsequent events, or other matters requiring user attention without modifying the opinion, per ISA 706. [ISA 706]' },
              { title: 'Modified Opinion — Basis & Documentation', purpose: 'To document the basis for any modification to the audit opinion including the nature and pervasiveness of the matter, whether the modification arises from a limitation of scope or a disagreement with management, and the precise wording of the qualified, adverse, or disclaimer opinion, per ISA 705. [ISA 705]' },
              { title: 'Going Concern Paragraph — Assessment & Wording', purpose: 'To document the assessment of whether a material uncertainty related to going concern exists and requires disclosure in the auditor\'s report, and to confirm that the wording accurately reflects the nature and extent of the uncertainty disclosed in the financial statements, per ISA 570.22. [ISA 570.22]' },
              { title: 'Audit Report Sign-Off — Date & Authority Confirmation', purpose: 'To confirm that the audit report is dated no earlier than the date on which sufficient appropriate audit evidence has been obtained, including evidence that the financial statements have been prepared and that those with recognised authority have taken responsibility for them, per ISA 700.41. [ISA 700.41; CAMA 2020 s.402]' },
            ],
          },
        ],
      },
    ],
  },

  // 2. FIELDWORK – MANUFACTURING
  {
    name: 'Fieldwork — Manufacturing',
    description:
      'Substantive procedures for manufacturing clients. Covers revenue (IFRS 15), inventory (IAS 2), PPE (IAS 16), payroll, taxation (NTA 2025), and regulatory compliance (SON, NAFDAC, ITF, NESREA).',
    phases: [
      {
        phase: 'Fieldwork',
        groups: [
          {
            title: 'Revenue',
            procedures: [
              { title: 'Revenue Recognition Policy Assessment (IFRS 15)', purpose: 'To evaluate whether the client\'s revenue recognition policy complies with IFRS 15, including correct application of the 5-step model: identify the contract, identify performance obligations, determine transaction price, allocate transaction price, and recognise revenue when or as performance obligations are satisfied. [IFRS 15]' },
              { title: 'Completeness of Revenue — Cut-Off Testing', purpose: 'To obtain evidence that all revenue transactions relating to the period have been recorded and that no pre or post period revenue has been included, by testing transactions around the reporting date against despatch records, delivery notes, and customer acknowledgements of receipt. [ISA 330; IFRS 15.31]' },
              { title: 'Occurrence — Revenue Transaction Testing', purpose: 'To verify that recorded revenue transactions represent actual sales of goods to legitimate customers during the period, by selecting a sample from the revenue ledger and agreeing to sales invoices, delivery documentation, customer purchase orders, and cash receipts. [ISA 330]' },
              { title: 'Revenue Journal Entry Testing', purpose: 'To identify and test unusual or irregular journal entries posted to revenue accounts, including manual journals, late adjustments, and entries posted by senior personnel, to address the presumed fraud risk of improper revenue recognition per ISA 240.32. [ISA 240.32]' },
              { title: 'Contract Liability and Deferred Revenue Assessment', purpose: 'To verify that amounts received from customers for performance obligations not yet satisfied are correctly recognised as contract liabilities rather than revenue, per IFRS 15.106. [IFRS 15.106]' },
              { title: 'Related Party Revenue Assessment', purpose: 'To identify all revenue transactions with related parties, confirm they are transacted at arm\'s length or that any non-arm\'s length terms are adequately disclosed, per ISA 550 and IAS 24. [ISA 550; IAS 24]' },
              { title: 'VAT on Revenue — Compliance Review (NTA 2025)', purpose: 'To verify that VAT has been correctly charged at 7.5% on all taxable supplies, that VAT returns reconcile to the revenue ledger, and that VAT remittances are current with no outstanding liabilities per the Nigeria Tax Act 2025. [NTA 2025; FIRS regulations]' },
              { title: 'Export Revenue — Foreign Currency & Variable Consideration', purpose: 'To verify that export revenue is correctly translated at the transaction date spot rate per IAS 21, that variable consideration elements are estimated and constrained appropriately per IFRS 15.56, and that foreign currency debtors are retranslated at the closing rate. [IFRS 15.56; IAS 21]' },
            ],
          },
          {
            title: 'Trade and Other Receivables',
            procedures: [
              { title: 'Debtors Ledger Reconciliation', purpose: 'To reconcile the trade receivables ledger to the general ledger control account and confirm the year-end balance is accurately stated. [ISA 330]' },
              { title: 'Debtors Circularisation / External Confirmation', purpose: 'To obtain direct written confirmation from a sample of debtors of the amounts owed to the client at the year-end date, per ISA 505. [ISA 505]' },
              { title: 'Aged Debtors Analysis', purpose: 'To review the aged receivables listing to identify overdue balances, disputed amounts, and balances requiring impairment assessment under the ECL model. [IFRS 9; ISA 540]' },
              { title: 'Impairment Assessment — ECL Model (IFRS 9)', purpose: 'To verify that the expected credit loss provision has been calculated in accordance with IFRS 9 using the simplified approach (provision matrix) or general approach as appropriate, and that the provision is adequate given the ageing profile and credit history of debtors. [IFRS 9.5.5; ISA 540]' },
              { title: 'WHT Receivable Reconciliation', purpose: 'To reconcile withholding tax credits receivable to WHT certificates received from customers and confirm the balance is recoverable or has been applied against tax liabilities. [NTA 2025; FIRS regulations]' },
              { title: 'Related Party Receivables', purpose: 'To identify all receivables from related parties, confirm they are supported by proper documentation, bear market-related terms, and are adequately disclosed per IAS 24. [ISA 550; IAS 24]' },
            ],
          },
          {
            title: 'Inventories',
            procedures: [
              { title: 'Attendance at Physical Stock Count (ISA 501)', purpose: 'To attend the client\'s physical inventory count to observe counting procedures, test count accuracy, and assess the adequacy of controls over the count process per ISA 501. [ISA 501]' },
              { title: 'Stock Count Results — Reconciliation to Books', purpose: 'To reconcile the results of the physical count to the inventory records and general ledger, and investigate any significant variances. [ISA 501; IAS 2]' },
              { title: 'Raw Materials — Purchase Price Variance Analysis', purpose: 'To analyse purchase price variances to identify unusual movements in raw material costs and confirm inventory is recorded at the lower of cost and NRV per IAS 2. [IAS 2.9]' },
              { title: 'Work-in-Progress — Stage of Completion Verification', purpose: 'To verify WIP quantities and the percentage of completion applied, including review of production records, to ensure WIP is correctly valued at cost of conversion to date. [IAS 2.12]' },
              { title: 'Finished Goods — Standard vs Actual Cost Reconciliation', purpose: 'To review the costing method applied to finished goods, reconcile standard costs to actual production costs, and assess whether variances have been appropriately treated. [IAS 2.21]' },
              { title: 'Production Overhead Absorption Rate', purpose: 'To verify that production overheads have been systematically allocated to inventory using a rate based on normal production capacity, in accordance with IAS 2.12. [IAS 2.12]' },
              { title: 'Net Realisable Value Assessment', purpose: 'To assess whether inventory is carried at the lower of cost and NRV by reviewing selling prices, current replacement costs, and write-down history, per IAS 2.9. [IAS 2.9]' },
              { title: 'Obsolete and Slow-Moving Stock Assessment', purpose: 'To identify slow-moving, obsolete, or damaged inventory items and confirm that appropriate write-downs have been recorded, with adequate documentation of management\'s assessment. [IAS 2.28]' },
              { title: 'Consignment and Third-Party Held Inventory', purpose: 'To verify the existence and ownership of inventory held at third party locations or on consignment, through confirmation or physical inspection per ISA 501. [ISA 501; IAS 2]' },
            ],
          },
          {
            title: 'Property, Plant and Equipment',
            procedures: [
              { title: 'PPE Lead Schedule Reconciliation', purpose: 'To reconcile the detailed PPE schedule (opening balance, additions, disposals, depreciation, closing balance) to the general ledger and prior year audited financial statements. [IAS 16; ISA 330]' },
              { title: 'Additions — Capex vs Opex Assessment', purpose: 'To verify that capital additions meet the recognition criteria of IAS 16.7, have been properly authorised, and that expenditure incorrectly capitalised or charged to opex has been identified. [IAS 16.7]' },
              { title: 'Disposals — Gain/Loss Calculation Verification', purpose: 'To verify the accuracy of gains or losses on disposal of PPE, confirm proper derecognition of the asset and accumulated depreciation, and check that sale proceeds have been received and recorded. [IAS 16.67]' },
              { title: 'Depreciation Computation Verification', purpose: 'To verify that depreciation has been calculated using the correct method, rates, and bases for each asset class, and that the useful life estimates and residual values remain appropriate. [IAS 16.43]' },
              { title: 'Physical Verification — Sample', purpose: 'To physically inspect a sample of assets on the PPE schedule to confirm their existence, condition, and use in the business, and to check assets in use are on the schedule. [ISA 501; IAS 16]' },
              { title: 'Impairment Assessment (IAS 36)', purpose: 'To assess whether any indicators of impairment exist and, where they do, verify that an impairment test has been performed and any impairment loss correctly recognised and disclosed per IAS 36. [IAS 36]' },
              { title: 'Asset Componentisation Review (IAS 16.43)', purpose: 'To assess whether significant components of major assets with different useful lives have been separately identified and depreciated per IAS 16.43. [IAS 16.43]' },
              { title: 'Right-of-Use Assets (IFRS 16) — Completeness & Calculation', purpose: 'To identify all leases to which IFRS 16 applies, confirm that right-of-use assets and lease liabilities have been recognised for all qualifying leases, and verify the calculation of initial and subsequent measurement. [IFRS 16]' },
            ],
          },
          {
            title: 'Cash and Bank',
            procedures: [
              { title: 'Bank Reconciliations — All Accounts', purpose: 'To obtain and review bank reconciliations for all bank accounts at the year-end date, agree the bank balance per reconciliation to bank statements, and investigate all reconciling items. [ISA 330]' },
              { title: 'Bank Confirmation Letters (ISA 505)', purpose: 'To obtain direct confirmation from the client\'s bankers of balances, facilities, and security arrangements at the year-end date per ISA 505. [ISA 505]' },
              { title: 'Petty Cash Count', purpose: 'To count petty cash floats at or near the year-end date and reconcile to the recorded balance to confirm completeness and accuracy. [ISA 501]' },
              { title: 'Unusual and Large Cash Transactions', purpose: 'To identify and investigate unusual, large, or irregular cash transactions that may indicate fraud, error, or undisclosed related party transactions, per ISA 240. [ISA 240]' },
              { title: 'Foreign Currency Balances — Translation (IAS 21)', purpose: 'To verify that foreign currency cash and bank balances have been retranslated at the closing exchange rate and that translation gains or losses have been correctly recognised in profit or loss per IAS 21. [IAS 21]' },
            ],
          },
          {
            title: 'Trade and Other Payables',
            procedures: [
              { title: 'Creditors Ledger Reconciliation', purpose: 'To reconcile the trade payables ledger to the general ledger control account at year-end to confirm completeness and accuracy of recorded payables. [ISA 330]' },
              { title: 'Supplier Statements Reconciliation', purpose: 'To obtain and reconcile supplier statements for a sample of significant creditors to the client\'s payables ledger and investigate material differences. [ISA 330]' },
              { title: 'Accruals Assessment — Completeness', purpose: 'To assess whether all material accruals for expenses incurred but not yet invoiced are recognised at year-end, through review of subsequent payments, post year-end invoices, and contracts. [IAS 37; ISA 330]' },
              { title: 'Unrecorded Liabilities — Subsequent Payments Testing', purpose: 'To review payments made after the reporting date to identify any invoices relating to the audit period that were not accrued, to test for completeness of liabilities. [ISA 330]' },
              { title: 'Related Party Payables', purpose: 'To identify all payables to related parties, confirm they are supported by proper documentation and commercial terms, and are adequately disclosed per IAS 24. [ISA 550; IAS 24]' },
              { title: 'VAT Payable Reconciliation', purpose: 'To reconcile the VAT payable balance to VAT returns filed with FIRS, confirm timely remittance, and identify any penalties or interest for late payment per the Nigeria Tax Act 2025. [NTA 2025]' },
            ],
          },
          {
            title: 'Payroll and Employee Benefits',
            procedures: [
              { title: 'Payroll Reconciliation — Gross to Net', purpose: 'To reconcile total gross payroll to net pay, statutory deductions (PAYE, pension, NSITF), and employer costs, and agree to the general ledger payroll expense account. [ISA 330; NTA 2025]' },
              { title: 'PAYE Reconciliation and Remittance Compliance', purpose: 'To verify that PAYE deductions have been correctly computed under the Personal Income Tax Act (as incorporated in NTA 2025), remitted to the relevant State Internal Revenue Service within 10 working days, and that there are no outstanding PAYE liabilities. [NTA 2025; PITA]' },
              { title: 'PENCOM Contributions — Verification', purpose: 'To verify that employer (minimum 10%) and employee (minimum 8%) pension contributions have been correctly computed on monthly emolument, remitted to the respective PFAs within 7 working days of salary payment, and reconcile to PENCOM remittance schedules per the Pension Reform Act 2014. [Pension Reform Act 2014]' },
              { title: 'NSITF Contribution Compliance (1% of payroll)', purpose: 'To verify that the employer has remitted 1% of total monthly payroll to NSITF in accordance with the Employee Compensation Act 2010, and that there are no outstanding contributions. [Employee Compensation Act 2010]' },
              { title: 'ITF Levy Compliance (1% of annual payroll)', purpose: 'To verify that the Industrial Training Fund levy of 1% of annual payroll has been remitted where applicable, and assess whether the entity qualifies for a refund of up to 50% based on qualifying training expenditure. [ITF Act 2011]' },
              { title: 'Staff Entitlements — Accrued Leave and Gratuity', purpose: 'To verify that accruals for employee entitlements including annual leave, long service awards, and gratuity are correctly calculated and recognised in accordance with IAS 19 Employee Benefits. [IAS 19]' },
              { title: 'Payroll Journal Entry Testing', purpose: 'To identify and test manual journal entries to payroll expense accounts for unusual items, late postings, or entries made by personnel outside the payroll function, to address fraud risk per ISA 240. [ISA 240.32]' },
            ],
          },
          {
            title: 'Borrowings and Finance Costs',
            procedures: [
              { title: 'Loan Agreements Review', purpose: 'To obtain and review all loan agreements to confirm the key terms (principal, interest rate, maturity, security, covenants) and ensure proper classification of current and non-current portions. [IFRS 9; IAS 1]' },
              { title: 'Interest Computation Verification — EIR Method (IFRS 9)', purpose: 'To verify that interest expense has been calculated using the effective interest rate method per IFRS 9 and agrees to the loan amortisation schedule. [IFRS 9.5.4]' },
              { title: 'Loan Covenant Compliance', purpose: 'To review compliance with financial and non-financial covenants in loan agreements and assess the impact of any breach on the current or non-current classification of the liability per IAS 1. [IAS 1.69; IFRS 9]' },
              { title: 'IFRS 16 Lease Liability Calculation Verification', purpose: 'To verify the completeness of leases recognised under IFRS 16, review the incremental borrowing rate applied, and re-perform the present value calculation for significant leases. [IFRS 16]' },
              { title: 'Finance Cost Capitalisation Assessment (IAS 23)', purpose: 'To assess whether any borrowing costs directly attributable to the acquisition or construction of qualifying assets have been capitalised in accordance with IAS 23. [IAS 23]' },
            ],
          },
          {
            title: 'Taxation',
            procedures: [
              { title: 'Companies Income Tax Computation (NTA 2025)', purpose: 'To verify the CIT computation under the Nigeria Tax Act 2025, including application of the correct rate (0% / 20% / 30% based on turnover threshold), allowable deductions, capital allowances, and minimum tax provisions. [NTA 2025; CITA]' },
              { title: 'Deferred Tax Assessment (IAS 12)', purpose: 'To verify that deferred tax assets and liabilities have been correctly identified, measured, and recognised for all temporary differences between the carrying amounts of assets and liabilities and their tax bases, per IAS 12. [IAS 12]' },
              { title: 'WHT Compliance Review — Rates and Remittance', purpose: 'To verify that withholding tax has been deducted at the correct rate on applicable payments (dividends 10%, rent 10%, professional fees 5%, contracts 5%), remitted to FIRS within the prescribed period, and that credit notes have been issued to payees. [NTA 2025; FIRS WHT regulations]' },
              { title: 'Tax Assessments and Open Disputes', purpose: 'To obtain details of all open tax assessments, disputes, and objections, assess the likelihood of outcome, and confirm that appropriate provisions or disclosures have been made per IAS 37 and IAS 12. [IAS 37; IAS 12; NTA 2025]' },
              { title: 'Transfer Pricing Considerations (FIRS TP Regulations 2018)', purpose: 'To assess whether the entity has related party transactions that require compliance with FIRS Transfer Pricing Regulations 2018, including disclosure requirements and maintenance of contemporaneous TP documentation. [FIRS TP Regulations 2018]' },
            ],
          },
          {
            title: 'P&L Line Items — Manufacturing Completion',
            procedures: [
              { title: 'Revenue, Cost of Sales and Gross Margin Completion', purpose: 'To complete final P&L validation over revenue, cost of sales, and gross margin by linking balances to completed substantive work and investigating abnormal variances. [ISA 330; ISA 520]' },
              { title: 'Other Income and Other Expenses', purpose: 'To verify occurrence, classification, and disclosure of other income/expenses including non-recurring or unusual items requiring separate presentation. [IAS 1; ISA 330]' },
              { title: 'Administrative, Selling and Distribution Expenses', purpose: 'To test completeness, occurrence, cut-off, and classification of administrative and selling/distribution expenses and identify capital items or omitted accruals. [ISA 330]' },
              { title: 'Finance Costs and Tax Expense', purpose: 'To reconcile finance costs and tax expense to supporting schedules and ensure consistency with borrowing/lease and tax computations. [IFRS 9; IFRS 16; IAS 12]' },
            ],
          },
          {
            title: 'Balance Sheet Line Items — Manufacturing Completion',
            procedures: [
              { title: 'Non-Current Assets Completion (PPE, Intangibles, Investments, Goodwill)', purpose: 'To confirm that all material non-current asset balances are fully covered by substantive procedures, reconciliations, and disclosure checks. [IAS 16; IAS 36; IFRS 9; ISA 330]' },
              { title: 'Current Assets Completion (Inventory, Receivables, Cash, Other Current Assets)', purpose: 'To confirm completeness and valuation coverage for all material current asset balances and related classifications. [IAS 2; IFRS 9; ISA 330]' },
              { title: 'Current and Non-Current Liabilities Completion', purpose: 'To confirm completeness, measurement, and presentation of liability balances including borrowings, leases, statutory liabilities, and provisions. [IAS 1; IAS 37; IFRS 16; ISA 330]' },
              { title: 'Equity, Retained Earnings and Reserves Completion', purpose: 'To verify equity movements and disclosures are fully supported, authorised, and consistent with profit allocation and prior period balances. [IAS 1.106; CAMA 2020]' },
            ],
          },
          {
            title: 'Financial Statements Completion — Manufacturing',
            procedures: [
              { title: 'Final Accounts Coverage Matrix (Mandatory)', purpose: 'To map every material P&L and balance sheet line item to completed substantive procedures and conclusions, and identify residual coverage gaps before sign-off. [ISA 330; ISA 230]' },
              { title: 'Notes and Presentation Completion (IAS 1)', purpose: 'To verify note disclosures, accounting policies, and statement presentation are complete, consistent, and compliant with IAS 1 and related standards. [IAS 1; IAS 8]' },
              { title: 'End-to-End Engagement Readiness Check', purpose: 'To confirm that evidence, conclusions, unresolved matters, and reporting implications are fully aligned for final partner sign-off. [ISA 220; ISA 700]' },
            ],
          },
          {
            title: 'Equity and Capital',
            procedures: [
              { title: 'Share Capital Verification (CAMA 2020)', purpose: 'To verify the authorised, issued, and paid-up share capital agrees to the CAC filings, board resolutions, and share register, and complies with minimum capital requirements under CAMA 2020. [CAMA 2020 s.27]' },
              { title: 'Retained Earnings Reconciliation', purpose: 'To reconcile the movement in retained earnings from opening balance through profit for the year, dividends declared, and any other adjustments to the closing balance per the financial statements. [IAS 1.106]' },
              { title: 'Dividends — Board Authority and Payment Compliance', purpose: 'To verify that all dividends declared during the year were authorised by the board or shareholders as required by CAMA 2020, correctly recorded, and paid within the statutory timeframe with proper WHT deducted. [CAMA 2020 s.424; NTA 2025]' },
              { title: 'Other Reserves Movement', purpose: 'To verify the nature, opening balance, movements, and closing balance of all other reserves including revaluation surplus, share premium, and other components of equity. [IAS 1.106; IAS 16]' },
            ],
          },
          {
            title: 'Related Parties',
            procedures: [
              { title: 'Complete Related Party List — Identification', purpose: 'To compile and confirm the complete list of related parties including subsidiaries, associates, joint ventures, directors, key management personnel, and entities controlled by them, per ISA 550.13 and IAS 24. [ISA 550.13; IAS 24.9]' },
              { title: 'Related Party Transactions — Completeness Testing', purpose: 'To obtain and review all related party transactions during the year, confirm they are completely recorded, and identify any transactions not disclosed by management using procedures including journal entry review and inquiry per ISA 550. [ISA 550]' },
              { title: 'Arm\'s Length Assessment', purpose: 'To assess whether related party transactions have been conducted on terms equivalent to those prevailing in an arm\'s length transaction or, where they have not, to confirm that appropriate disclosure has been made per IAS 24. [IAS 24.23]' },
              { title: 'Related Party Disclosure Adequacy Review', purpose: 'To review the related party disclosures in the financial statements for completeness and accuracy, confirming that all required disclosures under IAS 24 are included including the nature of relationships, amounts of transactions, and outstanding balances. [IAS 24.17]' },
            ],
          },
          {
            title: 'Commitments, Contingencies and Subsequent Events',
            procedures: [
              { title: 'Capital Commitments', purpose: 'To obtain details of all capital expenditure contracted for but not yet incurred at the reporting date and confirm adequate disclosure in the financial statements. [IAS 16; IAS 1.137]' },
              { title: 'Operating Commitments', purpose: 'To identify all significant operating commitments including long-term supply contracts, service agreements, and lease commitments, and confirm adequate disclosure where not already recognised under IFRS 16. [IFRS 16; IAS 1.137]' },
              { title: 'Legal Claims and Contingent Liabilities (IAS 37)', purpose: 'To obtain details of all pending or threatened legal claims, tax disputes, and regulatory proceedings, assess the probability of outflow per IAS 37, and confirm that provisions or disclosures are appropriate. [IAS 37; ISA 501]' },
              { title: 'Events After the Reporting Date (IAS 10 / ISA 560)', purpose: 'To identify all adjusting and non-adjusting events after the reporting date through inquiry of management, review of board minutes, and review of subsequent financial information, per IAS 10 and ISA 560. [ISA 560; IAS 10]' },
              { title: 'Directors Loans — CAMA 2020 Compliance', purpose: 'To identify any loans to directors or related parties and confirm they have been properly authorised in accordance with CAMA 2020 s.173 and adequately disclosed in the financial statements. [CAMA 2020 s.173]' },
            ],
          },
          {
            title: 'Regulatory Compliance — Manufacturing',
            procedures: [
              { title: 'SON Compliance — Standards Organisation of Nigeria', purpose: 'To verify that the entity holds current product certification from SON for all manufactured goods subject to mandatory standards, and that there are no pending enforcement actions or product recalls that may give rise to provisions or contingent liabilities. [SON Act; ISA 250]' },
              { title: 'NAFDAC Registration — Food & Pharmaceutical Products', purpose: 'To verify that all food, drug, cosmetic, or related manufactured products have valid NAFDAC registrations, that registration fees are current, and that any compliance issues have been properly disclosed per ISA 250. [NAFDAC Act; ISA 250]' },
              { title: 'Import Duty and Customs Clearance — Inventory Impact', purpose: 'To verify that import duties, levies, and customs clearing costs have been correctly included in the cost of imported raw materials and components per IAS 2.10. [IAS 2.10; Customs & Excise Act]' },
              { title: 'Environmental Compliance — NESREA Permits', purpose: 'To confirm that the entity holds valid environmental permits from NESREA, that environmental impact assessments are current, and that any environmental remediation obligations have been recognised as provisions per IAS 37. [NESREA Act 2007; IAS 37; ISA 250]' },
              { title: 'ITF Levy — Verification and Refund Assessment', purpose: 'To verify that the 1% ITF levy on annual payroll has been correctly computed and remitted, and assess whether the entity is entitled to a refund of up to 50% based on qualifying training expenditure during the year. [ITF Act 2011]' },
            ],
          },
        ],
      },
    ],
  },

  // 3. FIELDWORK – OIL & GAS SERVICES
  {
    name: 'Fieldwork — Oil & Gas Services',
    description:
      'Substantive procedures for oil and gas service companies. Covers IFRS 6 E&E assets, PPT computation (NTA 2025), NUPRC compliance, ARO decommissioning provisions (IAS 37), NDDC levy, and NOGICD Act local content requirements.',
    phases: [
      {
        phase: 'Fieldwork',
        groups: [
          {
            title: 'Revenue — Oil & Gas Services',
            procedures: [
              { title: 'Revenue Recognition for Service Contracts (IFRS 15)', purpose: 'To assess whether revenue from oil and gas service contracts is recognised over time or at a point in time based on the specific terms of each contract per IFRS 15.35, and that the method selected appropriately reflects the pattern of transfer of control. [IFRS 15.35]' },
              { title: 'Lifting Entitlements — Reconciliation', purpose: 'To reconcile oil liftings during the period to the production allocation, confirm revenue is recognised on the entitlement method, and identify any lifting imbalances that require accrual or deferral. [IFRS 15; industry practice]' },
              { title: 'PPT Treatment — Revenue Net of Royalties', purpose: 'To verify that Petroleum Profits Tax and royalties have been correctly treated in the financial statements, and assess whether the entity presents revenue gross or net of government take in accordance with IFRS 15.B34. [IFRS 15.B34; PPTA as modified by NTA 2025]' },
              { title: 'Signature Bonuses — Amortisation', purpose: 'To verify that signature bonuses paid for licence awards are capitalised and amortised over the licence period on a systematic basis, consistent with the entity\'s accounting policy. [IFRS 6; IAS 38]' },
              { title: 'Foreign Currency Revenue — Translation (IAS 21)', purpose: 'To verify that USD-denominated revenue and receivables are translated at the correct exchange rate per IAS 21, and that translation gains and losses are recognised in profit or loss. [IAS 21]' },
            ],
          },
          {
            title: 'Exploration & Evaluation Assets (IFRS 6)',
            procedures: [
              { title: 'E&E Assets — Recognition and Classification', purpose: 'To verify that exploration and evaluation expenditures meet the recognition criteria under the entity\'s accounting policy per IFRS 6.9, and are correctly classified as intangible or tangible E&E assets. [IFRS 6.9]' },
              { title: 'E&E Impairment Assessment (IFRS 6.18)', purpose: 'To assess whether any triggering events for impairment of E&E assets exist per IFRS 6.20, and where they do, verify that an impairment test has been performed at the appropriate CGU level and any impairment loss correctly recognised. [IFRS 6.18]' },
              { title: 'Licence Acquisition Costs — Allocation', purpose: 'To verify that costs of acquiring exploration licences have been correctly allocated to the relevant licence areas and that any abandoned or relinquished licences have been written off. [IFRS 6; IAS 38]' },
              { title: 'Reclassification from E&E to Development Assets', purpose: 'To confirm that E&E assets reclassified to development assets or PPE during the year meet the criteria for reclassification (commercial viability confirmed), and that the transfer is at carrying value with appropriate impairment testing at the date of transfer. [IFRS 6.17]' },
            ],
          },
          {
            title: 'PPE — Oil & Gas Specific',
            procedures: [
              { title: 'DD&A — Units of Production Method', purpose: 'To verify that depletion, depreciation, and amortisation for oil and gas assets has been calculated using the units of production method based on proved reserves, and that reserve estimates are adequately supported. [IAS 16; IFRS 6]' },
              { title: 'Oil Well Costs — Capitalisation Criteria', purpose: 'To assess whether costs incurred on oil wells (dry hole costs, completion costs) have been correctly capitalised or expensed in accordance with the entity\'s accounting policy and IFRS 6. [IFRS 6]' },
              { title: 'Decommissioning Provision — ARO Calculation (IAS 37)', purpose: 'To verify that asset retirement obligations have been recognised for all wells and facilities with decommissioning obligations, that the provision is calculated as the present value of expected decommissioning costs per IAS 37, and that the unwinding of discount is recognised as a finance cost. [IAS 37; IFRIC 1]' },
              { title: 'Impairment Testing — CGU Definition (IAS 36)', purpose: 'To confirm that impairment testing has been performed at the appropriate CGU level (typically individual licence area or field) and that value in use calculations are based on supportable reserve estimates and price assumptions per IAS 36. [IAS 36]' },
            ],
          },
          {
            title: 'Taxation — Oil & Gas',
            procedures: [
              { title: 'Petroleum Profits Tax Computation (NTA 2025)', purpose: 'To verify the PPT computation under the applicable provisions of the NTA 2025, including the correct tax rate (65.75% for PSC and JOA, 85% for non-PSC deepwater), allowed deductions, investment tax credit, and any minimum tax provisions. [NTA 2025; PPTA]' },
              { title: 'Investment Tax Credit / Allowance Verification', purpose: 'To verify that investment tax credits or allowances have been correctly claimed in the PPT computation, supported by qualifying capital expenditure documentation. [PPTA; NTA 2025]' },
              { title: 'Gas Transfer Pricing', purpose: 'To assess whether the entity has applied the regulated gas transfer price in its tax computation where applicable, and whether any deviations require disclosure or could give rise to tax exposure. [FIRS Gas TP regulations]' },
              { title: 'NDDC Levy — 3% of Operating Expenditure', purpose: 'To verify that the NDDC levy of 3% of annual operating budget has been correctly computed and remitted, and any outstanding balance properly accrued. [NDDC Act]' },
            ],
          },
          {
            title: 'Regulatory Compliance — Oil & Gas',
            procedures: [
              { title: 'NUPRC Annual Reports — Filing Status', purpose: 'To confirm that all required annual reports and returns to the Nigerian Upstream Petroleum Regulatory Commission have been filed within prescribed timelines, and any penalties for late filing are adequately provided for. [PIA 2021; ISA 250]' },
              { title: 'NUPRC Production Reporting Reconciliation', purpose: 'To reconcile production volumes reported to NUPRC to the volumes recorded in the financial statements and used as the basis for revenue recognition and DD&A calculations. [PIA 2021; ISA 315]' },
              { title: 'Local Content Compliance — NOGICD Act', purpose: 'To assess compliance with Nigerian Oil and Gas Industry Content Development (NOGICD) Act requirements including local content targets and NCDMB reporting obligations. [NOGICD Act 2010; ISA 250]' },
              { title: 'NAPIMS Reporting Obligations', purpose: 'To confirm that reporting obligations to NAPIMS have been fulfilled where the entity has NNPCL as a joint venture partner, and that government participation interests are correctly reflected in the accounts. [PIA 2021]' },
            ],
          },
          {
            title: 'P&L Line Items — Oil & Gas Completion',
            procedures: [
              { title: 'Revenue, Royalties and Cost of Sales Completion', purpose: 'To complete final P&L validation over revenue, royalties/government take treatment, and cost of sales by linking balances to substantive work and variance analytics. [ISA 330; ISA 520; IFRS 15]' },
              { title: 'Other Income, Other Expenses and Impairment Charges', purpose: 'To verify occurrence, classification, and disclosure of other income/expenses, including impairment and unusual industry-specific charges. [IAS 1; IAS 36; ISA 330]' },
              { title: 'Administrative, Selling and Distribution Expenses', purpose: 'To test completeness, occurrence, cut-off, and classification of administrative and distribution expenses and identify misclassifications or omitted accruals. [ISA 330]' },
              { title: 'Finance Costs and Tax Expense Completion', purpose: 'To reconcile finance costs and tax expense to supporting schedules (including ARO unwinding and deferred tax) and confirm disclosure consistency. [IFRS 9; IAS 12; IAS 37]' },
            ],
          },
          {
            title: 'Balance Sheet Line Items — Oil & Gas Completion',
            procedures: [
              { title: 'Non-Current Assets Completion (E&E, Development, PPE, Intangibles, Investments)', purpose: 'To confirm all material non-current asset balances are covered by substantive procedures, reconciliations, classification checks, and impairment assessments. [IFRS 6; IAS 16; IAS 36; ISA 330]' },
              { title: 'Current Assets Completion (Inventory, Receivables, Cash, Other Current Assets)', purpose: 'To confirm completeness, existence, valuation, and presentation coverage for all material current asset balances. [IAS 2; IFRS 9; ISA 330]' },
              { title: 'Liabilities Completion (Current and Non-Current)', purpose: 'To confirm completeness, measurement, and presentation of liabilities including borrowings, leases, provisions (ARO), statutory balances, and accruals. [IAS 1; IAS 37; IFRS 16; ISA 330]' },
              { title: 'Equity, Retained Earnings and Reserves Completion', purpose: 'To verify equity movements and disclosures are fully supported, authorised, and consistent with profit allocation and prior period balances. [IAS 1.106; ISA 330]' },
            ],
          },
          {
            title: 'Financial Statements Completion — Oil & Gas',
            procedures: [
              { title: 'Final Accounts Coverage Matrix (Mandatory)', purpose: 'To map every material P&L and balance sheet line item to completed substantive procedures and conclusions, and identify residual coverage gaps before sign-off. [ISA 330; ISA 230]' },
              { title: 'Notes, Presentation and Industry Disclosures', purpose: 'To verify completeness and consistency of note disclosures for oil and gas specific accounting areas including E&E, DD&A, ARO, royalties, and regulatory exposures. [IAS 1; IFRS 6; IAS 37]' },
              { title: 'Going Concern and Subsequent Events Wrap-Up', purpose: 'To confirm final going concern and subsequent events conclusions reflect commodity, financing, covenant, and regulatory developments and align with report wording. [ISA 570; ISA 560; IAS 10]' },
            ],
          },
        ],
      },
    ],
  },

  // 4. FIELDWORK – RESTAURANT
  {
    name: 'Fieldwork — Restaurant',
    description:
      'Substantive procedures for restaurant businesses with branch-level controls. Covers POS and delivery revenue integrity, food and beverage inventory/costing, cash handling, shift payroll, IFRS 16 leases, and food safety regulatory compliance.',
    phases: [
      {
        phase: 'Fieldwork',
        groups: [
          {
            title: 'Revenue — Restaurant Operations',
            procedures: [
              { title: 'Dine-In, Takeaway and Delivery Revenue Recognition (IFRS 15)', purpose: 'To verify that revenue is recognised when control transfers for each channel (dine-in, takeaway, own delivery, and aggregator delivery), and that prepayments are deferred until performance obligations are satisfied per IFRS 15. [IFRS 15; ISA 330]' },
              { title: 'POS to GL Reconciliation — All Branches', purpose: 'To reconcile branch-level POS revenue to the general ledger, including all tenders and all outlets, and investigate unexplained differences to address completeness and accuracy risks. [ISA 330; ISA 240]' },
              { title: 'Delivery Platform Revenue and Commission (Principal vs Agent)', purpose: 'To assess gross versus net presentation for third-party delivery channels under principal-vs-agent guidance and reconcile commissions and deductions to settlement reports. [IFRS 15.B34; ISA 330]' },
              { title: 'Discounts, Promotions and Loyalty Programmes', purpose: 'To verify that discounts, promotions, vouchers, and loyalty arrangements are authorised, accurately recorded, and appropriately recognised as revenue reductions or contract liabilities. [IFRS 15; ISA 240]' },
              { title: 'Catering, Events and Corporate Orders', purpose: 'To verify that catering and event revenue is recognised only when services are delivered, and that customer advances are held as liabilities until fulfilment. [IFRS 15; ISA 330]' },
              { title: 'Revenue Integrity — Branch-Level Exception Analytics', purpose: 'To use branch-level exception analytics (voids, refunds, overrides, post-close edits) to identify potential revenue leakage or fraud and determine where extended testing is required. [ISA 240; ISA 520]' },
            ],
          },
          {
            title: 'Inventory, Costing and Kitchen Controls',
            procedures: [
              { title: 'Food and Beverage Inventory Count (ISA 501)', purpose: 'To observe inventory count controls, perform independent test counts, and confirm year-end quantities for food and beverage items are complete and accurate. [ISA 501; IAS 2]' },
              { title: 'Inventory Valuation and NRV (IAS 2)', purpose: 'To verify that inventory is measured at lower of cost and NRV, including perishable and slow-moving items, and that write-downs are adequate. [IAS 2; ISA 540]' },
              { title: 'Recipe/BOM Yield and Consumption Testing', purpose: 'To compare theoretical consumption from approved recipes/BOMs against actual issues and identify yield, shrinkage, and pilferage anomalies requiring investigation. [ISA 330; ISA 520]' },
              { title: 'Purchase, Receiving and Supplier Control', purpose: 'To test the procure-to-stock cycle (PO, GRN, invoice, payment), validate supplier pricing controls, and confirm completeness of rebates/returns/credits. [ISA 330; ISA 240]' },
              { title: 'Food Cost and Gross Margin Analytics', purpose: 'To perform branch-level and category-level analytics on food cost and gross margin trends and identify outliers for focused substantive procedures. [ISA 520]' },
            ],
          },
          {
            title: 'Cash, Banking and Branch Governance',
            procedures: [
              { title: 'Daily Cash-Up and Float Controls', purpose: 'To verify that branch cash-up sheets, opening/closing floats, and paid-outs are properly documented, approved, and reconciled to expected balances. [ISA 330; ISA 240]' },
              { title: 'Banking Timeliness and Completeness', purpose: 'To confirm that cash collections are banked intact and timely, and that banked amounts reconcile to branch cash summaries and POS records. [ISA 240; ISA 330]' },
              { title: 'Card, Transfer and Wallet Settlement Reconciliation', purpose: 'To reconcile processor settlements to POS tender reports and the ledger, and confirm correct treatment of fees, reversals, and chargebacks. [ISA 330]' },
              { title: 'POS Access Rights and Override Governance', purpose: 'To review high-risk POS access rights and override controls, and test whether void/refund/discount overrides are properly authorised and evidenced. [ISA 240; ISA 315]' },
              { title: 'Branch Audit Pack Completeness', purpose: 'To verify that mandatory branch audit pack documents are submitted completely and timely, and that exceptions are tracked to closure. [ISA 230; ISA 330]' },
            ],
          },
          {
            title: 'Payroll and People Costs — Restaurant',
            procedures: [
              { title: 'Shift Payroll Reconciliation — Time to Pay', purpose: 'To reconcile approved shifts and attendance records to payroll and verify that overtime/allowances are correctly computed and authorised. [ISA 330; ISA 240]' },
              { title: 'Service Charge and Tips Distribution', purpose: 'To verify that service charge/tips collection and distribution are complete, policy-compliant, and correctly treated for payroll tax purposes. [NTA 2025; PITA]' },
              { title: 'PAYE, PENCOM, NSITF and ITF Compliance', purpose: 'To verify payroll statutory deductions and remittances are accurate, timely, and fully accrued where outstanding. [NTA 2025; Pension Reform Act 2014; Employee Compensation Act 2010; ITF Act 2011]' },
            ],
          },
          {
            title: 'Leases, Assets and Fit-Out',
            procedures: [
              { title: 'Outlet Lease Accounting (IFRS 16)', purpose: 'To verify lease register completeness and the measurement/classification of ROU assets and lease liabilities for outlets and support locations. [IFRS 16; ISA 330]' },
              { title: 'Store Fit-Out and Kitchen Equipment — Capex vs Opex', purpose: 'To assess whether fit-out and equipment spend is correctly classified as capital or expense and properly authorised. [IAS 16.7; ISA 330]' },
              { title: 'Asset Existence and Condition — Branch Sample', purpose: 'To physically verify key branch assets, confirm register accuracy, and identify impairment indicators for damaged or idle assets. [ISA 501; IAS 36]' },
            ],
          },
          {
            title: 'Regulatory Compliance — Restaurant',
            procedures: [
              { title: 'Food Safety, Hygiene and Public Health Certifications', purpose: 'To confirm branch-level compliance with required food safety and health certifications, and assess financial statement impact of enforcement actions or remediation obligations. [ISA 250; IAS 37]' },
              { title: 'NAFDAC and Product Labelling Compliance (Where Applicable)', purpose: 'To verify compliance for packaged/private-label products with applicable NAFDAC registration and labelling rules and identify unresolved exposures. [NAFDAC Act; ISA 250]' },
              { title: 'Local Government and Sector Levies', purpose: 'To identify applicable branch permits and levies, confirm payment status, and ensure outstanding obligations are accrued or disclosed appropriately. [ISA 250; IAS 37]' },
              { title: 'Fire, Safety and Environmental Compliance', purpose: 'To assess fire/safety/environmental compliance status and whether identified breaches create provisions, contingencies, or going concern implications. [ISA 250; IAS 37; ISA 570]' },
            ],
          },
          {
            title: 'P&L — Other Income and Operating Expenses',
            procedures: [
              { title: 'Cost of Sales and Consumption Completeness', purpose: 'To verify cost of sales completeness and accuracy using inventory movement logic, consumption records, and analysis of stock adjustments/write-offs. [ISA 330; IAS 2]' },
              { title: 'Operating Expense Testing — Branch and HQ', purpose: 'To test occurrence, accuracy, cut-off, and classification of material operating expenses at branch and head-office level. [ISA 330]' },
              { title: 'Utilities and Energy Expense Reasonableness', purpose: 'To perform analytical and substantive checks on utilities and energy expenses versus operational drivers and investigate abnormal movements. [ISA 520; ISA 330]' },
              { title: 'Marketing, Delivery and Platform Charges', purpose: 'To verify marketing and delivery-platform related expenses are complete, accurate, authorised, and properly classified. [ISA 330; IFRS 15]' },
              { title: 'Other Income and Miscellaneous Credits', purpose: 'To verify occurrence and proper classification of other income streams and identify non-recurring items requiring disclosure. [ISA 330; IAS 1]' },
            ],
          },
          {
            title: 'Balance Sheet — Working Capital and Tax',
            procedures: [
              { title: 'Trade and Other Receivables', purpose: 'To verify existence, valuation, classification, and recoverability of receivables including platform receivables and other debtor balances. [IFRS 9; ISA 330]' },
              { title: 'Prepayments and Deposits', purpose: 'To verify recognition and valuation of prepayments and deposits, ensuring only future economic benefits are carried as assets. [IAS 1; ISA 330]' },
              { title: 'Trade and Other Payables / Accruals', purpose: 'To test completeness and accuracy of payables/accruals and detect unrecorded liabilities through subsequent payment and supporting schedule review. [ISA 330; IAS 37]' },
              { title: 'Statutory and Tax Balances', purpose: 'To reconcile statutory/tax balances to filings and remittances and assess adequacy of current and deferred tax balances. [NTA 2025; IAS 12; ISA 330]' },
              { title: 'Cash and Bank Balance Sheet Presentation', purpose: 'To verify bank/cash balances, restricted cash classification, and the resolution of material reconciling items at year-end. [ISA 505; ISA 330]' },
            ],
          },
          {
            title: 'Balance Sheet — Equity, Provisions and Financing',
            procedures: [
              { title: 'Equity Rollforward and Retained Earnings', purpose: 'To reconcile equity movements from opening to closing balances and confirm all changes are authorised, accurate, and properly presented. [IAS 1.106; ISA 330]' },
              { title: 'Provisions and Contingent Liabilities (IAS 37)', purpose: 'To assess whether provisions and contingencies are complete, appropriately measured, and disclosed in line with IAS 37 criteria. [IAS 37; ISA 501]' },
              { title: 'Borrowings and Lease Liabilities', purpose: 'To verify measurement/classification of borrowings and lease liabilities, including covenant impacts and financing disclosures. [IFRS 9; IFRS 16; IAS 1]' },
            ],
          },
          {
            title: 'Financial Statements and Disclosure Completion — Restaurant',
            procedures: [
              { title: 'Final Accounts Line-Item Coverage Check', purpose: 'To confirm that all material P&L and balance sheet line items have completed substantive procedures and documented conclusions. [ISA 330; ISA 230]' },
              { title: 'Notes and Disclosure Adequacy', purpose: 'To verify completeness and consistency of disclosures relevant to restaurant operations, including key judgments and estimates. [IAS 1; IFRS disclosure requirements]' },
              { title: 'Going Concern and Subsequent Events Wrap-Up', purpose: 'To evaluate going concern and subsequent events based on latest evidence and confirm alignment with disclosures and report conclusions. [ISA 570; ISA 560; IAS 10]' },
            ],
          },
        ],
      },
    ],
  },

  // 5. FIELDWORK – CONSULTING
  {
    name: 'Fieldwork — Consulting',
    description:
      'Substantive procedures for consulting firms. Covers IFRS 15 contract assets and unbilled WIP, fixed-fee and retainer revenue, staff utilisation, WHT on sub-contractors, and professional body compliance.',
    phases: [
      {
        phase: 'Fieldwork',
        groups: [
          {
            title: 'Revenue — Consulting',
            procedures: [
              { title: 'Time-and-Materials Contracts — Cut-Off and Hours Billed', purpose: 'To verify that revenue on time-and-materials contracts is recognised as services are performed, test the completeness and accuracy of hours billed near the reporting date, and confirm that rates applied are per the applicable engagement letters or master service agreements per IFRS 15. [IFRS 15; ISA 330]' },
              { title: 'Fixed-Fee Contracts — Stage of Completion', purpose: 'To verify that fixed-fee contract revenue is recognised using an appropriate output or input method reflecting the stage of completion, review the basis for percentage completion estimates, and confirm that estimates are reasonable and consistently applied per IFRS 15.39. [IFRS 15.39]' },
              { title: 'Retainer Revenue — Period Allocation', purpose: 'To verify that retainer fees are allocated to the period in which the related services are rendered, and that any retainers received in advance of service delivery are recognised as deferred revenue / contract liabilities per IFRS 15. [IFRS 15]' },
              { title: 'Unbilled WIP (Contract Assets) — Assessment', purpose: 'To verify the completeness and valuation of unbilled work-in-progress (contract assets), confirm that WIP represents enforceable rights to consideration for services rendered, and assess whether any WIP has become irrecoverable and requires write-off per IFRS 15.107. [IFRS 15.107]' },
              { title: 'Contract Modifications — Variable Consideration', purpose: 'To identify contract modifications (scope changes, additions, cancellations) during the year, assess their accounting treatment as a modification or a new contract per IFRS 15.18, and verify that variable consideration has been constrained appropriately. [IFRS 15.18; IFRS 15.56]' },
              { title: 'Reimbursable Expenses — Gross vs Net Presentation', purpose: 'To assess whether reimbursable expenses (travel, accommodation, third-party costs) are presented gross as revenue or net, applying the principal vs agent guidance of IFRS 15.B34, and confirm consistent application of the policy. [IFRS 15.B34]' },
            ],
          },
          {
            title: 'Trade and Other Receivables — Consulting',
            procedures: [
              { title: 'Aged WIP and Debtors — Project-by-Project Analysis', purpose: 'To review the aged analysis of both billed debtors and unbilled WIP on a project-by-project basis, identify balances at risk of non-recovery, and confirm that provisions reflect specific client credit risk rather than a generic percentage. [IFRS 9; ISA 540]' },
              { title: 'Contract Asset vs Trade Receivable Distinction', purpose: 'To confirm that the distinction between contract assets (right to consideration conditional on completion of further performance obligations) and trade receivables (unconditional right to consideration) has been correctly applied and separately presented per IFRS 15.107. [IFRS 15.107]' },
              { title: 'Debtors Confirmation — Key Client Balances', purpose: 'To obtain external confirmation from significant debtors of the amounts owed at the year-end date, with particular focus on balances where collectability risk is elevated per ISA 505. [ISA 505]' },
            ],
          },
          {
            title: 'Payroll and Sub-Contractors — Consulting',
            procedures: [
              { title: 'Staff Utilisation Analysis', purpose: 'To analyse billed versus unbilled hours by staff member and by engagement to assess the reasonableness of the revenue recognised on time-based contracts, identify idle time or over-runs, and support the valuation of unbilled WIP. [ISA 520; IFRS 15]' },
              { title: 'Bonuses and Commissions — Accrual Basis', purpose: 'To verify that bonuses and commissions payable to staff are correctly accrued at year-end based on achieved performance metrics, and that the accrual basis and amount are consistent with approved schemes and prior year practice per IAS 19. [IAS 19; ISA 330]' },
              { title: 'Sub-Contractor Costs — WHT Deduction Compliance', purpose: 'To verify that withholding tax has been correctly deducted at 5% on payments to sub-contractors and professional service providers, remitted to FIRS, and that sub-contractor costs are recognised in the period in which the related services are received. [NTA 2025; FIRS WHT regulations]' },
              { title: 'Consultants vs Employees — Tax Classification', purpose: 'To assess whether individuals engaged as consultants (subject to WHT at 5%) are in substance employees (subject to PAYE), applying the tests of control and integration, and confirm the tax treatment is appropriate to avoid PAYE exposure. [NTA 2025; PITA; FIRS guidelines]' },
            ],
          },
          {
            title: 'Regulatory Compliance — Consulting',
            procedures: [
              { title: 'Professional Body Membership — Current Year', purpose: 'To confirm that the firm and relevant professional staff hold current membership of applicable professional bodies (ICAN, CIBN, NIM, CIPM, COREN, NSE, etc.), that practising licences are valid, and that annual fees are correctly expensed. [ISA 250; applicable professional body laws]' },
              { title: 'Professional Indemnity Insurance', purpose: 'To confirm that current professional indemnity insurance cover is in place and adequate for the scale of the firm\'s operations, and that premium payments are correctly treated in the financial statements. [ISA 250]' },
              { title: 'NOTAP Registration — Technology Transfer', purpose: 'To confirm that any agreements involving technology transfer, franchise, or technical services fees paid to foreign entities have been registered with the National Office for Technology Acquisition and Promotion (NOTAP) as required, and that related payments have the correct WHT treatment. [NOTAP Act; NTA 2025; ISA 250]' },
            ],
          },
          {
            title: 'P&L Line Items — Consulting Completion',
            procedures: [
              { title: 'Revenue, Cost of Sales and Gross Margin Completion', purpose: 'To complete final P&L validation over revenue, direct costs, and gross margin by linking balances to substantive contract testing and variance analytics. [ISA 330; ISA 520]' },
              { title: 'Other Income and Other Expenses', purpose: 'To verify occurrence, classification, and disclosure of other income and other expenses including unusual or non-recurring items. [IAS 1; ISA 330]' },
              { title: 'Administrative, Selling and Distribution Expenses', purpose: 'To test completeness, occurrence, cut-off, and classification of administrative and selling/distribution expenses and detect misclassifications or omitted accruals. [ISA 330]' },
              { title: 'Finance Costs and Tax Expense Completion', purpose: 'To reconcile finance costs and tax expense to supporting schedules and confirm consistency with tax computations and disclosures. [IFRS 9; IAS 12]' },
            ],
          },
          {
            title: 'Balance Sheet Line Items — Consulting Completion',
            procedures: [
              { title: 'Non-Current Assets Completion (PPE, Intangibles, Investments, Goodwill)', purpose: 'To confirm material non-current asset balances are fully covered by substantive procedures, reconciliations, and impairment/classification assessments. [IAS 16; IAS 36; ISA 330]' },
              { title: 'Current Assets Completion (Contract Assets, Receivables, Cash, Other Current Assets)', purpose: 'To confirm completeness, existence, valuation, and presentation of all material current asset balances including contract assets and receivables. [IFRS 9; IFRS 15; ISA 330]' },
              { title: 'Current and Non-Current Liabilities Completion', purpose: 'To confirm completeness, measurement, and classification of liabilities including accruals, borrowings, leases, and statutory obligations. [IAS 1; IAS 37; IFRS 16; ISA 330]' },
              { title: 'Equity, Retained Earnings and Reserves Completion', purpose: 'To verify equity movements and disclosures are fully supported, authorised, and consistent with profit allocation and prior period balances. [IAS 1.106; ISA 330]' },
            ],
          },
          {
            title: 'Financial Statements Completion — Consulting',
            procedures: [
              { title: 'Final Accounts Coverage Matrix (Mandatory)', purpose: 'To map every material P&L and balance sheet line item to completed substantive procedures and conclusions, and identify residual coverage gaps before sign-off. [ISA 330; ISA 230]' },
              { title: 'Notes and Presentation Completion (IAS 1)', purpose: 'To verify note disclosures and statement presentation are complete, consistent, and compliant with IAS 1 and related standards. [IAS 1; IAS 8]' },
              { title: 'End-to-End Engagement Readiness Check', purpose: 'To confirm evidence, conclusions, unresolved matters, and reporting implications are fully aligned for final sign-off. [ISA 220; ISA 700]' },
            ],
          },
        ],
      },
    ],
  },
];

function inferStandardType(reference) {
  const upper = reference.toUpperCase();
  if (upper.startsWith('ISA')) return 'ISA';
  if (upper.startsWith('ISQM')) return 'ISQM';
  if (upper.startsWith('IFRS') || upper.startsWith('IAS') || upper.startsWith('IFRIC')) return 'IFRS';
  if (upper.includes('CAMA') || upper.includes('NTA') || upper.includes('FRCN') || upper.includes('PENCOM')) return 'NIGERIA_REGULATION';
  return 'OTHER';
}

function parseCitations(purpose) {
  if (!purpose) return [];
  const match = purpose.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1]
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((reference) => ({
      standardType: inferStandardType(reference),
      reference,
    }));
}

function stripCitationSuffix(purpose) {
  if (!purpose) return '';
  return purpose.replace(/\[[^\]]+\]\s*$/, '').trim();
}

// ============================================================================
// SEEDER LOGIC
// ============================================================================

async function seed() {
  console.log('🌱 Seeding audit templates...\n');

  let templateCount = 0;
  let groupCount = 0;
  let procedureCount = 0;

  for (const template of TEMPLATES) {
    console.log(`📄 Creating template: ${template.name}`);

    // 1. Create the AuditTemplate
    const auditTemplate = await prisma.auditTemplate.create({
      data: {
        name: template.name,
        description: template.description,
      },
    });
    templateCount++;
    console.log(`   ✅ Template ID: ${auditTemplate.id}`);

    // 2. Iterate over phases and groups
    for (const phaseData of template.phases) {
      const phaseName = phaseData.phase;
      let groupOrder = 0;

      for (const group of phaseData.groups) {
        groupOrder++;
        // Create TemplateGroup
        const templateGroup = await prisma.templateGroup.create({
          data: {
            templateId: auditTemplate.id,
            phase: phaseName,
            title: group.title,
            displayOrder: groupOrder,
          },
        });
        groupCount++;

        let procOrder = 0;
        for (const proc of group.procedures) {
          procOrder++;
          // Create TemplateProcedure
          const createdProcedure = await prisma.templateProcedure.create({
            data: {
              templateId: auditTemplate.id,
              groupId: templateGroup.id,
              phase: phaseName,
              title: proc.title,
              purpose: proc.purpose,
              source: proc.purpose || null,
              displayOrder: procOrder,
            },
          });
          const citations = parseCitations(proc.purpose);
          const question = await prisma.templateProcedureQuestion.create({
            data: {
              templateProcedureId: createdProcedure.id,
              prompt: stripCitationSuffix(proc.purpose) || proc.title,
              guidance: proc.purpose || null,
              questionType: 'narrative',
              isRequired: true,
              expectedEvidenceCount: 1,
              riskRating: 'Moderate',
              controlType: 'Substantive',
              displayOrder: 0,
            }
          });
          if (citations.length > 0) {
            await prisma.templateQuestionCitation.createMany({
              data: citations.map((citation, citationIndex) => ({
                templateQuestionId: question.id,
                standardType: citation.standardType,
                reference: citation.reference,
                displayOrder: citationIndex,
              }))
            });
          }
          procedureCount++;
        }
        console.log(`      📁 ${phaseName} > ${group.title} (${group.procedures.length} procedures)`);
      }
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log(`✅ Seeding complete:`);
  console.log(`   Templates  : ${templateCount}`);
  console.log(`   Groups     : ${groupCount}`);
  console.log(`   Procedures : ${procedureCount}`);
  console.log('═══════════════════════════════════════════');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
