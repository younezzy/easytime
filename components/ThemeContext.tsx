import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme, ThemeContextType, ThemeMode } from '../types';

const defaultTheme: AppTheme = {
  mode: 'dark',
  accentColor: '#76b9ed',
  reducedMotion: false,
  wakeLockEnabled: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('fluent_clock_theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Assurer que les nouvelles propriétés sont présentes
        return { ...defaultTheme, ...parsed };
      }
      return defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    localStorage.setItem('fluent_clock_theme', JSON.stringify(theme));
    
    // Apply Theme Mode
    const html = document.documentElement;
    if (theme.mode === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }

    // Apply Reduced Motion
    if (theme.reducedMotion) {
      html.classList.add('reduced-motion');
    } else {
      html.classList.remove('reduced-motion');
    }

    // Apply Accent Color variable
    html.style.setProperty('--accent', theme.accentColor);
  }, [theme]);

  const setMode = (mode: ThemeMode) => setTheme(prev => ({ ...prev, mode }));
  const setAccentColor = (accentColor: string) => setTheme(prev => ({ ...prev, accentColor }));
  const setReducedMotion = (reducedMotion: boolean) => setTheme(prev => ({ ...prev, reducedMotion }));
  const setWakeLockEnabled = (wakeLockEnabled: boolean) => setTheme(prev => ({ ...prev, wakeLockEnabled }));

  return (
    <ThemeContext.Provider value={{ theme, setMode, setAccentColor, setReducedMotion, setWakeLockEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const PRESET_COLORS = [
  { name: 'Bleu', value: '#76b9ed' },
  { name: 'Vert', value: '#6ccb5f' },
  { name: 'Orange', value: '#ff9f0a' },
  { name: 'Violet', value: '#bf5af2' },
  { name: 'Jaune', value: '#ffd60a' },
  { name: 'Rouge', value: '#ff453a' },
  { name: 'Rose', value: '#ff375f' },
  { name: 'Turquoise', value: '#64d2ff' },
  { name: 'Indigo', value: '#5e5ce6' },
  { name: 'Menthe', value: '#00c7be' },
];