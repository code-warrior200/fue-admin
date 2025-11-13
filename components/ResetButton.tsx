/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ResetButton.tsx
'use client';

import { useState } from 'react';
import { resetAllVotes, resetAllVotesAlt, resetVotesByPosition, resetVotesByPositionAlt } from '@/lib/api';

interface ResetButtonProps {
  position?: string; // If provided, reset votes for this position only. Otherwise, reset all votes.
  useAltEndpoint?: boolean; // Use alternative endpoints
}

export default function ResetButton({ position, useAltEndpoint = false }: ResetButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    const message = position
      ? `Reset all votes for position "${position}" to 0?`
      : 'Reset all votes in the system to 0?';
    
    if (!confirm(message)) return;
    
    setLoading(true);
    try {
      if (position) {
        // Reset votes for a specific position
        if (useAltEndpoint) {
          await resetVotesByPositionAlt(position);
        } else {
          await resetVotesByPosition(position);
        }
      } else {
        // Reset all votes
        if (useAltEndpoint) {
          await resetAllVotesAlt();
        } else {
          await resetAllVotes();
        }
      }
      // reload to reflect new counts
      location.reload();
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.toLowerCase().includes('unauthorized') || 
          errorMsg.toLowerCase().includes('401') ||
          errorMsg.toLowerCase().includes('403')) {
        alert('Unauthorized — please login again');
        location.href = '/';
      } else {
        alert('Failed to reset: ' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="w-full sm:w-auto px-3 py-1.5 sm:py-1 text-sm sm:text-base border rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {loading ? (
        <span>
          <span className="hidden sm:inline">Resetting...</span>
          <span className="sm:hidden">Resetting</span>
        </span>
      ) : position ? (
        <span>
          <span className="hidden sm:inline">Reset {position} Votes</span>
          <span className="sm:hidden">Reset {position}</span>
        </span>
      ) : (
        <span>
          <span className="hidden sm:inline">Reset All Votes</span>
          <span className="sm:hidden">Reset All</span>
        </span>
      )}
    </button>
  );
}
