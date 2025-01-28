'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface LapData {
  date_start: string;
  lap_number: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  st_speed?: number;
}

interface SectorAnalysisProps {
  driverNumber: number;
  sessionKey: string;
  currentTime: string;
  currentLap: number;
  viewMode: 'chrono' | 'lap' | 'final';
}

const getSegmentColor = (value: number): string => {
  switch (value) {
    case 2048: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    case 2049: return 'bg-gradient-to-r from-green-400 to-green-600';
    case 2051: return 'bg-gradient-to-r from-purple-400 to-purple-600';
    case 2064: return 'bg-gradient-to-r from-gray-300 to-gray-500';
    default: return 'bg-gradient-to-r from-gray-100 to-gray-300';
  }
};

const SectorAnalysis: React.FC<SectorAnalysisProps> = ({ 
  driverNumber,
  sessionKey,
  currentTime,
  currentLap,
  viewMode
}) => {
  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLaps = async () => {
      try {
        const response = await fetch(
          `https://api.openf1.org/v1/laps?driver_number=${driverNumber}&session_key=${sessionKey}`
        );
        const data: LapData[] = await response.json();
        
        const filteredData = data.filter(lap => {
          if (viewMode === 'chrono') {
            return new Date(lap.date_start) <= new Date(currentTime);
          }
          if (viewMode === 'lap') {
            return lap.lap_number <= currentLap;
          }
          return true;
        });

        setLaps(filteredData.reverse());
      } catch (error) {
        console.error('Error fetching lap data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (driverNumber && sessionKey) fetchLaps();
  }, [driverNumber, sessionKey, currentTime, currentLap, viewMode]);

  if (loading) {
    return (
      <Card className="bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading sectorial data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!laps.length) {
    return (
      <Card className="bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">No available sectorial data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]">
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
          Sector Analysis
        </CardTitle>
        <Activity className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
      </CardHeader>
      <CardContent className="space-y-6 h-64 overflow-y-auto">
        {laps.map((lap) => (
          <div 
            key={lap.lap_number} 
            className="bg-black/20 backdrop-blur-sm p-4 rounded-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
                Lap {lap.lap_number}
              </div>
              {viewMode === 'chrono' && (
                <div className="text-sm text-gray-400">
                  {new Date(lap.date_start).toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <SectorSection 
                sectorNumber={1}
                segments={lap.segments_sector_1}
                duration={lap.duration_sector_1}
              />
              <SectorSection 
                sectorNumber={2}
                segments={lap.segments_sector_2}
                duration={lap.duration_sector_2}
              />
              <SectorSection 
                sectorNumber={3}
                segments={lap.segments_sector_3}
                duration={lap.duration_sector_3}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const SectorSection = ({ 
  sectorNumber, 
  segments, 
  duration 
}: { 
  sectorNumber: number;
  segments: number[];
  duration?: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-300">Sector {sectorNumber}</span>
      <span className="text-gray-400">
        {duration ? `${duration.toFixed(3)}s` : 'N/A'}
      </span>
    </div>
    <div className="flex gap-1">
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`h-4 w-4 rounded-full ${getSegmentColor(segment)} transition-transform duration-300 hover:scale-110`}
          title={`Mini-sector ${index + 1}: ${getSegmentColor(segment).replace('bg-gradient-to-r from-', '').split(' ')[0]}`}
        />
      ))}
    </div>
  </div>
);

export default SectorAnalysis;