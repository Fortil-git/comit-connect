import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE } from '@/lib/api';

interface Agency {
  id: string;
  name: string;
  city: string;
  region: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string | null;
  email: string;
  userRole: string;
  agencyId: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  agency: Agency | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAgency(data.agency);
        } else {
          setUser(null);
          setAgency(null);
        }
      } catch {
        setUser(null);
        setAgency(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Erreur de connexion' }));
      throw new Error(error.error || 'Erreur de connexion');
    }

    const data = await res.json();
    setUser(data.user);
    setAgency(data.agency);
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setAgency(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        agency,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
