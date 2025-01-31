"use client";

import { useState } from 'react';
import WeatherWidget from './components/WeatherWidget';

export default function WeatherAnalysisPage() {
  const [sessionKey, setSessionKey] = useState<string>('');
  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateAnalysis = async () => {
    try {
      const response = await fetch(`/api/weather?sessionKey=${sessionKey}`);
      const data = await response.json();
      setAnalysis(data.analysis);
      setIsWidgetVisible(true);
    } catch (error) {
      console.error('Failed to generate weather analysis:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Weather Analysis</h1>

      {/* Formulaire pour saisir la sessionKey */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={sessionKey}
            onChange={(e) => setSessionKey(e.target.value)}
            placeholder="Enter sessionKey"
            className="p-2 border border-gray-700 rounded-lg bg-[#282a2c] text-white focus:outline-none focus:border-[#3b82f6]"
            required
          />
          <button
            onClick={generateAnalysis}
            className="bg-[#3b82f6] hover:bg-[#60a5fa] text-white px-4 py-2 rounded-lg"
          >
            Generate Analysis
          </button>
        </div>
      </div>

      {/* Afficher le widget uniquement après l'analyse */}
      {isWidgetVisible && <WeatherWidget analysis={analysis} />}
    </div>
  );
}
