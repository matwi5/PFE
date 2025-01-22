import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../../../components/ui/button";

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_color?: string;
}

interface DriverPosition {
  date: string;
  driver_number: number;
  position: number;
  meeting_key: number;
  session_key: number;
  lap_number?: number;
}

interface Interval {
  date: string;
  driver_number: number;
  gap_to_leader: number | string | null;
  interval: number | string | null;
  meeting_key: number;
  session_key: number;
}

interface LapTime {
  date_start: string;
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  session_key: number;
}

interface EnhancedPosition {
  position: number;
  driver_number: number;
  driver_details: Driver | null;
  status: 'active' | 'inactive';
  gap_to_leader: number | string | null;
  interval: number | string | null;
  lastLapTime?: number | null;
}

interface DriverStandingsProps {
  sessionKey: string;
  meetingKey: string;
  currentTime: string;
  viewMode: 'chrono' | 'lap' | 'final';
  currentLap?: number;
}

const DriverStandings: React.FC<DriverStandingsProps> = ({
  sessionKey,
  meetingKey,
  currentTime,
  viewMode,
  currentLap = 0
}) => {
  const [positions, setPositions] = useState<DriverPosition[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [enhancedStandings, setEnhancedStandings] = useState<EnhancedPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [leaderLapStartTimes, setLeaderLapStartTimes] = useState<Map<number, string>>(new Map());
  const [gapMode, setGapMode] = useState<'interval' | 'leader'>('interval');

  // Fetch initial data
  useEffect(() => {
    if (!sessionKey || !meetingKey) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch drivers
        const driversResponse = await fetch('https://api.openf1.org/v1/drivers');
        const driversData = await driversResponse.json();
        const uniqueDrivers = Array.from(new Map(
          driversData.map((driver: Driver) => [driver.driver_number, driver])
        ).values());
        setDrivers(uniqueDrivers);

        // Fetch positions
        const positionsUrl = `https://api.openf1.org/v1/position?session_key=${sessionKey}&meeting_key=${meetingKey}`;
        const positionsResponse = await fetch(positionsUrl);
        const positionsData = await positionsResponse.json();
        setPositions(positionsData);

        // Fetch intervals
        const intervalsUrl = `https://api.openf1.org/v1/intervals?session_key=${sessionKey}`;
        const intervalsResponse = await fetch(intervalsUrl);
        const intervalsData = await intervalsResponse.json();
        setIntervals(intervalsData);

        // Fetch lap times
        const lapTimesResponse = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`);
        const lapTimesData = await lapTimesResponse.json();
        setLapTimes(lapTimesData);

        // Process leader lap start times
        const lapStartMap = new Map<number, string>();
        const sortedLapTimes = [...lapTimesData].sort((a, b) => 
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

        // Pour chaque tour, trouver le moment où le leader a commencé le tour
        sortedLapTimes.forEach(lap => {
          const positions = positionsData.filter(pos => 
            new Date(pos.date).getTime() <= new Date(lap.date_start).getTime()
          );
          
          if (positions.length > 0) {
            // Trouver le leader à ce moment
            const leaderPosition = positions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .find(pos => pos.position === 1);

            if (leaderPosition && leaderPosition.driver_number === lap.driver_number) {
              lapStartMap.set(lap.lap_number, lap.date_start);
            }
          }
        });

        setLeaderLapStartTimes(lapStartMap);

      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionKey, meetingKey]);

  const formatGap = (gap: number | string | null, isLeader: boolean): string => {
    if (isLeader) return '';
    if (gap === null) return '-';
    if (typeof gap === 'string') return gap;
    return `+${gap.toFixed(3)}s`;
  };

  useEffect(() => {
    if (!currentTime || drivers.length === 0) return;

    const processStandings = () => {
      const relevantPositions = new Map<number, DriverPosition>();
      const relevantIntervals = new Map<number, Interval>();

      switch (viewMode) {
        case 'chrono':
          const currentTimeMs = new Date(currentTime).getTime();
          
          // Process positions and intervals for chrono mode
          positions.forEach(pos => {
            const posTime = new Date(pos.date).getTime();
            if (posTime <= currentTimeMs) {
              const existing = relevantPositions.get(pos.driver_number);
              if (!existing || new Date(pos.date) > new Date(existing.date)) {
                relevantPositions.set(pos.driver_number, pos);
              }
            }
          });

          intervals.forEach(int => {
            const intTime = new Date(int.date).getTime();
            if (intTime <= currentTimeMs) {
              const existing = relevantIntervals.get(int.driver_number);
              if (!existing || new Date(int.date) > new Date(existing.date)) {
                relevantIntervals.set(int.driver_number, int);
              }
            }
          });
          break;

        case 'lap':
          // Get the start time for the current lap from the leader's crossing
          const lapStartTime = leaderLapStartTimes.get(currentLap);
          if (lapStartTime) {
            const lapStartMs = new Date(lapStartTime).getTime();
            
            // Get positions at the start of the lap
            positions.forEach(pos => {
              const posTime = new Date(pos.date).getTime();
              if (posTime <= lapStartMs) {
                const existing = relevantPositions.get(pos.driver_number);
                if (!existing || new Date(pos.date) > new Date(existing.date)) {
                  relevantPositions.set(pos.driver_number, pos);
                }
              }
            });

            // Get intervals at the start of the lap
            intervals.forEach(int => {
              const intTime = new Date(int.date).getTime();
              if (intTime <= lapStartMs) {
                const existing = relevantIntervals.get(int.driver_number);
                if (!existing || new Date(int.date) > new Date(existing.date)) {
                  relevantIntervals.set(int.driver_number, int);
                }
              }
            });
          }
          break;

        case 'final':
          // Get final positions and intervals
          positions.forEach(pos => {
            const existing = relevantPositions.get(pos.driver_number);
            if (!existing || new Date(pos.date) > new Date(existing.date)) {
              relevantPositions.set(pos.driver_number, pos);
            }
          });

          intervals.forEach(int => {
            const existing = relevantIntervals.get(int.driver_number);
            if (!existing || new Date(int.date) > new Date(existing.date)) {
              relevantIntervals.set(int.driver_number, int);
            }
          });
          break;
      }

      // Create enhanced standings
      let standings = drivers.map(driver => {
        const position = relevantPositions.get(driver.driver_number);
        const interval = relevantIntervals.get(driver.driver_number);
        return {
          position: position?.position || 999,
          driver_number: driver.driver_number,
          driver_details: driver,
          status: position ? 'active' : 'inactive',
          gap_to_leader: interval?.gap_to_leader || null,
          interval: interval?.interval || null
        };
      });

      // Sort standings
      standings.sort((a, b) => {
        if (a.status === 'active' && b.status === 'active') {
          return a.position - b.position;
        }
        if (a.status === 'active') return -1;
        if (b.status === 'active') return 1;
        return 0;
      });

      setEnhancedStandings(standings);
    };

    processStandings();
  }, [positions, intervals, drivers, currentTime, viewMode, currentLap, leaderLapStartTimes]);


  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {viewMode === 'final' ? 'Final Ranking' : 'Driver Standings'}
            {viewMode === 'lap' && ` - Lap ${currentLap}`}
          </CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setGapMode(prev => prev === 'interval' ? 'leader' : 'interval')}
          >
            {gapMode === 'interval' ? 'Show gaps to leader' : 'Show intervals'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-3rem)]">
        <div className="h-full overflow-y-auto pr-2">
          <AnimatePresence>
            {enhancedStandings
              .filter(standing => standing.status === 'active')
              .map((standing, index) => {
                const isLeader = index === 0;
                const displayValue = gapMode === 'interval' 
                  ? standing.interval 
                  : standing.gap_to_leader;
  
                return (
                  <motion.div
                    key={standing.driver_number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative mb-2"
                  >
                    <div className={`flex items-center p-3 rounded-lg ${
                      standing.status === 'active' 
                        ? 'bg-secondary/50' 
                        : 'bg-secondary/20'
                    }`}>
                      <div className="w-8 text-center font-bold">{index + 1}</div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">
                            {standing.driver_details?.full_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {standing.driver_details?.name_acronym}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {standing.driver_details?.team_name}
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-sm">
                          {formatGap(displayValue, isLeader)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverStandings;