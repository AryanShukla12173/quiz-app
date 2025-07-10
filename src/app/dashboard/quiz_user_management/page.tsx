'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/connectDatabase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { QuizAppUserDocData } from '@/lib/types';
import { UserRole, useAuth } from '@/context/AuthContext';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

function QuizUserDashboard() {
  const [adminUserData, setAdminUserData] = useState<QuizAppUserDocData[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [, setLoadingUserId] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const { role } = useAuth();

  useEffect(() => {
    fetchAllAdminUserData();
    fetchTotalUsers();
  }, []);

  async function fetchAllAdminUserData() {
    try {
      const snapshot = await getDocs(collection(db, 'user-profiles'));
      const users = snapshot.docs
        .filter((doc) => (doc.data() as QuizAppUserDocData).role === UserRole.quiz_app_user)
        .map((doc) => ({ id: doc.id, ...(doc.data() as QuizAppUserDocData) }));
      setAdminUserData(users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  async function fetchTotalUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'user-profiles'));
      const count = snapshot.docs.filter(
        (doc) => (doc.data() as QuizAppUserDocData).role === UserRole.quiz_app_user
      ).length;
      setTotalUsers(count);
    } catch (err) {
      console.error('Error counting users:', err);
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setLoadingUserId(userId);
      const userRef = doc(db, 'user-profiles', userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`Updated role to ${newRole}`);
      fetchAllAdminUserData();
    } catch (error) {
      toast.error('Error updating role.');
      console.error(error);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-base-200">
      {/* Stat Card */}
      <div className="card bg-base-100 shadow-md rounded-xl mb-8 w-full max-w-xs transition hover:shadow-lg">
        <div className="card-body flex-row items-center justify-between">
          <div>
            <p className="text-sm text-base-content/70">Quiz App Users</p>
            <h2 className="text-3xl font-bold text-base-content">{totalUsers}</h2>
          </div>
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0zM17 11h.01M7 11h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-base-100 p-4 rounded-box shadow">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Enrollment ID</th>
              <th>Year</th>
              <th>Branch</th>
              <th>Created At</th>
              <th>Role</th>
              {role === UserRole.quiz_app_superadmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {adminUserData.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.Enrollment_ID}</td>
                <td>{user.Year}</td>
                <td>{user.Branch}</td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Invalid Date'}
                </td>
                <td>{user.role}</td>
                {role === UserRole.quiz_app_superadmin && (
                  <td>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditingUserId(user.id ?? '')}
                        title="Edit Role"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {editingUserId === user.id && (
                        <select
                          className="select select-bordered select-sm w-[10rem]"
                          defaultValue={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id!, e.target.value as UserRole)
                          }
                        >
                          <option disabled>Select Role</option>
                          {Object.values(UserRole).map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {adminUserData.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizUserDashboard;
