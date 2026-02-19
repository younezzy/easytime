import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Alarm from './components/Alarm';
import Stopwatch from './components/Stopwatch';
import { Tab } from './types';
import { ThemeProvider, useTheme } from './components/ThemeContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('minuteur');
  const { theme } = useTheme();

  // Screen Wake Lock API
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && theme.wakeLockEnabled) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen Wake Lock is active');
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    requestWakeLock();

    // Re-request when tab becomes visible again
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
          console.log('Screen Wake Lock released');
        });
      }
    };
  }, [theme.wakeLockEnabled]);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] font-sans overflow-hidden transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-full overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto relative scroll-smooth h-full">
          <div style={{ display: activeTab === 'minuteur' ? 'block' : 'none', height: '100%' }}>
            <Timer />
          </div>
          <div style={{ display: activeTab === 'alarme' ? 'block' : 'none', height: '100%' }}>
            <Alarm />
          </div>
          <div style={{ display: activeTab === 'chrono' ? 'block' : 'none', height: '100%' }}>
            <Stopwatch />
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;