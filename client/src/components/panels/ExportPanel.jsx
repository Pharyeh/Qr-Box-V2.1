import { useState } from 'react';
import { exportToCSV } from '../../utils/exportCSV';

export default function ExportPanel() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/TradeLogs');
      const data = await res.json();
      if (data.trades && data.trades.length > 0) {
        exportToCSV(data.trades, 'qrbox_trade_logs');
      } else {
        alert('No trades available to export.');
      }
    } catch (err) {
      console.error('[client ERROR]: Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">Export Tools</h2>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium"
      >
        {exporting ? 'Exporting...' : 'Export Trade Logs (CSV)'}
      </button>
    </div>
  );
}
