'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, FileCheck, AlertCircle, RefreshCw, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchCerts = () => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/admin/certificates/pending?size=50')
      .then(res => setCerts(res.data.data?.content || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load pending certificates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleApprove = async (id: string) => {
    setActing(id + 'approve');
    try {
      await api.post(`/api/v1/admin/certificates/${id}/review`, {
        approved: true,
        remarks: 'Certificate verified and approved',
      });
      setCerts(prev => prev.filter(c => c.id !== id));
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
      await api.post(`/api/v1/admin/certificates/${id}/review`, {
        approved: false,
        remarks: rejectReason,
      });
      setCerts(prev => prev.filter(c => c.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActing(null);
    }
  };

  const certTypeLabel = (type: string) =>
    type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Certificate Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review organic and compliance certificates submitted by sellers</p>
        </div>
        <button onClick={fetchCerts}
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <div className="h-16 w-16 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">No pending certificates</h3>
          <p className="text-muted-foreground mt-1 text-sm">All submitted certificates have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{certs.length} certificate{certs.length !== 1 ? 's' : ''} pending review</p>
          {certs.map((cert: any) => (
            <div key={cert.id} className="rounded-2xl border bg-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">{certTypeLabel(cert.certificateType || cert.type)}</p>
                    <Badge variant="outline" className="text-[10px]">{cert.status || 'PENDING'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Product: {cert.productName || cert.product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seller: {cert.sellerName || cert.seller?.businessName || 'Unknown'}
                  </p>
                  {cert.issuingAuthority && (
                    <p className="text-xs text-muted-foreground">
                      Issuing Authority: {cert.issuingAuthority}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {cert.issueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Issued: {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
                    {cert.expiryDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(cert.expiryDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
                {cert.documentUrl && (
                  <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Certificate
                  </a>
                )}
              </div>

              {/* Certificate number */}
              {cert.certificateNumber && (
                <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground">
                  Certificate No: {cert.certificateNumber}
                </div>
              )}

              {/* Image preview */}
              {cert.documentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(cert.documentUrl) && (
                <div className="rounded-xl overflow-hidden border h-48">
                  <img src={cert.documentUrl} alt="Certificate" className="h-full w-full object-contain bg-muted/30" />
                </div>
              )}

              {/* Rejection reason */}
              {rejectingId === cert.id && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Rejection reason (required)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="e.g. Certificate has expired / issuing authority not recognized..."
                    rows={2}
                    className="w-full text-sm border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(cert.id)}
                      disabled={acting !== null} className="gap-1.5">
                      <X className="h-3.5 w-3.5" />
                      {acting === cert.id + 'reject' ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {rejectingId !== cert.id && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(cert.id)}
                    disabled={acting !== null}
                    size="sm"
                    className="bg-success hover:bg-success/90 gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {acting === cert.id + 'approve' ? 'Approving...' : 'Approve Certificate'}
                  </Button>
                  <Button
                    onClick={() => setRejectingId(cert.id)}
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
