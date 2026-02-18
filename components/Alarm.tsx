import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Trash2, Bell, BellOff, X, ChevronUp, ChevronDown, Disc, Edit2, Volume2, Square, Upload } from 'lucide-react';
import { Alarm as AlarmType, Sound } from '../types';
import { generateId } from '../utils';

// Sounds Configuration
const DEFAULT_SOUND_1 = "https://ik.imagekit.io/clwjg33dzn/An_original,_underst__2-1770653026374.mp3";
const DEFAULT_SOUND_2 = "https://ik.imagekit.io/clwjg33dzn/An_original,_underst__4-1770653030241.mp3";
const NO_SOUND_URL = "__NO_SOUND__";

const DEFAULT_SOUNDS: Sound[] = [
  { id: 'no-sound', name: '🔇 Aucun son', url: NO_SOUND_URL, isCustom: false },
  { id: 'default-1', name: 'Cosmic', url: DEFAULT_SOUND_1, isCustom: false },
  { id: 'default-2', name: 'Ethereal', url: DEFAULT_SOUND_2, isCustom: false },
];

const DAYS_OPTIONS = ['L', 'Ma', 'Me', 'J', 'V', 'S', 'D'];
const DEFAULT_ALARMS: AlarmType[] = [];

const Alarm: React.FC = () => {
  // Initialisation avec récupération du localStorage
  const [alarms, setAlarms] = useState<AlarmType[]>(() => {
    try {
      const saved = localStorage.getItem('fluent_clock_alarms');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erreur chargement alarmes", e);
    }
    return DEFAULT_ALARMS;
  });

  // Sound State
  const [availableSounds, setAvailableSounds] = useState<Sound[]>(DEFAULT_SOUNDS);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalHours, setModalHours] = useState(7);
  const [modalMinutes, setModalMinutes] = useState(0);
  const [modalLabel, setModalLabel] = useState('Alarme');
  const [modalDays, setModalDays] = useState<string[]>(['L', 'Ma', 'Me', 'J', 'V']);
  const [selectedSoundUrl, setSelectedSoundUrl] = useState<string>(DEFAULT_SOUND_1);

  const [ringingAlarm, setRingingAlarm] = useState<AlarmType | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('fluent_clock_alarms', JSON.stringify(alarms));
  }, [alarms]);

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

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const triggerAlarm = (alarm: AlarmType) => {
      setRingingAlarm(alarm);
      
      // Stop previous audio if any
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }

      const soundToPlay = alarm.soundUrl || DEFAULT_SOUND_1;

      // Ne jouer le son que si ce n'est pas "Aucun son"
      if (soundToPlay !== NO_SOUND_URL) {
        try {
          audioRef.current = new Audio(soundToPlay);
          audioRef.current.loop = true;
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
               playPromise.catch(e => console.error("Audio play failed (Alarm):", e));
          }
        } catch (e) {
            console.warn("Failed to initialize audio:", e);
        }
      }

      // Notification système améliorée
      if (Notification.permission === "granted") {
          new Notification("⏰ Alarme", { 
            body: alarm.label || "Alarme !",
            icon: "/icons/icon.svg",
            badge: "/icons/icon.svg",
            tag: `alarm-${alarm.id}`,
            requireInteraction: true
          });
      }
  };

  const stopAlarm = () => {
      setRingingAlarm(null);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  // Clock & Alarm Check Logic
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      const currentSeconds = now.getSeconds();
      
      // Prevent multiple triggers within the same minute
      if (currentSeconds !== 0) return;

      const dayMapping = ['D', 'L', 'Ma', 'Me', 'J', 'V', 'S'];
      const currentDay = dayMapping[now.getDay()];

      const alarmToTrigger = alarms.find(alarm => {
         if (!alarm.isActive) return false;
         if (alarm.time !== currentTime) return false;
         
         if (alarm.days.length === 0) return true;
         return alarm.days.includes(currentDay);
      });

      if (alarmToTrigger && !ringingAlarm) {
         triggerAlarm(alarmToTrigger);
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarm]);

  const toggleAlarm = (id: string) => {
      setAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const deleteAlarm = (id: string) => {
      setAlarms(alarms.filter(a => a.id !== id));
  };

  // Sound Handling Logic (duplicated from Timer for independence)
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

  const openAddModal = () => {
      setModalHours(7);
      setModalMinutes(0);
      setModalLabel('Alarme');
      setModalDays(['L', 'Ma', 'Me', 'J', 'V']);
      setSelectedSoundUrl(DEFAULT_SOUND_1);
      setEditingId(null);
      setIsModalOpen(true);
  };

  const openEditModal = (alarm: AlarmType) => {
      const [h, m] = alarm.time.split(':').map(Number);
      setModalHours(h);
      setModalMinutes(m);
      setModalLabel(alarm.label);
      setModalDays(alarm.days);
      setSelectedSoundUrl(alarm.soundUrl || DEFAULT_SOUND_1);
      setEditingId(alarm.id);
      setIsModalOpen(true);
  };

  const saveAlarm = () => {
      const timeStr = `${modalHours.toString().padStart(2, '0')}:${modalMinutes.toString().padStart(2, '0')}`;
      
      // Stop preview if playing
      if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          setPreviewPlaying(null);
      }

      if (editingId) {
          setAlarms(prev => prev.map(a => a.id === editingId ? {
              ...a,
              time: timeStr,
              label: modalLabel,
              days: modalDays,
              soundUrl: selectedSoundUrl
          } : a));
      } else {
          const newAlarm: AlarmType = {
              id: generateId(),
              time: timeStr,
              label: modalLabel,
              isActive: true,
              days: modalDays,
              soundUrl: selectedSoundUrl
          };
          setAlarms([...alarms, newAlarm]);
      }
      setIsModalOpen(false);
  };

  const toggleDay = (day: string) => {
      setModalDays(prev => 
          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
  };

  const pad = (num: number) => num.toString().padStart(2, '0');
  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number) => setter((value + 1) % max);
  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number) => setter((value - 1 + max) % max);

  return (
    <div className="p-8 h-full relative">
      <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto overflow-y-auto pb-24">
          {alarms.map(alarm => (
              <div key={alarm.id} className="bg-[var(--bg-card)] p-4 rounded-lg flex items-center justify-between group border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors shadow-md">
                  <div>
                      <div className="text-5xl font-light font-[Segoe UI Variable Display] tracking-wide mb-1 text-[var(--text-main)]">{alarm.time}</div>
                      <div className="text-[var(--text-muted)] text-sm flex items-center space-x-2">
                        <span className="font-medium">{alarm.label}</span>
                        {alarm.days.length > 0 && <span className="text-[var(--text-muted)] opacity-60">•</span>}
                        <span className="text-[var(--text-muted)] text-xs opacity-80">{alarm.days.join(' ')}</span>
                      </div>
                  </div>
                  <div className="flex items-center space-x-4">
                       <button 
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${alarm.isActive ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-bg)]'}`}
                       >
                           <div className={`absolute top-1 w-4 h-4 bg-[var(--toggle-circle)] rounded-full transition-all shadow-sm ${alarm.isActive ? 'left-7' : 'left-1'}`}></div>
                       </button>
                       <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                           <button onClick={() => openEditModal(alarm)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 rounded-md hover:bg-[var(--bg-hover)]">
                               <Edit2 size={18} />
                           </button>
                           <button onClick={() => deleteAlarm(alarm.id)} className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-md hover:bg-[var(--bg-hover)]">
                               <Trash2 size={18} />
                           </button>
                       </div>
                  </div>
              </div>
          ))}
          
          {alarms.length === 0 && (
             <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
                 <BellOff size={48} className="mb-4 opacity-30" />
                 <p className="text-lg">Aucune alarme configurée</p>
                 <p className="text-sm opacity-60">Ajoutez une alarme pour commencer</p>
             </div>
          )}
      </div>

       {/* Floating Action Button */}
      <div className="absolute bottom-8 right-8 z-10">
         <button 
            onClick={openAddModal}
            className="h-14 w-14 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverted)] rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
         >
            <Plus size={28} strokeWidth={2} />
         </button>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-modal)] backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[var(--bg-card)] w-[450px] rounded-xl shadow-2xl border border-[var(--border)] p-6 text-[var(--text-main)] flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-6">{editingId ? 'Modifier l\'alarme' : 'Ajouter une alarme'}</h2>

              {/* Time Picker */}
              <div className="flex justify-center items-center mb-8 relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-[60px] bg-[var(--bg-hover)] rounded-lg -z-10"></div>
                  
                  <div className="flex flex-col items-center mx-2 z-10">
                      <button onClick={() => increment(setModalHours, modalHours, 24)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 mb-1"><ChevronUp size={24}/></button>
                      <div className="text-6xl font-light py-1 font-[Segoe UI Variable Display] tabular-nums w-[2ch] text-center">{pad(modalHours)}</div>
                      <button onClick={() => decrement(setModalHours, modalHours, 24)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 mt-1"><ChevronDown size={24}/></button>
                  </div>
                  <span className="text-6xl pb-4 text-[var(--text-muted)] font-light mx-1">:</span>
                  <div className="flex flex-col items-center mx-2 z-10">
                      <button onClick={() => increment(setModalMinutes, modalMinutes, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 mb-1"><ChevronUp size={24}/></button>
                      <div className="text-6xl font-light py-1 font-[Segoe UI Variable Display] tabular-nums w-[2ch] text-center">{pad(modalMinutes)}</div>
                      <button onClick={() => decrement(setModalMinutes, modalMinutes, 60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 mt-1"><ChevronDown size={24}/></button>
                  </div>
              </div>

              {/* Label Input */}
              <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Pencil size={16} className="text-[var(--text-muted)] group-focus-within:text-[var(--accent)]" />
                  </div>
                  <input 
                    type="text" 
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    className="bg-[var(--bg-hover)] border-2 border-transparent focus:border-[var(--accent)] text-[var(--text-main)] text-sm rounded-md block w-full pl-10 p-3 outline-none transition-colors"
                    placeholder="Nom de l'alarme"
                  />
              </div>

              {/* Days Selection */}
              <div className="mb-6">
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">Répéter</label>
                  <div className="flex justify-between">
                     {DAYS_OPTIONS.map(day => (
                         <button 
                           key={day}
                           onClick={() => toggleDay(day)}
                           className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 border-2
                             ${modalDays.includes(day) 
                                ? 'bg-[var(--accent)] text-[var(--text-inverted)] border-[var(--accent)]' 
                                : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-main)]'}`}
                         >
                           {day}
                         </button>
                     ))}
                  </div>
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
              <div className="flex justify-between space-x-3 mt-auto">
                  <button 
                    onClick={saveAlarm}
                    className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverted)] font-semibold rounded-md px-4 py-3 flex items-center justify-center transition-colors"
                  >
                      <Disc size={20} className="mr-2" />
                      Enregistrer
                  </button>
                  <button 
                    onClick={() => { setIsModalOpen(false); if(previewAudioRef.current) { previewAudioRef.current.pause(); setPreviewPlaying(null); } }}
                    className="flex-1 bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text-main)] font-medium rounded-md px-4 py-3 flex items-center justify-center transition-colors border border-[var(--border)]"
                  >
                      <X size={20} className="mr-2" />
                      Annuler
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Ringing Overlay - Portalled to body to show over any tab */}
      {ringingAlarm && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-modal)] backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-[var(--bg-card)] p-8 rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-md text-center">
                  <Bell className="w-16 h-16 text-[var(--accent)] mx-auto mb-6 animate-bounce" />
                  <h2 className="text-5xl font-light mb-2 text-[var(--text-main)] font-[Segoe UI Variable Display]">{ringingAlarm.time}</h2>
                  <p className="text-xl text-[var(--text-muted)] mb-8">{ringingAlarm.label}</p>
                  <button 
                    onClick={stopAlarm} 
                    className="w-full bg-[var(--accent)] text-[var(--text-inverted)] font-semibold py-3 rounded-md hover:bg-[var(--accent-hover)] transition-colors"
                  >
                      Arrêter
                  </button>
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default Alarm;