'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type StageKey =
  | 'ACCEPTANCE'
  | 'UNDERSTANDING'
  | 'RISK'
  | 'MATERIALITY'
  | 'SAMPLING'
  | 'FIELDWORK'
  | 'COMPLETION'
  | 'OPINION';

type StageStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

interface StageGateIssue {
  code: string;
  message: string;
  severity: 'warning' | 'blocker';
  canOverride: boolean;
}

interface StageEvaluation {
  stage: StageKey;
  status: StageStatus;
  tailoringNotes: string | null;
  gateIssues: StageGateIssue[];
  unresolvedBlockers: StageGateIssue[];
  overrides: Array<{
    id: string;
    gateCode: string;
    reason: string;
    overriddenBy: string | null;
    createdAt: string;
  }>;
}

interface StagePayload {
  engagementAccepted: boolean;
  engagementLetterSigned: boolean;
  stages: StageEvaluation[];
}

const STAGE_LABELS: Record<StageKey, string> = {
  ACCEPTANCE: 'Acceptance & Independence',
  UNDERSTANDING: 'Understanding the Entity',
  RISK: 'Risk Assessment',
  MATERIALITY: 'Materiality',
  SAMPLING: 'Sampling',
  FIELDWORK: 'Fieldwork',
  COMPLETION: 'Completion',
  OPINION: 'Opinion',
};

const PHASE_DEFAULT_STAGE: Record<string, StageKey> = {
  Planning: 'MATERIALITY',
  'Risk Engine': 'RISK',
  'TB Mapping': 'SAMPLING',
  Fieldwork: 'FIELDWORK',
  'Completion Engine': 'COMPLETION',
  'Opinion Engine': 'OPINION',
  Reporting: 'COMPLETION',
};

export default function StageProgressPanel({ auditId, activePhase }: { auditId: string; activePhase: string }) {
  const [data, setData] = useState<StagePayload | null>(null);
  const [selectedStage, setSelectedStage] = useState<StageKey>('MATERIALITY');
  const [tailoringNotes, setTailoringNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideDrafts, setOverrideDrafts] = useState<Record<string, string>>({});

  const defaultStage = PHASE_DEFAULT_STAGE[activePhase] || 'ACCEPTANCE';

  useEffect(() => {
    setSelectedStage(defaultStage);
  }, [defaultStage]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/audits/${auditId}/stages`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to load stage status');
    }
    const payload = (await res.json()) as StagePayload;
    setData(payload);
  }, [auditId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stage panel');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const currentStage = useMemo(
    () => data?.stages.find((stage) => stage.stage === selectedStage) ?? null,
    [data, selectedStage]
  );

  useEffect(() => {
    if (currentStage) {
      setTailoringNotes(currentStage.tailoringNotes || '');
    }
  }, [currentStage]);

  const saveStage = async (status: StageStatus) => {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/audits/${auditId}/stages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: selectedStage,
          status,
          tailoringNotes,
          engagementAccepted: data.engagementAccepted,
          engagementLetterSigned: data.engagementLetterSigned,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to update stage');
      }
      setData(payload as StagePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  const saveAcceptanceFlags = async (nextAccepted: boolean, nextLetterSigned: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/audits/${auditId}/stages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'ACCEPTANCE',
          engagementAccepted: nextAccepted,
          engagementLetterSigned: nextLetterSigned,
          tailoringNotes,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to update acceptance outputs');
      }
      setData(payload as StagePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update acceptance outputs');
    } finally {
      setLoading(false);
    }
  };

  const addOverride = async (gate: StageGateIssue) => {
    const reason = (overrideDrafts[gate.code] || '').trim();
    if (reason.length < 10) {
      setError('Override reason must be at least 10 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/audits/${auditId}/stage-overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: selectedStage,
          gateCode: gate.code,
          gateMessage: gate.message,
          reason,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to create override');
      }
      setData(payload as StagePayload);
      setOverrideDrafts((prev) => ({ ...prev, [gate.code]: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">Engagement Stage Gates</h3>
        {loading ? <span className="text-xs text-slate-500">Syncing...</span> : null}
      </div>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {(data?.stages || []).map((stage) => (
          <button
            key={stage.stage}
            onClick={() => setSelectedStage(stage.stage)}
            className={`rounded-lg border px-3 py-2 text-left text-xs ${
              selectedStage === stage.stage
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <div className="font-semibold">{STAGE_LABELS[stage.stage]}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide">{stage.status.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {currentStage ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-700">
            {STAGE_LABELS[currentStage.stage]} - {currentStage.status.replace('_', ' ')}
          </p>

          {selectedStage === 'ACCEPTANCE' && data ? (
            <div className="mt-3 grid gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.engagementAccepted}
                  onChange={(e) => void saveAcceptanceFlags(e.target.checked, data.engagementLetterSigned)}
                />
                Engagement accepted
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.engagementLetterSigned}
                  onChange={(e) => void saveAcceptanceFlags(data.engagementAccepted, e.target.checked)}
                />
                Engagement letter signed
              </label>
            </div>
          ) : null}

          <label className="mt-3 block text-xs font-medium text-slate-600">
            Mandatory tailoring (entity-specific matters not covered)
          </label>
          <textarea
            value={tailoringNotes}
            onChange={(e) => setTailoringNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs"
            rows={3}
            placeholder="Required for completion (e.g. None noted, considered)."
          />

          {currentStage.gateIssues.length > 0 ? (
            <div className="mt-3 space-y-2">
              {currentStage.gateIssues.map((gate) => (
                <div key={gate.code} className="rounded-md border border-slate-200 p-2">
                  <p
                    className={`text-xs ${
                      gate.severity === 'blocker' ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    {gate.severity.toUpperCase()}: {gate.message}
                  </p>
                  {gate.canOverride ? (
                    <div className="mt-2 flex flex-col gap-2 md:flex-row">
                      <input
                        value={overrideDrafts[gate.code] || ''}
                        onChange={(e) =>
                          setOverrideDrafts((prev) => ({ ...prev, [gate.code]: e.target.value }))
                        }
                        placeholder="Override reason (required)"
                        className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => void addOverride(gate)}
                        className="rounded bg-slate-700 px-2 py-1 text-xs text-white"
                      >
                        Override
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-emerald-700">No stage gate issues for this stage.</p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => void saveStage('IN_PROGRESS')}
              className="rounded bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => void saveStage('COMPLETED')}
              className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              Mark Completed
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
