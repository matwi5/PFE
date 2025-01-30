'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_colour?: string;
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
  currentLap: number;
  onDriverSelect: (driverNumber: string | null) => void;
  selectedDriverNumber: string | null;
}

const DriverStandings: React.FC<DriverStandingsProps> = ({
  sessionKey,
  meetingKey,
  currentTime,
  viewMode,
  currentLap,
  onDriverSelect,
  selectedDriverNumber
}) => {
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [positions, setPositions] = useState<DriverPosition[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [enhancedStandings, setEnhancedStandings] = useState<EnhancedPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [leaderLapStartTimes, setLeaderLapStartTimes] = useState<Map<number, string>>(new Map());
  const [gapMode, setGapMode] = useState<'interval' | 'leader'>('interval');

  useEffect(() => {
    if (!sessionKey || !meetingKey) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch drivers
        const driversResponse = await fetch('https://api.openf1.org/v1/drivers');
        const driversData = await driversResponse.json() as Driver[];
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
        const lapTimesData = await lapTimesResponse.json(); // Corriger la variable (anciennement 'response')
        setLapTimes(lapTimesData);

        // Process leader lap start times
        const lapStartMap = new Map<number, string>();
        const sortedLapTimes = [...lapTimesData].sort((a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

        sortedLapTimes.forEach(lap => {
          const positions = positionsData.filter((pos: { date: string | number | Date; }) =>
            new Date(pos.date).getTime() <= new Date(lap.date_start).getTime()
          );

          if (positions.length > 0) {
            const leaderPosition = positions
              .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) =>
                new Date(b.date).getTime() - new Date(a.date).getTime())
              .find((pos: { position: number; }) => pos.position === 1);

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

            positions.forEach(pos => {
              const posTime = new Date(pos.date).getTime();
              if (posTime <= lapStartMs) {
                const existing = relevantPositions.get(pos.driver_number);
                if (!existing || new Date(pos.date) > new Date(existing.date)) {
                  relevantPositions.set(pos.driver_number, pos);
                }
              }
            });

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
          status: position ? 'active' as const : 'inactive' as const,
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
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 h-[70vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            {viewMode === 'final' ? 'Final Ranking' : 'Driver Standings'}
            {viewMode === 'lap' && ` - Lap ${currentLap}`}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGapMode(prev => prev === 'interval' ? 'leader' : 'interval')}
              className="text-xs bg-black/20 hover:bg-black/30 text-gray-300"
            >
              {gapMode === 'interval' ? 'Gaps to leader' : 'Intervals'}
            </Button>
            <Trophy className="h-5 w-5 text-[#5382ec]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)]">
        <div
          className="h-full overflow-y-auto pr-6
            scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 
            hover:scrollbar-thumb-[#2dd4bf]/80 transition-colors duration-200"
        >
          <div className="pr-2 space-y-4">
            <AnimatePresence>
              {enhancedStandings
                .filter(standing => standing.status === 'active')
                .map((standing, index) => {
                  const isLeader = index === 0;
                  const displayValue = gapMode === 'interval'
                    ? standing.interval
                    : standing.gap_to_leader;
                  const teamColor = standing.driver_details?.team_colour || '2b2b2b';
                  const headshotUrl = standing.driver_details?.headshot_url;
                  const isSelected = selectedDriverNumber === standing.driver_number.toString();

                  return (
                    <motion.button
                      key={standing.driver_number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                          delay: index * 0.03
                        }
                      }}
                      exit={{ opacity: 0 }}
                      className="w-full text-left p-0 bg-transparent border-none"
                      onClick={() => {
                        setSelectedDriver(standing.driver_number);
                        onDriverSelect(standing.driver_number.toString());
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`p-3 rounded-lg relative overflow-hidden transition-all duration-300 
                          bg-black/20 backdrop-blur-sm hover:bg-black/30 
                          ${isSelected ? 'ring-2 ring-[#5382ec] ring-offset-1 ring-offset-[#282a2c]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-lg font-bold ${isLeader
                              ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent'
                              : 'text-gray-400'
                            }`}>
                            {standing.position}
                          </div>

                          <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                            {headshotUrl ? (
                              <motion.img
                                src={headshotUrl}
                                alt={standing.driver_details?.full_name}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1 }}
                                animate={{ scale: isSelected ? 1.1 : 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: `#${teamColor}33` }}
                              >
                                <span className="font-bold text-white">
                                  {standing.driver_details?.driver_number}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-white truncate">
                                {standing.driver_details?.full_name}
                              </span>
                              <span className="text-sm text-gray-400">
                                {standing.driver_details?.name_acronym}
                              </span>
                            </div>

                            <div className="mt-1">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `#${teamColor}33`,
                                  color: `#${teamColor}`,
                                }}
                              >
                                {standing.driver_details?.team_name}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className={`text-sm font-medium ${isLeader
                                ? 'text-[#5382ec]'
                                : 'text-gray-300'
                              }`}>
                              {formatGap(displayValue, isLeader)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverStandings;