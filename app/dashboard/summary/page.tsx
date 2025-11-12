'use client';

import AdminSidebar from '@/components/AdminNav';
import { useCandidates } from '@/hooks/useCandidates';
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
import { Award } from 'lucide-react';
import type { Candidate } from '@/types';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: Candidate;
    value: number;
  }>;
}

export default function VoteSummaryPage() {
  const { candidates, error, loading } = useCandidates({ sortByVotes: true });

  const getBarColor = (index: number): string => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return '#3b82f6'; // Blue
    }
  };

  const getRankStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-yellow-500 font-bold';
      case 2:
        return 'text-gray-400 font-semibold';
      case 3:
        return 'text-orange-500 font-semibold';
      default:
        return 'text-gray-700 dark:text-gray-300';
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

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      const candidate = payload[0].payload;
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
              <p className="text-gray-600 dark:text-gray-300">
                {candidate.position && `${candidate.position} • `}Votes: {candidate.votes}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalVotes = candidates?.reduce((sum, candidate) => sum + candidate.votes, 0) || 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 md:p-6 transition-all">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Vote Summary
          </h1>
          {candidates && candidates.length > 0 && (
            <p className="text-gray-600 dark:text-gray-400">
              Total Votes: <span className="font-semibold">{totalVotes}</span> •{' '}
              <span className="font-semibold">{candidates.length}</span> Candidates
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="w-full h-80 flex items-center justify-center">
            <Skeleton className="w-full h-80 rounded-lg" />
          </div>
        )}

        {!loading && candidates && candidates.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-500 dark:text-gray-400">No candidates found.</p>
          </div>
        )}

        {!loading && candidates && candidates.length > 0 && (
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md w-full overflow-x-auto">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Votes Distribution
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={candidates}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#4b5563"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#4b5563" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="votes" animationDuration={800} radius={[8, 8, 0, 0]}>
                    {candidates.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Table */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Candidates Leaderboard
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 px-2 text-gray-700 dark:text-gray-300">Rank</th>
                      <th className="pb-3 px-2 text-gray-700 dark:text-gray-300">Position</th>
                      <th className="pb-3 px-2 text-gray-700 dark:text-gray-300">Candidate</th>
                      <th className="pb-3 px-2 text-gray-700 dark:text-gray-300">Total Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={candidate._id ?? candidate.id ?? index}
                          className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className={`py-3 px-2 ${getRankStyle(rank)}`}>
                            {rank}
                            {getTrophy(rank)}
                          </td>
                          <td className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                            {candidate.position}
                          </td>
                          <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                            {candidate.name}
                          </td>
                          <td className="py-3 px-2 font-semibold text-gray-800 dark:text-gray-200">
                            {candidate.votes}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
