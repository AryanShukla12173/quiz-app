'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/connectDatabase';
import { toast } from 'sonner';
import testSchema from '@/data_schema/challenges';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { user, loading, logOut } = useAuth(); // Use only the context
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
      // First check if this user has already attempted this test
      const submissionsRef = collection(db, 'codeTestsubmissions');
      const submissionQuery = query(
        submissionsRef,
        where('userId', '==', user.uid),
        where('testId', '==', code.trim())
      );
      
      const submissionSnapshot = await getDocs(submissionQuery);
      
      if (!submissionSnapshot.empty) {
        toast.error("You have already attempted this challenge. You cannot retake it.");
        setIsChecking(false);
        return;
      }

      // Now check if the challenge code is valid
      const challengeRef = doc(db, 'challenges', code.trim());
      const challengeSnap = await getDoc(challengeRef);

      if (!challengeSnap.exists()) {
        toast.error("Invalid challenge code. Please check and try again.");
        return;
      }

      const challengeData = challengeSnap.data();
      console.log(challengeData.challenges[0].testcases);

      if (!challengeData) {
        toast.error("Challenge data not found");
        return;
      }

      if (testSchema.parse(challengeData)) {
        toast.success("Challenge code validated successfully!");
        setTimeout(() => {
          router.push(`/coding-platform/start/test/?testId=${code.trim()}`);
        }, 1000);
      } else {
        toast.error("This challenge has no test cases. Please try another code.");
      }

    } catch (error) {
      console.error("Error checking challenge:", error);
      toast.error("An error occurred while checking the challenge code");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut(); // Use the context's logOut function
      router.push('/coding-platform/sign-in'); // Redirect where you want after logout
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out. Please try again.");
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
    <div className="min-h-screen flex flex-col bg-grid-pattern text-white">
      {/* Navigation Bar */}
      <nav className="p-4 flex justify-between items-center shadow-md">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-2xl tracking-wide hover:text-mint-400 transition">
            QuizApp 
          </Link>
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm hover:text-mint-300 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-mint-400 after:transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {!loading && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="bg-black text-white hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <h1 className="text-3xl font-bold text-center">Enter Challenge Code</h1>
        <Input
          placeholder="Enter your challenge code"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-64 bg-slate-800 border border-slate-700 text-white"
        />
        <Button
          onClick={validateAndStartChallenge}
          disabled={isChecking}
          className="w-64"
        >
          {isChecking ? "Checking..." : "Start Challenge"}
        </Button>
        <p className="text-sm text-gray-400 text-center">
          Enter the challenge code you received to start your coding assessment.
        </p>
      </div>
    </div>
  );
}