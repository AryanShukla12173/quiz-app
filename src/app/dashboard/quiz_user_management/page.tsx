'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/connectDatabase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { QuizAppUserDocData } from '@/lib/types'
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
  const [adminUserData, setAdminUserData] = useState<QuizAppUserDocData[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [, setLoadingUserId] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const { role } = useAuth()

  async function fetchAllAdminUserData() {
    try {
      const querySnapShot = await getDocs(collection(db, 'user-profiles'))
      const docs: QuizAppUserDocData[] = querySnapShot.docs
        .filter(doc => {
          const data = doc.data() as QuizAppUserDocData
          return data.role === UserRole.quiz_app_user
        })
        .map(doc => {
          const data = doc.data() as QuizAppUserDocData
          return { id: doc.id, ...data }
        })
      setAdminUserData(docs)
    } catch (error) {
      console.error("Error in super-admin-dashboard: ", error)
    }
  }

  async function fetchTotalUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'user-profiles'))
            let userCount = 0
            snapshot.forEach(doc => {
              const data = doc.data()
              if (data.role === UserRole.quiz_app_user) {
                userCount++
              }
            })
            setTotalUsers(userCount)
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
      toast(`The user role has been successfully updated to ${newRole}`)
      fetchAllAdminUserData()
    } catch (error) {
      toast("There was an error updating the role. Please try again.")
      console.error("Error updating role: ", error)
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <div className="bg-[#f4f4f7] min-h-screen px-4 py-6 md:ml-[250px]">
      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center transition hover:shadow-lg">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Quiz App Users</p>
            <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
          </div>
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0zM17 11h.01M7 11h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 overflow-x-auto">
        <Table>
          <TableCaption className="text-sm text-gray-500 mt-4">
            A list of all quiz app users
          </TableCaption>
          <TableHeader>
            <TableRow className="text-gray-600 whitespace-nowrap">
              <TableHead>Email</TableHead>
              <TableHead>Enrollment ID</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Role</TableHead>
              {role === UserRole.quiz_app_superadmin && (
                <TableHead>Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUserData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.Enrollment_ID}</TableCell>
                <TableCell>{user.Year}</TableCell>
                <TableCell>{user.Branch}</TableCell>
                <TableCell>
                {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'Invalid Date'}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                {role === UserRole.quiz_app_superadmin && (
                  <TableCell>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUserId(user.id ?? '')}
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
                          defaultValue={user.role}
                          onValueChange={(newRole) =>
                            handleRoleChange(user.id!, newRole as UserRole)
                          }
                        >
                          <SelectTrigger className="w-[140px] sm:w-[160px]">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserRole).map((roleOption) => (
                              <SelectItem key={roleOption} value={roleOption}>
                                {roleOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
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
