'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/components/hooks/get-user';
import { getAuth, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/connectDatabase';
import { toast } from 'sonner';
import testSchema from '@/data_schema/challenges';
export default function Page() {
  const { user, loading } = useAuthUser(true);
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  const db = getFirestore(app);

  const validateAndStartChallenge = async () => {
    if (!code.trim()) {
      toast.error("Please enter a challenge code");
      return;
    }

    setIsChecking(true);
    
    try {
      // Get document from challenges collection
      const challengeRef = doc(db, 'challenges', code.trim());
      const challengeSnap = await getDoc(challengeRef);
      
      if (!challengeSnap.exists()) {
        toast.error("Invalid challenge code. Please check and try again.");
        return;
      }
      
      // Get the challenge data
      const challengeData = challengeSnap.data();
      console.log(challengeData.challenges[0].testcases)
      // Simple validation without Zod
      if (!challengeData) {
        toast.error("Challenge data not found");
        return;
      }

      if (testSchema.parse(challengeData)) {
        toast.success("Challenge code validated successfully!");
        // Navigate to the challenge page
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
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <div className="font-bold text-xl">Quiz Challenge</div>
        
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
                <span className="text-xs text-slate-300">{user.email}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="text-white border-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Enter Challenge Code</h1>
        <Input
          placeholder="Enter your challenge code"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-64"
        />
        <Button 
          onClick={validateAndStartChallenge} 
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Start Challenge"}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Enter the challenge code you received to start your coding assessment.
        </p>
      </div>
    </div>
  );
}