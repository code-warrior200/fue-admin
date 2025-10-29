/* eslint-disable @typescript-eslint/no-explicit-any */
// components/SummaryTable.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ResetButton from '@/components/ResetButton';
import { Award } from 'lucide-react';

interface Candidate {
  _id?: string;
  id?: string;
  name: string;
  position: string;
  votes: number;
}

export default function SummaryTable() {
  const [rows, setRows] = useState<Candidate[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/candidates')
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          const sorted = data.sort((a: Candidate, b: Candidate) => b.votes - a.votes);
          setRows(sorted);
        } else {
          setRows([]);
        }
      })
      .catch((e: any) => {
        console.error(e);
        if (e.message === 'unauthorized') {
          setErr('Unauthorized — redirecting to login...');
          setTimeout(() => (location.href = '/'), 800);
        } else setErr(e.message || 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <p className="text-red-600">{err}</p>;
  if (rows === null)
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500 font-bold';
      case 2:
        return 'text-gray-400 font-semibold';
      case 3:
        return 'text-orange-500 font-semibold';
      default:
        return 'text-gray-700';
    }
  };

  const getTrophy = (rank: number) => {
    switch (rank) {
      case 1:
        return <Award className="w-4 h-4 text-yellow-500 inline-block ml-1" />;
      case 2:
        return <Award className="w-4 h-4 text-gray-400 inline-block ml-1" />;
      case 3:
        return <Award className="w-4 h-4 text-orange-500 inline-block ml-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Candidates Leaderboard</h3>
        <ResetButton />
      </div>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="pb-3 px-2">#</th>
            <th className="pb-3 px-2">Position</th>
            <th className="pb-3 px-2">Candidate</th>
            <th className="pb-3 px-2">Votes</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                No candidates yet
              </td>
            </tr>
          )}
          {rows.map((c, i) => {
            const rank = i + 1;
            return (
              <tr
                key={c._id ?? c.id ?? i}
                className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className={`py-2 px-2 ${getRankStyle(rank)}`}>
                  {rank}
                  {getTrophy(rank)}
                </td>
                <td className="py-2 px-2 font-medium text-gray-700">{c.position}</td>
                <td className="py-2 px-2">{c.name}</td>
                <td className="py-2 px-2">{c.votes}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
