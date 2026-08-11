'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, AlertCircle, CheckCircle } from 'lucide-react';

const DOC_TYPES = ['AADHAAR', 'PAN', 'GSTIN', 'BANK_STATEMENT', 'OTHER'];

export default function SellerKycPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ documentType: 'AADHAAR', documentNumber: '', documentUrl: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const fetchDocs = () => {
    api.get('/api/v1/seller/kyc')
      .then(res => setDocs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      await api.post('/api/v1/seller/kyc', form);
      setSuccess('Document submitted for review!');
      setShowForm(false);
      setForm({ documentType: 'AADHAAR', documentNumber: '', documentUrl: '' });
      fetchDocs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: any = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'destructive' };
    return <Badge variant={map[s] || 'outline'} className="text-[10px]">{s}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">KYC Documents</h1>
          <p className="text-muted-foreground mt-1">Upload identity & business documents for verification</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Document
        </Button>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
          <CheckCircle className="h-4 w-4" />{success}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 rounded-xl border bg-card space-y-4">
          <h3 className="font-semibold">Upload New Document</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Document Type *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.documentType}
              onChange={e => set('documentType', e.target.value)}
            >
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input
            label="Document Number *"
            placeholder="Enter document number"
            value={form.documentNumber}
            onChange={e => set('documentNumber', e.target.value)}
            required
          />
          <Input
            label="Document URL"
            placeholder="https://... (upload link)"
            value={form.documentUrl}
            onChange={e => set('documentUrl', e.target.value)}
          />
          <div className="flex gap-3">
            <Button type="submit" loading={submitting}>Submit</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
          <p className="text-muted-foreground">Upload KYC documents to get your account verified</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{doc.documentType}</p>
                  <p className="text-xs text-muted-foreground">{doc.documentNumber}</p>
                </div>
              </div>
              {statusBadge(doc.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
