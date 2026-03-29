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

  // Inject global modal animation styles so all popups can share the same animation
  useEffect(() => {
    const styleId = 'global-modal-animations';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    const MODAL_ANIM_DURATION = 220;
    style.innerHTML = `
      /* Modal card animations and sensible initial state so the animation is visible */
      @keyframes modal-in { from { transform: scale(1.15); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes modal-out { from { transform: scale(1); opacity: 1; } to { transform: scale(1.15); opacity: 0; } }
      /* Default hidden state to avoid flash before animation */
      .modal-card { transform-origin: center center; transform: scale(1.15); opacity: 0; }
      .modal-enter { animation: modal-in ${MODAL_ANIM_DURATION}ms cubic-bezier(0,0.67,0,1) forwards; }
      .modal-entered { transform: scale(1); opacity: 1; }
      .modal-exit { animation: modal-out ${MODAL_ANIM_DURATION}ms cubic-bezier(0,0.67,0,1) forwards; }

      /* Overlay (backdrop) animations and initial hidden state */
      @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes overlay-out { from { opacity: 1; } to { opacity: 0; } }
      .modal-overlay { opacity: 0; }
      .overlay-enter { animation: overlay-in ${MODAL_ANIM_DURATION}ms cubic-bezier(0,0.67,0,1) forwards; }
      .overlay-entered { opacity: 1; }
      .overlay-exit { animation: overlay-out ${MODAL_ANIM_DURATION}ms cubic-bezier(0,0.67,0,1) forwards; }
    `;
    document.head.appendChild(style);
  }, []);

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