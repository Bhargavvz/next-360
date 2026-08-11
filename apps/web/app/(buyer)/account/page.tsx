'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, Heart, LogOut, ShieldCheck, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    api.get('/api/v1/users/me')
      .then(res => {
        setProfile(res.data.data);
        setName(res.data.data?.name || '');
        setEmail(res.data.data?.email || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError(null);
    try {
      await api.put('/api/v1/users/me', { name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
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
      <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-8">My Account</h1>

      {/* Profile card */}
      <div className="rounded-2xl border bg-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
            {(name || profile?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-semibold">{name || profile?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{profile?.phone}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {roles.map((r: string) => (
                <Badge key={r} variant={r === 'SUPER_ADMIN' ? 'organic' : r === 'SELLER' ? 'natural' : 'outline'} className="text-[10px]">
                  {r.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />{error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />Profile updated successfully
            </p>
          )}
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border bg-card overflow-hidden mb-4">
        <div className="divide-y">
          <Link href="/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">My Orders</span>
          </Link>
          <Link href="/wishlist" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Wishlist</span>
          </Link>
          {isSeller && (
            <Link href="/seller/dashboard" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
              <Store className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Seller Dashboard</span>
              <Badge variant="natural" className="ml-auto text-[10px]">SELLER</Badge>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Admin Panel</span>
              <Badge variant="organic" className="ml-auto text-[10px]">ADMIN</Badge>
            </Link>
          )}
          {!isSeller && (
            <Link href="/seller/register" className="flex items-center gap-3 px-5 py-4 hover:bg-accent transition-colors">
              <Store className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Become a Seller</span>
            </Link>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 w-full hover:bg-destructive/10 text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
