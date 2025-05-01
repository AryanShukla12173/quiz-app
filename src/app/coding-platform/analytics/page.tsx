'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/connectDatabase';
import {
  getDocs,
  collection,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import LoadingScreen from '@/components/LoadingScreen';
import { Loader2 } from 'lucide-react';

export type SubmissionResult = {
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

type SubmissionResultWithId = SubmissionResult & { id: string };

type LeaderboardEntry = {
  userId: string;
  name: string;
  earnedPoints: number;
  totalPoints: number;
  rank: number;
};

export default function UserSubmissionsTable() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResultWithId[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [, setActiveSubmission] = useState<SubmissionResultWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;
    const fetchUserSubmissions = async () => {
      if (!user?.uid) return;
  
      try {
        setLoading(true);
  
        const submissionsQuery = query(
          collection(db, 'codeTestsubmissions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
  
        const submissionsSnap = await getDocs(submissionsQuery);
  
        if (submissionsSnap.empty) {
          setLoading(false);
          return;
        }
  
        const userSubmissions: SubmissionResultWithId[] = submissionsSnap.docs.map(docSnap => {
          const data = docSnap.data() as SubmissionResult;
          return { id: docSnap.id, ...data };
        });
  
        const latestSubmissions: Record<string, SubmissionResultWithId> = {};
  
        userSubmissions.forEach(submission => {
          const { testId } = submission;
          if (
            !latestSubmissions[testId] ||
            submission.createdAt.seconds > latestSubmissions[testId].createdAt.seconds
          ) {
            latestSubmissions[testId] = submission;
          }
        });
  
        setSubmissions(Object.values(latestSubmissions));
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSubmissions();
  }, [user, authLoading]);



  const loadLeaderboard = async (submission: SubmissionResultWithId) => {
    setActiveSubmission(submission);
    setLeaderboard(null);
    setLeaderboardLoading(true);

    try {
      const leaderboardQuery = query(
        collection(db, 'codeTestsubmissions'),
        where('testId', '==', submission.testId)
      );

      const leaderboardSnap = await getDocs(leaderboardQuery);
      const tempEntries: {
        userId: string;
        earnedPoints: number;
        totalPoints: number;
        createdAt: Timestamp;
      }[] = [];

      leaderboardSnap.forEach(docSnap => {
        const data = docSnap.data() as SubmissionResult;
        const { userId, earnedPoints = 0, totalPoints = 0, createdAt } = data;
        tempEntries.push({ userId, earnedPoints, totalPoints, createdAt });
      });

      const bestEntries: Record<string, typeof tempEntries[0]> = {};

      tempEntries.forEach(entry => {
        const currentBest = bestEntries[entry.userId];
        if (
          !currentBest ||
          entry.earnedPoints > currentBest.earnedPoints ||
          (entry.earnedPoints === currentBest.earnedPoints &&
            entry.createdAt.seconds < currentBest.createdAt.seconds)
        ) {
          bestEntries[entry.userId] = entry;
        }
      });

      const userIds = Object.keys(bestEntries);

      const userDocsPromises = userIds.map(userId =>
        getDoc(doc(db, 'users', userId)).then(docSnap => ({ userId, docSnap }))
      );
      const userDocs = await Promise.all(userDocsPromises);

      const userNames: Record<string, string> = {};

      userDocs.forEach(({ userId, docSnap }) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.displayName) {
            userNames[userId] = userData.displayName;
          } else if (userData.email) {
            userNames[userId] = userData.email.split('@')[0];
          } else {
            userNames[userId] = userId.slice(0, 6);
          }
        } else {
          userNames[userId] = userId.slice(0, 6);
        }
      });

      const leaderboardArray: LeaderboardEntry[] = userIds.map(userId => ({
        userId,
        name: userNames[userId],
        earnedPoints: bestEntries[userId].earnedPoints,
        totalPoints: bestEntries[userId].totalPoints,
        rank: 0,
      }));

      leaderboardArray.sort((a, b) => {
        const pointsDiff = b.earnedPoints - a.earnedPoints;
        if (pointsDiff !== 0) return pointsDiff;

        const aCreatedAt = bestEntries[a.userId].createdAt.seconds;
        const bCreatedAt = bestEntries[b.userId].createdAt.seconds;
        return aCreatedAt - bCreatedAt;
      });

      leaderboardArray.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboard(leaderboardArray);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const formatDate = (timestamp: Timestamp): string => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading your submissions..." />;
  }

  if (!user) {
    return <div className="p-4 text-center text-white">Please sign in to view your submissions.</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen font-sans text-gray-100">
    <h2 className="text-3xl font-semibold mb-8 text-center text-white">
      📚 Your Test Submissions
    </h2>
  
    {submissions.length === 0 ? (
      <p className="text-center text-gray-400">You haven&apos;t submitted any tests yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-gray-800 border border-gray-700 rounded-md shadow-md">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Test Title</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-2 py-3 text-center">Duration</th>
              <th className="px-2 py-3 text-center">Score</th>
              <th className="px-2 py-3 text-center">Challenges</th>
              <th className="px-2 py-3 text-center">Submitted</th>
              <th className="px-2 py-3 text-center">Leaderboard</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-t border-gray-700 hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{submission.testTitle}</td>
                <td className="px-4 py-3 truncate max-w-[250px] text-gray-300">{submission.testDescription}</td>
                <td className="px-2 py-3 text-center text-gray-300">{submission.testDuration} min</td>
                <td className="px-2 py-3 text-center text-green-400 font-semibold">
                  {submission.earnedPoints} / {submission.totalPoints}
                </td>
                <td className="px-2 py-3 text-center text-gray-300">
                  {submission.noOfChallengesAttempted} / {submission.challenges.length}
                </td>
                <td className="px-2 py-3 text-center text-gray-400">
                  {formatDate(submission.createdAt)}
                </td>
                <td className="px-2 py-3 text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-700 text-gray-300 hover:bg-gray-600"
                        onClick={() => loadLeaderboard(submission)}
                        disabled={leaderboardLoading}
                      >
                        {leaderboardLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'View'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
                      <DialogTitle className="text-lg font-semibold text-center mb-4 text-white">
                        🏆 Leaderboard
                      </DialogTitle>
  
                      {leaderboard === null ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          No leaderboard data available.
                        </div>
                      ) : (
                        <table className="w-full text-xs border border-gray-700 rounded-md overflow-hidden">
                          <thead className="bg-gray-700 text-gray-300">
                            <tr>
                              <th className="px-2 py-2">Rank</th>
                              <th className="px-2 py-2">User</th>
                              <th className="px-2 py-2">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.map(entry => (
                              <tr
                                key={entry.userId}
                                className={
                                  entry.userId === user.uid
                                    ? 'bg-blue-900 font-semibold text-blue-300'
                                    : 'hover:bg-gray-700'
                                }
                              >
                                <td className="px-2 py-2 text-center">{entry.rank}</td>
                                <td className="px-2 py-2">{entry.name}</td>
                                <td className="px-2 py-2 text-center">
                                  {entry.earnedPoints} / {entry.totalPoints}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
  

  );
}
