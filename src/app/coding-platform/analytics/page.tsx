'use client';

import { useEffect, useRef, useState } from 'react';
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
import { Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

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

const navLinks = [{ name: 'Home', href: '/coding-platform/start' }];

export default function UserSubmissionsTable() {
  const { user, loading: authLoading, logOut } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResultWithId[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const leaderboardDialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [, setActiveSubmission] =
    useState<SubmissionResultWithId | null>(null);

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
        console.error('[fetchUserSubmissions]', error);
        toast.error('Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [user, authLoading]);

  const loadLeaderboard = async (submission: SubmissionResultWithId) => {
    setLeaderboardLoading(true);
    setLeaderboard(null);
    setActiveSubmission(submission);

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
      const userDocs = await Promise.all(
        userIds.map((userId) =>
          getDoc(doc(db, 'users', userId))
            .then((docSnap) => ({ userId, docSnap }))
            .catch(() => ({ userId, docSnap: null }))
        )
      );

      const userNames: Record<string, string> = {};
      for (const { userId, docSnap } of userDocs) {
        if (docSnap?.exists()) {
          const data = docSnap.data();
          userNames[userId] =
            data.displayName || data.email?.split('@')[0] || userId.slice(0, 6);
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
          bestEntries[a.userId].createdAt.seconds - bestEntries[b.userId].createdAt.seconds
        );
      });

      leaderboardArray.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      setLeaderboard(leaderboardArray);
      leaderboardDialogRef.current?.showModal();
    } catch (error) {
      console.error('[loadLeaderboard]', error);
      toast.error('Failed to load leaderboard.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      router.push('/coding-platform/sign-in');
    } catch (error) {
      toast.error(`Failed to sign out.${error}`);

    }
  };

  const formatDate = (timestamp: Timestamp): string => {
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getUserInitials = () =>
    user?.displayName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  if (authLoading || loading) {
    return <LoadingScreen message="Loading your submissions..." />;
  }

  if (!user) {
    return <div className="p-4 text-center text-white">Please sign in.</div>;
  }

  return (
    <div className="p-6 bg-base-100 min-h-screen text-base-content">
      {/* Navbar */}
      <div className="navbar bg-base-200 rounded-lg shadow mb-6">
        <div className="navbar-center  flex-1">
          <Link href="/" className="btn btn-ghost text-xl text-primary">QuizApp</Link>
          <div className="  hidden md:flex ml-6 gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="link link-hover text-sm">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-xs ml-2">{getUserInitials()}</span>
            </div>
          </div>
          <div className="text-sm">
            <div>{user.displayName || 'User'}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
          <button className="btn btn-sm btn-outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="bg-base-200 p-8 rounded-lg shadow text-center">
          <p>You haven&apos;t submitted any tests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-200 p-4 rounded-lg shadow">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th className="text-center">Duration</th>
                <th className="text-center">Score</th>
                <th className="text-center">Challenges</th>
                <th className="text-center">Submitted</th>
                <th className="text-center">Leaderboard</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.testTitle}</td>
                  <td className="max-w-xs truncate">{submission.testDescription}</td>
                  <td className="text-center">{submission.testDuration} min</td>
                  <td className="text-center text-success font-semibold">
                    {submission.earnedPoints} / {submission.totalPoints}
                  </td>
                  <td className="text-center">
                    {submission.noOfChallengesAttempted} / {submission.challenges.length}
                  </td>
                  <td className="text-center">{formatDate(submission.createdAt)}</td>
                  <td className="text-center">
                    <button
                      onClick={() => loadLeaderboard(submission)}
                      className="btn btn-xs btn-primary"
                      disabled={leaderboardLoading}
                    >
                      {leaderboardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leaderboard Dialog */}
      <dialog ref={leaderboardDialogRef} className="modal">
        <div className="modal-box bg-base-200">
          <h3 className="font-bold text-lg text-primary mb-2">🏆 Leaderboard</h3>
          {leaderboard === null ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-gray-400">No leaderboard data available.</p>
          ) : (
            <table className="table table-xs mt-2">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th className="text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={
                      entry.userId === user.uid
                        ? 'bg-primary text-primary-content font-semibold'
                        : ''
                    }
                  >
                    <td>{entry.rank}</td>
                    <td>{entry.name}</td>
                    <td className="text-center">
                      {entry.earnedPoints} / {entry.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
