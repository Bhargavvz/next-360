'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Eye, Package, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  APPROVED: { label: 'Approved', variant: 'success' },
  PENDING:  { label: 'Pending Review', variant: 'warning' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  DRAFT:    { label: 'Draft', variant: 'outline' },
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/api/v1/seller/products?size=100')
      .then(res => setProducts(res.data.data?.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await api.delete(`/api/v1/seller/products/${id}`);
      setConfirmDeleteId(null);
      fetchProducts();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete product. It may have active orders.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {products.length} product{products.length !== 1 ? 's' : ''} in your catalogue
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <button onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-semibold text-lg mb-1">Delete Product</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. The product will be permanently removed from your catalogue.
            </p>
            {deleteError && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(confirmDeleteId)}
                loading={!!deletingId}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No products yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Add your first product to start selling on Next360</p>
          <Link href="/seller/products/new"><Button>Add Your First Product</Button></Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product: any) => {
                const statusCfg = STATUS_CONFIG[product.status] || { label: product.status, variant: 'outline' };
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images?.[0]?.url
                            ? <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                            : <Package className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.productType === 'ORGANIC' ? 'organic' : product.productType === 'NATURAL' ? 'natural' : 'eco'} className="text-[10px]">
                        {product.productType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock === 0 ? 'text-destructive font-medium' : product.stock < 10 ? 'text-amber-500 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant} className="text-[10px]">
                        {statusCfg.label}
                      </Badge>
                      {product.status === 'REJECTED' && product.rejectionReason && (
                        <p className="text-xs text-destructive mt-0.5">{product.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View on store">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/seller/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit product">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete product"
                          onClick={() => { setConfirmDeleteId(product.id); setDeleteError(null); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
