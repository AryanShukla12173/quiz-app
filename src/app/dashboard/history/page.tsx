'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/connectDatabase';
import { collection, getDocs, query, where, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Trash2, Edit, Copy, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

type TestCase = {
  description: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
};

type Challenge = {
  title: string;
  description: string;
  score: number;
  testcases: TestCase[];
  attempted?: boolean;
};

type ChallengeDoc = {
  id: string;
  userId: string;
  createdAt: Timestamp;
  testTitle: string;
  testDescription: string;
  testDuration: number;
  testStartTime?: Timestamp;
  testEndTime?: Timestamp;
  challenges: Challenge[];
  createdBy?: string;
};

function ChallengeHistory() {
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user, role } = useAuth();
  const isSuperAdmin = role === UserRole.quiz_app_superadmin;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const col = collection(db, 'challenges');
        const q = isSuperAdmin ? query(col) : query(col, where('userId', '==', user?.uid || ''));
        const snap = await getDocs(q);
        setChallenges(
          snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<ChallengeDoc, 'id'>),
          }))
        );
      } catch {
        setError('Failed to load challenges.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.uid, isSuperAdmin]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'challenges', deleteId));
      setChallenges(prev => prev.filter(c => c.id !== deleteId));
      toast.success('Challenge deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied share code!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="alert alert-error shadow-lg w-full max-w-md">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-base-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Challenge History</h1>
          {isSuperAdmin && (
            <span className="text-sm text-base-content/60">Viewing as Super Admin</span>
          )}
        </div>

        {challenges.length === 0 ? (
          <div className="card bg-base-200 p-6 shadow max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold mb-2">No Challenges Found</h2>
            <p className="mb-4">
              {isSuperAdmin
                ? 'There are no challenges in the system yet.'
                : "You haven't created any challenges yet."}
            </p>
            <Link href="/dashboard/challenges" className="btn btn-primary btn-sm">
              Create New Challenge
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {challenges.map((c) => {
              const totalProblems = c.challenges.length;
              const totalPoints = c.challenges.reduce((sum, ch) => sum + (ch.score || 0), 0);
              const isOpen = expanded === c.id;

              return (
                <div
                  key={c.id}
                  className={`card border border-base-300 shadow-sm transition-all duration-200 ${
                    isOpen ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="card-body space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-primary truncate" title={c.testTitle}>
                        {c.testTitle}
                      </h2>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setExpanded(p => (p === c.id ? null : c.id))}
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    <p className={`text-base-content/70 ${isOpen ? '' : 'line-clamp-2'}`}>
                      {c.testDescription}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-outline badge-primary text-xs">
                        Duration: {c.testDuration || 0} min
                      </span>
                      <span className="badge badge-outline badge-success text-xs">
                        Problems: {totalProblems}
                      </span>
                      <span className="badge badge-outline badge-info text-xs">
                        Points: {totalPoints}
                      </span>
                    </div>

                    {isOpen && (
                      <div className="border-t pt-4 space-y-2">
                        <h3 className="font-semibold text-base-content">Challenges</h3>
                        <ul className="space-y-1 list-disc list-inside">
                          {c.challenges.map((ch, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{ch.title}</span>{' '}
                              <span className="text-sm text-base-content/60">
                                ({ch.score} pts)
                              </span>
                              <div className="text-sm text-base-content/60">{ch.description}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-sm text-base-content/60 space-y-1 pt-2 border-t">
                      <div>
                        <span className="font-medium">Share Code:</span>{' '}
                        <span className="font-mono">{c.id}</span>
                        <button
                          className="btn btn-ghost btn-xs ml-2"
                          onClick={() => handleCopy(c.id)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {c.createdAt?.toDate
                          ? format(c.createdAt.toDate(), 'dd MMM yyyy, hh:mm a')
                          : 'Unknown'}
                      </div>
                      {isSuperAdmin && c.userId && (
                        <div>
                          <span className="font-medium">Created By:</span> {c.userId}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t flex justify-end gap-2">
                      <Link
                        href={`/dashboard/challenges/edit-challenge/?testId=${c.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <Edit size={16} />
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="btn btn-outline btn-sm btn-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <dialog id="delete_modal" className="modal" open={!!deleteId}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p className="py-2 text-base-content/70">
            Are you sure you want to delete this challenge? This action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog" className="space-x-2">
              <button className="btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default ChallengeHistory;
