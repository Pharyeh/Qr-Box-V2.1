import QuantumMetricPanel from "./QuantumMetricPanel";
import ConfidenceTrendChart from "./ConfidenceTrendChart";
import TradeLogsPanel from "./TradeLogsPanel";
import AssetSentimentPanel from "./AssetSentimentPanel";
import TriggerAlertsPanel from "./LiveTriggersPanel";
import SettingsPanel from "./SettingsPanel";
import PhaseWatchlistPanel from "./PhaseWatchlistPanel";
import ReplayTimeline from "./ReplayTimeline";
import GptPanel from "./GptPanel";
import MetricsBar from "./MetricsBar";
import EdgeDecayTracker from "./EdgeDecayTracker";
import SentimentHeatmapPanel from "./SentimentHeatmapPanel";
import ExportPanel from "./ExportPanel";

export default function Dashboard(activePanel) {
  const panelMap = {
    dashboard: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        <MetricsBar />
        <TriggerAlertsPanel />
        <QuantumMetricPanel />
        <ConfidenceTrendChart />
        <PhaseWatchlistPanel />
        <AssetSentimentPanel />
        <TradeLogsPanel />
        <ExportPanel />
        <GptPanel />
        <SentimentHeatmapPanel />
        <EdgeDecayTracker />
        <ReplayTimeline />
        <SettingsPanel />
      </div>
    ),
    quantum: <QuantumMetricPanel />,
    confidence: <ConfidenceTrendChart />,
    trades: <TradeLogsPanel />,
    sentiment: <AssetSentimentPanel />,
    settings: <SettingsPanel />,
  };

  return panelMap[activePanel] || panelMap.dashboard;
}
