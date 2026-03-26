import { createContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { LoginResponse, User } from '../types';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validationPromiseRef = useRef<Promise<void> | null>(null);

  // Validar token contra el servidor
  const validateToken = useCallback(async (tok: string) => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${tok}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        console.error('Token validation failed');
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Token validation error:', err);
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar estado con localStorage al montar
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');

      if (storedToken) {
        setToken(storedToken);
        await validateToken(storedToken);
      } else {
        setIsLoading(false);
      }
    };

    const promise = initializeAuth();
    validationPromiseRef.current = promise;

    return () => {
      validationPromiseRef.current = null;
    };
  }, [validateToken]);

  // Vigilar cambios en localStorage (para soportar logout en otras pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          setToken(e.newValue);
          validateToken(e.newValue);
        } else {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [validateToken]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      localStorage.setItem('access_token', data.access_token);
      setToken(data.access_token);
      setUser({
        id: data.userId,
        email: data.email,
      });
      setIsLoading(false);
      setError(null);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error:', errorMessage, err);
      setError(errorMessage);
      setIsLoading(false);
      setToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
