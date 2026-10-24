'use client';

import { lazy, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from './hooks/UseAuth';

// AdminLayout is dynamically imported once an admin session is verified,
// preventing unauthenticated users from downloading the admin bundle.
const AdminLayout = lazy(() => import('./AdminLayout'));

function AdminLoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#12100C] text-[#C5A059] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-sans">{label}</span>
      </div>
    </div>
  );
}

export default function AdminGate() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = authLoading ? null : user?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) router.push('/login');
  }, [authLoading, isAdmin, router]);

  // Still resolving the auth session — don't render or fetch the admin
  // chunk yet, we don't know the role.
  if (isAdmin === null) {
    return <AdminLoadingScreen label="Verifying access..." />;
  }

  // Confirmed non-admin (or logged out) — the effect above is already
  // navigating away; render nothing so there's no flash of admin UI and
  // no dynamic import is ever kicked off.
  if (!isAdmin) return null;

  // Only now does React attempt to download the admin chunk.
  return (
    <Suspense fallback={<AdminLoadingScreen label="Loading control panel..." />}>
      <AdminLayout />
    </Suspense>
  );
}
