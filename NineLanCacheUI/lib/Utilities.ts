export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do {
    bytes /= 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(1)} ${units[i]}`;
};

export const chartPalette = [
  '#4CAF50',
  '#ff3131ff',
  '#00bcd4',
  '#60a5fa',
  '#fbbf24',
  '#a78bfa',
  '#cbd5e1', 
  '#fb7185', 
  '#34d399', 
];

