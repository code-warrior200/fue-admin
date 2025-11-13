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
      <div className="flex flex-col items-center justify-center h-screen">
        <Skeleton className="w-48 h-6 mb-4" />
        <Skeleton className="w-80 h-8" />
        <p className="text-gray-500 mt-4">Checking authentication...</p>
      </div>
    );
  }

  if (isAuthed === false) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <AdminNav />

      {/* Dashboard Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Candidate Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Add New Candidate
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Vote Summary
              </CardTitle>
              <ResetButton />
            </CardHeader>
            <CardContent>
              <SummaryTable />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
