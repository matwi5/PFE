"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Route, Car, Layers, Wrench } from 'lucide-react';

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
    <div className="space-y-6 text-gray-100">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analysisData.map((team: any) => (
          <Card 
            key={team.team_name} 
            className="bg-gray-800 border-gray-700"
            style={{ borderLeft: `4px solid #${team.team_colour}` }}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-100">{team.team_name}</p>
                  <h3 className="text-2xl font-bold text-gray-100">
                    {team.drivers.reduce((total: number, driver: any) => total + driver.strategy.total_pit_stops, 0)} Total Pit Stops
                  </h3>
                  <p className="text-sm text-gray-300">
                    Avg Duration: {(team.drivers.reduce((total: number, driver: any) => total + driver.strategy.avg_pit_duration, 0) / team.drivers.length).toFixed(1)}s
                  </p>
                </div>
                <Route className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="team_strategies" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="team_strategies" className="text-gray-100 data-[state=active]:bg-gray-700">Team Strategies</TabsTrigger>
          <TabsTrigger value="driver_strategies" className="text-gray-100 data-[state=active]:bg-gray-700">Driver Strategies</TabsTrigger>
          <TabsTrigger value="pit_stops" className="text-gray-100 data-[state=active]:bg-gray-700">Pit Stop Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="team_strategies">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Team Strategy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.map((team: any) => (
                  <Card key={team.team_name} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-100 flex justify-between items-center">
                        {team.team_name}
                        <Badge 
                          variant="outline" 
                          className="text-gray-100"
                          style={{ backgroundColor: `#${team.team_colour}`, color: 'white' }}
                        >
                          {team.drivers.reduce((total: number, driver: any) => total + driver.strategy.total_pit_stops, 0)} Stops
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-green-500" />
                          <span>Tyre Strategy</span>
                        </div>
                        {team.drivers.map((driver: any) => (
                          <p key={driver.driver_number} className="text-sm">
                            {driver.driver_name}: {driver.strategy.tyre_strategy.join(' → ')}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driver_strategies">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Individual Driver Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.flatMap((team: any) => 
                  team.drivers.map((driver: any) => (
                    <Card 
                      key={driver.driver_number} 
                      className="bg-gray-700 border-gray-600"
                      style={{ borderLeft: `4px solid #${team.team_colour}` }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-100 flex justify-between items-center">
                          {driver.driver_name}
                          <Badge variant="outline" className="text-gray-100">
                            {driver.strategy.strategy_type}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-blue-500" />
                            <span>Tyre Sequence</span>
                          </div>
                          <p className="text-sm">
                            {driver.strategy.tyre_strategy.join(' → ')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Timer className="h-5 w-5 text-green-500" />
                            <span>Stint Lengths</span>
                          </div>
                          <p className="text-sm">
                            {driver.strategy.stint_lengths.join(', ')} laps
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pit_stops">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Pit Stop Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.flatMap((team: any) => 
                  team.drivers.map((driver: any) => (
                    <Card 
                      key={driver.driver_number} 
                      className="bg-gray-700 border-gray-600"
                      style={{ borderLeft: `4px solid #${team.team_colour}` }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-100 flex justify-between items-center">
                          {driver.driver_name}
                          <Badge variant="outline" className="text-gray-100">
                            {driver.strategy.total_pit_stops} Stops
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-blue-500" />
                            <span>Pit Stop Details</span>
                          </div>
                          <div className="text-sm">
                            <p>Avg Duration: {driver.strategy.avg_pit_duration.toFixed(1)}s</p>
                            <div className="mt-2">
                              <p>Pit Window:</p>
                              {driver.strategy.pit_window.map((stop: any, index: number) => (
                                <p key={index} className="text-gray-400 pl-2">
                                  Stop {index + 1}: Lap {stop.lap} ({stop.duration.toFixed(1)}s)
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyAnalysisComponent;