'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import AdminSidebar from '@/components/AdminNav';
import { useCandidates } from '@/hooks/useCandidates';
import { getVoteRealtime, API_BASE } from '@/lib/api';
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
  const { candidates: initialCandidates, error, loading, refetch } = useCandidates({ sortByVotes: true });
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Initialize candidates from hook
  useEffect(() => {
    if (initialCandidates) {
      setCandidates(initialCandidates);
    }
  }, [initialCandidates]);

  // Socket.io setup and real-time updates
  useEffect(() => {
    // Call GET /api/vote/realtime endpoint to get total votes of each candidate in realtime
    const fetchRealtimeData = async () => {
      try {
        const data = await getVoteRealtime();
        
        // Update candidates with real-time vote counts
        if (data) {
          setCandidates(prev => {
            if (!prev) return prev;
            
            // Handle different response formats
            let voteUpdates: Array<{ candidateId: string; voteCount: number }> = [];
            
            if (Array.isArray(data)) {
              // If response is an array of vote updates
              voteUpdates = data;
            } else if (data.candidates && Array.isArray(data.candidates)) {
              // If response has candidates array with votes
              voteUpdates = data.candidates.map((c: Candidate) => ({
                candidateId: c._id || c.id || '',
                voteCount: c.votes || 0,
              }));
            } else if (data.votes && Array.isArray(data.votes)) {
              // If response has votes array
              voteUpdates = data.votes;
            } else if (data.updates && Array.isArray(data.updates)) {
              // If response has updates array
              voteUpdates = data.updates;
            } else if (typeof data === 'object') {
              // If response is an object with candidate IDs as keys
              voteUpdates = Object.entries(data).map(([id, votes]) => ({
                candidateId: id,
                voteCount: typeof votes === 'number' ? votes : 0,
              }));
            }
            
            // Update candidates with new vote counts
            const updateMap = new Map(
              voteUpdates.map(u => [u.candidateId, u.voteCount])
            );
            
            return prev.map(candidate => {
              const id = candidate._id || candidate.id;
              if (id && updateMap.has(id)) {
                return { ...candidate, votes: updateMap.get(id)! };
              }
              return candidate;
            }).sort((a, b) => b.votes - a.votes);
          });
        }
      } catch (err) {
        console.error('Error fetching realtime data:', err);
      }
    };

    // Initialize socket connection
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Subscribe to vote counts
    socket.emit('subscribe_vote_counts');

    // Subscribe to specific candidates when they're available
    socket.on('connect', () => {
      console.log('Socket connected');
      // Fetch real-time vote data when socket connects
      fetchRealtimeData();
      
      if (candidates && candidates.length > 0) {
        const candidateIds = candidates.map(c => c._id || c.id).filter(Boolean) as string[];
        if (candidateIds.length > 0) {
          socket.emit('subscribe_vote_counts', { candidateIds });
        }
      }
    });

    // Set up periodic polling to fetch real-time votes (fallback if socket fails)
    const pollingInterval = setInterval(() => {
      if (socket.connected) {
        fetchRealtimeData();
      }
    }, 5000); // Poll every 5 seconds

    // Listen for individual vote count updates
    socket.on('vote_count_update', (data: { candidateId: string; voteCount: number }) => {
      console.log(`Candidate ${data.candidateId} now has ${data.voteCount} votes`);
      
      setCandidates(prev => {
        if (!prev) return prev;
        return prev.map(candidate => {
          const id = candidate._id || candidate.id;
          if (id === data.candidateId) {
            return { ...candidate, votes: data.voteCount };
          }
          return candidate;
        }).sort((a, b) => b.votes - a.votes);
      });
    });

    // Listen for bulk vote count updates
    socket.on('vote_counts_bulk_update', (data: { updates: Array<{ candidateId: string; voteCount: number }> }) => {
      console.log('Bulk update:', data.updates);
      
      setCandidates(prev => {
        if (!prev) return prev;
        const updateMap = new Map(data.updates.map(u => [u.candidateId, u.voteCount]));
        return prev.map(candidate => {
          const id = candidate._id || candidate.id;
          if (id && updateMap.has(id)) {
            return { ...candidate, votes: updateMap.get(id)! };
          }
          return candidate;
        }).sort((a, b) => b.votes - a.votes);
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (err: Error) => {
      console.error('Socket error:', err);
    });

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe_vote_counts');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update socket subscription when candidates change
  useEffect(() => {
    if (socketRef.current?.connected && candidates && candidates.length > 0) {
      const candidateIds = candidates.map(c => c._id || c.id).filter(Boolean) as string[];
      if (candidateIds.length > 0) {
        socketRef.current.emit('subscribe_vote_counts', { candidateIds });
      }
    }
  }, [candidates]);

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
        return <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 inline-block ml-1" />;
      case 2:
        return <Award className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 inline-block ml-1" />;
      case 3:
        return <Award className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 inline-block ml-1" />;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      const candidate = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {candidate.image ? (
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs sm:text-sm flex-shrink-0">
                ?
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-100 truncate">{candidate.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
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

  // Group candidates by position
  const groupedByPosition = candidates?.reduce((acc, candidate) => {
    const position = candidate.position || 'Unknown';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>) || {};

  // Sort positions by total votes (descending)
  const sortedPositions = Object.entries(groupedByPosition).sort(([, a], [, b]) => {
    const totalA = a.reduce((sum, c) => sum + c.votes, 0);
    const totalB = b.reduce((sum, c) => sum + c.votes, 0);
    return totalB - totalA;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 transition-all">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Vote Summary
          </h1>
          {candidates && candidates.length > 0 && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Total Votes: <span className="font-semibold">{totalVotes}</span> •{' '}
              <span className="font-semibold">{candidates.length}</span> Candidates •{' '}
              <span className="font-semibold">{sortedPositions.length}</span> Positions
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="w-full h-64 sm:h-80 flex items-center justify-center">
            <Skeleton className="w-full h-64 sm:h-80 rounded-lg" />
          </div>
        )}

        {!loading && candidates && candidates.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md text-center">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No candidates found.</p>
          </div>
        )}

        {!loading && candidates && candidates.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Bar Charts Grouped by Position */}
            {sortedPositions.map(([position, positionCandidates]) => {
              const positionTotalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
              // Sort candidates within position by votes (descending)
              const sortedCandidates = [...positionCandidates].sort((a, b) => b.votes - a.votes);
              
              return (
                <div
                  key={position}
                  className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-md w-full overflow-x-auto"
                >
                  <div className="mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {position}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {sortedCandidates.length} {sortedCandidates.length === 1 ? 'Candidate' : 'Candidates'} •{' '}
                      Total Votes: <span className="font-semibold">{positionTotalVotes}</span>
                    </p>
                  </div>
                  <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedCandidates}
                        margin={{ 
                          top: 10, 
                          right: 10, 
                          left: 0, 
                          bottom: 40 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          stroke="#4b5563"
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 10 }}
                          className="sm:[&_.recharts-cartesian-axis-tick-text]:!text-xs"
                        />
                        <YAxis 
                          stroke="#4b5563" 
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="votes" animationDuration={800} radius={[4, 4, 0, 0]}>
                          {sortedCandidates.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}

            {/* Summary Table */}
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-md">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                Candidates Leaderboard
              </h2>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-2 sm:pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Rank</th>
                        <th className="pb-2 sm:pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Position</th>
                        <th className="pb-2 sm:pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Candidate</th>
                        <th className="pb-2 sm:pb-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Total Votes</th>
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
                            <td className={`py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm ${getRankStyle(rank)}`}>
                              {rank}
                              {getTrophy(rank)}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                              <span className="truncate block max-w-[120px] sm:max-w-none">{candidate.position}</span>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                              <span className="truncate block max-w-[150px] sm:max-w-none">{candidate.name}</span>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
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
          </div>
        )}
      </main>
    </div>
  );
}
