import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Sound } from '../types';

interface Props {
  sounds: Sound[];
  value: string; // url
  onChange: (url: string) => void;
  disabled?: boolean;
}

const SoundSelect: React.FC<Props> = ({ sounds, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const portalEl = document.querySelector('[data-sound-select-portal]');
      // If click is inside the trigger/ref or inside the portaled list, do nothing
      if (ref.current && (ref.current.contains(target) || (portalEl && portalEl.contains(target as Node)))) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = sounds.find(s => s.url === value) || sounds[0];

  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (open && ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (open && ref.current) setRect(ref.current.getBoundingClientRect());
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-main)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate">{selected?.name}</span>
        <ChevronDown size={16} className="ml-2 text-[var(--text-muted)]" />
      </button>

      {open && rect && createPortal(
        <ul
          role="listbox"
          style={{
            position: 'fixed',
            left: rect.left,
            top: rect.bottom + 6,
            width: rect.width,
            maxHeight: 240,
            overflow: 'auto',
            zIndex: 9999
          }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-xl"
          data-sound-select-portal
        >
          {sounds.map(sound => (
            <li
              key={sound.id}
              role="option"
              aria-selected={sound.url === value}
              onClick={() => { onChange(sound.url); setOpen(false); }}
              className={`px-3 py-2 hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-main)] ${sound.url === value ? 'bg-[var(--bg-hover)] font-medium' : ''}`}
            >
              {sound.name}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
};

export default SoundSelect;
