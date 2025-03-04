/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Wind, Cloud, Droplets, Timer, Gauge } from 'lucide-react';

interface WeatherAnalysisProps {
  sessionKey: string;
}

const WeatherAnalysisComponent: React.FC<WeatherAnalysisProps> = ({ sessionKey }) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);
    
    try {
      const response = await fetch(`/api/weather?sessionKey=${sessionKey}`);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
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
    <div className="space-y-6 text-gray-100">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-100">Track Temperature</p>
                <h3 className="text-2xl font-bold text-gray-100">{analysisData.weather.track_temp.avg.toFixed(1)}°C</h3>
                <p className="text-sm text-gray-300">
                  Low: {analysisData.weather.track_temp.min.toFixed(1)}°C
                  <br />
                  High: {analysisData.weather.track_temp.max.toFixed(1)}°C
                </p>
              </div>
              <Thermometer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-100">Air Temperature</p>
                <h3 className="text-2xl font-bold text-gray-100">{analysisData.weather.air_temp.avg.toFixed(1)}°C</h3>
                <p className="text-sm text-gray-300">
                  Low: {analysisData.weather.air_temp.min.toFixed(1)}°C
                  <br />
                  High: {analysisData.weather.air_temp.max.toFixed(1)}°C
                </p>
              </div>
              <Cloud className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-100">Wind</p>
                <h3 className="text-2xl font-bold text-gray-100">{analysisData.weather.wind.speed_kmh.toFixed(1)} km/h</h3>
                <p className="text-sm text-gray-300">
                  Coming from: {analysisData.weather.wind.direction}
                </p>
              </div>
              <Wind className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-100">Track Conditions</p>
                <h3 className="text-2xl font-bold text-gray-100">{analysisData.weather.humidity.avg.toFixed(0)}% Humidity</h3>
                <p className="text-sm text-gray-300">
                  {analysisData.weather.rainfall ? '🌧️ Wet Track' : '☀️ Dry Track'}
                </p>
              </div>
              <Droplets className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="laptimes" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="laptimes" className="text-gray-100 data-[state=active]:bg-gray-700">Lap Times</TabsTrigger>
          <TabsTrigger value="track" className="text-gray-100 data-[state=active]:bg-gray-700">Track Evolution</TabsTrigger>
          <TabsTrigger value="tyres" className="text-gray-100 data-[state=active]:bg-gray-700">Tyre Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="laptimes">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Lap Time Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-violet-500"/>
                    <span className="text-gray-300">Fastest Lap</span>
                  </div>
                  <p className="text-2xl font-mono text-gray-100">
                    {formatTime(analysisData.performance.lap_times.fastest)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-emerald-500"/>
                    <span className="text-gray-300">Average Lap Time</span>
                  </div>
                  <p className="text-2xl font-mono text-gray-100">
                    {formatTime(analysisData.performance.lap_times.average)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={analysisData.performance.lap_times.consistency > 80 ? "default" : "secondary"}
                      className="text-gray-100"
                    >
                      Consistency Score: {analysisData.performance.lap_times.consistency.toFixed(0)}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300">
                    {analysisData.performance.lap_times.consistency > 80 
                      ? "Very consistent lap times" 
                      : analysisData.performance.lap_times.consistency > 60 
                        ? "Moderately consistent lap times"
                        : "Variable lap times"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="track">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Track Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-700">
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">Track Condition</h4>
                  <p className="text-gray-300">{analysisData.performance.track_evolution}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">Grip Level</h4>
                    {analysisData.weather.rainfall ? (
                      <p className="text-gray-300">Wet conditions affecting grip level</p>
                    ) : (
                      <p className="text-gray-300">
                        Normal grip conditions
                        {analysisData.weather.track_temp.avg > 40 ? " - Track temperature may affect tire wear" : ""}
                      </p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">Weather Impact</h4>
                    <p className="text-gray-300">
                      {analysisData.weather.rainfall 
                        ? "Rain affecting track conditions" 
                        : analysisData.weather.wind.speed_kmh > 20 
                          ? "Strong winds may affect car balance" 
                          : "Stable weather conditions"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tyres">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Tyre Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysisData.tyre_performance).map(([compound, data]: [string, any]) => (
                  <Card key={compound} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-100">{compound}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-gray-300">
                        <p>Average stint length: {data.averageLaps} laps</p>
                        <p>Number of stints: {data.totalStints}</p>
                        <Badge 
                          variant={
                            data.performance === "Long-lasting" ? "default" :
                            data.performance === "Good durability" ? "secondary" :
                            "outline"
                          }
                          className="text-gray-100"
                        >
                          {data.performance}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherAnalysisComponent;