import { createContext, useContext, ReactNode, useEffect } from "react";
import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/react";

interface CustomUser {
  id: string;
  email: string;
  display_name: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkIsLoaded, isSignedIn: clerkIsSignedIn } = useClerkUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  // Support test mode for E2E testing
  const isTestMode = typeof window !== 'undefined' && window.localStorage.getItem('test_mode') === 'true';
  const isLoaded = clerkIsLoaded || isTestMode;
  const isSignedIn = clerkIsSignedIn || (isTestMode && !!window.localStorage.getItem('clerk_user'));

  let user: CustomUser | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    display_name: clerkUser.fullName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    imageUrl: clerkUser.imageUrl || "",
  } : null;

  // Fallback to localStorage user in test mode
  if (!user && isTestMode) {
    const stored = localStorage.getItem('clerk_user');
    if (stored) {
      try {
        user = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse test user', e);
      }
    }
  }

  useEffect(() => {
    if (user && !isTestMode) {
      localStorage.setItem('clerk_user', JSON.stringify(user));
    } else if (!user && !isTestMode) {
      localStorage.removeItem('clerk_user');
    }
  }, [user, isTestMode]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed');
      }

      if (result.success) {
        localStorage.setItem('clerk_user', JSON.stringify(result.data));
        // Force a refresh of the user state by reloading or using a state setter if available
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      if (result.success) {
        // Automatically login after registration
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('clerk_user');
    await clerkSignOut();
  };

  const resetPassword = async (_email: string) => {
    throw new Error("Password reset handled by Clerk");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: !isLoaded, 
      isSignedIn: !!isSignedIn,
      signIn, 
      signUp, 
      signOut, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
