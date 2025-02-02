"use client";

import React, { useState } from 'react';
import StrategyAnalysisComponent from './components/StrategyAnalysisComponent';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Route } from 'lucide-react';

export default function StrategyAnalysisPage() {
  const [sessionKey, setSessionKey] = useState<string>('');
  const [activeSessionKey, setActiveSessionKey] = useState<string>('');

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
            <Route className="h-6 w-6" />
            Strategy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={sessionKey}
              onChange={(e) => setSessionKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter session key to analyze race strategies"
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
              Enter a session key to view detailed strategy analysis for all teams and drivers.
            </p>
          )}
        </CardContent>
      </Card>

      {activeSessionKey && <StrategyAnalysisComponent sessionKey={activeSessionKey} />}
    </div>
  );
}