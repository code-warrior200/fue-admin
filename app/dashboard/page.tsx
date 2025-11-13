/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AdminNav from '@/components/AdminNav';
import CandidateForm from '@/components/CandidateForm';
import SummaryTable from '@/components/SummaryTable';
import VoteVerification from '@/components/VoteVerification';
import ResetButton from '@/components/ResetButton';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthed(false);
      router.replace('/');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  if (isAuthed === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <Skeleton className="w-32 sm:w-48 h-6 mb-4" />
        <Skeleton className="w-64 sm:w-80 h-8" />
        <p className="text-gray-500 mt-4 text-sm sm:text-base text-center">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (isAuthed === false) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 px-4">
        <p className="text-sm sm:text-base text-center">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <AdminNav />

      {/* Dashboard Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Candidate Form Section */}
        <motion.div
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
        </motion.div>

        {/* Vote Verification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VoteVerification />
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                Vote Summary
              </CardTitle>
              <div className="w-full sm:w-auto">
                <ResetButton />
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 md:p-6">
              <SummaryTable />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
