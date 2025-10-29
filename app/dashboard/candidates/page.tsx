/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminSidebar from '@/components/AdminNav';
import { Skeleton } from '@/components/ui/skeleton';

interface Candidate {
  _id?: string;
  id?: string;
  name: string;
  position: string;
  votes: number;
  image?: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/candidates')
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setCandidates(data);
        } else setCandidates([]);
      })
      .catch((e: any) => {
        console.error(e);
        if (e.message === 'unauthorized') {
          setError('Unauthorized — redirecting to login...');
          setTimeout(() => (location.href = '/'), 800);
        } else {
          setError(e.message || 'Failed to load candidates');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-6 ml-64 transition-all">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Candidates
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!candidates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-48 rounded-lg" />
            ))}
          </div>
        )}

        {candidates && candidates.length === 0 && (
          <p className="text-gray-500">No candidates found.</p>
        )}

        {candidates && candidates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {candidates.map((c) => (
              <div
                key={c._id ?? c.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-shadow"
              >
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {c.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{c.position}</p>
                <p className="mt-2 font-medium text-gray-700 dark:text-gray-200">
                  Votes: {c.votes}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
