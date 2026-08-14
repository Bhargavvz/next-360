'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api, apiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Package, Heart, LogOut, ShieldCheck, Store, CheckCircle,
  AlertCircle, Plus, Pencil, Trash2, MapPin, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADDRESS_TYPES = ['HOME', 'WORK', 'OTHER'];

const emptyAddr = {
  type: 'HOME', name: '', phone: '', addressLine1: '', addressLine2: '',
  landmark: '', city: '', state: '', pincode: '', isDefault: false, deliveryInstructions: '',
};

export default function AccountPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tab, setTab] = useState<'profile' | 'addresses'>('profile');

  // Address form state
  const [addrForm, setAddrForm] = useState<any>(emptyAddr);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    Promise.all([
      api.get('/api/v1/users/me').then(r => {
        setProfile(r.data.data);
        setName(r.data.data?.name || '');
        setEmail(r.data.data?.email || '');
      }),
      api.get('/api/v1/users/me/addresses').then(r => setAddresses(r.data.data || [])),
    ]).finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  const handleSaveProfile = async () => {
    setSaving(true); setSaved(false); setError(null);
    try {
      await api.put('/api/v1/users/me', { name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to save'));
    } finally { setSaving(false); }
  };

  const refreshAddresses = () =>
    api.get('/api/v1/users/me/addresses').then(r => setAddresses(r.data.data || []));

  const normalizePhone = (p: string) => {
    const d = p.replace(/\D/g, '');
    if (p.startsWith('+91') && d.length === 12) return p;
    if (d.length === 10) return `+91${d}`;
    return p;
  };

  const handleSaveAddress = async () => {
    setAddrSaving(true); setAddrError(null);
    const payload = { ...addrForm, phone: normalizePhone(addrForm.phone) };
    try {
      if (editingAddrId) {
        await api.put(`/api/v1/users/me/addresses/${editingAddrId}`, payload);
      } else {
        await api.post('/api/v1/users/me/addresses', payload);
      }
      await refreshAddresses();
      setShowAddrForm(false);
      setEditingAddrId(null);
      setAddrForm(emptyAddr);
    } catch (err) {
      setAddrError(apiErrorMessage(err, 'Failed to save address'));
    } finally { setAddrSaving(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    setAddrError(null);
    try {
      await api.delete(`/api/v1/users/me/addresses/${id}`);
      await refreshAddresses();
      toast.success('Address deleted');
    } catch (err) {
      // Deleting an address attached to a live order is refused server-side —
      // surface that instead of silently doing nothing.
      const message = apiErrorMessage(err, 'Could not delete this address');
      setAddrError(message);
      toast.error(message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/v1/users/me/addresses/${id}/default`);
      await refreshAddresses();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not set the default address'));
    }
  };

  const startEdit = (addr: any) => {
    setAddrForm({
      type: addr.type, name: addr.name, phone: addr.phone?.replace(/^\+91/, '') || '',
      addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '', city: addr.city, state: addr.state,
      pincode: addr.pincode, isDefault: addr.isDefault, deliveryInstructions: addr.deliveryInstructions || '',
    });
    setEditingAddrId(addr.id);
    setShowAddrForm(true);
    setAddrError(null);
  };

  if (authLoading || loading) {
    return (
      <div className="container py-10 max-w-2xl">
        <Skeleton className="h-8 w-40 mb-8" />
        <Skeleton className="h-48 rounded-2xl mb-4" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const roles = profile?.roles || [];
  const isSeller = roles.includes('SELLER');
  const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
          {(name || 'U')[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">{name || 'My Account'}</h1>
          <p className="text-sm text-muted-foreground">{profile?.phone}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {roles.map((r: string) => (
              <Badge key={r} variant={r === 'SUPER_ADMIN' ? 'organic' : r === 'SELLER' ? 'natural' : 'outline'} className="text-[10px]">
                {r.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(['profile', 'addresses'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'addresses' ? `Addresses (${addresses.length})` : 'Profile'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <>
          <div className="rounded-2xl border bg-card p-6 mb-4">
            <h2 className="font-semibold mb-5">Personal Information</h2>
            <div className="space-y-4">
              <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
              {error && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />{error}</p>}
              {saved && <p className="text-sm text-success flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />Saved successfully</p>}
              <Button onClick={handleSaveProfile} loading={saving}>Save Changes</Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border bg-card overflow-hidden mb-4">
            <div className="divide-y">
              <Link href="/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
                <Package className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">My Orders</span>
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
                <Heart className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">Wishlist</span>
              </Link>
              <button onClick={() => setTab('addresses')} className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors w-full text-left">
                <MapPin className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">Delivery Addresses</span>
                <Badge variant="outline">{addresses.length}</Badge>
              </button>
              {isSeller && (
                <Link href="/seller/dashboard" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
                  <Store className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">Seller Dashboard</span>
                  <Badge variant="natural" className="text-[10px]">SELLER</Badge>
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">Admin Panel</span>
                  <Badge variant="organic" className="text-[10px]">ADMIN</Badge>
                </Link>
              )}
              {!isSeller && (
                <Link href="/seller/register" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
                  <Star className="h-5 w-5 text-muted-foreground" /><span className="font-medium flex-1">Become a Seller</span>
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card overflow-hidden">
            <button onClick={logout} className="flex items-center gap-3 px-5 py-4 w-full hover:bg-destructive/10 text-destructive transition-colors">
              <LogOut className="h-5 w-5" /><span className="font-medium">Log Out</span>
            </button>
          </div>
        </>
      )}

      {tab === 'addresses' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Delivery Addresses</h2>
            <Button size="sm" onClick={() => { setAddrForm(emptyAddr); setEditingAddrId(null); setShowAddrForm(true); setAddrError(null); }}>
              <Plus className="h-4 w-4" /> Add Address
            </Button>
          </div>

          {/* Address form */}
          {showAddrForm && (
            <div className="rounded-2xl border bg-card p-5 mb-4">
              <h3 className="font-semibold mb-4">{editingAddrId ? 'Edit Address' : 'New Address'}</h3>
              <div className="space-y-3">
                {/* Type selector */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {ADDRESS_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setAddrForm((f: any) => ({ ...f, type: t }))}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${addrForm.type === t ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:border-primary/50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name *" value={addrForm.name} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Recipient name" />
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground text-sm font-medium">+91</span>
                      <input type="tel" placeholder="9876543210" value={addrForm.phone}
                        onChange={(e: any) => setAddrForm((f: any) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                        className="flex-1 rounded-r-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                </div>
                <Input label="Address Line 1 *" value={addrForm.addressLine1} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, addressLine1: e.target.value }))} placeholder="House no., Street, Colony" />
                <Input label="Address Line 2" value={addrForm.addressLine2} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, addressLine2: e.target.value }))} placeholder="Apartment, Floor (optional)" />
                <Input label="Landmark" value={addrForm.landmark} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, landmark: e.target.value }))} placeholder="Near landmark (optional)" />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City *" value={addrForm.city} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, city: e.target.value }))} placeholder="City" />
                  <Input label="State *" value={addrForm.state} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, state: e.target.value }))} placeholder="State" />
                  <Input label="Pincode *" value={addrForm.pincode} onChange={(e: any) => setAddrForm((f: any) => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="110001" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isDefault" checked={addrForm.isDefault}
                    onChange={(e: any) => setAddrForm((f: any) => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
                  <label htmlFor="isDefault" className="text-sm">Set as default address</label>
                </div>
                {addrError && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />{addrError}</p>}
                <div className="flex gap-3 pt-1">
                  <Button onClick={handleSaveAddress} loading={addrSaving}>
                    {editingAddrId ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddrForm(false); setEditingAddrId(null); }}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {addresses.length === 0 && !showAddrForm && (
            <div className="text-center py-16 rounded-2xl border bg-card">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No addresses saved yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add an address to speed up checkout</p>
            </div>
          )}

          <div className="space-y-3">
            {addresses.map((addr: any) => (
              <div key={addr.id} className={`rounded-2xl border bg-card p-4 ${addr.isDefault ? 'border-primary/40 bg-primary/[0.02]' : ''}`}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={addr.type === 'HOME' ? 'outline' : 'outline'} className="text-[10px]">{addr.type}</Badge>
                    {addr.isDefault && <Badge variant="organic" className="text-[10px]">DEFAULT</Badge>}
                  </div>
                  <div className="flex gap-1">
                    {!addr.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)} className="text-xs h-7">
                        Set Default
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => startEdit(addr)} className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)} className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="font-medium text-sm">{addr.name} · {addr.phone}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
