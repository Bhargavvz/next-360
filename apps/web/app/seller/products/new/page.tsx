'use client';

import { useEffect, useState } from 'react';
import { api, publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

const PRODUCT_TYPES = [
  { value: 'ORGANIC', label: 'Organic', desc: 'NPOP certified organic product' },
  { value: 'NATURAL', label: 'Natural', desc: 'Natural, no certification required' },
  { value: 'ECO_FRIENDLY', label: 'Eco-Friendly', desc: 'Sustainable / eco-conscious' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    productType: 'ORGANIC',
    categoryId: '',
    sku: '',
    weight: '',
    dimensions: '',
    origin: '',
    ingredients: '',
    nutritionalInfo: '',
    storageInstructions: '',
    images: [] as { url: string; altText: string; isPrimary: boolean }[],
  });

  useEffect(() => {
    publicApi.get('/api/v1/categories')
      .then(r => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Please select a category'); return; }
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Valid price is required'); return; }

    setLoading(true);
    setError(null);
    try {
      await api.post('/api/v1/seller/products', {
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
        images: form.images,
      });
      setSuccess(true);
      setTimeout(() => router.push('/seller/products'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errs = err.response?.data?.errors;
      setError(msg || (errs ? Object.values(errs).join(', ') : 'Failed to create product. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Group categories: top-level first
  const rootCategories = categories.filter(c => !c.parentId);
  const subCategories = categories.filter(c => c.parentId);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/seller/products">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Products require admin approval before going live</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Product submitted for review. Redirecting to products list...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Basic Information</h2>

          <Input
            label="Product Name *"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Organic Basmati Rice — 1 kg"
            maxLength={200}
          />

          <div>
            <label className="block text-sm font-medium mb-1.5">Product Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                  <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...form.images];
                      newImages.splice(i, 1);
                      if (img.isPrimary && newImages.length > 0) newImages[0].isPrimary = true;
                      setForm(f => ({ ...f, images: newImages }));
                    }}
                    className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {img.isPrimary && (
                    <div className="absolute bottom-2 left-2 right-2 bg-emerald-500 text-white text-[10px] font-medium px-2 py-1 rounded text-center">
                      Primary
                    </div>
                  )}
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = form.images.map(img => ({ ...img, isPrimary: false }));
                        newImages[i].isPrimary = true;
                        setForm(f => ({ ...f, images: newImages }));
                      }}
                      className="absolute bottom-2 left-2 right-2 bg-black/50 hover:bg-black/80 text-white text-[10px] font-medium px-2 py-1 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Set Primary
                    </button>
                  )}
                </div>
              ))}
              {form.images.length < 4 && (
                <div className="col-span-1 sm:col-span-2">
                  <FileUpload
                    folder="products"
                    label="Add Product Image"
                    onUploadComplete={(url) => {
                      const isFirst = form.images.length === 0;
                      setForm(f => ({ ...f, images: [...f.images, { url, altText: f.name || 'Product Image', isPrimary: isFirst }] }));
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Upload up to 4 images (JPG, PNG, WEBP). First image is the primary thumbnail.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe your product — sourcing, farming practices, quality, benefits..."
              rows={5}
              maxLength={10000}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.description.length}/10000</p>
          </div>

          {/* Product type */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('productType', t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.productType === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              value={form.categoryId}
              onChange={e => set('categoryId', e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
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

        {/* Pricing & Inventory */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pricing & Inventory</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Selling Price (INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">MRP / Original Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.mrp}
                  onChange={e => set('mrp', e.target.value)}
                  placeholder="0.00"
                  className="w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity *"
              type="number"
              min="0"
              value={form.stock}
              onChange={e => set('stock', e.target.value)}
              placeholder="0"
            />
            <Input
              label="SKU / Product Code"
              value={form.sku}
              onChange={e => set('sku', e.target.value)}
              placeholder="e.g. RICE-BAS-001"
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Specifications</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight / Volume"
              value={form.weight}
              onChange={e => set('weight', e.target.value)}
              placeholder="e.g. 1 kg, 500 ml"
            />
            <Input
              label="Dimensions"
              value={form.dimensions}
              onChange={e => set('dimensions', e.target.value)}
              placeholder="e.g. 20 x 10 x 5 cm"
            />
          </div>
          <Input
            label="Origin / Farm Location"
            value={form.origin}
            onChange={e => set('origin', e.target.value)}
            placeholder="e.g. Uttarakhand, India"
          />
        </div>

        {/* Additional Details */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Additional Details (optional)</h2>
          <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2.5 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            Providing complete information helps buyers make informed decisions and improves your product ranking.
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ingredients</label>
            <textarea
              value={form.ingredients}
              onChange={e => set('ingredients', e.target.value)}
              placeholder="List all ingredients..."
              rows={2}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nutritional Information</label>
            <textarea
              value={form.nutritionalInfo}
              onChange={e => set('nutritionalInfo', e.target.value)}
              placeholder="Per 100g: Calories, Protein, Carbs, Fat, Fibre..."
              rows={2}
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Storage Instructions</label>
            <input
              type="text"
              value={form.storageInstructions}
              onChange={e => set('storageInstructions', e.target.value)}
              placeholder="e.g. Store in a cool, dry place away from direct sunlight"
              className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="min-w-[140px]">
            Submit Product
          </Button>
          <Link href="/seller/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
