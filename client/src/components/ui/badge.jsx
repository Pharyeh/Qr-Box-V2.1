import React from 'react';

const COLOR_MAP = {
  bias: {
    Bullish: 'bg-green-800 text-green-100',
    Bearish: 'bg-red-800 text-red-100',
    Neutral: 'bg-yellow-600 text-yellow-100'
  },
  cot: {
    'Strong Bullish': 'bg-green-700 text-white border border-green-500',
    Bullish: 'bg-green-800 text-green-100',
    'Extremely Bullish': 'bg-green-900 text-green-100',
    'Extreme Bullish': 'bg-green-900 text-green-100',
    Neutral: 'bg-gray-700 text-gray-300',
    Bearish: 'bg-yellow-700 text-yellow-100',
    'Strong Bearish': 'bg-red-700 text-white border border-red-500',
    'Extremely Bearish': 'bg-red-900 text-red-100',
    'Extreme Bearish': 'bg-red-900 text-red-100',
    'No COT': 'bg-zinc-700 text-zinc-300'
  },
  phase: {
    'Phase 1': 'bg-gray-700 text-gray-200',
    'Phase 2': 'bg-green-800 text-green-100',
    'Phase 3': 'bg-amber-700 text-amber-100',
    'Phase 4': 'bg-red-800 text-red-100'
  }
};

const STATUS_HINT = {
  '✅ Aligned': 'Institutional bias confirms the current market direction.',
  '⚠️ Divergence': 'COT and price bias are in conflict — caution advised.',
  '❓ Unknown': 'No strong alignment signal.'
};

const Badge = ({ label, type = 'default', score, status, glow }) => {
  const colorClass = COLOR_MAP[type]?.[label] || 'bg-zinc-600 text-white';
  const shadow = glow ? 'shadow-lg shadow-green-400/30 animate-pulse' : '';
  const tooltipText = status ? STATUS_HINT[status] : '';

  return (
    <div
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${colorClass} ${shadow}`}
      title={tooltipText}
    >
      {label}
      {score !== undefined && (
        <span className="ml-1 text-gray-400">({score >= 0 ? '+' : ''}{score.toFixed(2)})</span>
      )}
      {status && <span className="ml-2 text-xs">{status}</span>}
    </div>
  );
};

export default Badge;