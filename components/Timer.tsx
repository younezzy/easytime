import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Plus, Pencil, ChevronUp, ChevronDown, X, Disc, MoreHorizontal, Trash2, Edit2, Bell, Upload, Volume2, Square } from 'lucide-react';
import { Timer as TimerType, Sound } from '../types';
import { formatTime, generateId } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

// Utilisation des nouvelles URLs fournies
const DEFAULT_SOUND_1 = "https://ik.imagekit.io/clwjg33dzn/An_original,_underst__2-1770653026374.mp3";
const DEFAULT_SOUND_2 = "https://ik.imagekit.io/clwjg33dzn/An_original,_underst__4-1770653030241.mp3";
const NO_SOUND_URL = "__NO_SOUND__";

const DEFAULT_SOUNDS: Sound[] = [
  { id: 'no-sound', name: '🔇 Aucun son', url: NO_SOUND_URL, isCustom: false },
  { id: 'default-1', name: 'Cosmic', url: DEFAULT_SOUND_1, isCustom: false },
  { id: 'default-2', name: 'Ethereal', url: DEFAULT_SOUND_2, isCustom: false },
];

const DEFAULT_TIMERS_DATA: TimerType[] = [
  { id: '1', initialSeconds: 60, remainingSeconds: 60, isRunning: false, label: '1 minute', soundUrl: DEFAULT_SOUND_1 },
  { id: '2', initialSeconds: 180, remainingSeconds: 180, isRunning: false, label: '3 minutes', soundUrl: DEFAULT_SOUND_1 },
  { id: '3', initialSeconds: 300, remainingSeconds: 300, isRunning: false, label: '5 minutes', soundUrl: DEFAULT_SOUND_1 },
  { id: '4', initialSeconds: 600, remainingSeconds: 600, isRunning: false, label: '10 minutes', soundUrl: DEFAULT_SOUND_1 },
];

const Digit = ({ value }: { value: string }) => (
  <div className="relative w-[0.65em] h-[1.1em] inline-flex justify-center overflow-hidden tabular-nums">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: '60%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '-60%', opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.5
        }}
        style={{ willChange: "transform, opacity" }}
        className="absolute inset-0 flex items-center justify-center font-[Segoe UI Variable Display]"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
);

interface TimerItemProps {
  timer: TimerType;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  openEditModal: (timer: TimerType) => void;
  deleteTimer: (id: string) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const TimerItem = React.memo(({ 
  timer, 
  menuOpenId, 
  setMenuOpenId, 
  toggleTimer, 
  resetTimer, 
  openEditModal, 
  deleteTimer,
  menuRef 
}: TimerItemProps) => {
  const { hDisplay, mDisplay, sDisplay } = formatTime(timer.remainingSeconds);
  const percent = timer.initialSeconds > 0 
    ? ((timer.initialSeconds - timer.remainingSeconds) / timer.initialSeconds) * 100 
    : 0;

  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-5 aspect-[4/5] flex flex-col justify-between relative group border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] transition-all duration-200 shadow-md">
      {/* Header: Title & Menu */}
      <div className="flex justify-between items-start text-[var(--text-main)] z-10 relative h-6 shrink-0">
        <span className="font-semibold text-[15px] tracking-wide truncate pr-8" title={timer.label}>{timer.label}</span>
        
        <div className="absolute right-0 -top-1">
            <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === timer.id ? null : timer.id); }}
                className={`text-[var(--text-muted)] p-1 rounded-md transition-all duration-200 
                ${menuOpenId === timer.id 
                    ? 'opacity-100 bg-[var(--bg-hover)] scale-100 text-[var(--text-main)]' 
                    : 'opacity-0 group-hover:opacity-100 hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] hover:scale-110'
                }`}
            >
                <MoreHorizontal size={20} />
            </button>
            
            <AnimatePresence>
            {menuOpenId === timer.id && (
                <motion.div 
                    ref={menuRef} 
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-8 w-40 bg-[var(--bg-popover)] border border-[var(--border)] rounded-lg shadow-xl z-50 flex flex-col p-1 overflow-hidden"
                >
                     <button 
                        onClick={() => openEditModal(timer)}
                        className="flex items-center px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-hover)] rounded-md text-left transition-colors"
                     >
                         <Edit2 size={14} className="mr-3" />
                         Editer
                     </button>
                     <button 
                        onClick={() => deleteTimer(timer.id)}
                        className="flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[var(--bg-hover)] hover:text-red-300 rounded-md text-left transition-colors"
                     >
                         <Trash2 size={14} className="mr-3" />
                         Supprimer
                     </button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>

      {/* Circle & Digits */}
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                <circle cx="90" cy="90" r="86" stroke="var(--border)" strokeWidth="4" fill="transparent"/>
                <circle cx="90" cy="90" r="86" stroke="var(--accent)" strokeWidth="4" fill="transparent" strokeLinecap="round" strokeDasharray={2 * Math.PI * 86} strokeDashoffset={2 * Math.PI * 86 * (percent / 100)} 
                    className="transition-all duration-1000 ease-linear"
                    style={{ willChange: "stroke-dashoffset" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-light tracking-widest text-[var(--text-main)] select-none tabular-nums">
                {timer.initialSeconds >= 3600 ? (
                    <>
                        <Digit value={hDisplay[0]} /><Digit value={hDisplay[1]} />
                        <span className="text-[var(--text-muted)] mx-[1px] -mt-1">:</span>
                    </>
                ) : null}
                <Digit value={mDisplay[0]} /><Digit value={mDisplay[1]} />
                <span className="text-[var(--text-muted)] mx-[1px] -mt-1">:</span>
                <Digit value={sDisplay[0]} /><Digit value={sDisplay[1]} />
            </div>
        </div>
      </div>

      {/* Footer: Controls */}
      <div className="flex justify-center items-center gap-4 pt-2 h-16 shrink-0 z-10">
        <button
          onClick={() => toggleTimer(timer.id)}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)]`}
        >
          {timer.isRunning ? <Pause size={24} className="text-[var(--text-inverted)] fill-[var(--text-inverted)]" /> : <Play size={24} className="text-[var(--text-inverted)] fill-[var(--text-inverted)] ml-1" />}
        </button>
        
        <button
            onClick={() => resetTimer(timer.id)}
            disabled={timer.initialSeconds === timer.remainingSeconds && !timer.isRunning}
            className={`h-10 w-10 rounded-full flex items-center justify-center bg-[var(--bg-hover)] hover:bg-[var(--border-hover)] text-[var(--text-main)] transition-all 
                ${timer.initialSeconds === timer.remainingSeconds && !timer.isRunning ? 'opacity-30 cursor-not-allowed scale-90' : 'opacity-100 scale-100'}`}
        >
            <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
});

const Timer: React.FC = () => {
  // Initialisation avec récupération du localStorage
  const [timers, setTimers] = useState<TimerType[]>(() => {
    try {
      const saved = localStorage.getItem('fluent_clock_timers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erreur chargement timers", e);
    }
    return DEFAULT_TIMERS_DATA;
  });

  // Sound State
  const [availableSounds, setAvailableSounds] = useState<Sound[]>(DEFAULT_SOUNDS);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null); 
  
  // Timer Finished State
  const [finishedTimer, setFinishedTimer] = useState<TimerType | null>(null);
  const [customExtensionTime, setCustomExtensionTime] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHours, setNewHours] = useState(0);
  const [newMinutes, setNewMinutes] = useState(0);
  const [newSeconds, setNewSeconds] = useState(0);
  const [newLabel, setNewLabel] = useState('');
  const [selectedSoundUrl, setSelectedSoundUrl] = useState<string>(DEFAULT_SOUND_1);

  // Menu State
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Refs for Audio
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('fluent_clock_timers', JSON.stringify(timers));
  }, [timers]);

  // Load custom sounds from LocalStorage on mount
  useEffect(() => {
    const savedSounds = localStorage.getItem('fluent_clock_custom_sounds');
    if (savedSounds) {
      try {
        const parsed = JSON.parse(savedSounds);
        setAvailableSounds([...DEFAULT_SOUNDS, ...parsed]);
      } catch (e) {
        console.error("Failed to load sounds", e);
      }
    }
  }, []);

  // Handler for timer finish
  const handleTimerFinish = (timer: TimerType) => {
      setFinishedTimer(timer);
      
      if (ringAudioRef.current) {
          ringAudioRef.current.pause();
          ringAudioRef.current.currentTime = 0;
      }

      const soundToPlay = timer.soundUrl || DEFAULT_SOUND_1;
      
      // Ne jouer le son que si ce n'est pas "Aucun son"
      if (soundToPlay !== NO_SOUND_URL) {
        try {
          ringAudioRef.current = new Audio(soundToPlay);
          ringAudioRef.current.loop = true; // Loop is explicitly set here
          // Important: catch error if play fails (e.g. user hasn't interacted with document)
          const playPromise = ringAudioRef.current.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.warn("Auto-play prevented:", error);
              });
          }
        } catch (err) {
            console.warn("Audio initialization failed:", err);
        }
      }
      
      // Notification système améliorée
      if (Notification.permission === 'granted') {
          new Notification("⏱️ Minuteur terminé", { 
            body: timer.label || "Le minuteur est terminé",
            icon: "/icons/icon.svg",
            badge: "/icons/icon.svg",
            tag: `timer-${timer.id}`,
            requireInteraction: true
          });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification("⏱️ Minuteur terminé", { 
                  body: timer.label || "Le minuteur est terminé",
                  icon: "/icons/icon.svg",
                  badge: "/icons/icon.svg",
                  tag: `timer-${timer.id}`,
                  requireInteraction: true
                });
            }
        });
      }
  };

  // Ref to hold the latest version of the handler to avoid stale closures in setInterval
  const handleTimerFinishRef = useRef(handleTimerFinish);
  useEffect(() => {
      handleTimerFinishRef.current = handleTimerFinish;
  });

  // Timer Tick Logic
  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - lastTickRef.current) / 1000);
          
          if (elapsed >= 1) {
              lastTickRef.current = now;
              setTimers(prev => {
                  let hasChanges = false;
                  const next = prev.map(t => {
                      if (t.isRunning) {
                          if (t.remainingSeconds > 0) {
                              hasChanges = true;
                              const newRemaining = Math.max(0, t.remainingSeconds - elapsed);
                              if (newRemaining === 0) {
                                  setTimeout(() => handleTimerFinishRef.current(t), 0);
                                  return { ...t, remainingSeconds: 0, isRunning: false };
                              }
                              return { ...t, remainingSeconds: newRemaining };
                          }
                      }
                      return t;
                  });
                  return hasChanges ? next : prev;
              });
          }
      }, 1000);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
        clearInterval(interval);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const stopFinishedTimer = () => {
      if (ringAudioRef.current) {
          ringAudioRef.current.pause();
          ringAudioRef.current.currentTime = 0;
      }
      setFinishedTimer(null);
      setShowCustomInput(false);
      setCustomExtensionTime('');
  };

  const extendTimer = (minutes: number) => {
      if (!finishedTimer) return;
      
      const additionalSeconds = minutes * 60;
      lastTickRef.current = Date.now();
      
      setTimers(prev => prev.map(t => {
          if (t.id === finishedTimer.id) {
              return {
                  ...t,
                  remainingSeconds: additionalSeconds,
                  initialSeconds: additionalSeconds, 
                  isRunning: true
              };
          }
          return t;
      }));
      
      stopFinishedTimer();
  };

  const handleExtensionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'custom') {
          setShowCustomInput(true);
      } else {
          setShowCustomInput(false);
          extendTimer(parseInt(value, 10));
      }
  };

  const handleCustomExtensionSubmit = () => {
      const minutes = parseInt(customExtensionTime, 10);
      if (!isNaN(minutes) && minutes > 0) {
          extendTimer(minutes);
      }
  };

  const handleSoundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const result = e.target?.result as string;
              const newSound: Sound = {
                  id: generateId(),
                  name: file.name.replace(/\.[^/.]+$/, ""),
                  url: result,
                  isCustom: true
              };
              
              const updatedSounds = [...availableSounds, newSound];
              setAvailableSounds(updatedSounds);
              setSelectedSoundUrl(newSound.url);
              
              const customSounds = updatedSounds.filter(s => s.isCustom);
              localStorage.setItem('fluent_clock_custom_sounds', JSON.stringify(customSounds));
          };
          reader.readAsDataURL(file);
      }
  };

  const togglePreviewSound = (url: string, id: string) => {
      if (previewPlaying === id) {
          if (previewAudioRef.current) {
              previewAudioRef.current.pause();
              previewAudioRef.current.currentTime = 0;
          }
          setPreviewPlaying(null);
      } else {
          if (previewAudioRef.current) {
              previewAudioRef.current.pause();
          }
          try {
            previewAudioRef.current = new Audio(url);
            previewAudioRef.current.onended = () => setPreviewPlaying(null);
            const playPromise = previewAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Preview play failed:", e));
            }
            setPreviewPlaying(id);
          } catch(err) {
            console.warn("Preview initialization failed:", err);
            setPreviewPlaying(null);
          }
      }
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
          if (t.id === id) {
              // Réinitialiser le dernier tick au moment où on démarre
              if (!t.isRunning) {
                  lastTickRef.current = Date.now();
              }
              return { ...t, isRunning: !t.isRunning };
          }
          return t;
      })
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: false, remainingSeconds: t.initialSeconds } : t))
    );
  };

  const openAddModal = () => {
    setNewHours(0);
    setNewMinutes(0);
    setNewSeconds(0);
    setNewLabel(`Minuteur (${timers.length + 1})`);
    setSelectedSoundUrl(DEFAULT_SOUND_1);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (timer: TimerType) => {
    const h = Math.floor(timer.initialSeconds / 3600);
    const m = Math.floor((timer.initialSeconds % 3600) / 60);
    const s = timer.initialSeconds % 60;
    
    setNewHours(h);
    setNewMinutes(m);
    setNewSeconds(s);
    setNewLabel(timer.label);
    setSelectedSoundUrl(timer.soundUrl || DEFAULT_SOUND_1);
    setEditingId(timer.id);
    setIsModalOpen(true);
    setMenuOpenId(null);
  };

  const deleteTimer = (id: string) => {
      setTimers(prev => prev.filter(t => t.id !== id));
      setMenuOpenId(null);
  };

  const saveTimer = () => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60) + newSeconds;
    if (totalSeconds === 0) return; 

    if (editingId) {
        setTimers(prev => prev.map(t => t.id === editingId ? {
            ...t,
            initialSeconds: totalSeconds,
            remainingSeconds: totalSeconds,
            isRunning: false,
            label: newLabel || 'Minuteur',
            soundUrl: selectedSoundUrl
        } : t));
    } else {
        const newTimer: TimerType = {
            id: generateId(),
            initialSeconds: totalSeconds,
            remainingSeconds: totalSeconds,
            isRunning: false,
            label: newLabel || 'Minuteur',
            soundUrl: selectedSoundUrl
        };
        setTimers([...timers, newTimer]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        setPreviewPlaying(null);
    }
  };

  const pad = (num: number) => num.toString().padStart(2, '0');

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number) => {
    setter((value + 1) % max);
  };
  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number) => {
    setter((value - 1 + max) % max);
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-24 pr-2">
        {timers.map((timer) => (
          <TimerItem 
            key={timer.id}
            timer={timer}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            openEditModal={openEditModal}
            deleteTimer={deleteTimer}
            menuRef={menuRef}
          />
        ))}
      </div>

      <div className="absolute bottom-8 right-8 flex space-x-3 z-10">
         <button onClick={openAddModal} className="h-12 w-12 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverted)] rounded-lg flex items-center justify-center shadow-lg transition-colors hover:scale-105 active:scale-95">
            <Plus size={28} strokeWidth={1.5} />
         </button>
      </div>

      {/* Finished Timer Popup - Portalled to body to show over any tab */}
      {finishedTimer && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-modal)] backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-[var(--bg-card)] p-8 rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-md text-center">
                  <Bell className="w-16 h-16 text-[var(--accent)] mx-auto mb-6 animate-bounce" />
                  <h2 className="text-3xl font-semibold text-[var(--text-main)] mb-2">{finishedTimer.label}</h2>
                  <p className="text-[var(--text-muted)] mb-8">Le minuteur est terminé</p>
                  
                  <div className="flex flex-col gap-4">
                      <button 
                        onClick={stopFinishedTimer} 
                        className="w-full bg-[var(--accent)] text-[var(--text-inverted)] font-semibold py-3 rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                      >
                          Arrêter
                      </button>
                      
                      <div className="flex gap-2 items-center">
                          {!showCustomInput ? (
                             <select 
                                className="w-full bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] rounded-md py-3 px-4 focus:outline-none focus:border-[var(--accent)] appearance-none cursor-pointer hover:bg-[var(--border)] transition-colors"
                                onChange={handleExtensionSelect}
                                value=""
                             >
                                <option value="" disabled>Ajouter du temps...</option>
                                <option value="1">1 minute</option>
                                <option value="5">5 minutes</option>
                                <option value="10">10 minutes</option>
                                <option value="15">15 minutes</option>
                                <option value="20">20 minutes</option>
                                <option value="25">25 minutes</option>
                                <option value="custom">Personnalisé</option>
                             </select>
                          ) : (
                             <div className="flex w-full gap-2 animate-in slide-in-from-right duration-200">
                                 <input 
                                    type="number" 
                                    placeholder="Minutes"
                                    className="flex-1 bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border)] rounded-md px-3 outline-none focus:border-[var(--accent)]"
                                    value={customExtensionTime}
                                    onChange={(e) => setCustomExtensionTime(e.target.value)}
                                    autoFocus
                                 />
                                 <button onClick={handleCustomExtensionSubmit} className="bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] px-4 rounded-md border border-[var(--border)]">
                                     <Plus size={18} />
                                 </button>
                                 <button onClick={() => setShowCustomInput(false)} className="bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-muted)] px-3 rounded-md border border-[var(--border)]">
                                     <X size={18} />
                                 </button>
                             </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Add/Edit Timer Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-modal)] backdrop-blur-sm">
           <div className="bg-[var(--bg-card)] w-[450px] rounded-lg shadow-2xl border border-[var(--border)] p-6 text-[var(--text-main)] flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-base font-semibold mb-6">{editingId ? 'Modifier le minuteur' : 'Ajouter un nouveau minuteur'}</h2>

              {/* Time Picker */}
              <div className="flex justify-center items-center mb-6 relative">
                  <div className="absolute bottom-2 left-10 right-10 h-[2px] bg-[var(--accent)]"></div>
                  <div className="flex flex-col items-center mx-2">
                      <button onClick={() => increment(setNewHours, newHours, 24)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronUp size={20}/></button>
                      <div className="text-5xl font-semibold py-2 font-[Segoe UI Variable Display] tabular-nums">{pad(newHours)}</div>
                      <button onClick={() => decrement(setNewHours, newHours, 24)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronDown size={20}/></button>
                  </div>
                  <span className="text-4xl pb-4">:</span>
                  <div className="flex flex-col items-center mx-2">
                      <button onClick={() => increment(setNewMinutes, newMinutes, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronUp size={20}/></button>
                      <div className="text-5xl font-semibold py-2 font-[Segoe UI Variable Display] tabular-nums">{pad(newMinutes)}</div>
                      <button onClick={() => decrement(setNewMinutes, newMinutes, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronDown size={20}/></button>
                  </div>
                  <span className="text-4xl pb-4">:</span>
                  <div className="flex flex-col items-center mx-2">
                      <button onClick={() => increment(setNewSeconds, newSeconds, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronUp size={20}/></button>
                      <div className="text-5xl font-semibold py-2 font-[Segoe UI Variable Display] tabular-nums">{pad(newSeconds)}</div>
                      <button onClick={() => decrement(setNewSeconds, newSeconds, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded"><ChevronDown size={20}/></button>
                  </div>
              </div>

              {/* Label Input */}
              <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Pencil size={16} className="text-[var(--text-main)]" />
                  </div>
                  <input 
                    type="text" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="bg-[var(--bg-hover)] border border-transparent border-b-2 border-b-[var(--text-muted)] focus:border-b-[var(--accent)] text-[var(--text-main)] text-sm rounded-t-md block w-full pl-10 p-2.5 outline-none transition-colors"
                    placeholder="Nom du minuteur"
                  />
              </div>

              {/* Sound Selection */}
              <div className="mb-8">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Sonnerie</label>
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <select 
                            value={selectedSoundUrl}
                            onChange={(e) => setSelectedSoundUrl(e.target.value)}
                            className="bg-[var(--bg-hover)] text-[var(--text-main)] text-sm rounded-md block w-full p-2.5 outline-none border border-transparent focus:border-[var(--accent)] appearance-none"
                          >
                              {availableSounds.map(sound => (
                                  <option key={sound.id} value={sound.url}>{sound.name}</option>
                              ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-3 text-[var(--text-muted)] pointer-events-none" />
                      </div>
                      
                      <button 
                        onClick={() => {
                            const sound = availableSounds.find(s => s.url === selectedSoundUrl);
                            if (sound && sound.url !== NO_SOUND_URL) togglePreviewSound(sound.url, sound.id);
                        }}
                        disabled={selectedSoundUrl === NO_SOUND_URL}
                        className={`p-2.5 rounded-md border border-[var(--border)] transition-colors ${
                          selectedSoundUrl === NO_SOUND_URL 
                            ? 'opacity-50 cursor-not-allowed bg-[var(--bg-hover)] text-[var(--text-muted)]' 
                            : previewPlaying 
                              ? 'bg-[var(--accent)] text-[var(--text-inverted)] border-[var(--accent)]' 
                              : 'bg-[var(--bg-hover)] text-[var(--text-main)] hover:bg-[var(--border)]'
                        }`}
                        title={selectedSoundUrl === NO_SOUND_URL ? "Aucun son sélectionné" : "Écouter"}
                      >
                         {previewPlaying ? <Square size={18} fill="currentColor" /> : <Volume2 size={18} />}
                      </button>

                      <div className="relative">
                          <input 
                            type="file" 
                            accept="audio/*"
                            onChange={handleSoundUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Importer une sonnerie"
                          />
                          <button className="h-full px-3 bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] rounded-md border border-[var(--border)] flex items-center justify-center">
                              <Upload size={18} />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between space-x-2 mt-auto">
                  <button 
                    onClick={saveTimer}
                    className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverted)] font-normal rounded-[4px] px-4 py-2 flex items-center justify-center transition-colors"
                  >
                      <Disc size={18} className="mr-2" />
                      Enregistrer
                  </button>
                  <button 
                    onClick={() => { setIsModalOpen(false); if(previewAudioRef.current) { previewAudioRef.current.pause(); setPreviewPlaying(null); } }}
                    className="flex-1 bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] font-normal rounded-[4px] px-4 py-2 flex items-center justify-center transition-colors border border-[var(--border)]"
                  >
                      <X size={18} className="mr-2" />
                      Annuler
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Timer;