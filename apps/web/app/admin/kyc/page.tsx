'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Shield, AlertCircle, RefreshCw, ExternalLink, Calendar, FileText } from 'lucide-react';

export default function AdminKycPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDocs = () => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/admin/kyc/pending?size=50')
      .then(res => setDocs(res.data.data?.content || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load pending KYC'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleApprove = async (id: string) => {
    setActing(id + 'approve');
    try {
      await api.post(`/api/v1/admin/kyc/${id}/review`, { approved: true, remarks: 'KYC approved by admin' });
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) { setError('Please enter a rejection reason'); return; }
    setActing(id + 'reject');
    try {
      await api.post(`/api/v1/admin/kyc/${id}/review`, { approved: false, remarks: rejectReason });
      setDocs(prev => prev.filter(d => d.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActing(null);
    }
  };

  const formatDocType = (type: string) => type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">KYC Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">Verify seller identity documents before approval</p>
        </div>
        <button onClick={fetchDocs}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <div className="h-16 w-16 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">No pending KYC</h3>
          <p className="text-muted-foreground mt-1 text-sm">All KYC documents have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{docs.length} document{docs.length !== 1 ? 's' : ''} pending review</p>
          {docs.map((doc: any) => (
            <div key={doc.id} className="rounded-2xl border bg-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">{formatDocType(doc.documentType)}</p>
                    <Badge variant="outline" className="text-[10px]">{doc.status || 'PENDING'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seller: {doc.sellerName || doc.seller?.businessName || 'Unknown'}
                  </p>
                  {doc.uploadedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      Submitted {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Document
                </a>
              </div>

              {/* Preview if image URL */}
              {doc.documentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.documentUrl) && (
                <div className="rounded-xl overflow-hidden border h-40">
                  <img src={doc.documentUrl} alt="KYC Document" className="h-full w-full object-contain bg-muted/30" />
                </div>
              )}

              {/* Reject reason input */}
              {rejectingId === doc.id && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Rejection reason (required)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Document is blurry / expired / incorrect type..."
                    rows={2}
                    className="w-full text-sm border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(doc.id)}
                      disabled={acting !== null} className="gap-1.5">
                      <X className="h-3.5 w-3.5" />
                      {acting === doc.id + 'reject' ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {rejectingId !== doc.id && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(doc.id)}
                    disabled={acting !== null}
                    size="sm"
                    className="bg-success hover:bg-success/90 gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {acting === doc.id + 'approve' ? 'Approving...' : 'Approve KYC'}
                  </Button>
                  <Button
                    onClick={() => setRejectingId(doc.id)}
                    disabled={acting !== null}
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
