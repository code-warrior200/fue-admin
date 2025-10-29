/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const res = await fetch(
        `https://fue-vote-backend-1.onrender.com/api/auth/admin-login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Login failed');
      }

      const body = await res.json();
      const token = body.token || body.access_token || body.data?.token;

      if (!token) throw new Error('No token returned from server');

      // Save JWT to localStorage
      setToken(token);

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (e: any) {
      console.error(e);
      setErr(e.message || 'Login error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
            placeholder="Admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            required
          />
          <input
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {err && <p className="text-red-600 mt-2 text-center">{err}</p>}
        </form>
      </div>
    </div>
  );
}
