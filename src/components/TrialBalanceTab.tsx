'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface TrialBalanceTabProps {
  auditId: string;
}

interface TrialBalanceAccountDto {
  id: string;
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
  groupingId: string | null;
}

interface TrialBalanceImportDto {
  id: string;
  periodLabel: string;
  isCurrentYear: boolean;
  source: string;
  locked: boolean;
  accounts: TrialBalanceAccountDto[];
}

interface GroupingDto {
  id: string;
  code: string;
  name: string;
}

interface LeadsheetDto {
  id: string;
  reference: string;
  name: string;
  fsCaption: string;
  fsStatement: string;
  groupings: GroupingDto[];
}

interface TrialBalancePayload {
  imports: TrialBalanceImportDto[];
  leadsheets: LeadsheetDto[];
  unmappedCount: number;
}

function parseRowsFromText(input: string): Array<{ accountCode: string; accountName: string; debit: number; credit: number }> {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [accountCode = '', accountName = '', debitRaw = '0', creditRaw = '0'] = line.split('\t');
      const debit = Number(debitRaw.replace(/,/g, '').trim()) || 0;
      const credit = Number(creditRaw.replace(/,/g, '').trim()) || 0;
      return {
        accountCode: accountCode.trim(),
        accountName: accountName.trim(),
        debit,
        credit,
      };
    })
    .filter((row) => row.accountCode && row.accountName);
}

export default function TrialBalanceTab({ auditId }: TrialBalanceTabProps) {
  const [data, setData] = useState<TrialBalancePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [periodLabel, setPeriodLabel] = useState('');
  const [tbRowsText, setTbRowsText] = useState('');

  const [leadRef, setLeadRef] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadCaption, setLeadCaption] = useState('');
  const [leadStatement, setLeadStatement] = useState('SOFP');

  const [groupingLeadsheetId, setGroupingLeadsheetId] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupName, setGroupName] = useState('');

  const currentImport = useMemo(
    () => data?.imports.find((tbImport) => tbImport.isCurrentYear) ?? data?.imports[0] ?? null,
    [data]
  );

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/audits/${auditId}/trial-balance`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load trial-balance data');
    setData((await res.json()) as TrialBalancePayload);
  }, [auditId]);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load trial-balance data');
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const submitImport = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = parseRowsFromText(tbRowsText);
      const res = await fetch(`/api/audits/${auditId}/trial-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodLabel,
          source: 'manual-tab',
          isCurrentYear: true,
          rows,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'TB import failed');
      setTbRowsText('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'TB import failed');
    } finally {
      setLoading(false);
    }
  };

  const createLeadsheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/trial-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createLeadsheet',
          reference: leadRef,
          name: leadName,
          fsCaption: leadCaption,
          fsStatement: leadStatement,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to create leadsheet');
      setLeadRef('');
      setLeadName('');
      setLeadCaption('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create leadsheet');
    } finally {
      setLoading(false);
    }
  };

  const createGrouping = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/audits/${auditId}/trial-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createGrouping',
          leadsheetId: groupingLeadsheetId,
          code: groupCode,
          name: groupName,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to create grouping');
      setGroupCode('');
      setGroupName('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create grouping');
    } finally {
      setLoading(false);
    }
  };

  const mapAccount = async (accountId: string, groupingId: string) => {
    try {
      const res = await fetch(`/api/audits/${auditId}/trial-balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mapAccount',
          accountId,
          groupingId: groupingId || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to map account');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to map account');
    }
  };

  const groupingOptions = useMemo(
    () =>
      (data?.leadsheets || []).flatMap((ls) =>
        ls.groupings.map((grouping) => ({
          id: grouping.id,
          label: `${ls.reference} / ${grouping.code} - ${grouping.name}`,
        }))
      ),
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Trial Balance Spine</p>
        <p className="mt-1 text-xs text-slate-600">
          Current-year import: {currentImport ? currentImport.periodLabel : 'None'} | Unmapped accounts:{' '}
          {data?.unmappedCount ?? 0}
        </p>
        {loading ? <p className="mt-2 text-xs text-slate-500">Working...</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-800">Import Trial Balance</p>
          <p className="mt-1 text-xs text-slate-500">Paste tab-separated rows: code, name, debit, credit.</p>
          <input
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="Period label (e.g. FY2026)"
            className="mt-3 w-full rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <textarea
            value={tbRowsText}
            onChange={(e) => setTbRowsText(e.target.value)}
            rows={8}
            className="mt-2 w-full rounded border border-slate-300 p-2 font-mono text-xs"
            placeholder={'1000\tCash at bank\t1200000\t0'}
          />
          <button
            onClick={() => void submitImport()}
            className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Import Current-Year TB
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Add Client-Specific Leadsheet</p>
            <p className="mt-1 text-xs text-slate-500">
              Use this only for client exceptions. Standard leadsheets are cloned from the master library.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={leadRef}
                onChange={(e) => setLeadRef(e.target.value)}
                placeholder="Reference (A, B, F...)"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              />
              <input
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Leadsheet name"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              />
              <input
                value={leadCaption}
                onChange={(e) => setLeadCaption(e.target.value)}
                placeholder="FS caption"
                className="rounded border border-slate-300 px-2 py-1 text-xs col-span-2"
              />
              <select
                value={leadStatement}
                onChange={(e) => setLeadStatement(e.target.value)}
                className="rounded border border-slate-300 px-2 py-1 text-xs col-span-2"
              >
                <option value="SOFP">SOFP</option>
                <option value="PROFIT_LOSS">PROFIT_LOSS</option>
                <option value="EQUITY">EQUITY</option>
                <option value="CASHFLOW">CASHFLOW</option>
              </select>
            </div>
            <button
              onClick={() => void createLeadsheet()}
              className="mt-2 rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white"
            >
              Add Client-Specific Leadsheet
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">Add Client-Specific Grouping</p>
            <p className="mt-1 text-xs text-slate-500">
              Groupings added here apply only to this engagement file.
            </p>
            <select
              value={groupingLeadsheetId}
              onChange={(e) => setGroupingLeadsheetId(e.target.value)}
              className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">Select leadsheet</option>
              {(data?.leadsheets || []).map((ls) => (
                <option key={ls.id} value={ls.id}>
                  {ls.reference} - {ls.name}
                </option>
              ))}
            </select>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                placeholder="Grouping code"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              />
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Grouping name"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              />
            </div>
            <button
              onClick={() => void createGrouping()}
              className="mt-2 rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-white"
            >
              Add Client-Specific Grouping
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">Map Current-Year Accounts</p>
        {!currentImport ? (
          <p className="mt-2 text-xs text-slate-500">Import a current-year TB to begin mapping.</p>
        ) : (
          <div className="mt-3 max-h-[380px] overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-2">Code</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Net</th>
                  <th className="py-2 pr-2">Grouping</th>
                </tr>
              </thead>
              <tbody>
                {currentImport.accounts.map((account) => {
                  const net = Number(account.debit) - Number(account.credit);
                  return (
                    <tr key={account.id} className="border-b border-slate-100">
                      <td className="py-1 pr-2">{account.accountCode}</td>
                      <td className="py-1 pr-2">{account.accountName}</td>
                      <td className="py-1 pr-2">{net.toLocaleString()}</td>
                      <td className="py-1 pr-2">
                        <select
                          value={account.groupingId || ''}
                          onChange={(e) => void mapAccount(account.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value="">Unmapped</option>
                          {groupingOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
