import React from 'react';

const PhaseTag = ({ phase, isNew = false, className = '' }) => {
  const getPhaseColor = (phase) => {
    switch (phase) {
      case 1: return 'bg-blue-500/20 text-blue-400';
      case 2: return 'bg-yellow-500/20 text-yellow-400';
      case 3: return 'bg-orange-500/20 text-orange-400';
      case 4: return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseColor(phase)} ${className}`}>
        Phase {phase}
      </span>
      {isNew && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 animate-pulse">
          New
        </span>
      )}
    </div>
  );
};

export default PhaseTag; 