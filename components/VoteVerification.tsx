'use client';

import { useState } from 'react';
import { verifyVotes } from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function VoteVerification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleVerify() {
    setLoading(true);
    setResult(null);

    try {
      const data = await verifyVotes();
      setResult({
        success: true,
        message: data.message || 'Votes verified and synced successfully!',
      });
      // Clear result after 5 seconds
      setTimeout(() => setResult(null), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errorMsg.toLowerCase().includes('unauthorized') || 
          errorMsg.toLowerCase().includes('401') ||
          errorMsg.toLowerCase().includes('403')) {
        setResult({
          success: false,
          message: 'Unauthorized — please login again',
        });
        setTimeout(() => {
          location.href = '/';
        }, 2000);
      } else {
        setResult({
          success: false,
          message: 'Failed to verify votes: ' + errorMsg,
        });
        setTimeout(() => setResult(null), 5000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            Vote Verification
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verify and sync vote counts across the system
          </p>
        </div>
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Verify Votes
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              result.success
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}

