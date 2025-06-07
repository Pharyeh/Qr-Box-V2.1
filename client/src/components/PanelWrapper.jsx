import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const PanelWrapper = ({ 
  title, 
  children, 
  onRefresh, 
  lastUpdated,
  className = '',
  showRefresh = true
}) => {
  return (
    <div className={`rounded-2xl shadow-2xl bg-white/10 dark:bg-zinc-900/70 backdrop-blur-lg border border-white/10 dark:border-zinc-800 p-8 mb-4 animate-fade-in ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent select-none drop-shadow-md">{title}</h2>
        {showRefresh && (
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Refresh data"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      {lastUpdated && (
        <div className="text-xs text-gray-400 mb-4">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
      {children}
    </div>
  );
};

export default PanelWrapper; 