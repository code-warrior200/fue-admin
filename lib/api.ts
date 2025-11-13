// lib/api.ts
'use client';

import type { Candidate } from '@/types';

export const API_BASE = 'https://fue-vote-backend.onrender.com';
export const TOKEN_KEY = 'fue_vote_token';

// get/set/clear token helpers
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// wrapper for authenticated fetch requests
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = options.headers
    ? (options.headers as Record<string, string>)
    : {};
  
  // Only set Content-Type for JSON, not for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || res.statusText);
  }
  return res.json();
}

// ============================================
// Admin API Endpoints - Following all 11 routes
// ============================================

// 1. GET /api/admin/candidates - Get all candidates (public view)
export async function getAllCandidates(): Promise<Candidate[]> {
  return apiFetch('/api/admin/candidates', { method: 'GET' });
}

// 2. POST /api/admin/candidates - Create a new candidate (Admin only)
export async function createCandidate(data: {
  name: string;
  position: string;
  image?: File;
}): Promise<Candidate> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('position', data.position);
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiFetch('/api/admin/candidates', {
    method: 'POST',
    body: formData,
  });
}

// 3. POST /api/admin/add-candidate - Create a new candidate - alternative endpoint (Admin only)
export async function createCandidateAlt(data: {
  name: string;
  position: string;
  image?: File;
}): Promise<Candidate> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('position', data.position);
  if (data.image) {
    formData.append('image', data.image);
  }

  return apiFetch('/api/admin/add-candidate', {
    method: 'POST',
    body: formData,
  });
}

// 4. GET /api/admin/all-candidates - Get all candidates with full details (Admin only)
export async function getAllCandidatesFull(): Promise<Candidate[]> {
  return apiFetch('/api/admin/all-candidates', { method: 'GET' });
}

// 5. GET /api/admin/vote-summary - Get vote summary by category (Admin only)
export async function getVoteSummary(category?: string): Promise<any> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch(`/api/admin/vote-summary${query}`, { method: 'GET' });
}

// 6. GET /api/admin/votes/summary - Get vote summary by category - alternative endpoint (Admin only)
export async function getVoteSummaryAlt(category?: string): Promise<any> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch(`/api/admin/votes/summary${query}`, { method: 'GET' });
}

// 7. POST /api/admin/votes/reset - Reset votes for a specific position (Admin only)
export async function resetVotesByPosition(position: string): Promise<any> {
  return apiFetch('/api/admin/votes/reset', {
    method: 'POST',
    body: JSON.stringify({ position }),
  });
}

// 8. POST /api/admin/reset - Reset votes for a specific position - alternative endpoint (Admin only)
export async function resetVotesByPositionAlt(position: string): Promise<any> {
  return apiFetch('/api/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ position }),
  });
}

// 9. DELETE /api/admin/votes/reset-all - Reset all votes in the system (Admin only)
export async function resetAllVotes(): Promise<any> {
  return apiFetch('/api/admin/votes/reset-all', { method: 'DELETE' });
}

// 10. DELETE /api/admin/reset-all - Reset all votes - alternative endpoint (Admin only)
export async function resetAllVotesAlt(): Promise<any> {
  return apiFetch('/api/admin/reset-all', { method: 'DELETE' });
}

// 11. POST /api/admin/votes/verify - Verify and sync vote counts (Admin only)
export async function verifyVotes(): Promise<any> {
  return apiFetch('/api/admin/votes/verify', { method: 'POST' });
}

// GET /api/vote/realtime - Get total votes of each candidate in realtime
export async function getVoteRealtime(): Promise<any> {
  return apiFetch('/api/vote/realtime', { method: 'GET' });
}
