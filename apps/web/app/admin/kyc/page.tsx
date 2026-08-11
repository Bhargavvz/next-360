'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Shield, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchKycs = () => {
    setLoading(true);
    api.get('/api/v1/admin/kyc/pending?size=50')
      .then(res => { setKycs(res.data.data?.content || []); setError(null); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load KYC submissions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKycs(); }, []);

  const handleAction = async (id: string, approved: boolean) => {
    setActing(id + approved);
    try {
      await api.post(`/api/v1/admin/kyc/${id}/review`, {
        approved,
        remarks: approved ? 'KYC approved by admin' : 'KYC rejected by admin',
      });
      fetchKycs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">KYC Review</h1>
        <p className="text-muted-foreground mt-1">Verify seller identity documents</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : kycs.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold">No pending KYC reviews</h3>
          <p className="text-muted-foreground mt-1">All documents have been verified</p>
        </div>
      ) : (
        <div className="space-y-4">
          {kycs.map((kyc: any) => (
            <Card key={kyc.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{kyc.documentType}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Seller: <span className="text-foreground font-medium">{kyc.sellerName || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Document #: <span className="text-foreground">{kyc.documentNumber || kyc.id}</span>
                    </p>
                    {kyc.uploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(kyc.uploadedAt).toLocaleDateString('en-IN')}
                      </p>
                    )}
                    {kyc.documentUrl && (
                      <a
                        href={kyc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Document
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleAction(kyc.id, true)}
                      disabled={acting !== null}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      {acting === kyc.id + 'true' ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleAction(kyc.id, false)}
                      disabled={acting !== null}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                      {acting === kyc.id + 'false' ? 'Rejecting…' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
