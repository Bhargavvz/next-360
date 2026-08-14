'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, AlertCircle, RefreshCw, MapPin, Mail, Phone, Building2 } from 'lucide-react';

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchSellers = () => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/admin/sellers/pending?size=50')
      .then(res => setSellers(res.data.data?.content || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load pending sellers'))
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
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Seller Approvals</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review seller applications before they can list products</p>
        </div>
        <button onClick={fetchSellers}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : sellers.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <div className="h-16 w-16 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold">No pending sellers</h3>
          <p className="text-muted-foreground mt-1 text-sm">All seller applications have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{sellers.length} application{sellers.length !== 1 ? 's' : ''} pending review</p>
          {sellers.map((seller: any) => (
            <div key={seller.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
                  {(seller.businessName || seller.name || '?').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold">{seller.businessName || seller.name}</p>
                    <Badge variant="outline" className="text-[10px]">PENDING</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                    {(seller.email || seller.user?.email) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {seller.email || seller.user?.email}
                      </div>
                    )}
                    {(seller.phone || seller.user?.phone) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {seller.phone || seller.user?.phone}
                      </div>
                    )}
                    {seller.businessAddress && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {seller.businessAddress}
                      </div>
                    )}
                    {seller.gstin && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        GSTIN: {seller.gstin}
                      </div>
                    )}
                  </div>

                  {seller.businessDescription && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{seller.businessDescription}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => handleAction(seller.id, true)}
                    disabled={acting !== null}
                    size="sm"
                    className="bg-success hover:bg-success/90 gap-1.5 w-full"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {acting === seller.id + 'true' ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleAction(seller.id, false)}
                    disabled={acting !== null}
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 w-full"
                  >
                    <X className="h-3.5 w-3.5" />
                    {acting === seller.id + 'false' ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
