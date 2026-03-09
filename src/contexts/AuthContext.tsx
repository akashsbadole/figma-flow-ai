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
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  const user: CustomUser | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    display_name: clerkUser.fullName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    imageUrl: clerkUser.imageUrl || "",
  } : null;

  useEffect(() => {
    if (user) {
      localStorage.setItem('clerk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('clerk_user');
    }
  }, [user]);

  const signIn = async (_email: string, _password: string) => {
    // Handled by Clerk
  };

  const signUp = async (_email: string, _password: string, _displayName?: string) => {
    // Handled by Clerk
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
