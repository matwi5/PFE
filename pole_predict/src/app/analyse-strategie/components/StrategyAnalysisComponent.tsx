/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Timer, Route, Octagon, Car, Gauge, Trophy, GitCompare } from 'lucide-react';

// Constantes pour les couleurs des pneus F1
const TYRE_COLORS = {
  'SOFT': 'bg-red-500',
  'MEDIUM': 'bg-yellow-500',
  'HARD': 'bg-white text-black',
  'INTERMEDIATE': 'bg-green-500',
  'WET': 'bg-blue-500'
};

interface StrategyAnalysisProps {
  sessionKey: string;
}

const StrategyAnalysisComponent: React.FC<StrategyAnalysisProps> = ({ sessionKey }) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);
    
    try {
      const response = await fetch(`/api/strategy?sessionKey=${sessionKey}`);
      const result = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }
      
      setAnalysisData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    if (sessionKey) {
      fetchAnalysis();
    }
  }, [sessionKey, fetchAnalysis]);

  const TyreBadge = ({ compound, laps }: { compound: string; laps?: number }) => {
    const colorClass = TYRE_COLORS[compound as keyof typeof TYRE_COLORS] || 'bg-gray-500';
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${colorClass}`}>
        {compound}
        {laps && <span className="opacity-80">({laps} laps)</span>}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <Alert variant="destructive">
      <AlertTitle>Error loading analysis: {error}</AlertTitle>
    </Alert>
  );
  
  if (!analysisData) return null;

  return (
    <div className="space-y-4">
      {analysisData.map((team: any) => (
        <Card 
          key={team.team_name} 
          className="bg-gray-800 border-gray-700"
          style={{ borderLeft: `4px solid #${team.team_colour}` }}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-gray-100">
                {team.team_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500"/>
                <span className="text-gray-100 font-semibold">
                  {team.team_stats.best_pit_stop.toFixed(2)}s best stop
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Team Stats Row */}
            <div className="flex flex-wrap items-center gap-4 p-2 bg-gray-700/50 rounded text-sm">
              <div className="flex items-center gap-2">
                <Octagon className="h-4 w-4 text-white" stroke="white" fill="red" strokeWidth={2}/>
                <div className="text-gray-300">
                  {team.team_stats.total_pit_stops} stops
                  <span className="text-gray-400 ml-2">
                    (avg {team.team_stats.avg_pit_duration.toFixed(2)}s)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-500"/>
                <div className="text-gray-300">
                  Consistency: 
                  <Badge variant={team.team_stats.pit_stop_consistency > 90 ? "default" : "secondary"}
                        className="ml-2">
                    {team.team_stats.pit_stop_consistency.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {team.drivers.map((driver: any) => (
                <div key={driver.driver_number} 
                     className="p-3 bg-gray-700 rounded border border-gray-600">
                  {/* Driver Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-100 font-top">{driver.driver_name}</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-gray-200 text-xs">
                        {driver.strategy.total_pit_stops} stops
                      </span>
                      {driver.strategy.pit_window.map((pit: any, index: number) => (
                        <span key={index} className="text-gray-400 text-[11px]">
                          Lap {pit.lap}: {pit.duration.toFixed(2)}s
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tire Strategy Timeline */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Tire Strategy:</div>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                      {driver.strategy.tyre_strategy.map((compound: string, index: number) => (
                        <TyreBadge 
                          key={index} 
                          compound={compound}
                          laps={driver.strategy.stint_lengths[index]}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Strategy Moves */}
                  {driver.strategy.moves?.length > 0 && (
                    <div className="text-xs">
                      <div className="text-gray-400 mb-1">Strategy Moves:</div>
                      <div className="space-y-1">
                        {driver.strategy.moves.map((move: any, index: number) => (
                          <div key={index} className="flex items-center gap-1 text-gray-300">
                            <GitCompare className="h-3 w-3 text-orange-500"/>
                            <span>
                              {move.type === 'undercut' ? 'Undercut' : 'Overcut'} vs {move.againstDriver}
                            </span>
                            <span className="text-gray-400">
                              (lap {move.lap}, {move.gap} lap gap)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StrategyAnalysisComponent;