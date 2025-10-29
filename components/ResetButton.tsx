/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ResetButton.tsx
'use client';

import { apiFetch } from '@/lib/api';

export default function ResetButton() {
  async function handleReset() {
    if (!confirm('Reset all votes to 0?')) return;
    try {
      await apiFetch('/api/reset', { method: 'POST' });
      // reload to reflect new counts
      location.reload();
    } catch (err: any) {
      if (err.message === 'unauthorized') {
        alert('Unauthorized — please login again');
        location.href = '/';
      } else {
        alert('Failed to reset: ' + (err.message || 'Unknown error'));
      }
    }
  }

  return (
    <button onClick={handleReset} className="px-3 py-1 border rounded bg-red-50">
      Reset All Votes
    </button>
  );
}
