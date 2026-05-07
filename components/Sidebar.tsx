import React, { useState } from 'react';
import { Hourglass, Bell, Timer, Settings, X, Check, Sun, Moon, Zap, ZapOff, Coffee } from 'lucide-react';
import { Tab } from '../types';
import { useTheme, PRESET_COLORS } from './ThemeContext';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [modalAnimationState, setModalAnimationState] = useState<'idle'|'entering'|'entered'|'exiting'>('idle');
   const MODAL_ANIM_DURATION = 220;
  const { theme, setMode, setAccentColor, setReducedMotion, setWakeLockEnabled } = useTheme();

  const menuItems = [
    { id: 'minuteur', label: 'Minuteur', icon: Hourglass },
    { id: 'alarme', label: 'Alarme', icon: Bell },
    { id: 'chrono', label: 'Chrono', icon: Timer },
  ] as const;

  return (
    <>
      <div className="w-[60px] md:w-[280px] h-full bg-[var(--bg-main)] flex flex-col pt-4 border-r border-[var(--border)] select-none transition-colors duration-300">
        <div className="flex flex-col space-y-1 flex-1">
          {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
                     return (
                        <div key={item.id} className="relative mx-1">
                           <button
                              onClick={() => setActiveTab(item.id as Tab)}
                              className={`flex items-center h-10 w-full px-3 rounded-md transition-all duration-200 group relative
                                 ${isActive ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'}`}
                           >
                              {isActive && (
                                    <motion.div 
                                       layoutId="sidebar-active-indicator" 
                                       style={{
                                          position: "absolute",
                                          left: "0.25rem",
                                          top: "0.75rem",
                                          bottom: "0.75rem",
                                          width: "0.25rem",
                                          backgroundColor: "var(--accent)",
                                          borderRadius: "9999px"
                                       }}
                                    />
                              )}
                              <Icon 
                                 size={18} 
                                 className={`${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'} min-w-[20px] ml-1`} 
                                 strokeWidth={isActive ? 2 : 1.5} 
                              />
                              <span className={`ml-4 text-sm font-normal hidden md:block ${isActive ? 'text-[var(--text-main)] font-semibold' : 'text-[var(--text-muted)]'}`}>
                                 {item.label}
                              </span>
                           </button>
                        </div>
              );
          })}
        </div>

        {/* Settings Button */}
        <div className="pb-4 pt-2 border-t border-[var(--border)] mx-1">
               <button
                  onClick={() => {
                     setIsSettingsOpen(true);
                     setModalAnimationState('entering');
                     window.setTimeout(() => setModalAnimationState('entered'), MODAL_ANIM_DURATION);
                  }}
                  className="flex items-center h-10 w-full px-3 rounded-md transition-all duration-200 hover:bg-[var(--bg-hover)] group"
               >
             <Settings 
                size={18} 
                className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] min-w-[20px] ml-1" 
                strokeWidth={1.5}
             />
             <span className="ml-4 text-sm font-normal hidden md:block text-[var(--text-muted)] group-hover:text-[var(--text-main)]">
                Paramètres
             </span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
         {isSettingsOpen && (
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm modal-overlay ${modalAnimationState === 'entering' ? 'overlay-enter' : ''} ${modalAnimationState === 'entered' ? 'overlay-entered' : ''} ${modalAnimationState === 'exiting' ? 'overlay-exit' : ''}`}>
                <div className={`bg-[var(--bg-card)] w-[500px] rounded-xl shadow-2xl border border-[var(--border)] p-6 text-[var(--text-main)] flex flex-col max-h-[90vh] overflow-y-auto modal-card ${modalAnimationState === 'entering' ? 'modal-enter' : ''} ${modalAnimationState === 'entered' ? 'modal-entered' : ''} ${modalAnimationState === 'exiting' ? 'modal-exit' : ''}`}>
              <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
                 <h2 className="text-xl font-semibold">Paramètres</h2>
                 <button onClick={() => {
                     setModalAnimationState('exiting');
                     window.setTimeout(() => { setIsSettingsOpen(false); setModalAnimationState('idle'); }, MODAL_ANIM_DURATION);
                 }} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 hover:bg-[var(--bg-hover)] rounded-md">
                    <X size={20} />
                 </button>
              </div>

              {/* Theme Selection */}
              <section className="mb-8">
                <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase mb-3 tracking-wider">Thème</h3>
                <div className="flex space-x-4">
                   <button 
                     onClick={() => setMode('light')}
                     className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${theme.mode === 'light' ? 'border-[var(--accent)] bg-[var(--bg-hover)]' : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'}`}
                   >
                      <Sun size={24} className={theme.mode === 'light' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                      <span className="text-sm">Clair</span>
                   </button>
                   <button 
                     onClick={() => setMode('dark')}
                     className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${theme.mode === 'dark' ? 'border-[var(--accent)] bg-[var(--bg-hover)]' : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'}`}
                   >
                      <Moon size={24} className={theme.mode === 'dark' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                      <span className="text-sm">Sombre</span>
                   </button>
                </div>
              </section>

              {/* Accent Color Selection */}
              <section className="mb-8">
                <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase mb-3 tracking-wider">Couleur d'accentuation</h3>
                <div className="grid grid-cols-5 gap-3">
                   {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setAccentColor(color.value)}
                        className="w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border border-[var(--border)] relative"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                         {theme.accentColor === color.value && (
                           <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />
                         )}
                      </button>
                   ))}
                </div>
              </section>

              {/* Motion Reduced */}
              <section className="mb-6">
                 <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase mb-3 tracking-wider">Accessibilité</h3>
                 <div 
                    onClick={() => setReducedMotion(!theme.reducedMotion)}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                 >
                    <div className="flex items-center gap-3">
                       {theme.reducedMotion ? <ZapOff size={20} className="text-[var(--text-muted)]"/> : <Zap size={20} className="text-[var(--text-muted)]" />}
                       <div className="flex flex-col">
                          <span className="text-sm font-medium">Mouvement réduit</span>
                          <span className="text-xs text-[var(--text-muted)]">Désactive les animations complexes</span>
                       </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${theme.reducedMotion ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-bg)]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-[var(--toggle-circle)] rounded-full transition-all shadow-sm ${theme.reducedMotion ? 'left-6' : 'left-1'}`}></div>
                    </div>
                 </div>
              </section>

              {/* Wake Lock Protection */}
              <section className="mb-4">
                 <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase mb-3 tracking-wider">Performance</h3>
                 <div 
                    onClick={() => setWakeLockEnabled(!theme.wakeLockEnabled)}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                 >
                    <div className="flex items-center gap-3">
                       <Coffee size={20} className={theme.wakeLockEnabled ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                       <div className="flex flex-col">
                          <span className="text-sm font-medium">Empêcher la mise en veille</span>
                          <span className="text-xs text-[var(--text-muted)]">Maintient l'écran allumé pour les alarmes</span>
                       </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${theme.wakeLockEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-bg)]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-[var(--toggle-circle)] rounded-full transition-all shadow-sm ${theme.wakeLockEnabled ? 'left-6' : 'left-1'}`}></div>
                    </div>
                 </div>
                 <p className="mt-2 text-[10px] text-[var(--text-muted)] px-1 italic">
                    Note: Nécessite que l'onglet reste visible et que Windows ne soit pas en mode "Économie d'énergie" strict.
                 </p>
              </section>
           </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;