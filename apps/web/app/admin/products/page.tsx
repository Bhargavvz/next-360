'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Package, AlertCircle, RefreshCw, ShieldCheck, Sprout } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/admin/products/pending?size=50')
      .then(res => setProducts(res.data.data?.content || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load pending products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAction = async (id: string, approved: boolean) => {
    setActing(id + approved);
    try {
      await api.post(`/api/v1/admin/products/${id}/review`, {
        approved,
        remarks: approved ? 'Approved by admin' : 'Rejected by admin',
      });
      setProducts(prev => prev.filter(p => p.id !== id));
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
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Product Approvals</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and approve product listings before they go live</p>
        </div>
        <button onClick={fetchProducts}
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold">All caught up</h3>
          <p className="text-muted-foreground mt-1 text-sm">No pending products to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? 's' : ''} pending review</p>
          {products.map((product: any) => (
            <div key={product.id} className="flex items-center gap-4 p-5 rounded-2xl border bg-card hover:border-border/80 transition-colors">
              {/* Image */}
              <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {product.imageUrl || product.primaryImageUrl ? (
                  <img src={product.imageUrl || product.primaryImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                  {product.productType && (
                    <Badge
                      variant={product.productType === 'ORGANIC' ? 'organic' : product.productType === 'NATURAL' ? 'natural' : 'eco'}
                      className="text-[10px]"
                    >
                      {product.productType === 'ORGANIC' && <ShieldCheck className="h-2.5 w-2.5" />}
                      {product.productType === 'NATURAL' && <Sprout className="h-2.5 w-2.5" />}
                      {product.productType}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  by {product.sellerName || 'Unknown Seller'} &nbsp;•&nbsp; ₹{product.price?.toLocaleString('en-IN')}
                  {product.mrp && ` / MRP ₹${product.mrp?.toLocaleString('en-IN')}`}
                </p>
                {product.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => handleAction(product.id, true)}
                  disabled={acting !== null}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  {acting === product.id + 'true' ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleAction(product.id, false)}
                  disabled={acting !== null}
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  {acting === product.id + 'false' ? 'Rejecting...' : 'Reject'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
