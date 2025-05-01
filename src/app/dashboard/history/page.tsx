'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/connectDatabase';
import { collection, getDocs, query, where, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  Trash2, 
  Edit, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  createdBy?: string; // Optional field for creator info
};

function ChallengeHistory() {
  const [challenges, setChallenges] = useState<ChallengesDocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  const { user, role } = useAuth();
  
  const isSuperAdmin = role === UserRole.quiz_app_superadmin;
  
  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const challengeCollectionRef = collection(db, 'challenges');
        let challengesQuery;
        
        // If superadmin, fetch all challenges; otherwise, fetch only the user's challenges
        if (isSuperAdmin) {
          challengesQuery = query(challengeCollectionRef);
        } else {
          // Regular admin can only see their own challenges
          if (!user?.uid) {
            throw new Error("User ID not available");
          }
          challengesQuery = query(challengeCollectionRef, where("userId", "==", user.uid));
        }
        
        const snapshot = await getDocs(challengesQuery);
        
        if (snapshot.empty) {
          setChallenges([]);
          setLoading(false);
          return;
        }
        
        const challengesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChallengesDocumentData[];
        
        setChallenges(challengesData);
      } catch (error) {
        console.error('Error fetching challenges: ', error);
        setError('Failed to load challenges. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user?.uid, isSuperAdmin]);

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
  
  const handleDeleteClick = (challengeId: string) => {
    setChallengeToDelete(challengeId);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!challengeToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'challenges', challengeToDelete));
      setChallenges(challenges.filter(challenge => challenge.id !== challengeToDelete));
      toast.success('Challenge deleted successfully');
    } catch (error) {
      console.error('Error deleting challenge: ', error);
      toast.error('Failed to delete challenge');
    } finally {
      setDeleteDialogOpen(false);
      setChallengeToDelete(null);
    }
  };
  
  const toggleCardExpansion = (challengeId: string) => {
    if (expandedCard === challengeId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(challengeId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Challenge History</h1>
        {isSuperAdmin && (
          <div className="text-sm text-gray-500">
            Viewing as Super Admin - All challenges visible
          </div>
        )}
      </div>
      
      {challenges.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Challenges Found</h2>
          <p className="text-gray-500 mb-6">
            {isSuperAdmin 
              ? "There are no challenges in the system yet." 
              : "You haven't created any challenges yet."}
          </p>
          <Link href="/dashboard/challenges" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            Create New Challenge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
          {challenges.map((challenge) => {
            // Safely calculate noOfChallengesAttempted if not present
            const problemCount = challenge.noOfChallengesAttempted || challenge.challenges?.length || 0;
            // Safely handle testDuration fallback
            const testDuration = challenge.testDuration || 0;
            const isExpanded = expandedCard === challenge.id;

            return (
              <div
                key={challenge.id}
                className={`bg-white rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-all ${
                  isExpanded ? 'col-span-1 sm:col-span-2' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-purple-700 truncate" title={challenge.testTitle}>
                      {challenge.testTitle}
                    </h2>
                    <button
                      onClick={() => toggleCardExpansion(challenge.id)}
                      className="text-gray-500 hover:text-purple-700"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  
                  <p className={`text-gray-600 mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {challenge.testDescription}
                  </p>

                  {/* Badges for Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      Duration: {testDuration} min
                    </span>
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Problems: {problemCount}
                    </span>
                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Points: {challenge.totalPoints || 0}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h3 className="font-semibold text-purple-600 mb-2">Challenges:</h3>
                      <ul className="space-y-2 pl-4">
                        {challenge.challenges?.map((item, idx) => (
                          <li key={idx} className="text-gray-700">
                            <span className="font-medium">{item.title}</span>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 space-y-2">
                    <p className="flex items-center flex-wrap">
                      <span className="font-semibold text-gray-700">Shareable Code:</span>&nbsp;
                      <span className="text-purple-600 font-mono truncate">{challenge.id}</span>
                      <button
                        onClick={() => handleCopy(challenge.id)}
                        className="ml-2 p-1 text-purple-500 hover:text-purple-700 transition-colors"
                        title="Copy Code"
                      >
                        <Copy size={16} />
                      </button>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Created:</span>{' '}
                      {challenge.createdAt?.toDate 
                        ? format(challenge.createdAt.toDate(), 'dd MMM yyyy, hh:mm a')
                        : 'Unknown date'}
                    </p>
                    
                    {isSuperAdmin && challenge.userId && (
                      <p>
                        <span className="font-semibold text-gray-700">Created By:</span>{' '}
                        <span className="text-gray-600">{challenge.userId}</span>
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    {/* All admins can edit their own challenges */}
                    <Link
                      href={`/dashboard/challenges/edit-challenge/?testId=${challenge.id}`}
                      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit Challenge"
                    >
                      <Edit size={18} />
                    </Link>
                    
                    {/* Only superadmins can delete challenges */}
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteClick(challenge.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Challenge"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the challenge
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChallengeHistory;