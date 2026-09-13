import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as loginRequest, type AuthUser } from './api';

// What the guest register lets any component see and do.
interface AuthContextValue {
  user: AuthUser | null; // who's signed in (null = nobody)
  isAuthenticated: boolean; // convenience: is there a user?
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Keys under which we write the wristband info "in pen on the hand".
const STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  // On first load, try to rebuild the register from what's written on the hand.
  // This is what makes a page reload NOT kick you out.
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  // Whenever the user changes, keep the hand and the token-in-localStorage
  // (which apiFetch reads) in sync with the register.
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('accessToken', user.accessToken);
      localStorage.setItem('refreshToken', user.refreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [user]);

  async function signIn(username: string, password: string) {
    // Show ID at the door; if accepted, write the guest into the register.
    const signedInUser = await loginRequest(username, password);
    setUser(signedInUser);
  }

  function signOut() {
    // Cross the guest out of the register (and the effect wipes the hand).
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// The glance-at-the-register hook. Any component calls useAuth() to read
// or change auth state. Throws if used outside the provider — a guardrail
// so you can't accidentally read a register that was never set up.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
