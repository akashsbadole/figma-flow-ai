import { useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/react';

/**
 * Custom hook to get the authentication header for API requests
 * This hook properly integrates with Clerk's authentication state
 */
export function useAuthHeader() {
  const { user } = useUser();
  const { getToken } = useClerkAuth();
  const [authHeader, setAuthHeader] = useState<{ 'x-user-id': string } | { authorization: string } | Record<string, never>>({});

  useEffect(() => {
    const updateAuthHeader = async () => {
      console.log('Auth: Checking authentication state...');

      // Method 1: Try to get session token (for server-side validation)
      try {
        const token = await getToken();
        if (token) {
          console.log('Auth: Using session token');
          setAuthHeader({ 'authorization': `Bearer ${token}` });
          return;
        }
      } catch (e) {
        console.warn('Auth: Failed to get session token:', e);
      }

      // Method 2: Use Clerk's user ID directly
      if (user && user.id) {
        console.log('Auth: Using Clerk user ID:', user.id);
        setAuthHeader({ 'x-user-id': user.id });
        return;
      }

      // Method 3: Try to get from localStorage (set by AuthContext)
      try {
        const stored = localStorage.getItem('clerk_user');
        if (stored) {
          const storedUser = JSON.parse(stored);
          if (storedUser.id) {
            console.log('Auth: Using localStorage user ID:', storedUser.id);
            setAuthHeader({ 'x-user-id': storedUser.id });
            return;
          }
        }
      } catch (e) {
        console.warn('Auth: Failed to parse localStorage user data:', e);
      }

      // No valid authentication found
      console.warn('Auth: No valid authentication found - API calls will fail with 401');
      setAuthHeader({});
    };

    updateAuthHeader();
  }, [user, getToken]);

  return authHeader;
}

/**
 * Simple function to get auth header (for use in non-React contexts)
 * This is a synchronous version that may not get the freshest token
 */
export function getAuthHeader(): { 'x-user-id': string } | { authorization: string } | Record<string, never> {
  // Try to get from localStorage first
  try {
    const stored = localStorage.getItem('clerk_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.id) {
        return { 'x-user-id': user.id };
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return {};
}

