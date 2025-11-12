// Custom hook for fetching candidates
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { Candidate } from '@/types';

interface UseCandidatesOptions {
  sortByVotes?: boolean;
  autoRedirect?: boolean;
}

interface UseCandidatesReturn {
  candidates: Candidate[] | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useCandidates(
  options: UseCandidatesOptions = { sortByVotes: false, autoRedirect: true }
): UseCandidatesReturn {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch('/api/candidates');
      
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
      
      if (errorMessage === 'unauthorized' && options.autoRedirect) {
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

