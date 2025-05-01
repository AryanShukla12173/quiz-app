'use client'

import React, { useEffect, useState, useContext } from 'react'
import { db } from '@/lib/connectDatabase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { adminUserDocData } from '@/lib/types'
import { UserRole } from '@/context/AuthContext'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

function SuperAdminDashboard() {
  const [adminUserData, setAdminUserData] = useState<adminUserDocData[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const { user, role } = useAuth()

  async function fetchAllAdminUserData() {
    try {
      const querySnapShot = await getDocs(collection(db, 'user-profiles'))
      const docs: adminUserDocData[] = querySnapShot.docs
        .filter(doc => {
          const data = doc.data() as adminUserDocData;
          return data.role === UserRole.quiz_app_admin;
        })
        .map(doc => {
          const data = doc.data() as adminUserDocData;
          return { id: doc.id, ...data };
        });
      console.log(docs)
      setAdminUserData(docs)
    }

    catch (error) {
      console.error("Error in super-admin-dashboard: ", error)
    }
  }

  async function fetchTotalUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'user-profiles'))
      setTotalUsers(snapshot.size)
    } catch (error) {
      console.error("Error fetching total users: ", error)
    }
  }
  useEffect(() => {
    fetchAllAdminUserData()
    fetchTotalUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setLoadingUserId(userId)
      const userRef = doc(db, 'user-profiles', userId)
      await updateDoc(userRef, { role: newRole })

      // Display success toast
      toast(`The user role has been successfully updated to ${newRole}`)

      // Refresh data
      fetchAllAdminUserData()

    } catch (error) {
      // Display error toast
      toast("There was an error updating the role. Please try again.")
      console.log("Error occurred while updating role: ", error)
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-semibold text-gray-800">{totalUsers}</p>
          </div>
          <div className="text-blue-600 bg-blue-100 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0zM17 11h.01M7 11h.01" />
            </svg>
          </div>
        </div>
      </div>
  
      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <Table>
          <TableCaption className="text-muted-foreground mb-4">A list of your admin users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-600">Email</TableHead>
              <TableHead className="text-gray-600">State</TableHead>
              <TableHead className="text-gray-600">Created At</TableHead>
              <TableHead className="text-gray-600">Role</TableHead>
              {role === UserRole.quiz_app_superadmin && (
                <TableHead className="text-gray-600">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUserData.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.state}</TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Invalid Date"}</TableCell>
                <TableCell>{user.role}</TableCell>
                {role === UserRole.quiz_app_superadmin && (
                  <TableCell className="flex flex-col gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUserId(user.id ?? '')}
                          className="w-fit"
                        >
                          <Pencil size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit User Role</p>
                      </TooltipContent>
                    </Tooltip>
                    {editingUserId === user.id && (
                      <Select
                        defaultValue={user.role ?? 'defaultRole'}
                        onValueChange={(newRole) => {
                          if (newRole) {
                            handleRoleChange(user.id!, newRole as UserRole)
                          }
                        }}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(UserRole).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter />
        </Table>
      </div>
    </div>
  )
  
}

export default SuperAdminDashboard
