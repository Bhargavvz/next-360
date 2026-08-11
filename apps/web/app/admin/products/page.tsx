'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Package, AlertCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/api/v1/admin/products/pending?size=50')
      .then(res => { setProducts(res.data.data?.content || []); setError(null); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load products'))
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
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Product Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve product listings before going live</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold">No pending products</h3>
          <p className="text-muted-foreground mt-1">All products have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {product.primaryImageUrl ? (
                      <img src={product.primaryImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      by {product.sellerName} • ₹{product.price?.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          product.productType === 'ORGANIC' ? 'organic' :
                          product.productType === 'NATURAL' ? 'natural' : 'eco'
                        }
                        className="text-[10px]"
                      >
                        {product.productType}
                      </Badge>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleAction(product.id, true)}
                      disabled={acting !== null}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      {acting === product.id + 'true' ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleAction(product.id, false)}
                      disabled={acting !== null}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                      {acting === product.id + 'false' ? 'Rejecting…' : 'Reject'}
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
