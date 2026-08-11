'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';

const PRODUCT_TYPES = ['ORGANIC', 'NATURAL', 'ECO_FRIENDLY'];
const CATEGORIES = ['Vegetables & Fruits', 'Grains & Cereals', 'Spices & Herbs', 'Dairy & Eggs', 'Oils & Fats', 'Honey & Sweeteners', 'Tea & Coffee', 'Skincare & Beauty', 'Baby Products', 'Pet Products', 'Other'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    productType: 'ORGANIC',
    category: '',
    brand: '',
    weight: '',
    unit: 'g',
    sku: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/v1/seller/products', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        stock: parseInt(form.stock),
        productType: form.productType,
        category: form.category,
        brand: form.brand || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        unit: form.unit,
        sku: form.sku || null,
      });
      setSuccess(true);
      setTimeout(() => router.push('/seller/products'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/seller/products">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Add New Product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Fill in product details — admin review required before going live</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Product submitted for review! Redirecting…
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl border p-6">
        {/* Basic info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h2>
          <Input
            label="Product Name *"
            placeholder="e.g. Cold-Pressed Coconut Oil"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Describe the product, its benefits, origin, and certifications…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Product Type *</label>
            <div className="flex gap-2">
              {PRODUCT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('productType', type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.productType === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {type === 'ORGANIC' ? '🟢 Organic' : type === 'NATURAL' ? '🟡 Natural' : '🔵 Eco-Friendly'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input
            label="Brand"
            placeholder="e.g. Your Brand Name"
            value={form.brand}
            onChange={e => set('brand', e.target.value)}
          />
        </div>

        {/* Pricing */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="499"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              required
            />
            <Input
              label="MRP (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="599"
              value={form.mrp}
              onChange={e => set('mrp', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity *"
              type="number"
              min="0"
              placeholder="100"
              value={form.stock}
              onChange={e => set('stock', e.target.value)}
              required
            />
            <Input
              label="SKU"
              placeholder="e.g. SKU-001"
              value={form.sku}
              onChange={e => set('sku', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight / Volume"
              type="number"
              min="0"
              step="0.1"
              placeholder="500"
              value={form.weight}
              onChange={e => set('weight', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Unit</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
              >
                {['g', 'kg', 'ml', 'L', 'pcs', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} disabled={success}>
            {loading ? 'Submitting…' : 'Submit for Review'}
          </Button>
          <Link href="/seller/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
