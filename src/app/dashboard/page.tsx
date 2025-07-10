'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { UserCircle } from 'lucide-react'

function UserProfile() {
  const { user, role, loading, updateUserProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.')
      return
    }

    setSaving(true)
    try {
      await updateUserProfile(displayName.trim())
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner text-primary"></span>
        <p className="ml-2 text-primary font-medium">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-error font-semibold">No user signed in.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-200 px-4 py-10">
      <h1 className="text-3xl font-bold text-primary mb-10">Your Profile</h1>

      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body space-y-6">
          {/* Profile Avatar */}
          <div className="flex justify-center">
            <UserCircle className="text-primary" size={100} />
          </div>

          {/* Email */}
          <div>
            <h2 className="text-sm font-semibold text-base-content/70">Email</h2>
            <p className="text-base-content">{user.email}</p>
          </div>

          {/* Display Name */}
          <div>
            <h2 className="text-sm font-semibold text-base-content/70">Display Name</h2>
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered w-full mt-1"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
              />
            ) : (
              <p className="text-base-content">{user.displayName || 'Not set'}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <h2 className="text-sm font-semibold text-base-content/70">Role</h2>
            <p className="text-base-content capitalize">
              {role?.replaceAll('_', ' ') || 'Unknown'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-end pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-sm btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
