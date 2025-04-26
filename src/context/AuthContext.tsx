'use client';
import { createContext, useContext, useEffect, useState , useTransition } from 'react';
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
import LoadingScreen from '@/components/LoadingScreen'; // import it at top

// Define user roles
export enum UserRole {
  quiz_app_user = 'quiz-app-user',
  quiz_app_admin = 'quiz-app-admin'
}

// Auth context type definition with auth methods
type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  error: string | null;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
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
          return profileData.role as UserRole;
        }
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
          const userRole = await fetchUserRole(firebaseUser.uid);
          setRole(userRole);
        } else {
          setRole(null);
        }
        setLoading(false); // ✅ Move this inside async after role is fetched
      };
  
      fetchAndSetRole();
    });
  
    return () => unsubscribe();
  }, [auth, db]);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle setting the user and role
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle different error codes
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(`Authentication error: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Sign up with email, password, and display name
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore with default role
      const userProfileRef = doc(db, 'user-profiles', userCredential.user.uid);
      await setDoc(userProfileRef, {
        email,
        displayName,
        role: UserRole.quiz_app_user, // Default role
        createdAt: new Date().toISOString()
      });
      
      // Auth state listener will handle setting the user and role
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle different error codes
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(`Registration error: ${error.message}`);
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(`Sign out error: ${error.message}`);
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(`Password reset error: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async (displayName: string) => {
    setError(null);
    
    if (!user) {
      setError('No authenticated user found.');
      return;
    }
    
    try {
      await updateProfile(user, { displayName });
      
      // Update the user profile in Firestore
      const userProfileRef = doc(db, 'user-profiles', user.uid);
      await setDoc(userProfileRef, { displayName }, { merge: true });
      
      // Force refresh of user object
      setUser({ ...user });
      console.log('User profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(`Profile update error: ${error.message}`);
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
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading

    if (!user) {
      router.replace(redirectPath);  // ❌ No user, redirect to login
    } else if (role && !allowedRoles.includes(role)) {
      // ❌ Wrong role, redirect
      if (role === UserRole.quiz_app_user) {
        router.replace('/dashboard');
      } else if (role === UserRole.quiz_app_admin) {
        router.replace('/coding-platform/start');
      } else {
        router.replace('/unauthorized');
      }
    } else {
      // ✅ Correct user & role
      setIsChecking(false);
    }
  }, [user, role, loading, allowedRoles, redirectPath, router]);

  if (loading || isChecking) {
    return <LoadingScreen message={loading ? 'Loading...' : 'Redirecting...'} />;
  }

  return <>{children}</>;
};
// AdminRoute - Specialized route for admin access only
export const AdminRoute = ({ children, redirectPath = '/sign-in' }: Omit<ProtectedRouteProps, 'allowedRoles'>) => {
  return (
    <ProtectedRoute allowedRoles={[UserRole.quiz_app_admin]} redirectPath={redirectPath}>
      {children}
    </ProtectedRoute>
  );
};

// UserRoute - Specialized route for regular users
export const UserRoute = ({ children, redirectPath = '/coding-platform/sign-in' }: Omit<ProtectedRouteProps, 'allowedRoles'>) => {
  return (
    <ProtectedRoute allowedRoles={[UserRole.quiz_app_user]} redirectPath={redirectPath}>
      {children}
    </ProtectedRoute>
  );
};