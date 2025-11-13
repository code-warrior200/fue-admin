'use client';

import { useState } from 'react';
import { createCandidate, createCandidateAlt } from '@/lib/api';

interface CandidateFormProps {
  onCandidateAdded?: () => void;
}

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
      // Try primary endpoint first, fallback to alternative
      try {
        await createCandidate({ name, position, image: image ?? undefined });
      } catch (primaryError) {
        // If primary endpoint fails, try alternative endpoint
        await createCandidateAlt({ name, position, image: image ?? undefined });
      }
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
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
        Add Candidate
      </h2>

      {error && (
        <div className="mb-3 sm:mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3">
          <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 sm:mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-3">
          <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
            Candidate added successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {/* Name Input */}
        <div className="relative">
          <input
            type="text"
            id="name"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="peer w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 pt-4 sm:pt-5 text-sm sm:text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label
            htmlFor="name"
            className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-gray-500 dark:text-gray-400 text-xs sm:text-sm transition-all peer-placeholder-shown:top-4 sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-focus:top-2.5 sm:peer-focus:top-3 peer-focus:text-xs sm:peer-focus:text-sm peer-focus:text-blue-500"
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
            className="peer w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 pt-4 sm:pt-5 text-sm sm:text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label
            htmlFor="position"
            className="absolute left-3 sm:left-4 top-2.5 sm:top-3 text-gray-500 dark:text-gray-400 text-xs sm:text-sm transition-all peer-placeholder-shown:top-4 sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-focus:top-2.5 sm:peer-focus:top-3 peer-focus:text-xs sm:peer-focus:text-sm peer-focus:text-blue-500"
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
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-3 border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 border border-gray-300 dark:border-gray-600 text-gray-400 text-xs sm:text-sm">
              Preview
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 w-full max-w-xs"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 text-sm sm:text-base"
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
