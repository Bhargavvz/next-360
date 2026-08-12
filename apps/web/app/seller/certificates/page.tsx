'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck, Plus, AlertCircle, CheckCircle, ExternalLink, X, Info } from 'lucide-react';

// Must match backend CertificateRequest exactly:
// certificateNumber, certificationBody, productId, issueDate, expiryDate, documentUrl

const CERT_BODIES = [
  'APEDA (NPOP)',
  'Control Union',
  'OneCert International',
  'LACON India',
  'Bureau Veritas',
  'SGS India',
  'FSSAI',
  'IMO Control (EU Organic)',
  'Other',
];

const STATUS_CONFIG: Record<string, { variant: any; label: string }> = {
  PENDING: { variant: 'warning', label: 'Under Review' },
  APPROVED: { variant: 'success', label: 'Verified' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
  REVOKED: { variant: 'destructive', label: 'Revoked' },
};

const emptyForm = {
  certificateNumber: '',
  certificationBody: '',
  productId: '',
  issueDate: '',
  expiryDate: '',
  documentUrl: '',
};

export default function SellerCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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
    if (!form.productId) { setError('Please select a product'); return; }
    if (!form.certificateNumber.trim()) { setError('Certificate number is required'); return; }
    if (!form.certificationBody.trim()) { setError('Certification body is required'); return; }
    if (!form.issueDate) { setError('Issue date is required'); return; }
    if (!form.expiryDate) { setError('Expiry date is required'); return; }
    if (!form.documentUrl.trim()) { setError('Document URL is required'); return; }

    setSubmitting(true); setError(null); setSuccess(null);
    try {
      // Backend CertificateRequest fields exactly:
      await api.post('/api/v1/seller/certificates', {
        certificateNumber: form.certificateNumber.trim(),
        certificationBody: form.certificationBody.trim(),
        productId: form.productId,
        issueDate: form.issueDate,        // LocalDate: "YYYY-MM-DD"
        expiryDate: form.expiryDate,      // LocalDate: "YYYY-MM-DD"
        documentUrl: form.documentUrl.trim(),
      });
      setSuccess('Certificate submitted for admin review.');
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).join(', ') || 'Failed to submit certificate');
    } finally {
      setSubmitting(false);
    }
  };

  // Only show approved products (can't certify a rejected/draft product)
  const eligibleProducts = products.filter(p => ['APPROVED', 'PENDING'].includes(p.status));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Certificates</h1>
          <p className="text-muted-foreground mt-1 text-sm">Submit organic and quality certificates for your products</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError(null); setSuccess(null); }}>
          <Plus className="h-4 w-4" /> Add Certificate
        </Button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
        <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="font-medium mb-0.5">Certificate Submission</p>
          <p className="text-blue-700">Paste a publicly accessible URL to your certificate document (Google Drive, Dropbox). Once approved by admin, the product will be marked as verified organic and buyers will see the certification badge.</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200 mb-6">
          <CheckCircle className="h-4 w-4 shrink-0" />{success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Submit New Certificate</h2>
            <button onClick={() => { setShowForm(false); setError(null); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Product *</label>
              <select value={form.productId} onChange={e => set('productId', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Select a product</option>
                {eligibleProducts.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {eligibleProducts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Add products first before submitting certificates</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Certificate Number *"
                value={form.certificateNumber}
                onChange={e => set('certificateNumber', e.target.value)}
                placeholder="e.g. NPOP/CERT/2024/001"
              />
              <div>
                <label className="block text-sm font-medium mb-1.5">Certification Body *</label>
                <select value={form.certificationBody}
                  onChange={e => set('certificationBody', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select body</option>
                  {CERT_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Issue Date *</label>
                <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Expiry Date *</label>
                <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Certificate Document URL *</label>
              <input type="url" placeholder="https://drive.google.com/file/..."
                value={form.documentUrl} onChange={e => set('documentUrl', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-muted-foreground mt-1">Paste a shareable, publicly accessible link to your certificate scan</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>Submit Certificate</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates list */}
      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border bg-card">
          <FileCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No certificates yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Submit your organic and quality certificates to build buyer trust</p>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Submit First Certificate</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {certs.map((cert: any) => {
            const cfg = STATUS_CONFIG[cert.status] || { variant: 'outline', label: cert.status };
            return (
              <div key={cert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileCheck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cert.certificationBody}</p>
                      <p className="text-xs text-muted-foreground">{cert.certificateNumber}</p>
                      {cert.productName && (
                        <p className="text-xs text-muted-foreground mt-0.5">For: {cert.productName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {cert.documentUrl && (
                      <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> View
                      </a>
                    )}
                    <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                  </div>
                </div>
                {cert.rejectionReason && (
                  <p className="text-xs text-destructive mt-2 pl-13">Rejection reason: {cert.rejectionReason}</p>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground mt-2 pl-13">
                  {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                  {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
