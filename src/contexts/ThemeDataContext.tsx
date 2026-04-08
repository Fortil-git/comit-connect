import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SubTheme {
  id: string;
  title: string;
  type: 'text' | 'checkbox' | 'select' | 'number' | 'date' | 'counter' | 'radio';
  options?: string[];
  placeholder?: string;
  max?: number;
  order?: number;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  important?: boolean;
  order?: number;
  subThemes: SubTheme[];
}

interface ThemeDataContextType {
  themes: Theme[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const ThemeDataContext = createContext<ThemeDataContextType | undefined>(undefined);

export const ThemeDataProvider = ({ children }: { children: ReactNode }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getThemes();
      setThemes(data);
    } catch {
      // Fallback to static data if API fails
      const { themes: staticThemes } = await import('@/data/themes');
      setThemes(staticThemes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return (
    <ThemeDataContext.Provider value={{ themes, loading, refetch: fetchThemes }}>
      {children}
    </ThemeDataContext.Provider>
  );
};

export const useThemeData = (): ThemeDataContextType => {
  const context = useContext(ThemeDataContext);
  if (!context) {
    throw new Error('useThemeData must be used within a ThemeDataProvider');
  }
  return context;
};
