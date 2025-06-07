import { useSymbol } from '../../context/SymbolContext.jsx';

export default function PhaseMonitorPanel() {
  const { setSelectedSymbol } = useSymbol();

  return (
    <div
      onClick={() => setSelectedSymbol(symbol)}
      className={`cursor-pointer border p-3 rounded-lg ${
        phase === 'Phase 2' ? 'border-yellow-400 bg-yellow-800/20' : 'border-zinc-700'
      }`}
    >
      {/* ... existing code ... */}
    </div>
  );
} 