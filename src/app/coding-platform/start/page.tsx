'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/connectDatabase';
import { toast } from 'sonner';
import testSchema from '@/data_schema/challenges';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { user, loading, logOut } = useAuth();
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const db = getFirestore(app);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Analytics", href: "/coding-platform/analytics" },
    { name: "About", href: "/about" },
  ];

  const validateAndStartChallenge = async () => {
    if (!code.trim()) {
      toast.error("Please enter a challenge code");
      return;
    }

    if (!user || !user.uid) {
      toast.error("You must be logged in to start a challenge");
      return;
    }

    setIsChecking(true);

    try {
      const submissionsRef = collection(db, 'codeTestsubmissions');
      const submissionQuery = query(
        submissionsRef,
        where('userId', '==', user.uid),
        where('testId', '==', code.trim())
      );

      const submissionSnapshot = await getDocs(submissionQuery);

      if (!submissionSnapshot.empty) {
        toast.error("You have already attempted this challenge.");
        return;
      }

      const challengeRef = doc(db, 'challenges', code.trim());
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        toast.error("Invalid challenge code.");
        return;
      }

      const challengeData = challengeSnap.data();

      if (testSchema.parse(challengeData)) {
        toast.success("Challenge code validated!");
        router.push(`/coding-platform/start/test/?testId=${code.trim()}`);
      } else {
        toast.error("This challenge has no test cases.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error validating challenge code.");
    } finally {
      setIsChecking(false);
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

  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold text-primary">QuizApp</Link>
        </div>
        <div className="hidden md:flex gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="btn btn-ghost text-sm">
              {link.name}
            </Link>
          ))}
        </div>
        {!loading && user && (
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span>{getUserInitials()}</span>
                </div>
              </div>
              <div className="flex flex-col text-sm leading-tight">
                <span className="font-semibold">{user.displayName || 'User'}</span>
                <span className="text-xs text-base-content/70">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn-outline btn-sm"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-20 gap-6">
        <h1 className="text-3xl font-bold text-center">Enter Challenge Code</h1>
        <input
          type="text"
          placeholder="Enter your challenge code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input input-bordered w-64 text-center"
        />
        <button
          onClick={validateAndStartChallenge}
          disabled={isChecking}
          className="btn btn-primary w-64"
        >
          {isChecking ? "Checking..." : "Start Challenge"}
        </button>
        <p className="text-sm text-base-content/60 text-center max-w-sm">
          Enter the challenge code you received to begin your coding assessment.
        </p>
      </main>
    </div>
  );
}
