'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/connectDatabase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { adminUserDocData } from '@/lib/types';
import { UserRole } from '@/context/AuthContext';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

function SuperAdminDashboard() {
  const [adminUserData, setAdminUserData] = useState<adminUserDocData[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [, setLoadingUserId] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const { role } = useAuth();

  async function fetchAllAdminUserData() {
    try {
      const querySnapShot = await getDocs(collection(db, 'user-profiles'));
      const docs: adminUserDocData[] = querySnapShot.docs
        .filter(doc => {
          const data = doc.data() as adminUserDocData;
          return data.role === UserRole.quiz_app_admin;
        })
        .map(doc => {
          const data = doc.data() as adminUserDocData;
          return { id: doc.id, ...data };
        });
      setAdminUserData(docs);
    } catch (error) {
      console.error('Error fetching admin users: ', error);
    }
  }

  async function fetchTotalUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'user-profiles'));
      let adminCount = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === UserRole.quiz_app_admin) {
          adminCount++;
        }
      });
      setTotalUsers(adminCount);
    } catch (error) {
      console.error('Error fetching total users: ', error);
    }
  }

  useEffect(() => {
    fetchAllAdminUserData();
    fetchTotalUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setLoadingUserId(userId);
      const userRef = doc(db, 'user-profiles', userId);
      await updateDoc(userRef, { role: newRole });
      toast.success(`The user role has been updated to ${newRole}`);
      fetchAllAdminUserData();
    } catch (error) {
      toast.error('There was an error updating the role. Please try again.');
      console.error('Error updating role: ', error);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen px-4 py-6">
      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-base-100 rounded-xl shadow p-6 flex justify-between items-center transition hover:shadow-lg">
          <div className="space-y-1">
            <p className="text-sm text-base-content/70">Admin Users</p>
            <p className="text-3xl font-bold text-base-content">{totalUsers}</p>
          </div>
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0zM17 11h.01M7 11h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Admin User Table */}
      <div className="bg-base-100 rounded-xl shadow p-4 md:p-6 overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="text-base-content">
                <th>Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Created At</th>
                <th>Role</th>
                {role === UserRole.quiz_app_superadmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {adminUserData.map(user => (
                <tr key={user.id}>
                  <td className="max-w-[200px] truncate">{user.email}</td>
                  <td>{user.department ?? '—'}</td>
                  <td>{user.designation ?? '—'}</td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Invalid Date'}
                  </td>
                  <td>{user.role}</td>
                  {role === UserRole.quiz_app_superadmin && (
                    <td>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="tooltip" data-tip="Edit User Role">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setEditingUserId(user.id ?? '')}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>

                        {editingUserId === user.id && (
                          <select
                            className="select select-bordered select-sm w-[160px]"
                            defaultValue={user.role ?? 'quiz-app-admin'}
                            onChange={e =>
                              handleRoleChange(user.id!, e.target.value as UserRole)
                            }
                          >
                            <option disabled value="">
                              Select Role
                            </option>
                            {Object.values(UserRole).map(roleValue => (
                              <option key={roleValue} value={roleValue}>
                                {roleValue}
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
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
