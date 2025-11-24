/* eslint-disable @next/next/no-img-element */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import CandidateForm from '@/components/CandidateForm';
import AdminSidebar from '@/components/AdminNav';
import { useCandidates } from '@/hooks/useCandidates';
import { Skeleton } from '@/components/ui/skeleton';

export default function CandidatesPage() {
  // Use all-candidates endpoint for full admin details
  const { candidates, error, loading } = useCandidates({ 
    sortByVotes: false,
    useFullDetails: true 
  });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 transition-all">

        {/* Candidate Form Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-md">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                Add New Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <CandidateForm />
            </CardContent>
          </Card>
        </motion.div> */}

        <h1 className="text-2xl font-bold mt-15 text-gray-800 dark:text-gray-100 mb-6">
          Candidates
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-48 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && candidates && candidates.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-500 dark:text-gray-400">No candidates found.</p>
          </div>
        )}

        {!loading && candidates && candidates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate._id ?? candidate.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-shadow flex flex-col"
              >
                {candidate.image ? (
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-40 sm:h-32 md:h-36 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-40 sm:h-32 md:h-36 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {candidate.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 truncate">{candidate.position}</p>
                <p className="mt-2 font-medium text-gray-700 dark:text-gray-200">
                  Votes: {candidate.votes}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
