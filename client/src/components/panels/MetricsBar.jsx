import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import PanelShell from '../ui/PanelShell';

export default function MetricsBar() {
  const [metrics, setMetrics] = useState(null);

  const fetchMetrics = () => {
    fetch('/api/MetricsBar')
      .then(res => res.json())
      .then(data => setMetrics(data.metrics || null))
      .catch(err => console.error('[client ERROR]: Failed to fetch system metrics', err));
  };

  useAutoRefresh(fetchMetrics, 5000);

  return (
    <PanelShell title="System Metrics">
      {!metrics ? (
        <p className="text-gray-400">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm text-white">
          <div><span className="text-blue-400">Scanned:</span> {metrics.scannedAssets}</div>
          <div><span className="text-blue-400">Phase 2:</span> {metrics.phase2Count}</div>
          <div><span className="text-blue-400">Phase 4:</span> {metrics.phase4Count}</div>
          <div><span className="text-blue-400">Latency:</span> {metrics.responseTime} ms</div>
          <div><span className="text-blue-400">Uptime:</span> {metrics.uptime} %</div>
          <div><span className="text-blue-400">Memory:</span> {metrics.memoryUsage} %</div>
          <div><span className="text-blue-400">Volatility:</span> {metrics.volatility || 'n/a'}</div>
          <div><span className="text-blue-400">Liquidity:</span> {metrics.liquidity || 'n/a'}</div>
        </div>
      )}
    </PanelShell>
  );
}
