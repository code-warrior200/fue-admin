// Custom hook for fetching candidates
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllCandidates, getAllCandidatesFull } from '@/lib/api';
import type { Candidate } from '@/types';

interface UseCandidatesOptions {
  sortByVotes?: boolean;
  autoRedirect?: boolean;
  useFullDetails?: boolean; // Use /api/admin/all-candidates instead of /api/admin/candidates
}

interface UseCandidatesReturn {
  candidates: Candidate[] | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useCandidates(
  options: UseCandidatesOptions = { sortByVotes: false, autoRedirect: true, useFullDetails: false }
): UseCandidatesReturn {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use all-candidates endpoint for admin with full details, or regular candidates endpoint
      const data = options.useFullDetails 
        ? await getAllCandidatesFull()
        : await getAllCandidates();
      
      if (Array.isArray(data)) {
        let processed = data;
        if (options.sortByVotes) {
          processed = [...data].sort((a: Candidate, b: Candidate) => b.votes - a.votes);
        }
        setCandidates(processed);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load candidates';
      console.error('Error fetching candidates:', err);
      
      // Check for unauthorized errors
      if ((errorMessage.toLowerCase().includes('unauthorized') || 
           errorMessage.toLowerCase().includes('401') ||
           errorMessage.toLowerCase().includes('403')) && 
          options.autoRedirect) {
        setError('Unauthorized — redirecting to login...');
        setTimeout(() => router.push('/'), 800);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      await fetchCandidates();
      if (cancelled) {
        setCandidates(null);
        setError(null);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    candidates,
    error,
    loading,
    refetch: fetchCandidates,
  };
}

