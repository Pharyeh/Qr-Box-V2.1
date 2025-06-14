import openai from '../utils/openaiClient.js';
import { scanPhaseMonitor } from './phasemonitor.js';

function formatThesisPrompt(asset) {
  const { symbol, bias, phase, cotBias, reflex, structure, volatility, durationInPhase, levels } = asset;
  const { entry, stop, tp1, tp2 } = levels || {};
  const volRank = (volatility < 0.005)
    ? 'Low Volatility Setup'
    : (volatility > 0.02)
      ? 'High Volatility Risk'
      : 'Normal Volatility Conditions';

  return `
📍 Asset Overview
🚩 ${symbol} (${symbol})
Bias: ${bias} / ${cotBias}
Trade Duration: 2–5 Days
Status: Approaching Structural Decision Point
Current Reflexivity Phase: ${phase} – Awaiting Confirmation
Strategy Type: Reflex Momentum or Structural Breakout
Execution Style: Reactive, not predictive
Theme: "Market at Decision Point – Breakout or Rejection?"

🧠 Strategic Thesis
Analyze the asset's recent reflex, structure, and volatility readings. Use this to form a short and clear thesis about the market's positioning and possible next move.

🔍 Structure Breakdown Highlights
- Reflex Strength: ${reflex}
- Structure Score: ${structure}
- Volatility Index: ${volatility}
- Volatility Rank: ${volRank}
- Duration in Phase: ${durationInPhase}

📊 COT & Sentiment Snapshot
- COT Bias: ${cotBias}
- Sentiment Context: Comment on likely retail or institutional bias.

📌 Translation
Explain the trade-off and risk-reward at current price zone.

🧠 Behavioral Finance Triggers
Highlight what crowd psychology may do at this structural level.

🔄 Reflexivity Model – Phase Breakdown
Phase 1: Base formation and compression zone.
Phase 2: ✅ Current – Breakout testing structure.
Phase 3: Euphoria or crowd follow-through.
Phase 4: Exhaustion or reversal phase.

🛠️ Execution Plan (Real Levels)
- Entry: ${entry}
- Stop Loss: ${stop}
- Take Profit Targets:
  • TP1 (1× ATR): ${tp1}
  • TP2 (2× ATR): ${tp2}

🕰️ Execution Timeline
Execution should be reactive within the next 24–72h.

✅ Strategic Summary
Summarize why this trade idea has edge and what makes it worth tracking.

🔁 Quote: "The best trades wait for confirmation."
`;
}

export async function generateGptThesis(req, res) {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).send('Symbol is required.');

  try {
    const data = await scanPhaseMonitor(req, res, true);
    const asset = data.find(item => item.symbol === symbol);
    if (!asset) return res.status(404).send('Asset not found.');

    const prompt = formatThesisPrompt(asset);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    // Robust error handling for OpenAI response
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      console.error('GPT API response missing expected structure:', response);
      return res.status(500).send('GPT API response invalid.');
    }

    const thesis = response.choices[0].message.content;
    console.log('GPT API raw response:', response);
    res.send(thesis);
  } catch (err) {
    console.error('GPT Error:', err);
    res.status(500).send(err.message);
  }
}
export async function gptThesisFollowup(req, res) {
  const { symbol, question } = req.body;
  if (!symbol || !question) return res.status(400).send('Symbol and question are required.');

  try {
    const data = await scanPhaseMonitor(req, res, true);
    const asset = data.find(item => item.symbol === symbol);
    if (!asset) return res.status(404).send('Asset not found.');

    // Optionally, you could re-use the thesis prompt or a summary as context
    const thesisPrompt = formatThesisPrompt(asset);
    const followupPrompt = `You are an expert trading assistant. Here is the context for ${symbol}:
\n${thesisPrompt}\n\nUser follow-up question: ${question}\n\nPlease answer in a concise, actionable way.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a world-class trading assistant.' },
        { role: 'user', content: followupPrompt }
      ],
      temperature: 0.7,
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      console.error('GPT API response missing expected structure:', response);
      return res.status(500).send('GPT API response invalid.');
    }

    const answer = response.choices[0].message.content;
    res.send(answer);
  } catch (err) {
    console.error('GPT Follow-up Error:', err);
    res.status(500).send(err.message);
  }
}