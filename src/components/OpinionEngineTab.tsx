'use client';

import { useCallback, useEffect, useState } from 'react';

interface OpinionEngineTabProps {
  auditId: string;
}

interface OpinionPayload {
  opinion: {
    opinionType: string;
    basis: string | null;
    requiresModification: boolean;
    modifiedDecisionReason: string | null;
    selectedBy: string | null;
    selectedAt: string | null;
  } | null;
  completion: {
    totals: { corrected: number; uncorrected: number; total: number };
    materiality: { overall: number | null; performance: number | null; trivial: number | null; exceeded: boolean };
  };
  requirements: {
    requiresModifiedDecision: boolean;
  };
}

const OPINION_TYPES = ['UNMODIFIED', 'QUALIFIED', 'ADVERSE', 'DISCLAIMER'];

export default function OpinionEngineTab({ auditId }: OpinionEngineTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<OpinionPayload | null>(null);
  const [draft, setDraft] = useState({
    opinionType: 'UNMODIFIED',
    basis: '',
    requiresModification: false,
    modifiedDecisionReason: '',
  });

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/audits/${auditId}/opinion`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load opinion data');
    const next = (await res.json()) as OpinionPayload;
    setPayload(next);
  }, [auditId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load opinion data');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    if (!payload?.opinion) return;
    setDraft({
      opinionType: payload.opinion.opinionType || 'UNMODIFIED',
      basis: payload.opinion.basis || '',
      requiresModification: payload.opinion.requiresModification,
      modifiedDecisionReason: payload.opinion.modifiedDecisionReason || '',
    });
  }, [payload?.opinion]);

  const saveOpinion = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/opinion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const next = await res.json();
      if (!res.ok) throw new Error(next.error || 'Failed to save opinion');
      setPayload(next as OpinionPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save opinion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Opinion Engine</p>
        <p className="mt-1 text-xs text-slate-600">Final opinion decision linked to completion rollups and materiality.</p>
        {loading ? <p className="mt-2 text-xs text-slate-500">Working...</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </div>

      {payload ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Corrected</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{payload.completion.totals.corrected.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Uncorrected</p>
            <p className={`mt-1 text-lg font-bold ${payload.completion.materiality.exceeded ? 'text-rose-700' : 'text-amber-700'}`}>
              {payload.completion.totals.uncorrected.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="font-semibold text-slate-700">Overall Materiality</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{(payload.completion.materiality.overall || 0).toLocaleString()}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Opinion Decision</p>
        {payload?.requirements.requiresModifiedDecision ? (
          <p className="mt-2 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
            Uncorrected misstatements exceed overall materiality. A modified-opinion decision reason is required.
          </p>
        ) : null}

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <select
            className="rounded border border-slate-300 px-2 py-1 text-xs"
            value={draft.opinionType}
            onChange={(e) => setDraft((prev) => ({ ...prev, opinionType: e.target.value }))}
          >
            {OPINION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={draft.requiresModification}
              onChange={(e) => setDraft((prev) => ({ ...prev, requiresModification: e.target.checked }))}
            />
            Requires modification
          </label>
          <textarea
            className="rounded border border-slate-300 px-2 py-1 text-xs md:col-span-2"
            rows={3}
            placeholder="Basis for opinion"
            value={draft.basis}
            onChange={(e) => setDraft((prev) => ({ ...prev, basis: e.target.value }))}
          />
          <textarea
            className="rounded border border-slate-300 px-2 py-1 text-xs md:col-span-2"
            rows={3}
            placeholder="Modified decision reason (required if threshold exceeded)"
            value={draft.modifiedDecisionReason}
            onChange={(e) => setDraft((prev) => ({ ...prev, modifiedDecisionReason: e.target.value }))}
          />
        </div>
        <button onClick={() => void saveOpinion()} className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Save Opinion Decision
        </button>
        {payload?.opinion?.selectedBy ? (
          <p className="mt-2 text-xs text-slate-500">
            Last selected by {payload.opinion.selectedBy} {payload.opinion.selectedAt ? `at ${new Date(payload.opinion.selectedAt).toLocaleString()}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  );
}
