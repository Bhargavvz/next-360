'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload } from '@/components/ui/file-upload';
import { Shield, Plus, AlertCircle, CheckCircle, FileText, X } from 'lucide-react';

// documentType values accepted by backend
const DOC_TYPES = [
  { value: 'PAN', label: 'PAN Card' },
  { value: 'GSTIN', label: 'GST Registration (GSTIN)' },
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'FSSAI', label: 'FSSAI License' },
  { value: 'BUSINESS_LICENSE', label: 'Business / Shop Act License' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'OTHER', label: 'Other Document' },
];

const STATUS_CONFIG: Record<string, { variant: any; label: string }> = {
  PENDING: { variant: 'warning', label: 'Under Review' },
  APPROVED: { variant: 'success', label: 'Verified' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
};

export default function SellerKycPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Backend: KycUploadRequest has documentType + documentUrl only
  const [form, setForm] = useState({ documentType: 'PAN', documentUrl: '' });

  const fetchDocs = () => {
    api.get('/api/v1/seller/kyc')
      .then(res => setDocs(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.documentUrl.trim()) { setError('Document is required'); return; }
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      // Backend KycUploadRequest: documentType + documentUrl
      await api.post('/api/v1/seller/kyc', {
        documentType: form.documentType,
        documentUrl: form.documentUrl.trim(),
      });
      setSuccess('Document submitted for review. We will notify you within 24-48 hours.');
      setShowForm(false);
      setForm({ documentType: 'PAN', documentUrl: '' });
      fetchDocs();
    } catch (err: any) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).join(', ') || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">KYC Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">Upload identity and business documents for seller verification</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError(null); setSuccess(null); }}>
          <Plus className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-success bg-success-muted px-4 py-3 rounded-lg border border-success/30 mb-6">
          <CheckCircle className="h-4 w-4 shrink-0" />{success}
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upload New Document</h2>
            <button onClick={() => { setShowForm(false); setError(null); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Document Type *</label>
              <select value={form.documentType} onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Document *</label>
              <FileUpload
                folder="kyc"
                onUploadComplete={(url) => setForm({ ...form, documentUrl: url })}
                label="Upload KYC Document"
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
              </div>
            )}
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>Submit Document</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border bg-card">
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No documents uploaded</h3>
          <p className="text-muted-foreground text-sm mb-6">Upload your identity and business documents to complete KYC</p>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Upload First Document</Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {docs.map((doc: any) => {
            const cfg = STATUS_CONFIG[doc.status] || { variant: 'outline', label: doc.status };
            const docLabel = DOC_TYPES.find(d => d.value === doc.documentType)?.label || doc.documentType;
            return (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{docLabel}</p>
                    {doc.rejectionReason && (
                      <p className="text-xs text-destructive mt-0.5">Reason: {doc.rejectionReason}</p>
                    )}
                    {doc.uploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.documentUrl && (
                    <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline">View</a>
                  )}
                  <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
