import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Google AI API key');
}

export const genAI = new GoogleGenerativeAI(API_KEY);