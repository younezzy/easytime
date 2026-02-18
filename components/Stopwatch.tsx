import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Maximize2 } from 'lucide-react';
import { formatStopwatch } from '../utils';
import { Lap } from '../types';

// Animated Digit Component
const AnimatedDigit = ({ value }: { value: string }) => {
    return (
      <div className="relative inline-block overflow-hidden h-[1.1em] align-top w-[0.7em]">
        <span key={value} className="absolute inset-0 flex justify-center animate-slide-up">
          {value}
        </span>
      </div>
    );
};

// Static Digit for delimiters
const StaticDigit = ({ value }: { value: string }) => {
    return <span className="inline-block">{value}</span>;
}

const Stopwatch: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined && previousTimeRef.current !== 0) {
      const deltaTime = time - previousTimeRef.current;
      setElapsedTime(prevTime => prevTime + deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const toggleStart = () => {
    if (!isRunning) {
      previousTimeRef.current = performance.now();
      setIsRunning(true);
    } else {
      setIsRunning(false);
      previousTimeRef.current = 0;
    }
  };

  const reset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    previousTimeRef.current = 0;
  };

  const addLap = () => {
    const lastTotal = laps.length > 0 ? laps[0].time : 0;
    
    const newLap: Lap = {
      id: laps.length + 1,
      time: elapsedTime,
      split: elapsedTime - lastTotal
    };
    setLaps([newLap, ...laps]);
  };

  const { m, s, ms } = formatStopwatch(elapsedTime);

  return (
    <div className="flex flex-col items-center justify-center h-full relative p-8">
      
      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(70%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.15s ease-out;
        }
      `}</style>

      {/* Time Display */}
      <div className="flex flex-col items-center mb-10 mt-6 z-10">
        <div className="font-[Segoe UI Variable Display] font-semibold text-[13vh] leading-none tracking-wider tabular-nums flex items-baseline select-none text-[var(--text-main)]">
          <div className="flex justify-end">
             {/* Split chars for individual animation if needed, or grouped. Grouped works better for layout stability */}
             <AnimatedDigit value={m[0]} />
             <AnimatedDigit value={m[1]} />
          </div>
          <StaticDigit value=":" />
          <div className="flex justify-center">
             <AnimatedDigit value={s[0]} />
             <AnimatedDigit value={s[1]} />
          </div>
          <div className="text-4xl text-[var(--text-muted)] font-normal ml-3 pb-2 flex">
              .<span className="tabular-nums w-[2ch]">{ms}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-8 mb-12 z-10">
        {/* Reset */}
         <button
          onClick={reset}
          disabled={isRunning && elapsedTime > 0} 
          className={`h-10 w-10 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-main)] transition-all ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--border-hover)]'}`}
        >
          <RotateCcw size={16} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={toggleStart}
          className={`h-16 w-16 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverted)]`}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1"/>}
        </button>

        {/* Flag */}
        <button
          onClick={addLap}
          disabled={!isRunning}
          className={`h-10 w-10 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-main)] transition-all ${!isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--border-hover)]'}`}
        >
          <Flag size={16} />
        </button>
      </div>

      {/* Laps Table */}
      <div className="w-full max-w-2xl flex-grow overflow-hidden relative z-0 flex flex-col">
        {laps.length > 0 && (
            <div className="w-full flex text-[var(--text-muted)] text-sm mb-2 px-4 border-b border-[var(--border)] pb-2">
                 <div className="w-16">Tour</div>
                 <div className="flex-1">Temps intermédiaire</div>
                 <div className="flex-1 text-right">Temps total</div>
            </div>
        )}
        <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left border-collapse">
            <tbody>
              {laps.map((lap) => {
                  const splitFmt = formatStopwatch(lap.split);
                  const totalFmt = formatStopwatch(lap.time);
                  return (
                    <tr key={lap.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] last:border-0 group">
                      <td className="py-3 pl-4 text-[var(--text-muted)] font-semibold w-16 group-first:text-[var(--accent)]">{laps.length - lap.id + 1}</td>
                      <td className="py-3 text-[var(--text-muted)] font-mono text-base group-first:text-[var(--text-main)]">
                          {splitFmt.m}:{splitFmt.s}<span className="text-sm text-[var(--text-muted)] opacity-70 group-first:opacity-100">.{splitFmt.ms}</span>
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-muted)] font-mono text-base text-right group-first:text-[var(--text-main)]">
                          {totalFmt.m}:{totalFmt.s}<span className="text-sm text-[var(--text-muted)] opacity-70 group-first:opacity-100">.{totalFmt.ms}</span>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Decorative controls top right (Zoom) */}
      <div className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer hidden md:block">
          <Maximize2 size={18} />
      </div>
    </div>
  );
};

export default Stopwatch;