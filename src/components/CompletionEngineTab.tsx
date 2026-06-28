'use client';

import { useCallback, useEffect, useState } from 'react';

type Assertion =
  | 'EXISTENCE'
  | 'COMPLETENESS'
  | 'VALUATION'
  | 'RIGHTS_OBLIGATIONS'
  | 'CUTOFF'
  | 'CLASSIFICATION'
  | 'PRESENTATION'
  | 'OCCURRENCE'
  | 'ACCURACY';

const ASSERTIONS: Assertion[] = [
  'EXISTENCE',
  'COMPLETENESS',
  'VALUATION',
  'RIGHTS_OBLIGATIONS',
  'CUTOFF',
  'CLASSIFICATION',
  'PRESENTATION',
  'OCCURRENCE',
  'ACCURACY',
];

interface CompletionEngineTabProps {
  auditId: string;
}

interface MisstatementDto {
  id: string;
  accountLabel: string;
  assertion: Assertion;
  amount: string;
  direction: string;
  isCorrected: boolean;
  description: string | null;
  procedure?: { id: string; title: string | null; phase: string } | null;
  leadsheet?: { id: string; reference: string; name: string } | null;
}

interface CompletionPayload {
  misstatements: MisstatementDto[];
  summary: {
    totals: { corrected: number; uncorrected: number; total: number };
    materiality: { overall: number | null; performance: number | null; trivial: number | null; exceeded: boolean };
    significantRiskCoverage: { total: number; linked: number; unlinkedReferences: string[] };
    coverageMatrix: Array<{
      leadsheetId: string;
      reference: string;
      name: string;
      fsCaption: string;
      amount: number;
      isMaterial: boolean;
      coveredAssertions: Assertion[];
      uncoveredAssertions: Assertion[];
    }>;
  };
}

interface ProcedureOption {
  id: string;
  title: string | null;
  phase: string;
}

interface LeadsheetOption {
  id: string;
  reference: string;
  name: string;
}

export default function CompletionEngineTab({ auditId }: CompletionEngineTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<CompletionPayload | null>(null);
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [leadsheets, setLeadsheets] = useState<LeadsheetOption[]>([]);

  const [form, setForm] = useState({
    accountLabel: '',
    assertion: 'VALUATION' as Assertion,
    amount: '',
    direction: 'UNDERSTATEMENT',
    isCorrected: false,
    description: '',
    procedureId: '',
    leadsheetId: '',
  });

  const refresh = useCallback(async () => {
    const [misRes, riskRes, tbRes] = await Promise.all([
      fetch(`/api/audits/${auditId}/misstatements`, { cache: 'no-store' }),
      fetch(`/api/audits/${auditId}/risks`, { cache: 'no-store' }),
      fetch(`/api/audits/${auditId}/trial-balance`, { cache: 'no-store' }),
    ]);
    if (!misRes.ok || !riskRes.ok || !tbRes.ok) throw new Error('Failed to load completion engine data.');
    const misPayload = (await misRes.json()) as CompletionPayload;
    const riskPayload = await riskRes.json();
    const tbPayload = await tbRes.json();
    setPayload(misPayload);
    setProcedures((riskPayload.procedures || []) as ProcedureOption[]);
    setLeadsheets((tbPayload.leadsheets || []).map((item: LeadsheetOption) => ({ id: item.id, reference: item.reference, name: item.name })));
  }, [auditId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load completion engine');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const addMisstatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/misstatements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountLabel: form.accountLabel,
          assertion: form.assertion,
          amount: Number(form.amount),
          direction: form.direction,
          isCorrected: form.isCorrected,
          description: form.description || null,
          procedureId: form.procedureId || null,
          leadsheetId: form.leadsheetId || null,
        }),
      });
      const next = await res.json();
      if (!res.ok) throw new Error(next.error || 'Failed to add misstatement');
      setPayload(next as CompletionPayload);
      setForm({
        accountLabel: '',
        assertion: 'VALUATION',
        amount: '',
        direction: 'UNDERSTATEMENT',
        isCorrected: false,
        description: '',
        procedureId: '',
        leadsheetId: '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add misstatement');
    } finally {
      setLoading(false);
    }
  };

  const toggleCorrected = async (misstatementId: string, isCorrected: boolean) => {
    try {
      const res = await fetch(`/api/audits/${auditId}/misstatements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ misstatementId, isCorrected }),
      });
      const next = await res.json();
      if (!res.ok) throw new Error(next.error || 'Failed to update misstatement');
      setPayload(next as CompletionPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update misstatement');
    }
  };

  const deleteMisstatement = async (misstatementId: string) => {
    try {
      const res = await fetch(`/api/audits/${auditId}/misstatements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', misstatementId }),
      });
      const next = await res.json();
      if (!res.ok) throw new Error(next.error || 'Failed to delete misstatement');
      setPayload(next as CompletionPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete misstatement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Completion Engine</p>
        <p className="mt-1 text-xs text-slate-600">Capture corrected/uncorrected misstatements and monitor final coverage gaps.</p>
        {loading ? <p className="mt-2 text-xs text-slate-500">Working...</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </div>

      {payload ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Corrected</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{payload.summary.totals.corrected.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Uncorrected</p>
            <p className={`mt-1 text-lg font-bold ${payload.summary.materiality.exceeded ? 'text-rose-700' : 'text-amber-700'}`}>
              {payload.summary.totals.uncorrected.toLocaleString()}
            </p>
            {payload.summary.materiality.overall !== null ? (
              <p className="mt-1 text-[11px] text-slate-500">Overall materiality: {payload.summary.materiality.overall.toLocaleString()}</p>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Significant Risk Linkage</p>
            <p className="mt-1 text-lg font-bold text-slate-800">
              {payload.summary.significantRiskCoverage.linked}/{payload.summary.significantRiskCoverage.total}
            </p>
            {payload.summary.significantRiskCoverage.unlinkedReferences.length > 0 ? (
              <p className="mt-1 text-[11px] text-rose-600">
                Unlinked: {payload.summary.significantRiskCoverage.unlinkedReferences.join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Add Misstatement</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="Account / line item label"
            value={form.accountLabel}
            onChange={(e) => setForm((prev) => ({ ...prev, accountLabel: e.target.value }))}
          />
          <input
            className="rounded border border-slate-300 px-2 py-1 text-xs"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={form.assertion} onChange={(e) => setForm((prev) => ({ ...prev, assertion: e.target.value as Assertion }))}>
            {ASSERTIONS.map((assertion) => (
              <option key={assertion} value={assertion}>{assertion}</option>
            ))}
          </select>
          <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={form.direction} onChange={(e) => setForm((prev) => ({ ...prev, direction: e.target.value }))}>
            <option value="UNDERSTATEMENT">UNDERSTATEMENT</option>
            <option value="OVERSTATEMENT">OVERSTATEMENT</option>
          </select>
          <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={form.procedureId} onChange={(e) => setForm((prev) => ({ ...prev, procedureId: e.target.value }))}>
            <option value="">Procedure (optional)</option>
            {procedures.map((procedure) => (
              <option key={procedure.id} value={procedure.id}>[{procedure.phase}] {procedure.title || 'Untitled'}</option>
            ))}
          </select>
          <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={form.leadsheetId} onChange={(e) => setForm((prev) => ({ ...prev, leadsheetId: e.target.value }))}>
            <option value="">Leadsheet (optional)</option>
            {leadsheets.map((leadsheet) => (
              <option key={leadsheet.id} value={leadsheet.id}>{leadsheet.reference} - {leadsheet.name}</option>
            ))}
          </select>
          <textarea
            className="rounded border border-slate-300 px-2 py-1 text-xs md:col-span-2"
            rows={2}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-xs text-slate-600 md:col-span-2">
            <input type="checkbox" checked={form.isCorrected} onChange={(e) => setForm((prev) => ({ ...prev, isCorrected: e.target.checked }))} />
            Mark as corrected
          </label>
        </div>
        <button onClick={() => void addMisstatement()} className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Add Misstatement
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Misstatement Schedule</p>
        <div className="mt-2 max-h-[260px] overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-2">Account</th>
                <th className="py-2 pr-2">Assertion</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Corrected</th>
                <th className="py-2 pr-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(payload?.misstatements || []).map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-1 pr-2">{item.accountLabel}</td>
                  <td className="py-1 pr-2">{item.assertion}</td>
                  <td className="py-1 pr-2">{Number(item.amount).toLocaleString()}</td>
                  <td className="py-1 pr-2">
                    <input type="checkbox" checked={item.isCorrected} onChange={(e) => void toggleCorrected(item.id, e.target.checked)} />
                  </td>
                  <td className="py-1 pr-2">
                    <button onClick={() => void deleteMisstatement(item.id)} className="rounded bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Coverage Matrix (Leadsheet x Assertions)</p>
        <div className="mt-2 max-h-[280px] overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-2">Leadsheet</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Covered</th>
                <th className="py-2 pr-2">Uncovered</th>
              </tr>
            </thead>
            <tbody>
              {(payload?.summary.coverageMatrix || []).map((row) => (
                <tr key={row.leadsheetId} className="border-b border-slate-100">
                  <td className="py-1 pr-2">
                    {row.reference} - {row.name}
                    {row.isMaterial ? <span className="ml-2 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800">Material</span> : null}
                  </td>
                  <td className="py-1 pr-2">{row.amount.toLocaleString()}</td>
                  <td className="py-1 pr-2 text-emerald-700">{row.coveredAssertions.join(', ') || '-'}</td>
                  <td className="py-1 pr-2 text-rose-700">{row.uncoveredAssertions.join(', ') || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
