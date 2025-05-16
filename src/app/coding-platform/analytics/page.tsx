'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/connectDatabase';
import { useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingScreen from '@/components/LoadingScreen';
import { Loader2, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Link from 'next/link';

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

const navLinks = [
  { name: 'Home', href: '/coding-platform/start' },
];

export default function UserSubmissionsTable() {
  const { user, loading: authLoading, logOut } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResultWithId[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [, setActiveSubmission] = useState<SubmissionResultWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchUserSubmissions = async () => {
      try {
        setLoading(true);

        const submissionsQuery = query(
          collection(db, 'codeTestsubmissions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const submissionsSnap = await getDocs(submissionsQuery);

        if (submissionsSnap.empty) {
          setSubmissions([]);
          return;
        }

        const userSubmissions: SubmissionResultWithId[] = submissionsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as SubmissionResult),
        }));

        const latestSubmissions: Record<string, SubmissionResultWithId> = {};
        userSubmissions.forEach((submission) => {
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
        console.error('[fetchUserSubmissions] Failed to fetch submissions:', error);
        toast.error('Failed to load submissions. Please try again.');
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

      leaderboardSnap.forEach((docSnap) => {
        const data = docSnap.data() as SubmissionResult;
        if (data.userId && data.createdAt) {
          tempEntries.push({
            userId: data.userId,
            earnedPoints: data.earnedPoints || 0,
            totalPoints: data.totalPoints || 0,
            createdAt: data.createdAt,
          });
        } else {
          console.warn('[loadLeaderboard] Skipped malformed entry:', docSnap.id);
        }
      });

      const bestEntries: Record<string, typeof tempEntries[0]> = {};
      for (const entry of tempEntries) {
        const currentBest = bestEntries[entry.userId];
        if (
          !currentBest ||
          entry.earnedPoints > currentBest.earnedPoints ||
          (entry.earnedPoints === currentBest.earnedPoints &&
            entry.createdAt.seconds < currentBest.createdAt.seconds)
        ) {
          bestEntries[entry.userId] = entry;
        }
      }

      const userIds = Object.keys(bestEntries);
      const userDocsPromises = userIds.map((userId) =>
        getDoc(doc(db, 'users', userId))
          .then((docSnap) => ({ userId, docSnap }))
          .catch((err) => {
            console.warn(`[loadLeaderboard] Failed to get user ${userId}:`, err);
            return { userId, docSnap: null };
          })
      );

      const userDocs = await Promise.all(userDocsPromises);
      const userNames: Record<string, string> = {};

      for (const { userId, docSnap } of userDocs) {
        if (docSnap?.exists()) {
          const userData = docSnap.data();
          userNames[userId] =
            userData.displayName || userData.email?.split('@')[0] || userId.slice(0, 6);
        } else {
          userNames[userId] = userId.slice(0, 6);
        }
      }

      const leaderboardArray: LeaderboardEntry[] = userIds.map((userId) => ({
        userId,
        name: userNames[userId],
        earnedPoints: bestEntries[userId].earnedPoints,
        totalPoints: bestEntries[userId].totalPoints,
        rank: 0,
      }));

      leaderboardArray.sort((a, b) => {
        const diff = b.earnedPoints - a.earnedPoints;
        if (diff !== 0) return diff;
        return (
          bestEntries[a.userId].createdAt.seconds -
          bestEntries[b.userId].createdAt.seconds
        );
      });

      leaderboardArray.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      setLeaderboard(leaderboardArray);
    } catch (error) {
      console.error('[loadLeaderboard] Failed to load leaderboard:', error);
      toast.error('Failed to load leaderboard. Please try again.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      router.push('/coding-platform/sign-in');
    } catch (error) {
      console.error('[handleSignOut] Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const formatDate = (timestamp: Timestamp): string => {
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch (e) {
      console.warn('[formatDate] Invalid timestamp:', timestamp);
      console.log("error in formatdate:",e)
      return 'Invalid date';
    }
  };

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading your submissions..." />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-white">
        Please sign in to view your submissions.
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans text-slate-100">
      {/* Navigation Bar */}
      <nav className="p-4 mb-6 flex justify-between items-center bg-slate-800 rounded-lg shadow-lg">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl tracking-wide text-cyan-400 hover:text-cyan-300 transition">
            QuizApp
          </Link>
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm text-slate-200 hover:text-cyan-300 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-cyan-500 after:transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-slate-600">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-cyan-700 text-slate-100">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-100">{user.displayName || 'User'}</span>
              <span className="text-xs text-slate-300">{user.email}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="bg-slate-700 text-slate-100 border border-slate-600 hover:bg-slate-600 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      {submissions.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
          <p className="text-center text-slate-300 text-lg">
            You haven&apos;t submitted any tests yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-800 p-4 rounded-lg shadow-lg">
          <table className="min-w-full text-sm rounded-md overflow-hidden">
            <thead className="bg-slate-700 text-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Test Title</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-2 py-3 text-center font-medium">Duration</th>
                <th className="px-2 py-3 text-center font-medium">Score</th>
                <th className="px-2 py-3 text-center font-medium">Challenges</th>
                <th className="px-2 py-3 text-center font-medium">Submitted</th>
                <th className="px-2 py-3 text-center font-medium">Leaderboard</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-t border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white">{submission.testTitle}</td>
                  <td className="px-4 py-3 truncate max-w-[250px] text-slate-300">{submission.testDescription}</td>
                  <td className="px-2 py-3 text-center text-slate-300">{submission.testDuration} min</td>
                  <td className="px-2 py-3 text-center text-emerald-400 font-semibold">
                    {submission.earnedPoints} / {submission.totalPoints}
                  </td>
                  <td className="px-2 py-3 text-center text-slate-300">
                    {submission.noOfChallengesAttempted} / {submission.challenges.length}
                  </td>
                  <td className="px-2 py-3 text-center text-slate-400">
                    {formatDate(submission.createdAt)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-cyan-700 text-white border-none hover:bg-cyan-600"
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
                      <DialogContent className="max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
                        <DialogTitle className="text-lg font-semibold text-center mb-4 text-cyan-300">
                          🏆 Leaderboard
                        </DialogTitle>

                        {leaderboard === null ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                          </div>
                        ) : leaderboard.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            No leaderboard data available.
                          </div>
                        ) : (
                          <table className="w-full text-xs border border-slate-700 rounded-md overflow-hidden">
                            <thead className="bg-slate-700 text-slate-200">
                              <tr>
                                <th className="px-2 py-2 font-medium">Rank</th>
                                <th className="px-2 py-2 font-medium">User</th>
                                <th className="px-2 py-2 font-medium">Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leaderboard.map((entry) => (
                                <tr
                                  key={entry.userId}
                                  className={
                                    entry.userId === user.uid
                                      ? 'bg-cyan-900 font-semibold text-cyan-100'
                                      : 'hover:bg-slate-700 text-slate-200'
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
