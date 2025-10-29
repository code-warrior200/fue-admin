/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminNav';
import { apiFetch } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface Candidate {
  _id?: string;
  id?: string;
  name: string;
  votes: number;
  image?: string;
}

export default function VoteSummaryPage() {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/candidates')
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          const sorted = data.sort((a: Candidate, b: Candidate) => b.votes - a.votes);
          setCandidates(sorted);
        } else setCandidates([]);
      })
      .catch((e: any) => {
        console.error(e);
        if (e.message === 'unauthorized') {
          setError('Unauthorized — redirecting to login...');
          setTimeout(() => (location.href = '/'), 800);
        } else setError(e.message || 'Failed to load candidates');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getBarColor = (index: number) => {
    switch (index) {
      case 0:
        return '#FFD700';
      case 1:
        return '#C0C0C0';
      case 2:
        return '#CD7F32';
      default:
        return '#3b82f6';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const candidate = payload[0].payload as Candidate;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {candidate.image ? (
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                ?
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{candidate.name}</p>
              <p className="text-gray-600 dark:text-gray-300">Votes: {candidate.votes}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: hidden on mobile, toggleable if needed */}
      <div className="md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 md:p-6 transition-all">
        <h1 className="text-2xl font-bold text-gray-800 mt-15 dark:text-gray-100 mb-6">
          Vote Summary
        </h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!candidates && (
          <div className="w-full h-80 flex items-center justify-center">
            <Skeleton className="w-full h-80 rounded-lg" />
          </div>
        )}

        {candidates && candidates.length === 0 && (
          <p className="text-gray-500">No candidates found.</p>
        )}

        {candidates && candidates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={candidates}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#4b5563" interval={0} angle={-20} textAnchor="end" />
                <YAxis stroke="#4b5563" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" animationDuration={800}>
                  {candidates.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
