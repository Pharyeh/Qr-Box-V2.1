export function formatFresh(duration) {
  if (!duration || typeof duration !== 'string') return duration;
  const match = duration.match(/(\d+)\s*(day|hour|minute)/i);
  if (!match) return duration;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('day')) return `${value}d`;
  if (unit.startsWith('hour')) return `${value}h`;
  if (unit.startsWith('minute')) return `${value}m`;
  return duration;
} 