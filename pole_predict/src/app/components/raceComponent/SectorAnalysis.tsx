import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, AlertTriangle, Loader2 } from 'lucide-react';

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

const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const getSegmentColor = (value: number): string => {
  if (!value || isNaN(value)) return 'bg-gradient-to-r from-gray-100 to-gray-300';
  
  try {
    switch (value) {
      case 2048: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2049: return 'bg-gradient-to-r from-green-400 to-green-600';
      case 2051: return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 2064: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-300';
    }
  } catch (error) {
    console.error('Error in getSegmentColor:', error);
    return 'bg-gradient-to-r from-gray-100 to-gray-300';
  }
};

const SectorAnalysis: React.FC<SectorAnalysisProps> = ({
  driverNumber,
  sessionKey,
  currentTime,
  currentLap,
  viewMode = 'final'
}) => {
  const [laps, setLaps] = useState<LapData[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaps = async () => {
      if (!driverNumber || !sessionKey) {
        setError('Missing required parameters');
        setIsInitialLoad(false);
        return;
      }

      try {
        if (!isInitialLoad) {
          setIsRefreshing(true);
        }
        
        const data: LapData[] = await fetchWithRetry(
          `https://api.openf1.org/v1/laps?driver_number=${driverNumber}&session_key=${sessionKey}`
        );

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        const validData = data.filter(lap => {
          if (!lap || !lap.date_start || !lap.lap_number) return false;
          
          try {
            const lapDate = new Date(lap.date_start);
            if (isNaN(lapDate.getTime())) return false;

            if (!Array.isArray(lap.segments_sector_1) || 
                !Array.isArray(lap.segments_sector_2) || 
                !Array.isArray(lap.segments_sector_3)) {
              return false;
            }

            return true;
          } catch {
            return false;
          }
        });

        const filteredData = validData.filter(lap => {
          try {
            if (viewMode === 'chrono') {
              return new Date(lap.date_start) <= new Date(currentTime);
            }
            if (viewMode === 'lap') {
              return lap.lap_number <= currentLap;
            }
            return true;
          } catch (error) {
            console.error('Error filtering lap:', error);
            return false;
          }
        });

        setLaps(filteredData.reverse());
        setError(null);
      } catch (error) {
        console.error('Error fetching lap data:', error);
        setError('Failed to fetch sector data. Please try again.');
      } finally {
        setIsInitialLoad(false);
        setIsRefreshing(false);
      }
    };

    fetchLaps();
  }, [driverNumber, sessionKey, currentTime, currentLap, viewMode]);

  const LoadingState = () => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[48vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Sector Analysis
          </CardTitle>
          <Activity className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
          <div className="text-gray-400">Loading sectorial data...</div>
        </div>
      </CardContent>
    </Card>
  );

  const ErrorState = () => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[48vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Sector Analysis
          </CardTitle>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div className="text-red-400">{error}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (isInitialLoad) return <LoadingState />;
  if (error && laps.length === 0) return <ErrorState />;

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[48vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Sector Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <Loader2 className="h-4 w-4 animate-spin text-[#5382ec]" />
            )}
            <Activity className="h-5 w-5 text-[#5382ec]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)]">
        {laps.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No available sectorial data
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-6 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 hover:scrollbar-thumb-[#2dd4bf]/80 transition-all duration-200 ease-out">
            {error && (
              <div className="mb-4 p-2 rounded bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="pr-2 space-y-4">
              {laps.map((lap) => (
                <div
                  key={`${lap.lap_number}-${lap.date_start}`}
                  className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SectorSection: React.FC<{
  sectorNumber: number;
  segments: number[];
  duration?: number;
}> = ({ sectorNumber, segments = [], duration }) => {
  if (!Array.isArray(segments)) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-300">Sector {sectorNumber}</span>
        <span className="text-gray-400">
          {duration && !isNaN(duration) ? `${duration.toFixed(3)}s` : 'N/A'}
        </span>
      </div>
      <div className="flex gap-1">
        {segments.map((segment, index) => (
          <div
            key={`${sectorNumber}-${index}-${segment}`}
            className={`h-4 w-4 rounded-full ${getSegmentColor(segment)} transition-transform duration-300 hover:scale-110`}
            title={`Mini-sector ${index + 1}: ${getSegmentColor(segment).replace('bg-gradient-to-r from-', '').split(' ')[0]}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SectorAnalysis;