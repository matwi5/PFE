"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Ajout de cette ligne
import WeatherAnalysisComponent from './components/WeatherAnalysisComponent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud } from 'lucide-react';

export default function WeatherAnalysisPage() {
  const searchParams = useSearchParams(); // Ajout de cette ligne
  const [sessionKey, setSessionKey] = useState<string>('');
  const [activeSessionKey, setActiveSessionKey] = useState<string>('');

  // Ajout de cet useEffect pour gérer l'initialisation automatique
  useEffect(() => {
    const sessionKeyParam = searchParams.get('sessionKey');
    if (sessionKeyParam) {
      setSessionKey(sessionKeyParam);
      setActiveSessionKey(sessionKeyParam);
    }
  }, [searchParams]);

  const handleAnalyze = () => {
    if (sessionKey) {
      setActiveSessionKey(sessionKey);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sessionKey) {
      handleAnalyze();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-100">
            <Cloud className="h-6 w-6" />
            Weather Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={sessionKey}
              onChange={(e) => setSessionKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter session key to analyze weather data"
              className="flex-grow bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-400"
            />
            <Button
              onClick={handleAnalyze}
              className="bg-blue-600 hover:bg-blue-700 text-gray-100"
              disabled={!sessionKey}
            >
              Analyze
            </Button>
          </div>
          {!activeSessionKey && (
            <p className="mt-4 text-sm text-gray-300">
              Enter a session key to view detailed weather analysis and track conditions.
            </p>
          )}
        </CardContent>
      </Card>

      {activeSessionKey && <WeatherAnalysisComponent sessionKey={activeSessionKey} />}
    </div>
  );
}