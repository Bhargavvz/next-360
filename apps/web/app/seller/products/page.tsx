'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/seller/products?size=50')
      .then(res => setProducts(res.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, any> = {
      APPROVED: 'success', PENDING: 'warning', REJECTED: 'destructive', DRAFT: 'outline',
    };
    return <Badge variant={map[status] || 'outline'} className="text-[10px]">{status}</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product listings</p>
        </div>
        <Link href="/seller/products/new">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-6">Add your first product to get started</p>
          <Link href="/seller/products/new"><Button><Plus className="h-4 w-4" /> Add Product</Button></Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.primaryImageUrl ? (
                            <img src={p.primaryImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg">🌿</div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={p.stock > 0 ? '' : 'text-destructive'}>{p.stock}</span></td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.productType === 'ORGANIC' ? 'organic' : p.productType === 'NATURAL' ? 'natural' : 'eco'} className="text-[10px]">
                        {p.productType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/products/${p.slug}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
