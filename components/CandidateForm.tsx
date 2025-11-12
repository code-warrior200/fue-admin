'use client';

import { useState } from 'react';
import { getToken, API_BASE } from '@/lib/api';

interface CandidateFormProps {
  onCandidateAdded?: () => void;
}

const addCandidate = async (candidate: { name: string; position: string; image?: File }) => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('name', candidate.name);
  formData.append('position', candidate.position);
  if (candidate.image) {
    formData.append('image', candidate.image);
  }

  const res = await fetch(`${API_BASE}/api/admin/add-candidate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Failed to add candidate: ${res.statusText}`);
  }

  return res.json();
};

export default function CandidateForm({ onCandidateAdded }: CandidateFormProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addCandidate({ name, position, image: image ?? undefined });
      setName('');
      setPosition('');
      setImage(null);
      setPreview(null);
      setSuccess(true);
      if (onCandidateAdded) {
        onCandidateAdded();
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add candidate';
      console.error('Error adding candidate:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Add Candidate
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-green-600 dark:text-green-400 text-sm">
            Candidate added successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name Input */}
        <div className="relative">
          <input
            type="text"
            id="name"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="peer w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 pt-5 text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label
            htmlFor="name"
            className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Candidate Name
          </label>
        </div>

        {/* Position Input */}
        <div className="relative">
          <input
            type="text"
            id="position"
            placeholder=" "
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="peer w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 pt-5 text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label
            htmlFor="position"
            className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Position
          </label>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover mb-3 border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 border border-gray-300 dark:border-gray-600 text-gray-400">
              Preview
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Adding...
            </>
          ) : (
            'Add Candidate'
          )}
        </button>
      </form>
    </div>
  );
}
