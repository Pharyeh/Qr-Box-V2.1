import React, { useEffect, useState } from 'react';
import { useSymbol } from '../../context/SymbolContext.jsx';
import PanelWrapper from '../../components/PanelWrapper';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import API_BASE from '../../config/api';

const PERSONAS = [
  {
    key: 'execution',
    label: 'Execution Risk Manager',
    prompt: '\n[As an execution risk manager, provide a risk-focused commentary on this thesis.]',
  },
  {
    key: 'macro',
    label: 'Macro Strategist',
    prompt: '\n[As a macro strategist, provide a macro context commentary on this thesis.]',
  },
  {
    key: 'behavioral',
    label: 'Behavioral Coach',
    prompt: '\n[As a behavioral coach, provide a behavioral/psychological perspective on this thesis.]',
  },
];

export default function GPTThesisPanel() {
  const { selectedSymbol } = useSymbol();
  const [persona, setPersona] = useState(PERSONAS[0].key);
  const [cache, setCache] = useState({}); // { [symbol]: { [persona]: thesis } }
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isPreBreakout = (reflex, structure) => {
    return parseFloat(reflex) > 0.5 && parseFloat(structure) > 0.35;
  };

  const fetchThesis = async (symbol, personaKey) => {
    if (!symbol) return;
    setLoading(true);
    setThesis(null);
    setError(null);
    const personaObj = PERSONAS.find(p => p.key === personaKey);

    try {
      const res = await fetch(`${API_BASE}/api/gptthesis?symbol=${symbol}&persona=${personaKey}`);
      const data = await res.json();
      const raw = data?.[0];

      let thesisContent = raw?.thesis || 'No thesis returned.';
      const reflex = raw?.reflex || 0;
      const structure = raw?.structure || 0;

      if (raw?.phase === 'Phase 1' && isPreBreakout(reflex, structure)) {
        thesisContent = `⚠️ *Pre-Breakout Detected*. This thesis is speculative. A confirmed breakout (Phase 2) has not yet occurred, but metrics suggest high probability setup.\n\n${thesisContent}`;
      }

      if (personaObj && personaObj.key !== 'execution') {
        thesisContent += `\n\n${personaObj.prompt}`;
      }

      setCache(prev => ({
        ...prev,
        [symbol]: {
          ...(prev[symbol] || {}),
          [personaKey]: thesisContent,
        },
      }));

      setThesis(thesisContent);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Error fetching GPT response.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSymbol) return;
    if (cache[selectedSymbol]?.[persona]) {
      setThesis(cache[selectedSymbol][persona]);
      setError(null);
      setLoading(false);
      return;
    }
    fetchThesis(selectedSymbol, persona);
    // eslint-disable-next-line
  }, [selectedSymbol, persona]);

  const downloadThesis = () => {
    if (!thesis) return;
    const personaLabel = PERSONAS.find(p => p.key === persona)?.label || '';
    const markdown = `# ${selectedSymbol} Trade Thesis (${personaLabel})\n\n${thesis}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSymbol}-thesis-${persona}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (!selectedSymbol) {
      return (
        <div className="text-sm text-gray-400">
          Click a symbol in the Phase Monitor or Trade Ideas panel to generate a thesis.
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-300 animate-pulse">
          <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
          Generating trade thesis...
        </div>
      );
    }
    if (error) {
      return <div className="text-sm text-red-400">{error}</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex gap-2">
            {PERSONAS.map(p => (
              <button
                key={p.key}
                onClick={() => setPersona(p.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                  persona === p.key
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400 shadow shadow-blue-500/10'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={downloadThesis}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="prose prose-invert max-w-none">
          <div className="text-sm whitespace-pre-wrap card-glass p-4 rounded-xl border max-h-[500px] overflow-y-auto animate-fade-in">
            {thesis}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PanelWrapper
      title="GPT Thesis"
      onRefresh={() => fetchThesis(selectedSymbol, persona)}
      lastUpdated={lastUpdated}
      showRefresh={!!selectedSymbol}
    >
      {renderContent()}
    </PanelWrapper>
  );
}
