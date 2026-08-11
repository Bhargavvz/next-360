'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck, Plus, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const CERT_TYPES = ['NPOP', 'NOP', 'EU_ORGANIC', 'USDA_ORGANIC', 'FSSAI', 'ISO', 'OTHER'];

export default function SellerCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    productId: '',
    certificateType: 'NPOP',
    certificateNumber: '',
    certifyingBody: '',
    validFrom: '',
    validTo: '',
    documentUrl: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const fetchData = () => {
    Promise.all([
      api.get('/api/v1/seller/certificates').then(r => setCerts(r.data.data || [])).catch(() => {}),
      api.get('/api/v1/seller/products?size=100').then(r => setProducts(r.data.data?.content || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      await api.post('/api/v1/seller/certificates', form);
      setSuccess('Certificate submitted for review!');
      setShowForm(false);
      setForm({ productId: '', certificateType: 'NPOP', certificateNumber: '', certifyingBody: '', validFrom: '', validTo: '', documentUrl: '' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload certificate');
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
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Certificates</h1>
          <p className="text-muted-foreground mt-1">Upload organic certifications for your products</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Certificate
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
          <h3 className="font-semibold">Upload New Certificate</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Product *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.productId}
              onChange={e => set('productId', e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Certificate Type *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.certificateType}
              onChange={e => set('certificateType', e.target.value)}
            >
              {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Certificate Number *" placeholder="NPOP-2024-001" value={form.certificateNumber} onChange={e => set('certificateNumber', e.target.value)} required />
            <Input label="Certifying Body *" placeholder="e.g. APEDA" value={form.certifyingBody} onChange={e => set('certifyingBody', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valid From *" type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)} required />
            <Input label="Valid To *" type="date" value={form.validTo} onChange={e => set('validTo', e.target.value)} required />
          </div>
          <Input label="Document URL" placeholder="https://... (certificate link)" value={form.documentUrl} onChange={e => set('documentUrl', e.target.value)} />
          <div className="flex gap-3">
            <Button type="submit" loading={submitting}>Submit</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <FileCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
          <p className="text-muted-foreground">Upload organic certificates to build trust with buyers</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert: any) => (
            <div key={cert.id} className="flex items-center justify-between p-5 rounded-xl border bg-card">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{cert.certificateNumber}</p>
                    {statusBadge(cert.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{cert.certificateType} • {cert.certifyingBody}</p>
                  <p className="text-xs text-muted-foreground">{cert.productName}</p>
                  {cert.validTo && <p className="text-xs text-muted-foreground">Expires: {cert.validTo}</p>}
                </div>
              </div>
              {cert.documentUrl && (
                <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
