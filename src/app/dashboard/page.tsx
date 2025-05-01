'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserCircle } from 'lucide-react'; // Importing the user icon!

function UserProfile() {
  const { user, role, loading, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(displayName.trim());
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.log(error)
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-purple-600 font-semibold">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 font-semibold">No user signed in.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-purple-700 mb-10">Your Profile</h1>

      <div className="bg-white p-8 rounded-2xl shadow-md border border-purple-100 w-full max-w-md hover:shadow-lg hover:border-purple-300 transition-all">

        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <UserCircle className="text-purple-500" size={100} />
        </div>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Email</h2>
            <p className="text-gray-800">{user.email}</p>
          </div>

          {/* Display Name */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Display Name</h2>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded-lg border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
              />
            ) : (
              <p className="text-gray-800">{user.displayName || 'Not set'}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Role</h2>
            <p className="text-gray-800 capitalize">{role?.replaceAll('_', ' ') || 'Unknown'}</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
