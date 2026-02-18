import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Alarm from './components/Alarm';
import Stopwatch from './components/Stopwatch';
import { Tab } from './types';
import { ThemeProvider } from './components/ThemeContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('minuteur');

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] font-sans overflow-hidden transition-colors duration-300">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 h-full overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-auto relative scroll-smooth h-full">
            {/* 
              We keep all components mounted but hide them using CSS.
              This ensures setInterval/requestAnimationFrame continues running 
              even when the user switches tabs.
            */}
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
    </ThemeProvider>
  );
};

export default App;