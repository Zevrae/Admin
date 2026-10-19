'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/UseAuth';
import { RefreshCw, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#12100C] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#C5A059] mb-2">Zevrae</p>
          <h1 className="text-[22px] font-light tracking-[0.15em] text-[#EAE6E1]">Admin Access</h1>
          <p className="text-[11px] text-[#EAE6E1]/30 font-sans mt-2">Restricted — authorised personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-[11px] font-sans text-red-300 bg-red-900/20 border border-red-700/40 rounded-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[#EAE6E1]/40 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full py-3 px-4 bg-[#1a1814] border border-[#EAE6E1]/10 rounded-sm text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
              placeholder="admin@zevrae.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[#EAE6E1]/40 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full py-3 px-4 bg-[#1a1814] border border-[#EAE6E1]/10 rounded-sm text-[12px] text-[#EAE6E1] font-mono placeholder:text-[#EAE6E1]/20 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-[11px] uppercase tracking-[0.2em] font-sans bg-[#C5A059] text-[#12100C] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-sm"
          >
            {loading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Lock size={13} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[9px] font-sans text-[#EAE6E1]/15 mt-10 tracking-[0.1em]">
          ZEVRAE ADMIN · SECURE ACCESS
        </p>
      </div>
    </div>
  );
}
