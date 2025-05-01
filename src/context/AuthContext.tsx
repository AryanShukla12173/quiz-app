'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { app } from '@/lib/connectDatabase';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import { FirebaseError } from 'firebase/app';

// Define user roles with values that exactly match what's stored in database
export enum UserRole {
  quiz_app_user = 'quiz-app-user',
  quiz_app_admin = 'quiz-app-admin',
  quiz_app_superadmin = 'quiz-app-superadmin'
}

// Auth context type definition with auth methods
type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  error: string | null;
  
  // Auth methods
  signIn: (email: string, password: string, expectedRole?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, formData?: Record<string, unknown>) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, profileData?: Record<string, unknown>) => Promise<void>;
  clearError: () => void;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  error: null,
  
  signIn: async () => {},
  signUp: async () => {},
  logOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  clearError: () => {},
});

// Props for the AuthProvider component
type AuthProviderProps = {
  children: React.ReactNode;
};

// Props for the ProtectedRoute component
type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
};

// AuthProvider component that wraps the application
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Function to fetch user role from Firestore
  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const userProfileRef = doc(db, 'user-profiles', userId);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data();
        if (profileData && 'role' in profileData) {
          const rawRole = profileData.role;
          console.log("Raw role from database:", rawRole);
          
          // Proper role mapping based on database values
          if (rawRole === 'quiz-app-user') {
            return UserRole.quiz_app_user;
          } else if (rawRole === 'quiz-app-admin') {
            return UserRole.quiz_app_admin;
          } else if (rawRole === 'quiz-app-superadmin') {
            console.log("Superadmin role detected, returning:", UserRole.quiz_app_superadmin);
            return UserRole.quiz_app_superadmin;
          }
          
          // Handle unexpected role values
          console.log("Unrecognized role format:", rawRole);
        } else {
          console.log("No role field found in user profile");
        }
      } else {
        console.log("User profile document does not exist");
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
  
      const fetchAndSetRole = async () => {
        if (firebaseUser) {
          try {
            const userRole = await fetchUserRole(firebaseUser.uid);
            console.log("Setting user role to:", userRole);
            setRole(userRole);
          } catch (error) {
            console.error("Error setting user role:", error);
            setRole(null);
          }
        } else {
          setRole(null);
        }
        setLoading(false);
      };
  
      fetchAndSetRole();
    });
  
    return () => unsubscribe();
  }, [auth, db]);
  
  // Sign in with email and password - with optional role validation
  const signIn = async (email: string, password: string, expectedRole?: UserRole) => {
    setLoading(true);
    setError(null);
    
    try {
      // First authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // If role validation is requested, check the user's role
      if (expectedRole) {
        const userRole = await fetchUserRole(userCredential.user.uid);
        
        // If user doesn't have the expected role, sign them out and show error
        if (userRole !== expectedRole) {
          await signOut(auth);
          setError(`Access denied. Your account doesn't have the required permissions for this area.`);
          setLoading(false);
          return;
        }
      }
      
      // Auth state listener will handle setting the user and role
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
            setError('Invalid email or password. Please try again.');
            break;
          case 'auth/user-not-found':
            setError('No account found with this email.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password.');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed login attempts. Please try again later.');
            break;
          default:
            setError(`Authentication error: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred during sign-in.');
      }
      setLoading(false);
    }
  };

  // Sign up with email, password, display name, and arbitrary form data
  const signUp = async (email: string, password: string, displayName: string, formData: Record<string, unknown> = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore with default role and additional form data
      const userProfileRef = doc(db, 'user-profiles', userCredential.user.uid);
      
      // Create the profile object with all the form data
      const profileData = {
        email,
        displayName,
        role: UserRole.quiz_app_user, // Default role
        createdAt: new Date().toISOString(),
        // Add any additional form data
        ...formData
      };
      
      await setDoc(userProfileRef, profileData);
      setRole(profileData.role)
      // For debugging
      console.log('User profile created with data:', profileData);
      
      // Auth state listener will handle setting the user and role
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('An account with this email already exists.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please use at least 6 characters.');
            break;
          default:
            setError(`Registration error: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred during registration.');
      }
      setLoading(false);
    }
  };

  // Sign out function
  const logOut = async () => {
    setError(null);
    
    try {
      await signOut(auth);
      // Auth state listener will handle clearing the user and role
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      setError(`Sign out error: ${error}`);
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            setError('No account found with this email.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          default:
            setError(`Password reset error: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred during password reset.');
      }
      setLoading(false);
    }
  };

  // Update user profile function - now with additional profile data support
  const updateUserProfile = async (displayName: string, profileData: Record<string, unknown> = {}) => {
    setError(null);
    
    if (!user) {
      setError('No authenticated user found.');
      return;
    }
    
    try {
      await updateProfile(user, { displayName });
      
      // Update the user profile in Firestore
      const userProfileRef = doc(db, 'user-profiles', user.uid);
      await setDoc(userProfileRef, { 
        displayName,
        ...profileData 
      }, { merge: true });
      
      // Force refresh of user object
      setUser({ ...user });
      console.log('User profile updated successfully!');
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      setError(`Profile update error: ${error}`);
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  // Create context value
  const contextValue = {
    user,
    loading,
    role,
    error,
    signIn,
    signUp,
    logOut,
    resetPassword,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// ProtectedRoute component that handles route protection
export const ProtectedRoute = ({
  children,
  allowedRoles = [UserRole.quiz_app_user, UserRole.quiz_app_admin],
  redirectPath = '/',
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}) => {
  const { user, role, loading, logOut } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      console.log("Still loading auth state...");
      return; // Wait for auth to finish loading
    }

    const checkAccess = async () => {
      console.log("Checking access with user:", user?.uid);
      console.log("Current role:", role);
      console.log("Allowed roles:", allowedRoles.map(r => r));
      
      // Access check logic
      if (!user) {
        console.log("No authenticated user, redirecting to", redirectPath);
        router.replace(redirectPath);
      } else if (!role) {
        console.log("User authenticated but no role found");
        setUnauthorized(true);
        
        // Handle no role case - could be due to database error
        setTimeout(async () => {
          await logOut();
          router.replace('/sign-in?error=no-role');
        }, 3000);
      } else if (!allowedRoles.includes(role)) {
        console.log("User role not in allowed roles");
        console.log("User role:", role);
        console.log("Allowed roles:", allowedRoles);
        setUnauthorized(true);
        
        setTimeout(async () => {
          await logOut();
          // Redirect based on role
          if (role === UserRole.quiz_app_user) {
            router.replace('/dashboard');
          } else if (role === UserRole.quiz_app_admin) {
            router.replace('/coding-platform/start');
          } else {
            router.replace('/unauthorized');
          }
        }, 3000);
      } else {
        console.log("Access granted!");
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, role, loading, allowedRoles, redirectPath, router, logOut]);

  if (loading || (isChecking && !unauthorized)) {
    return <LoadingScreen message={loading ? 'Loading authentication...' : 'Checking access permissions...'} />;
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">
            Your account doesn&apos;t have the required permissions to access this area.
          </p>
          <p className="text-sm text-gray-300">
            You&apos;ll be redirected to the appropriate area in a moment...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// AdminRoute - Specialized route for admin access only
export const AdminRoute = ({ children, redirectPath = '/sign-in' }: Omit<ProtectedRouteProps, 'allowedRoles'>) => {
  // Explicitly define the allowed roles
  const adminRoles: UserRole[] = [UserRole.quiz_app_admin, UserRole.quiz_app_superadmin];
  
  console.log("AdminRoute using roles:", adminRoles);
  
  return (
    <ProtectedRoute 
      allowedRoles={adminRoles}
      redirectPath={redirectPath}
    >
      {children}
    </ProtectedRoute>
  );
};

// UserRoute - Specialized route for regular users
export const UserRoute = ({ children, redirectPath = '/coding-platform/sign-in' }: Omit<ProtectedRouteProps, 'allowedRoles'>) => {
  return (
    <ProtectedRoute 
      allowedRoles={[UserRole.quiz_app_user]} 
      redirectPath={redirectPath}
    >
      {children}
    </ProtectedRoute>
  );
};