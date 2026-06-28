'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type RiskRating = 'HIGH' | 'MEDIUM' | 'LOW';
type RiskCategory = 'FRAUD' | 'ERROR' | 'GOING_CONCERN' | 'COMPLIANCE' | 'RELATED_PARTY' | 'ESTIMATE';
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

interface RiskDto {
  id: string;
  reference: string;
  description: string;
  category: RiskCategory;
  isSignificant: boolean;
  isPresumed: boolean;
  likelihood: RiskRating;
  magnitude: RiskRating;
  assertions: Array<{ assertion: Assertion }>;
  links: Array<{ procedure: { id: string; title: string | null; phase: string } }>;
}

interface ProcedureDto {
  id: string;
  title: string | null;
  phase: string;
}

interface MaterialityDto {
  benchmark: string;
  benchmarkValue: string;
  percentage: string;
  overallMateriality: string;
  performanceMateriality: string;
  trivialThreshold: string;
  specificMateriality: string | null;
  notes: string | null;
}

interface SamplingPlanDto {
  id: string;
  areaLabel: string;
  suggestedSampleSize: number;
  selectedSampleSize: number;
  overrideReason: string | null;
  status: string;
  risk?: { reference: string; likelihood: RiskRating } | null;
  leadsheet?: { reference: string; name: string } | null;
}

interface RiskEngineTabProps {
  auditId: string;
}

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

export default function RiskEngineTab({ auditId }: RiskEngineTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [risks, setRisks] = useState<RiskDto[]>([]);
  const [procedures, setProcedures] = useState<ProcedureDto[]>([]);
  const [materiality, setMateriality] = useState<MaterialityDto | null>(null);
  const [samplingPlans, setSamplingPlans] = useState<SamplingPlanDto[]>([]);
  const [leadsheets, setLeadsheets] = useState<Array<{ id: string; reference: string; name: string }>>([]);

  const [newRisk, setNewRisk] = useState({
    reference: '',
    description: '',
    category: 'ERROR' as RiskCategory,
    likelihood: 'MEDIUM' as RiskRating,
    magnitude: 'MEDIUM' as RiskRating,
    isSignificant: true,
  });

  const [materialityDraft, setMaterialityDraft] = useState({
    benchmark: '',
    benchmarkValue: '',
    percentage: '5',
    notes: '',
  });

  const [samplingDraft, setSamplingDraft] = useState({
    areaLabel: '',
    leadsheetId: '',
    riskId: '',
  });

  const refreshAll = useCallback(async () => {
    const [riskRes, matRes, samplingRes, tbRes] = await Promise.all([
      fetch(`/api/audits/${auditId}/risks`, { cache: 'no-store' }),
      fetch(`/api/audits/${auditId}/materiality`, { cache: 'no-store' }),
      fetch(`/api/audits/${auditId}/sampling`, { cache: 'no-store' }),
      fetch(`/api/audits/${auditId}/trial-balance`, { cache: 'no-store' }),
    ]);

    if (!riskRes.ok || !matRes.ok || !samplingRes.ok || !tbRes.ok) {
      throw new Error('Failed to load risk engine data.');
    }

    const riskPayload = await riskRes.json();
    const matPayload = await matRes.json();
    const samplingPayload = await samplingRes.json();
    const tbPayload = await tbRes.json();

    setRisks(riskPayload.risks || []);
    setProcedures(riskPayload.procedures || []);
    setMateriality(matPayload.profile || null);
    setSamplingPlans(samplingPayload.plans || []);
    setLeadsheets((tbPayload.leadsheets || []).map((ls: { id: string; reference: string; name: string }) => ({ id: ls.id, reference: ls.reference, name: ls.name })));
  }, [auditId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await refreshAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load risk engine');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshAll]);

  const riskOptions = useMemo(
    () => risks.map((risk) => ({ id: risk.id, label: `${risk.reference} (${risk.likelihood})` })),
    [risks]
  );

  useEffect(() => {
    if (!materiality) return;
    setMaterialityDraft({
      benchmark: materiality.benchmark || '',
      benchmarkValue: materiality.benchmarkValue || '',
      percentage: materiality.percentage || '5',
      notes: materiality.notes || '',
    });
  }, [materiality]);

  const createRisk = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRisk),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to create risk');
      setRisks(payload.risks || []);
      setProcedures(payload.procedures || []);
      setNewRisk({ reference: '', description: '', category: 'ERROR', likelihood: 'MEDIUM', magnitude: 'MEDIUM', isSignificant: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create risk');
    } finally {
      setLoading(false);
    }
  };

  const bootstrapPresumed = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bootstrapPresumed' }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to bootstrap presumed risks');
      setRisks(payload.risks || []);
      setProcedures(payload.procedures || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to bootstrap presumed risks');
    } finally {
      setLoading(false);
    }
  };

  const updateRiskAssertions = async (risk: RiskDto, assertion: Assertion) => {
    const current = new Set(risk.assertions.map((item) => item.assertion));
    if (current.has(assertion)) current.delete(assertion);
    else current.add(assertion);

    const res = await fetch(`/api/audits/${auditId}/risks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'setAssertions',
        riskId: risk.id,
        assertions: Array.from(current),
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to update assertions');
    setRisks(payload.risks || []);
  };

  const toggleProcedureLink = async (risk: RiskDto, procedureId: string) => {
    const currentIds = new Set(risk.links.map((link) => link.procedure.id));
    if (currentIds.has(procedureId)) currentIds.delete(procedureId);
    else currentIds.add(procedureId);

    const res = await fetch(`/api/audits/${auditId}/risks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'setLinks',
        riskId: risk.id,
        procedureIds: Array.from(currentIds),
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to update risk links');
    setRisks(payload.risks || []);
  };

  const saveMateriality = async () => {
    const benchmarkValue = Number(materialityDraft.benchmarkValue) || 0;
    const percentage = Number(materialityDraft.percentage) || 0;
    const res = await fetch(`/api/audits/${auditId}/materiality`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        benchmark: materialityDraft.benchmark,
        benchmarkValue,
        percentage,
        notes: materialityDraft.notes,
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to save materiality');
    setMateriality(payload.profile || null);
  };

  const createSamplingPlan = async () => {
    const res = await fetch(`/api/audits/${auditId}/sampling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        areaLabel: samplingDraft.areaLabel,
        leadsheetId: samplingDraft.leadsheetId || null,
        riskId: samplingDraft.riskId || null,
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to create sampling plan');
    setSamplingPlans((prev) => [payload.plan, ...prev]);
    setSamplingDraft({ areaLabel: '', leadsheetId: '', riskId: '' });
  };

  const updateSamplingSelection = async (planId: string, value: number, suggested: number) => {
    const overrideReason = value !== suggested ? 'Adjusted based on engagement judgement.' : '';
    const res = await fetch(`/api/audits/${auditId}/sampling`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        selectedSampleSize: value,
        overrideReason,
      }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to update sampling selection');
    await refreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Risk and Control Engine</p>
        <p className="mt-1 text-xs text-slate-600">Structured risk register, engagement materiality, and sampling derivation.</p>
        {loading ? <p className="mt-2 text-xs text-slate-500">Working...</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Risk Register</p>
            <button onClick={() => void bootstrapPresumed()} className="rounded bg-slate-700 px-2 py-1 text-xs text-white">
              Bootstrap Presumed Risks
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input className="rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Reference" value={newRisk.reference} onChange={(e) => setNewRisk((prev) => ({ ...prev, reference: e.target.value }))} />
            <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={newRisk.category} onChange={(e) => setNewRisk((prev) => ({ ...prev, category: e.target.value as RiskCategory }))}>
              <option value="ERROR">ERROR</option>
              <option value="FRAUD">FRAUD</option>
              <option value="COMPLIANCE">COMPLIANCE</option>
              <option value="RELATED_PARTY">RELATED_PARTY</option>
              <option value="ESTIMATE">ESTIMATE</option>
              <option value="GOING_CONCERN">GOING_CONCERN</option>
            </select>
            <textarea className="col-span-2 rounded border border-slate-300 px-2 py-1 text-xs" rows={2} placeholder="Risk description" value={newRisk.description} onChange={(e) => setNewRisk((prev) => ({ ...prev, description: e.target.value }))} />
            <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={newRisk.likelihood} onChange={(e) => setNewRisk((prev) => ({ ...prev, likelihood: e.target.value as RiskRating }))}>
              <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option>
            </select>
            <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={newRisk.magnitude} onChange={(e) => setNewRisk((prev) => ({ ...prev, magnitude: e.target.value as RiskRating }))}>
              <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option>
            </select>
          </div>
          <button onClick={() => void createRisk()} className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Add Risk</button>

          <div className="mt-4 max-h-[320px] space-y-2 overflow-auto">
            {risks.map((risk) => (
              <div key={risk.id} className="rounded border border-slate-200 p-2">
                <p className="text-xs font-semibold text-slate-800">
                  {risk.reference} - {risk.description}
                </p>
                <p className="text-[11px] text-slate-500">
                  {risk.category} | L:{risk.likelihood} M:{risk.magnitude} {risk.isPresumed ? '| Presumed' : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ASSERTIONS.map((assertion) => {
                    const selected = risk.assertions.some((item) => item.assertion === assertion);
                    return (
                      <button
                        key={assertion}
                        onClick={() => void updateRiskAssertions(risk, assertion)}
                        className={`rounded px-2 py-0.5 text-[10px] ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {assertion}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 max-h-24 overflow-auto rounded border border-slate-100 p-1">
                  {procedures.map((procedure) => {
                    const linked = risk.links.some((item) => item.procedure.id === procedure.id);
                    return (
                      <label key={procedure.id} className="flex items-center gap-1 text-[10px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={linked}
                          onChange={() => void toggleProcedureLink(risk, procedure.id)}
                        />
                        <span>
                          [{procedure.phase}] {procedure.title || 'Untitled'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Materiality</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className="rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Benchmark (e.g. PBT)" value={materialityDraft.benchmark} onChange={(e) => setMaterialityDraft((prev) => ({ ...prev, benchmark: e.target.value }))} />
              <input className="rounded border border-slate-300 px-2 py-1 text-xs" placeholder="Benchmark value" value={materialityDraft.benchmarkValue} onChange={(e) => setMaterialityDraft((prev) => ({ ...prev, benchmarkValue: e.target.value }))} />
              <input className="rounded border border-slate-300 px-2 py-1 text-xs col-span-2" placeholder="Percentage" value={materialityDraft.percentage} onChange={(e) => setMaterialityDraft((prev) => ({ ...prev, percentage: e.target.value }))} />
              <textarea className="rounded border border-slate-300 px-2 py-1 text-xs col-span-2" rows={2} placeholder="Notes" value={materialityDraft.notes} onChange={(e) => setMaterialityDraft((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
            <button onClick={() => void saveMateriality()} className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Save Materiality</button>
            {materiality ? (
              <p className="mt-2 text-xs text-slate-600">
                Overall: {materiality.overallMateriality} | Performance: {materiality.performanceMateriality} | Trivial: {materiality.trivialThreshold}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Sampling</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className="rounded border border-slate-300 px-2 py-1 text-xs col-span-2" placeholder="Area label" value={samplingDraft.areaLabel} onChange={(e) => setSamplingDraft((prev) => ({ ...prev, areaLabel: e.target.value }))} />
              <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={samplingDraft.leadsheetId} onChange={(e) => setSamplingDraft((prev) => ({ ...prev, leadsheetId: e.target.value }))}>
                <option value="">Leadsheet (optional)</option>
                {leadsheets.map((item) => (
                  <option key={item.id} value={item.id}>{item.reference} - {item.name}</option>
                ))}
              </select>
              <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={samplingDraft.riskId} onChange={(e) => setSamplingDraft((prev) => ({ ...prev, riskId: e.target.value }))}>
                <option value="">Risk (optional)</option>
                {riskOptions.map((risk) => (
                  <option key={risk.id} value={risk.id}>{risk.label}</option>
                ))}
              </select>
            </div>
            <button onClick={() => void createSamplingPlan()} className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Create Sampling Plan</button>
            <div className="mt-3 max-h-[230px] space-y-2 overflow-auto">
              {samplingPlans.map((plan) => (
                <div key={plan.id} className="rounded border border-slate-200 p-2">
                  <p className="text-xs font-semibold text-slate-800">
                    {plan.areaLabel} {plan.leadsheet ? `(${plan.leadsheet.reference})` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Suggested: {plan.suggestedSampleSize} | Selected: {plan.selectedSampleSize}
                  </p>
                  <input
                    type="number"
                    min={1}
                    defaultValue={plan.selectedSampleSize}
                    className="mt-1 w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                    onBlur={(e) => void updateSamplingSelection(plan.id, Number(e.target.value), plan.suggestedSampleSize)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Available Procedures for Risk Linkage</p>
        <div className="mt-2 max-h-[180px] overflow-auto text-xs text-slate-600">
          {procedures.map((procedure) => (
            <p key={procedure.id}>
              [{procedure.phase}] {procedure.title || 'Untitled procedure'}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
