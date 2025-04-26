'use client'

import { useEffect, useState } from 'react'
import { getDocs, collection, query, where, orderBy, Timestamp, doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/lib/connectDatabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

type TestCase = {
  description: string
  input: string
  expectedOutput: string
  hidden: boolean
}

type Challenge = {
  title: string
  description: string
  testcases: TestCase[]
}

type SubmissionResult = {
  id : string
  userId: string
  createdAt: Timestamp
  earnedPoints: number
  totalPoints: number
  testId: string
  challenges: Challenge[]
}

type LeaderboardEntry = {
  userId: string
  name: string
  earnedPoints: number
  totalPoints: number
  rank: number
}

export default function UserSubmissionsTable() {
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null)
  const [activeSubmission, setActiveSubmission] = useState<SubmissionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()
  const hardcodedUserId = auth.currentUser?.uid || null // Replace with your hardcoded user ID or logic to get it
  useEffect(() => {
    fetchUserSubmissions()
  }, [])

  const fetchUserSubmissions = async () => {
    if (!hardcodedUserId) {
      console.error("No userId provided for fetching submissions.")
      return
    }

    try {
      setLoading(true)
      
      // Query all submissions for this user
      const submissionsQuery = query(
        collection(db, 'codeTestsubmissions'), 
        where('userId', '==', hardcodedUserId),
        orderBy('createdAt', 'desc') // Order by creation time, newest first
      )
      
      const submissionsSnap = await getDocs(submissionsQuery)
      
      if (submissionsSnap.empty) {
        console.log('No submissions found for user:', hardcodedUserId)
        setLoading(false)
        return
      }
      
      const userSubmissions = submissionsSnap.docs.map(doc => {
        return { id: doc.id, ...doc.data() } as SubmissionResult
      })
      
      // Group submissions by testId and keep only the latest one for each test
      const latestSubmissions: Record<string, SubmissionResult> = {}
      
      userSubmissions.forEach(submission => {
        const { testId } = submission
        
        // If we haven't seen this testId yet or this submission is newer,
        // update the latest submission for this testId
        if (!latestSubmissions[testId] || 
            submission.createdAt.seconds > latestSubmissions[testId].createdAt.seconds) {
          latestSubmissions[testId] = submission
        }
      })
      
      // Convert the grouped submissions object to an array
      const latestSubmissionsArray = Object.values(latestSubmissions)
      
      setSubmissions(latestSubmissionsArray)
    } catch (error) {
      console.error("Error fetching user submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async (submission: SubmissionResult) => {
    setActiveSubmission(submission)
    setLeaderboard(null) // Reset leaderboard while loading
    
    try {
      // Get all submissions for this test ID
      const q = query(
        collection(db, 'codeTestsubmissions'), 
        where('testId', '==', submission.testId)
      )
      
      const snap = await getDocs(q)
      const userStats: Record<string, LeaderboardEntry> = {}
      
      // Process submissions to build leaderboard
      snap.forEach((doc) => {
        const data = doc.data() as SubmissionResult
        const { userId, earnedPoints = 0, totalPoints = 0 } = data
        
        // Keep only the highest score for each user
        if (!userStats[userId] || userStats[userId].earnedPoints < earnedPoints) {
          userStats[userId] = {
            userId,
            name: "Anonymous User", // Default fallback name
            earnedPoints,
            totalPoints,
            rank: 0 // Will be assigned later
          }
        }
      })
      
      // Fetch user details from Firebase Auth-generated Firestore documents
      const userIds = Object.keys(userStats)
      
      for (const userId of userIds) {
        try {
          // Check if user data exists in the users collection (where Firebase Auth stores user data)
          const userDocRef = doc(db, 'users', userId)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Use the display name from Firebase Auth, stored in Firestore
            if (userData.displayName) {
              userStats[userId].name = userData.displayName
            } else if (userData.email) {
              // Use email as fallback, but only show the part before @
              const emailName = userData.email.split('@')[0]
              userStats[userId].name = emailName
            }
          }
        } catch (error) {
          console.error(`Error fetching user data for ${userId}:`, error)
        }
      }
      
      // Convert to array and sort by points
      const leaderboardArray = Object.values(userStats).sort(
        (a, b) => b.earnedPoints - a.earnedPoints
      )
      
      // Assign rankings
      leaderboardArray.forEach((entry, index) => {
        entry.rank = index + 1
      })
      
      setLeaderboard(leaderboardArray)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  // Helper function to get test title (first challenge title or testId if no challenges)
  const getTestTitle = (submission: SubmissionResult): string => {
    if (submission.challenges && submission.challenges.length > 0) {
      return submission.challenges[0].title
    }
    return submission.testId
  }

  if (loading) {
    return <div className="p-4">Loading submissions...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Test Submissions</h2>
      
      {submissions.length === 0 ? (
        <p>You haven't submitted any tests yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1">Test Title</th>
              <th className="px-2 py-1">Score</th>
              <th className="px-2 py-1">Submission Date</th>
              <th className="px-2 py-1">Leaderboard</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => {
              // Format the timestamp to a readable date
              const submittedDate = submission.createdAt 
                ? new Date(submission.createdAt.seconds * 1000).toLocaleDateString()
                : 'Unknown'
                
              return (
                <tr key={index} className="border-t">
                  <td className="px-2 py-1">{getTestTitle(submission)}</td>
                  <td className="px-2 py-1">{submission.earnedPoints} / {submission.totalPoints}</td>
                  <td className="px-2 py-1">{submittedDate}</td>
                  <td className="px-2 py-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          onClick={() => loadLeaderboard(submission)}
                          size="sm"
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogTitle className="text-lg font-bold mb-2">
                          Leaderboard: {getTestTitle(activeSubmission || submission)}
                        </DialogTitle>
                        
                        {leaderboard === null ? (
                          <div className="text-center py-4">Loading leaderboard...</div>
                        ) : leaderboard.length === 0 ? (
                          <div className="text-center py-4">No data available</div>
                        ) : (
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 py-1">Rank</th>
                                <th className="px-2 py-1">User</th>
                                <th className="px-2 py-1">Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {leaderboard.map((entry) => (
                                <tr 
                                  key={entry.userId} 
                                  className={entry.userId === hardcodedUserId ? "bg-blue-100" : ""}
                                >
                                  <td className="px-2 py-1">{entry.rank}</td>
                                  <td className="px-2 py-1">{entry.name}</td>
                                  <td className="px-2 py-1">
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
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}