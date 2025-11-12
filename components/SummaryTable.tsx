'use client';

import { useCandidates } from '@/hooks/useCandidates';
import { Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SummaryTable() {
  const { candidates, error, loading } = useCandidates({ sortByVotes: true });

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    );
  }

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

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
        <p className="text-gray-500 dark:text-gray-400">No candidates yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Candidates Leaderboard
        </h3>
      </div>
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
                  <td className="py-3 px-2 text-gray-800 dark:text-gray-200">{candidate.name}</td>
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
  );
}
