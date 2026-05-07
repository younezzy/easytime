import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatStopwatch } from '../utils';
import { Lap } from '../types';

// Animated Digit Component (reuse Timer-style animation)
const AnimatedDigit = ({ value }: { value: string }) => {
    return (
      <div className="relative w-[0.7em] h-[1.1em] inline-flex justify-center overflow-hidden tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-60%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.5
            }}
            style={{ 
              willChange: 'transform, opacity',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Segoe UI Variable Display"'
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
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
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>((() => {
    try {
      const saved = localStorage.getItem('fluent_clock_stopwatch_accumulated');
      return saved ? parseFloat(saved) : 0;
    } catch (e) {
      return 0;
    }
  })());

  useEffect(() => {
    try {
      const savedLaps = localStorage.getItem('fluent_clock_stopwatch_laps');
      if (savedLaps) setLaps(JSON.parse(savedLaps));
      const savedElapsed = localStorage.getItem('fluent_clock_stopwatch_elapsed');
      if (savedElapsed) setElapsedTime(parseFloat(savedElapsed));
    } catch (e) {
      console.error("Error loading stopwatch data", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fluent_clock_stopwatch_laps', JSON.stringify(laps));
    localStorage.setItem('fluent_clock_stopwatch_elapsed', elapsedTime.toString());
    localStorage.setItem('fluent_clock_stopwatch_accumulated', accumulatedTimeRef.current.toString());
  }, [laps, elapsedTime]);

  const animate = () => {
    if (isRunning) {
      const now = performance.now();
      const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current);
      setElapsedTime(currentElapsed);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      accumulatedTimeRef.current = elapsedTime;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const toggleStart = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = 0;
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
      
      {/* animation handled by framer-motion per-digit */}

      {/* Time Display */}
      <div className="flex flex-col items-center mb-10 mt-6 z-10">
        <div className="font-[Segoe UI Variable Display] font-semibold text-[13vh] leading-none tracking-wider tabular-nums flex items-baseline select-none text-[var(--text-main)]">
          {/* Minutes */}
          <div className="flex items-baseline">
             <AnimatedDigit value={m[0]} />
             <AnimatedDigit value={m[1]} />
          </div>

          <StaticDigit value=":" />

          {/* Seconds */}
          <div className="flex items-baseline">
             <AnimatedDigit value={s[0]} />
             <AnimatedDigit value={s[1]} />
          </div>

          {/* Fractional seconds — smaller and baseline-aligned */}
          <div className="ml-3 flex items-baseline text-[6.5vh] text-[var(--text-muted)] font-normal">
              <span className="leading-none">.</span>
              <span className="tabular-nums w-[2ch] ml-1 text-[4.2vh]">{ms}</span>
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