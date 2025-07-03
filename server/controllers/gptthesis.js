import { getOpenAIClient } from '../utils/openaiClient.js';
import { scanPhaseMonitor } from './phasemonitor.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';

function formatThesisPrompt(asset) {
  const {
    symbol, primary, priceSource, priceSymbol
  } = asset;
  const { phase, bias, cotBias, reflex, structure, volatility, durationInPhase, levels, playType, source } = primary || {};
  const { entry, stop, tp1, tp2, rr } = levels || {};
  const volRank = volatility < 0.005
    ? 'Low Volatility Setup'
    : volatility > 0.02
      ? 'High Volatility Risk'
      : 'Normal Volatility Conditions';
  return `
📍 Asset Overview
🚩 ${symbol}
Bias: ${bias} / COT: ${cotBias}
Phase: ${phase} (${durationInPhase})
Play Type: ${playType || 'N/A'}
Reward/Risk Estimate: ${rr || 'N/A'}
Data Confidence: Based on 20 recent candles (H4/D1 composite)

💡 Price Source: ${source || priceSource || 'Unknown'} (${priceSymbol || 'N/A'})

🧠 Strategic Thesis
Use reflex, structure, and volatility to determine how the asset is likely to behave next. Consider market psychology for breakout, fade, or reversal behavior.

🔍 Structure Breakdown
• Reflex Strength: ${reflex}
• Structure Score: ${structure}
• Volatility Index: ${volatility} → ${volRank}
• Duration in Phase: ${durationInPhase}
• Setup Status: ${phase === 'Phase 2' ? 'Breakout Confirmed' : phase === 'Phase 4' ? 'Reversal Opportunity' : 'Monitoring'}

📊 Sentiment Snapshot
• COT Bias: ${cotBias}
• Alignment with Bias: ${bias === cotBias ? 'Strong Alignment' : 'Mixed Sentiment'}

🛠️ Execution Plan
• Entry: ${entry}
• Stop Loss: ${stop}
• Take Profit Targets:
   - TP1: ${tp1}
   - TP2: ${tp2}

📈 Strategy Timeline
Act within 1–3 days if structure holds and volatility remains favorable. Favor reactive entry if price retests breakout structure or shows momentum continuation.

✅ Summary
Briefly explain why this setup is valid, what phase signals are telling us, and how reflex strength or sentiment alignment justifies the trade.

🧠 Reflex Model Key:
Phase 1: Compression → Phase 2: Breakout → Phase 3: Euphoria → Phase 4: Reversal
`;
}

export async function generateGptThesis(req, res) {
  // 🚫 Proprietary GPT thesis logic removed for public demo.
  // This function would normally use AI to generate a market thesis based on proprietary signals.
  // For demo purposes, we return static demo content.
  res.send('Demo GPT Thesis: This is a placeholder. Real logic is private.');
}

export async function gptThesisFollowup(req, res) {
  const { symbol, question } = req.body;
  if (!symbol || !question) return res.status(400).send('Symbol and question are required.');

  try {
    const scanData = await scanPhaseMonitor(req, res, true);
    const phaseMeta = scanData.find(item => item.symbol === symbol);
    if (!phaseMeta) return res.status(404).send('Asset not found in Phase Monitor.');

    const context = formatThesisPrompt(phaseMeta);
    const followupPrompt = `You are a strategic trading assistant. Here is the context for ${symbol}:\n${context}\n\nUser follow-up question: ${question}\n\nAnswer clearly and concisely.`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a world-class trading assistant.' },
        { role: 'user', content: followupPrompt }
      ],
      temperature: 0.7,
    });

    if (!response?.choices?.[0]?.message?.content) {
      console.error('GPT follow-up response missing expected structure:', response);
      return res.status(500).send('GPT API response invalid.');
    }

    res.send(response.choices[0].message.content);
  } catch (err) {
    console.error('GPT Follow-up Error:', err);
    res.status(500).send(err.message);
  }
}
