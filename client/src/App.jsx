// client/src/App.jsx
import React, { useState } from 'react';
import PhaseMonitorPanel from './panels/phasemonitor/PhaseMonitorPanel.jsx';
import TradeIdeasPanel from './panels/tradeideas/TradeIdeasPanel.jsx';
import GPTThesisPanel from './panels/gptthesis/GPTThesisPanel.jsx';
// import SettingsPanel from './panels/SettingsPanel.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import "./index.css";

function handleToggleFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  return (
    <ErrorBoundary>
      <div className="min-h-screen h-screen text-slate-200 p-4 flex flex-col" style={{ background: '#181A20' }}>
        <header className="flex-shrink-0 flex justify-between items-center mb-4 rounded-2xl shadow-xl bg-white/10 dark:bg-slate-800/60 backdrop-blur-lg p-4 border border-white/10 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg shadow-md bg-gradient-to-r from-sky-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">QR</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
              QR Box Dashboard
            </h1>
          </div>
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
        </header>
        <main className="flex-1 w-full">
          <PanelGroup direction="horizontal" className="h-full gap-4">
            <Panel minSize={15} defaultSize={50} className="flex flex-col">
              <section className="rounded-2xl shadow-xl bg-slate-800/80 border border-slate-700 p-4 overflow-y-auto h-full">
                <PhaseMonitorPanel onSelect={setSelectedSymbol} selectedSymbol={selectedSymbol} />
              </section>
            </Panel>
            <PanelResizeHandle className="w-2 cursor-col-resize bg-slate-900/60 hover:bg-sky-700/60 transition-colors" />
            <Panel minSize={10} defaultSize={20} className="flex flex-col">
              <section className="rounded-2xl shadow-xl bg-slate-800/80 border border-slate-700 p-4 overflow-y-auto h-full">
                <TradeIdeasPanel onSelect={setSelectedSymbol} selectedSymbol={selectedSymbol} />
              </section>
            </Panel>
            <PanelResizeHandle className="w-2 cursor-col-resize bg-slate-900/60 hover:bg-sky-700/60 transition-colors" />
            <Panel minSize={15} defaultSize={30} className="flex flex-col">
              <section className="rounded-2xl shadow-xl bg-slate-800/80 border border-slate-700 p-4 overflow-y-auto h-full min-h-0 flex flex-col">
                <GPTThesisPanel selectedSymbol={selectedSymbol} />
              </section>
            </Panel>
            <PanelResizeHandle className="w-2 cursor-col-resize bg-slate-900/60 hover:bg-sky-700/60 transition-colors" />
          </PanelGroup>
        </main>
      </div>
    </ErrorBoundary>
  );
}
