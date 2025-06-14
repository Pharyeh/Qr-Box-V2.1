import React from 'react';
import { FaArrowUp, FaArrowDown, FaPause, FaBalanceScale } from 'react-icons/fa';

/**
 * Badge component for displaying Bias or COT with color coding and optional score.
 * @param {string} label - The text label (e.g., 'Bullish', 'Bearish', etc.)
 * @param {number} [score] - Optional score to display (for COT)
 * @param {string} [type] - 'bias' | 'cot' (for future extension, currently same style)
 * @param {string} [className] - Additional classes
 */
export default function Badge({ label, score, type = 'cot', className = '' }) {
  let colorClass = '';
  let icon = null;
  if (label?.includes('Strong Bullish')) { colorClass = 'bg-blue-900 text-blue-200 border border-blue-400'; icon = <FaArrowUp className="inline mr-1 text-blue-300 animate-bounce" />; }
  else if (label?.includes('Bullish')) { colorClass = 'bg-green-900 text-green-200 border border-green-400'; icon = <FaArrowUp className="inline mr-1 text-green-300 animate-bounce" />; }
  else if (label?.includes('Strong Bearish')) { colorClass = 'bg-red-900 text-red-200 border border-red-400'; icon = <FaArrowDown className="inline mr-1 text-red-300 animate-bounce" />; }
  else if (label?.includes('Bearish')) { colorClass = 'bg-orange-900 text-orange-200 border border-orange-400'; icon = <FaArrowDown className="inline mr-1 text-orange-300 animate-bounce" />; }
  else if (label?.includes('Neutral')) { colorClass = 'bg-yellow-900 text-yellow-200 border border-yellow-400'; icon = <FaPause className="inline mr-1 text-yellow-300" />; }
  else if (label?.includes('No COT') || label?.includes('No Data')) { colorClass = 'bg-gray-800 text-gray-400 border border-gray-600'; icon = <FaBalanceScale className="inline mr-1 text-gray-400" />; }
  else { colorClass = 'bg-yellow-900 text-yellow-300 border border-yellow-700'; icon = <FaPause className="inline mr-1 text-yellow-300" />; }

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/70 inline-flex items-center gap-1 ${colorClass} ${className}`}
      title={score !== undefined ? `${label} (${score >= 0 ? '+' : ''}${score.toFixed(2)})` : label}
      tabIndex={0}
    >
     {icon}
      {label}
      {score !== undefined && (
        <span className="font-mono text-xs ml-1">({score >= 0 ? '+' : ''}{score.toFixed(2)})</span>
      )}
    </span>
  );
} 