"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CloudRain, 
  Flag, 
  Trophy, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Timer,
  Award,
  AlertCircle,
  Star,
  Users,
  FileText
} from 'lucide-react';

interface RaceSummaryProps {
  sessionKey: string;
}

interface RaceSummary {
  general: {
    name: string;
    circuit: string;
    date: string;
    laps: number;
    circuitLength: string;
  };
  conditions: {
    weather: string;
    trackTemp: number;
    airTemp: number;
    events: Array<{
      type: string;
      lap: number;
      description: string;
    }>;
  };
  results: {
    podium: Array<{
      position: number;
      driver: string;
      team: string;
      time: string;
    }>;
    fastestLap: {
      driver: string;
      time: string;
      lap: number;
    };
    topTen: Array<{
      position: number;
      driver: string;
      team: string;
      gap: string;
    }>;
  };
  performance: {
    polePosition: {
      driver: string;
      time: string;
    };
    notablePerformances: Array<{
      driver: string;
      description: string;
    }>;
  };
  incidents: {
    retirements: Array<{
      driver: string;
      lap: number;
      reason: string;
    }>;
    penalties: Array<{
      driver: string;
      penalty: string;
      reason: string;
    }>;
  };
  championship: {
    driversImpact: Array<{
      driver: string;
      points: number;
      position: number;
      change: number;
    }>;
    constructorsImpact: Array<{
      team: string;
      points: number;
      position: number;
      change: number;
    }>;
  };
  statistics?: {
    totalOvertakes: number;
    safetyCars: Array<{
      lap: number;
      duration: number;
    }>;
    totalPitStops: number;
  };
  narrative?: string[];
}

const RaceSummaryComponent: React.FC<RaceSummaryProps> = ({ sessionKey }) => {
  const [summary, setSummary] = useState<RaceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/summary?sessionKey=${sessionKey}`);
        const data = await response.json();
        
        if (data.status === 'error') {
          throw new Error(data.message);
        }
        
        setSummary(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (sessionKey) {
      fetchSummary();
    }
  }, [sessionKey]);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <Alert variant="destructive">
      <AlertTitle>Error generating summary: {error}</AlertTitle>
    </Alert>
  );

  if (!summary) return null;

  return (
    <div className="space-y-4">
      {/* General Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-100 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {summary.general.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              <span className="text-gray-200">{summary.general.circuit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <span className="text-gray-200">{summary.general.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-400" />
              <span className="text-gray-200">{summary.general.laps} laps</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-400" />
              <span className="text-gray-200">{summary.general.circuitLength}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Conditions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-400" />
            Race Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">Weather</span>
              <span className="text-gray-100">{summary.conditions.weather}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">Track Temperature</span>
              <span className="text-gray-100">{summary.conditions.trackTemp}°C</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400">Air Temperature</span>
              <span className="text-gray-100">{summary.conditions.airTemp}°C</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Results */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Race Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Podium */}
          <div className="space-y-2">
            <span className="text-gray-400">Podium</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.results.podium.map((position) => (
                <div key={position.position} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-gray-100">P{position.position}</div>
                    <div className="text-right">
                      <div className="text-gray-100">{position.driver}</div>
                      <div className="text-gray-400 text-sm">{position.team}</div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm mt-2">{position.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fastest Lap */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-400" />
              <div>
                <span className="text-gray-100">Fastest Lap: {summary.results.fastestLap.driver}</span>
                <span className="text-gray-400 ml-2">
                  ({summary.results.fastestLap.time} - Lap {summary.results.fastestLap.lap})
                </span>
              </div>
            </div>
          </div>

          {/* Top 10 */}
          <div className="space-y-2">
            <span className="text-gray-400">Final Classification</span>
            <div className="space-y-1">
              {summary.results.topTen.map((position) => (
                <div key={position.position} 
                     className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-8">P{position.position}</span>
                    <span className="text-gray-100">{position.driver}</span>
                    <span className="text-gray-400 text-sm">{position.team}</span>
                  </div>
                  <span className="text-gray-300 text-sm">{position.gap}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notable Performances */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Key Performances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-gray-700 p-3 rounded">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="text-gray-100">Pole Position: {summary.performance.polePosition.driver}</span>
              <span className="text-gray-400 ml-2">({summary.performance.polePosition.time})</span>
            </div>
          </div>
          <div className="space-y-2">
            {summary.performance.notablePerformances.map((perf, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-gray-100">{perf.driver}:</span>
                <span className="text-gray-300">{perf.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incidents & Penalties */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Incidents & Penalties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Retirements */}
          <div className="space-y-2">
            <span className="text-gray-400">Retirements</span>
            {summary.incidents.retirements.map((retirement, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-gray-100">{retirement.driver}</span>
                <span className="text-gray-400">Lap {retirement.lap}:</span>
                <span className="text-gray-300">{retirement.reason}</span>
              </div>
            ))}
          </div>

          {/* Penalties */}
          <div className="space-y-2">
            <span className="text-gray-400">Penalties</span>
            {summary.incidents.penalties.map((penalty, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded">
                <Flag className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-100">{penalty.driver}:</span>
                <span className="text-gray-300">{penalty.penalty}</span>
                <span className="text-gray-400">- {penalty.reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Championship Impact */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Championship Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drivers Championship */}
          <div className="space-y-2">
            <span className="text-gray-400">Drivers Championship</span>
            {summary.championship.driversImpact.map((driver, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">P{driver.position}</span>
                  <span className="text-gray-100">{driver.driver}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">{driver.points} pts</span>
                  <Badge variant={driver.change > 0 ? "default" : driver.change < 0 ? "destructive" : "secondary"}>
                    {driver.change > 0 ? `+${driver.change}` : driver.change}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Constructors Championship */}
          <div className="space-y-2">
            <span className="text-gray-400">Constructors Championship</span>
            {summary.championship.constructorsImpact.map((team, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">P{team.position}</span>
                  <span className="text-gray-100">{team.team}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">{team.points} pts</span>
                  <Badge variant={team.change > 0 ? "default" : team.change < 0 ? "destructive" : "secondary"}>
                    {team.change > 0 ? `+${team.change}` : team.change}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Race Statistics (Section additionnelle optionnelle) */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Race Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overtakes */}
            <div className="bg-gray-700/50 p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Total Overtakes</div>
              <div className="text-2xl text-gray-100">{summary.statistics?.totalOvertakes || 'N/A'}</div>
            </div>
            
            {/* Safety Car Periods */}
            <div className="bg-gray-700/50 p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Safety Car Periods</div>
              <div className="text-2xl text-gray-100">
                {summary.statistics?.safetyCars?.length || 0}
              </div>
            </div>
            
            {/* Pit Stops */}
            <div className="bg-gray-700/50 p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Total Pit Stops</div>
              <div className="text-2xl text-gray-100">{summary.statistics?.totalPitStops || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race Story (Section narrative optionnelle) */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Race Story
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-gray-200">
            {summary.narrative?.map((paragraph: string, index: number) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaceSummaryComponent;