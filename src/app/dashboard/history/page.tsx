'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/connectDatabase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'sonner';

type ChallengesDocumentData = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  earnedPoints: number;
  totalPoints: number;
  testId: string;
  testTitle: string;
  testDescription: string;
  testDuration: number;
  testStartTime: Timestamp;
  testEndTime: Timestamp;
  noOfChallengesAttempted: number;
  challenges: {
    title: string;
    description: string;
    attempted: boolean;
    testcases: {
      description: string;
      input: string;
      expectedOutput: string;
      hidden: boolean;
    }[];
  }[];
};

function ChallengeHistory() {
  const [challenges, setChallenges] = useState<ChallengesDocumentData[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const challengeCollectionRef = collection(db, 'challenges');
        const snapshot = await getDocs(challengeCollectionRef);
        const challengesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChallengesDocumentData[];
        setChallenges(challengesData);
      } catch (error) {
        console.error('Error fetching challenges: ', error);
      }
    };

    fetchChallenges();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Shareable code copied!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy.');
      });
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-10 text-purple-700">Challenge History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl">
        {challenges.map((challenge) => {
          // Safely calculate noOfChallengesAttempted if not present
          const problemCount = challenge.noOfChallengesAttempted || challenge.challenges.length;
          // Safely handle testDuration fallback
          const testDuration = challenge.testDuration || 0;

          return (
            <div
              key={challenge.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all"
            >
              <h2 className="text-xl font-bold text-purple-700 mb-2">{challenge.testTitle}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{challenge.testDescription}</p>

              {/* Badges for Duration and Problems */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                  Duration: {testDuration} min
                </span>
                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Problems: {problemCount}
                </span>
              </div>

              <div className="text-sm text-gray-500 space-y-2">
                <p className="flex items-center flex-wrap">
                  <span className="font-semibold text-gray-700">Shareable Code:</span>&nbsp;
                  <span className="text-purple-600 font-mono truncate">{challenge.id}</span>
                  <button
                    onClick={() => handleCopy(challenge.id)}
                    className="ml-2 px-3 py-1 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Created At:</span>{' '}
                  {format(challenge.createdAt.toDate(), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChallengeHistory;
