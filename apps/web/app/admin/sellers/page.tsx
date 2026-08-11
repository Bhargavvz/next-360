'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Store, AlertCircle } from 'lucide-react';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchSellers = () => {
    setLoading(true);
    api.get('/api/v1/admin/sellers/pending?size=50')
      .then(res => { setSellers(res.data.data?.content || []); setError(null); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load sellers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleAction = async (id: string, approved: boolean) => {
    setActing(id + approved);
    try {
      await api.post(`/api/v1/admin/sellers/${id}/review`, {
        approved,
        remarks: approved ? 'Approved by admin' : 'Rejected by admin',
      });
      fetchSellers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Seller Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve seller accounts</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold">No pending sellers</h3>
          <p className="text-muted-foreground mt-1">All seller applications have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sellers.map((seller: any) => (
            <Card key={seller.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{seller.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        {seller.businessType} • {seller.city}, {seller.state}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        GSTIN: {seller.gstin || 'N/A'} • Phone: {seller.phone || seller.user?.phone || 'N/A'}
                      </p>
                      {seller.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{seller.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleAction(seller.id, true)}
                      disabled={acting !== null}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      {acting === seller.id + 'true' ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleAction(seller.id, false)}
                      disabled={acting !== null}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                      {acting === seller.id + 'false' ? 'Rejecting…' : 'Reject'}
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
