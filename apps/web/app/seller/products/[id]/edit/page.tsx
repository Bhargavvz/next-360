'use client';

import { useEffect, useState } from 'react';
import { api, publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, CheckCircle, Save } from 'lucide-react';

const PRODUCT_TYPES = [
  { value: 'ORGANIC', label: 'Organic', desc: 'NPOP certified organic product' },
  { value: 'NATURAL', label: 'Natural', desc: 'Natural, no certification required' },
  { value: 'ECO_FRIENDLY', label: 'Eco-Friendly', desc: 'Sustainable / eco-conscious' },
];

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', mrp: '', stock: '',
    productType: 'ORGANIC', categoryId: '', sku: '', weight: '',
    dimensions: '', origin: '', ingredients: '', nutritionalInfo: '', storageInstructions: '',
  });

  useEffect(() => {
    Promise.all([
      publicApi.get('/api/v1/categories').then(r => setCategories(r.data.data || [])).catch(() => {}),
      api.get('/api/v1/seller/products?size=200').then(r => {
        const products = r.data.data?.content || [];
        const product = products.find((p: any) => p.id === id);
        if (product) {
          setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            mrp: product.mrp?.toString() || '',
            stock: product.stock?.toString() || '',
            productType: product.productType || 'ORGANIC',
            categoryId: product.categoryId || '',
            sku: product.sku || '',
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            origin: product.origin || '',
            ingredients: product.ingredients || '',
            nutritionalInfo: product.nutritionalInfo || '',
            storageInstructions: product.storageInstructions || '',
          });
        }
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Please select a category'); return; }
    setSaving(true); setError(null); setSuccess(false);
    try {
      await api.put(`/api/v1/seller/products/${id}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : undefined,
        stock: parseInt(form.stock) || 0,
        productType: form.productType,
        categoryId: form.categoryId,
        sku: form.sku || undefined,
        weight: form.weight || undefined,
        dimensions: form.dimensions || undefined,
        origin: form.origin || undefined,
        ingredients: form.ingredients || undefined,
        nutritionalInfo: form.nutritionalInfo || undefined,
        storageInstructions: form.storageInstructions || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/seller/products'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errs = err.response?.data?.errors;
      setError(msg || (errs ? Object.values(errs).join(', ') : 'Failed to update product'));
    } finally { setSaving(false); }
  };

  const rootCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/seller/products">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Edits will require re-approval if the product was previously approved</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Product updated successfully. Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h2>
          <Input label="Product Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Organic Basmati Rice — 1 kg" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={5} className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Product Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => set('productType', t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${form.productType === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select a category</option>
              {rootCategories.map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  <option value={cat.id}>{cat.name}</option>
                  {subCategories.filter(s => s.parentId === cat.id).map(sub => (
                    <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Selling Price (INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                  className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">MRP / Original Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input type="number" step="0.01" min="0" value={form.mrp} onChange={e => set('mrp', e.target.value)}
                  className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity *" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            <Input label="SKU / Product Code" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. RICE-BAS-001" />
          </div>
        </div>

        {/* Specs */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Specifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Weight / Volume" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 1 kg, 500 ml" />
            <Input label="Dimensions" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="e.g. 20 x 10 x 5 cm" />
          </div>
          <Input label="Origin / Farm Location" value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="e.g. Uttarakhand, India" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Ingredients</label>
            <textarea value={form.ingredients} onChange={e => set('ingredients', e.target.value)} rows={2}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nutritional Information</label>
            <textarea value={form.nutritionalInfo} onChange={e => set('nutritionalInfo', e.target.value)} rows={2}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <Input label="Storage Instructions" value={form.storageInstructions} onChange={e => set('storageInstructions', e.target.value)} placeholder="e.g. Store in a cool, dry place" />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="min-w-[140px]">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
          <Link href="/seller/products"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
