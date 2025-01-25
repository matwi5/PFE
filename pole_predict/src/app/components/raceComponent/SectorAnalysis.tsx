'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

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
    case 2048: return 'bg-yellow-500';
    case 2049: return 'bg-green-500';
    case 2051: return 'bg-purple-500';
    case 2064: return 'bg-gray-400';
    default: return 'bg-gray-200';
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
        
        // Filtrer les tours selon le mode de visualisation
        const filteredData = data.filter(lap => {
          if (viewMode === 'chrono') {
            return new Date(lap.date_start) <= new Date(currentTime);
          }
          if (viewMode === 'lap') {
            return lap.lap_number <= currentLap;
          }
          return true; // Mode final
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

  if (loading) return <div>Sectorial data loading...</div>;
  if (!laps.length) return <div>No available sectorial data</div>;

  return (
    <div className="space-y-6">
      {laps.map((lap) => (
        <div key={lap.lap_number} className="bg-background p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Tour {lap.lap_number}</div>
            <div className="text-sm text-muted-foreground">
              {viewMode === 'chrono' && 
                new Date(lap.date_start).toLocaleTimeString()}
            </div>
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
    </div>
  );
};

const SectorSection = ({ sectorNumber, segments, duration }: { 
  sectorNumber: number;
  segments: number[];
  duration?: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span>Sector {sectorNumber}</span>
      <span className="text-muted-foreground">
        {duration ? `${duration.toFixed(3)}s` : 'N/A'}
      </span>
    </div>
    <div className="flex gap-1">
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`h-4 w-4 rounded-full ${getSegmentColor(segment)}`}
          title={`Mini-secteur ${index + 1}: ${getSegmentColor(segment).replace('bg-', '')}`}
        />
      ))}
    </div>
  </div>
);

export default SectorAnalysis;