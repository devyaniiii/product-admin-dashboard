// context/AuthContext.tsx
"use client"; // This is a client component: it uses React state, useEffect,
              // and localStorage, none of which exist on the server.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  login as loginRequest,
  saveSession,
  clearSession,
  getStoredUser,
  getToken,
  LoginCredentials,
  AuthUser,
} from "@/lib/auth";

// Shape of what any component can pull out of this context.
interface AuthContextType {
  user: Omit<AuthUser, "token"> | null; // logged-in user's basic info, or null
  isLoading: boolean;                    // true while we check localStorage on first load
  isAuthenticated: boolean;              // convenience boolean
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Context starts as undefined so we can detect "used outside provider" bugs.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<AuthUser, "token"> | null>(null);
  const [isLoading, setIsLoading] = useState(true); // start true: we haven't checked yet

  
  useEffect(() => {
  const storedUser = getStoredUser();
  const token = getToken();
  if (storedUser && token) {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage (an external system) once on mount, not syncing React state to itself
    setUser(storedUser);
  }
  setIsLoading(false);
}, []);

  async function login(credentials: LoginCredentials) {
    const result = await loginRequest(credentials); // calls POST /auth/login
    saveSession(result); // writes token + user to localStorage
    // Store everything except the token in React state
    // (the token lives only in localStorage; the Axios interceptor reads it from there).
   setUser({
  id: result.id,
  username: result.username,
  email: result.email,
  firstName: result.firstName,
  lastName: result.lastName,
  image: result.image,
});
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook so components just call useAuth() instead of
// useContext(AuthContext) + manually checking for undefined every time.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}