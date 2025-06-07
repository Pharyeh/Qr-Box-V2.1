import React from 'react';

const ScoreBar = ({ score = 0, bias = 'Neutral', className = '', tooltip = '' }) => {
  const value = typeof score === 'number' && !isNaN(score) ? score : 0;
  let color = 'bg-gray-400';
  let glow = '';
  if (bias === 'Bullish') {
    color = 'bg-green-400';
    if (value > 0.7) glow = 'shadow-[0_0_12px_2px_rgba(34,197,94,0.5)]';
  } else if (bias === 'Bearish') {
    color = 'bg-red-400';
    if (value > 0.7) glow = 'shadow-[0_0_12px_2px_rgba(239,68,68,0.5)]';
  } else if (value > 0.7) {
    color = 'bg-green-400';
    glow = 'shadow-[0_0_12px_2px_rgba(34,197,94,0.5)]';
  } else if (value > 0.3) {
    color = 'bg-yellow-400';
  }

  return (
    <div
      className={`w-full h-2 bg-zinc-800/60 rounded-full overflow-hidden relative ${className}`}
      title={tooltip ? tooltip : value.toFixed(2)}
    >
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color} ${glow}`}
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          backdropFilter: 'blur(2px)',
          background: 'linear-gradient(90deg, rgba(0,255,153,0.7) 0%, rgba(0,119,255,0.7) 100%)',
          boxShadow: value > 0.7 ? '0 0 16px 2px rgba(0,255,153,0.25)' : undefined,
        }}
      />
    </div>
  );
};

export default ScoreBar; 