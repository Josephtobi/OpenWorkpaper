'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, ShieldAlert, Trash2, Pencil, RefreshCw } from 'lucide-react';

type EntityTypeSet = 'UNIVERSAL' | 'COMMERCIAL' | 'NGO';
type FsStatement = 'SOFP' | 'PROFIT_LOSS' | 'EQUITY' | 'CASHFLOW';

interface MasterGrouping {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}

interface MasterLeadsheet {
  id: string;
  entitySet: EntityTypeSet;
  reference: string;
  name: string;
  fsCaption: string;
  fsStatement: FsStatement;
  sortOrder: number;
  active: boolean;
  groupings: MasterGrouping[];
}

const ENTITY_SETS: EntityTypeSet[] = ['UNIVERSAL', 'COMMERCIAL', 'NGO'];

export default function MasterLeadsheetLibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [entitySet, setEntitySet] = useState<EntityTypeSet>('UNIVERSAL');
  const [rows, setRows] = useState<MasterLeadsheet[]>([]);

  const [newLeadsheet, setNewLeadsheet] = useState({
    reference: '',
    name: '',
    fsCaption: '',
    fsStatement: 'SOFP' as FsStatement,
    sortOrder: 0,
  });

  const fetchRows = useCallback(async (selected: EntityTypeSet) => {
    const res = await fetch(`/api/admin/master-leadsheets?entitySet=${selected}`);
    const payload = await res.json().catch(() => []);
    if (!res.ok) throw new Error(payload?.error || 'Failed to load master leadsheets.');
    setRows(payload);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json().catch(() => null);
      if (!sessionRes.ok || !session?.user) {
        router.push('/login');
        return;
      }
      setUserRole(session.user.role);
      if (session.user.role !== 'Business Operations') {
        setLoading(false);
        return;
      }
      await fetchRows(entitySet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [entitySet, fetchRows, router]);

  useEffect(() => {
    load();
  }, [load]);

  const emptyStateText = useMemo(() => `No ${entitySet} master leadsheets yet.`, [entitySet]);

  async function createLeadsheet(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/master-leadsheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createLeadsheet',
          entitySet,
          ...newLeadsheet,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || 'Failed to create leadsheet.');
      setNewLeadsheet({ reference: '', name: '', fsCaption: '', fsStatement: 'SOFP', sortOrder: 0 });
      await fetchRows(entitySet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leadsheet.');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteLeadsheet(id: string) {
    if (!confirm('Delete this master leadsheet and all its groupings?')) return;
    const res = await fetch(`/api/admin/master-leadsheets?action=deleteLeadsheet&id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to delete leadsheet.');
      return;
    }
    await fetchRows(entitySet);
  }

  async function deleteGrouping(id: string) {
    const res = await fetch(`/api/admin/master-leadsheets?action=deleteGrouping&id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to delete grouping.');
      return;
    }
    await fetchRows(entitySet);
  }

  async function addGrouping(masterLeadsheetId: string) {
    const code = prompt('Grouping code (e.g. G-01):');
    if (!code) return;
    const name = prompt('Grouping name:');
    if (!name) return;

    const res = await fetch('/api/admin/master-leadsheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createGrouping',
        masterLeadsheetId,
        code,
        name,
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to add grouping.');
      return;
    }
    await fetchRows(entitySet);
  }

  async function editLeadsheet(item: MasterLeadsheet) {
    const name = prompt('Leadsheet name:', item.name);
    if (!name) return;
    const fsCaption = prompt('FS caption:', item.fsCaption);
    if (!fsCaption) return;

    const res = await fetch('/api/admin/master-leadsheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateLeadsheet',
        id: item.id,
        name,
        fsCaption,
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to update leadsheet.');
      return;
    }
    await fetchRows(entitySet);
  }

  async function toggleLeadsheetActive(item: MasterLeadsheet) {
    const res = await fetch('/api/admin/master-leadsheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateLeadsheet',
        id: item.id,
        active: !item.active,
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to update active status.');
      return;
    }
    await fetchRows(entitySet);
  }

  async function editGrouping(item: MasterGrouping) {
    const code = prompt('Grouping code:', item.code);
    if (!code) return;
    const name = prompt('Grouping name:', item.name);
    if (!name) return;

    const res = await fetch('/api/admin/master-leadsheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateGrouping',
        id: item.id,
        code,
        name,
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      alert(payload?.error || 'Failed to update grouping.');
      return;
    }
    await fetchRows(entitySet);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading master leadsheet library...
      </div>
    );
  }

  if (userRole && userRole !== 'Business Operations') {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">
          <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500">Only Business Operations can manage the master leadsheet library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 pb-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600" />
          Master Leadsheet Library
        </h1>
        <p className="text-sm text-slate-600">
          Changes here affect future engagements only. Existing engagement copies are not retroactively updated.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ENTITY_SETS.map((set) => (
          <button
            key={set}
            type="button"
            onClick={async () => {
              setEntitySet(set);
              await fetchRows(set);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              entitySet === set
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {set}
          </button>
        ))}
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      <form onSubmit={createLeadsheet} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Add master leadsheet ({entitySet})</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            required
            value={newLeadsheet.reference}
            onChange={(e) => setNewLeadsheet((prev) => ({ ...prev, reference: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Reference (e.g. A)"
          />
          <input
            required
            value={newLeadsheet.name}
            onChange={(e) => setNewLeadsheet((prev) => ({ ...prev, name: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Name"
          />
          <input
            required
            value={newLeadsheet.fsCaption}
            onChange={(e) => setNewLeadsheet((prev) => ({ ...prev, fsCaption: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="FS caption"
          />
          <select
            value={newLeadsheet.fsStatement}
            onChange={(e) => setNewLeadsheet((prev) => ({ ...prev, fsStatement: e.target.value as FsStatement }))}
            className="border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="SOFP">SOFP</option>
            <option value="PROFIT_LOSS">PROFIT_LOSS</option>
            <option value="EQUITY">EQUITY</option>
            <option value="CASHFLOW">CASHFLOW</option>
          </select>
          <button
            disabled={submitting}
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-2 font-semibold disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">{emptyStateText}</div>
        )}
        {rows.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 font-semibold">
                  {item.entitySet} · {item.reference} · {item.fsStatement}
                </div>
                <div className="text-lg font-bold text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-600">{item.fsCaption}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLeadsheetActive(item)}
                  className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700"
                >
                  {item.active ? 'Set inactive' : 'Set active'}
                </button>
                <button
                  type="button"
                  onClick={() => editLeadsheet(item)}
                  className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 inline-flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => addGrouping(item.id)}
                  className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Grouping
                </button>
                <button
                  type="button"
                  onClick={() => deleteLeadsheet(item.id)}
                  className="text-xs px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {item.groupings.map((group) => (
                <div key={group.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                  <div className="text-sm text-slate-800">
                    <span className="font-semibold">{group.code}</span> — {group.name}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editGrouping(group)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 bg-white text-slate-700"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGrouping(group.id)}
                      className="text-xs px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
