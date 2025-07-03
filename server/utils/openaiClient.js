// server/utils/openaiClient.js
import OpenAI from 'openai';

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing!');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
