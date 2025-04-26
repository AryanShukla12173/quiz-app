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
  const [activeSubmission, setActiveSubmission] = useState<SubmissionResultWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchUserSubmissions();
  }, [user, authLoading]);

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

      // Batch fetch user profiles
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
    return <div className="p-4 text-center">Please sign in to view your submissions.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">📚 Your Test Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-center text-gray-500">You haven't submitted any tests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
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
              {submissions.map((submission, index) => (
                <tr key={submission.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-medium">{submission.testTitle}</td>
                  <td className="px-4 py-2 truncate max-w-[200px]">{submission.testDescription}</td>
                  <td className="px-2 py-2 text-center">{submission.testDuration} min</td>
                  <td className="px-2 py-2 text-center">
                    {submission.earnedPoints} / {submission.totalPoints}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {submission.noOfChallengesAttempted} / {submission.challenges.length}
                  </td>
                  <td className="px-2 py-2 text-center">{formatDate(submission.createdAt)}</td>
                  <td className="px-2 py-2 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => loadLeaderboard(submission)}
                          disabled={leaderboardLoading}
                        >
                          {leaderboardLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'View'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogTitle className="text-lg font-bold text-center mb-4">
                          🏆 Leaderboard
                        </DialogTitle>

                        {leaderboard === null ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                          </div>
                        ) : leaderboard.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            No leaderboard data available.
                          </div>
                        ) : (
                          <table className="w-full text-xs border">
                            <thead className="bg-gray-50">
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
                                  className={entry.userId === user.uid ? 'bg-blue-100 font-bold' : ''}
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
