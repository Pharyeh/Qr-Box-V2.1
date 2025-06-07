// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import PhaseMonitorPanel from './panels/phasemonitor/PhaseMonitorPanel.jsx';
import TradeIdeasPanel from './panels/tradeideas/TradeIdeasPanel.jsx';
import GPTThesisPanel from './panels/gptthesis/GPTThesisPanel.jsx';
import { SunIcon, MoonIcon } from './components/Icons';
import logo from './assets/logo.ico';

// Fullscreen toggle handler
function handleToggleFullscreen() {
  console.log('Fullscreen toggle button clicked');
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.send('toggle-fullscreen');
  } else {
    console.error('Fullscreen not available: Electron preload not loaded.');
    alert('Fullscreen not available: Electron preload not loaded.');
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('dashboardTheme');
    return stored ? stored : 'dark';
  });
  const [layout, setLayout] = useState(() => localStorage.getItem('dashboardLayout') || 'Default');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLayoutChange = (e) => {
    setLayout(e.target.value);
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboardLayout', layout);
    alert('Layout saved!');
  };

  // Optionally, you can use layout to change grid structure below
  let gridClass = 'grid grid-cols-1 lg:grid-cols-12 gap-6';
  let showPhase = true, showIdeas = true, showThesis = true;
  if (layout === 'Wide Monitor') gridClass = 'grid grid-cols-1 xl:grid-cols-8 gap-4';
  if (layout === 'Compact') gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-2';
  if (layout === 'Stacked') gridClass = 'flex flex-col gap-4';
  if (layout === 'Side-by-Side') gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  if (layout === 'Focus Phase Monitor') { gridClass = 'flex flex-col gap-4'; showIdeas = true; showThesis = true; }
  if (layout === 'Focus Trade Ideas') { gridClass = 'flex flex-col gap-4'; showPhase = false; showIdeas = true; showThesis = true; }
  if (layout === 'Hide GPT Thesis') { showThesis = false; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-200 p-6 space-y-6 transition-colors duration-200">
      <header className="flex justify-between items-center mb-2 rounded-2xl shadow-xl bg-white/30 dark:bg-slate-800/60 backdrop-blur-lg p-4 border border-white/10 dark:border-slate-700 transition-all duration-300">
        <div className="flex items-center gap-3">
          <img src={logo} alt="QR Box Logo" className="w-10 h-10 rounded-lg shadow-md" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            QR Box Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <select value={layout} onChange={handleLayoutChange} className="dropdown px-2 py-1 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none">
            <option value="Default">Default</option>
            <option value="Wide Monitor">Wide Monitor</option>
            <option value="Compact">Compact</option>
            <option value="Stacked">Stacked (Vertical)</option>
            <option value="Side-by-Side">Side-by-Side</option>
            <option value="Focus Phase Monitor">Focus Phase Monitor</option>
            <option value="Focus Trade Ideas">Focus Trade Ideas</option>
            <option value="Hide GPT Thesis">Hide GPT Thesis</option>
          </select>
          <button onClick={handleSaveLayout} className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-purple-500 text-white font-semibold shadow-md hover:from-sky-600 hover:to-purple-600 transition">Save Layout</button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-md bg-slate-800 hover:bg-slate-700"
            aria-label="Toggle Fullscreen"
            title="Toggle Fullscreen (F11)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-sky-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9V5.25A1.5 1.5 0 015.25 3.75H9m6 0h3.75a1.5 1.5 0 011.5 1.5V9m0 6v3.75a1.5 1.5 0 01-1.5 1.5H15m-6 0H5.25a1.5 1.5 0 01-1.5-1.5V15" />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-md ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700'
                : 'bg-slate-200 hover:bg-slate-300'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-6 h-6 text-yellow-400 animate-glow" />
            ) : (
              <MoonIcon className="w-6 h-6 text-slate-600" />
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg select-none">A</span>
          </div>
        </div>
      </header>

      <div className={gridClass}>
        {/* Phase Monitor */}
        {showPhase && (
          <div className={(layout === 'Side-by-Side' ? '' : 'lg:col-span-8') + ' rounded-2xl shadow-xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 border-t-2 border-t-sky-500 p-4 text-slate-800 dark:text-white'}>
            <PhaseMonitorPanel />
          </div>
        )}

        {/* Trade Ideas */}
        {showIdeas && (
          <div className={(layout === 'Side-by-Side' ? '' : 'lg:col-span-4') + ' rounded-2xl shadow-xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 border-t-2 border-t-purple-500 p-4 text-slate-800 dark:text-white'}>
            <TradeIdeasPanel />
          </div>
        )}

        {/* GPT Thesis */}
        {showThesis && (
          <div className={(layout === 'Side-by-Side' ? 'md:col-span-2' : 'lg:col-span-12') + ' rounded-2xl shadow-xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 border-t-2 border-t-pink-500 p-4 text-slate-800 dark:text-white'}>
            <GPTThesisPanel />
          </div>
        )}
      </div>
    </div>
  );
}
