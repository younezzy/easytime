export const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hDisplay = h > 0 ? h.toString().padStart(2, '0') : '00';
  const mDisplay = m.toString().padStart(2, '0');
  const sDisplay = s.toString().padStart(2, '0');

  return { hDisplay, mDisplay, sDisplay };
};

export const formatStopwatch = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  return {
    m: minutes.toString().padStart(2, '0'),
    s: seconds.toString().padStart(2, '0'),
    ms: centiseconds.toString().padStart(2, '0'),
  };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
