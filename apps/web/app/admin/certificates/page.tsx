'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, FileText, ExternalLink, AlertCircle } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchCerts = () => {
    setLoading(true);
    api.get('/api/v1/admin/certificates/pending?size=50')
      .then(res => { setCerts(res.data.data?.content || []); setError(null); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load certificates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleAction = async (id: string, approved: boolean) => {
    setActing(id + approved);
    try {
      await api.post(`/api/v1/admin/certificates/${id}/review`, {
        approved,
        remarks: approved ? 'Approved by admin' : 'Rejected by admin',
      });
      fetchCerts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Certificate Review</h1>
        <p className="text-muted-foreground mt-1">Review and approve organic certificates from sellers</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No pending certificates to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert: any) => (
            <Card key={cert.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{cert.certificateNumber || cert.id}</span>
                      <Badge variant="warning" className="text-[10px]">PENDING</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Product: <span className="text-foreground font-medium">{cert.productName || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Certifying Body: <span className="text-foreground">{cert.certifyingBody || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: <span className="text-foreground font-medium">{cert.certificateType || cert.type || 'N/A'}</span>
                    </p>
                    {(cert.validFrom || cert.validTo) && (
                      <p className="text-sm text-muted-foreground">
                        Valid: {cert.validFrom} — {cert.validTo}
                      </p>
                    )}
                    {cert.documentUrl && (
                      <a
                        href={cert.documentUrl}
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
                      onClick={() => handleAction(cert.id, true)}
                      disabled={acting !== null}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      {acting === cert.id + 'true' ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleAction(cert.id, false)}
                      disabled={acting !== null}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                      {acting === cert.id + 'false' ? 'Rejecting…' : 'Reject'}
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
