'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ExistingAudit {
  id: string;
  title: string;
  auditNumber?: string | null;
  category?: string | null;
  entityType?: 'COMMERCIAL' | 'NGO' | 'UNIVERSAL' | null;
}

export default function NewAudit() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [auditNumber, setAuditNumber] = useState('');
  const [objective, setObjective] = useState('');
  const [entityType, setEntityType] = useState<'COMMERCIAL' | 'NGO'>('COMMERCIAL');
  const [carryForwardFromAuditId, setCarryForwardFromAuditId] = useState('');
  const [existingAudits, setExistingAudits] = useState<ExistingAudit[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAudits() {
      try {
        const res = await fetch('/api/audits');
        if (!res.ok) throw new Error('Failed to load previous audits');
        const audits: ExistingAudit[] = await res.json();
        setExistingAudits(audits);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingAudits(false);
      }
    }

    loadAudits();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          category,
          auditNumber,
          objective, 
          entityType,
          status: 'In Progress',
          carryForwardFromAuditId: carryForwardFromAuditId || undefined,
        }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const payload = await res.json().catch(() => null);
        setError(payload?.error || 'Failed to create audit');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Audit</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              id="entityType"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as 'COMMERCIAL' | 'NGO')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="NGO">NGO</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Universal master leadsheets are always included. This selection adds the COMMERCIAL or NGO overlay.
            </p>
          </div>

          <div>
            <label htmlFor="carryForward" className="block text-sm font-medium text-gray-700 mb-1">
              Carry Forward From Prior Audit (Optional)
            </label>
            <select
              id="carryForward"
              value={carryForwardFromAuditId}
              onChange={(e) => setCarryForwardFromAuditId(e.target.value)}
              disabled={loadingAudits}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">
                {loadingAudits ? 'Loading previous audits...' : 'Do not carry forward'}
              </option>
              {existingAudits.map((audit) => (
                <option key={audit.id} value={audit.id}>
                  {audit.title}
                  {audit.auditNumber ? ` (${audit.auditNumber})` : ''}
                  {audit.category ? ` - ${audit.category}` : ''}
                  {audit.entityType ? ` [${audit.entityType}]` : ''}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Carries over team members, groups, procedures, question setup, and template application history; resets working responses and review progress.
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Audit Title</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Q3 Financial Audit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Audit Category</label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Financial"
              />
            </div>
            <div>
              <label htmlFor="auditNumber" className="block text-sm font-medium text-gray-700 mb-1">Audit Number</label>
              <input
                id="auditNumber"
                type="text"
                value={auditNumber}
                onChange={e => setAuditNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. AUD-2024-001"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">Audit Objective</label>
            <textarea
              id="objective"
              rows={4}
              value={objective}
              onChange={e => setObjective(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Define the primary objective of this audit..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link href="/" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
