
export type Tab = 'minuteur' | 'alarme' | 'chrono';

export interface Timer {
  id: string;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  label: string;
  soundUrl?: string; // URL of the sound file
}

export interface Alarm {
  id: string;
  time: string; // HH:MM format
  label: string;
  isActive: boolean;
  days: string[]; // ['L', 'Ma', 'Me', 'J', 'V', 'S', 'D']
  soundUrl?: string; // URL of the sound file
}

export interface Lap {
  id: number;
  time: number; // in milliseconds
  split: number; // difference from last lap
}

export interface Sound {
  id: string;
  name: string;
  url: string;
  isCustom: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  accentColor: string;
  reducedMotion: boolean;
}

export interface ThemeContextType {
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  setReducedMotion: (enabled: boolean) => void;
}
