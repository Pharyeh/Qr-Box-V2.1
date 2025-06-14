import React, { useState } from 'react';

export function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-zinc-800 rounded shadow-lg whitespace-nowrap
                     transform -translate-y-1/2 left-full ml-2 top-1/2
                     animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-zinc-800 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"
            style={{ boxShadow: '-2px -2px 5px rgba(0, 0, 0, 0.06)' }}
          />
        </div>
      )}
    </div>
  );
} 