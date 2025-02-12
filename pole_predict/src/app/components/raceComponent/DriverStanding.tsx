/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronDown, Loader2 } from 'lucide-react';

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
  onStandingsUpdate?: (standings: { position: number, acronym: string }[]) => void;
}

interface LoadingStatus {
  drivers: boolean;
  positions: boolean;
  intervals: boolean;
  lapTimes: boolean;
}

// Fonction utilitaire pour retry les appels API
const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data) throw new Error('No data received');
      return data;
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      console.log(`Retry attempt ${retries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const LoadingCard: React.FC<{ loadingStatus: LoadingStatus }> = ({ loadingStatus }) => (
  <Card className="bg-[#282a2c] border border-gray-800 h-48">
    <CardContent className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
      <div className="text-white flex flex-col items-center gap-2">
        <div>Loading standings data...</div>
        <div className="text-sm text-gray-400">
          {!loadingStatus.drivers && "Fetching drivers..."}
          {loadingStatus.drivers && !loadingStatus.positions && "Fetching positions..."}
          {loadingStatus.positions && !loadingStatus.intervals && "Fetching intervals..."}
          {loadingStatus.intervals && !loadingStatus.lapTimes && "Fetching lap times..."}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ErrorCard: React.FC<{ error: string }> = ({ error }) => (
  <Card className="bg-[#282a2c] border border-gray-800 h-48">
    <CardContent className="flex items-center justify-center h-full">
      <div className="text-red-500">Error: {error}</div>
    </CardContent>
  </Card>
);

const DriverStandings: React.FC<DriverStandingsProps> = ({
  sessionKey,
  meetingKey,
  currentTime,
  viewMode,
  currentLap,
  onDriverSelect,
  selectedDriverNumber,
  onStandingsUpdate
}) => {
  const isMobile = useIsMobile();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [positions, setPositions] = useState<DriverPosition[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [enhancedStandings, setEnhancedStandings] = useState<EnhancedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [leaderLapStartTimes, setLeaderLapStartTimes] = useState<Map<number, string>>(new Map());
  const [gapMode, setGapMode] = useState<'interval' | 'leader'>('interval');
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    drivers: false,
    positions: false,
    intervals: false,
    lapTimes: false
  });

  useEffect(() => {
    if (!sessionKey || !meetingKey) {
      setError('Session or meeting key not provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        setLoadingStatus({
          drivers: false,
          positions: false,
          intervals: false,
          lapTimes: false
        });

        // Fetch drivers
        const driversData: any[] = await fetchWithRetry('https://api.openf1.org/v1/drivers');
        const uniqueDrivers: Driver[] = Array.from(new Map(
          driversData.filter((driver: any) =>
            driver?.driver_number && driver?.name_acronym
          ).map((driver: any) => [driver.driver_number, driver as Driver])
        ).values());
        setDrivers(uniqueDrivers);
        setLoadingStatus(prev => ({ ...prev, drivers: true }));

        // Fetch positions
        const positionsUrl = `https://api.openf1.org/v1/position?session_key=${sessionKey}&meeting_key=${meetingKey}`;
        const positionsData: any[] = await fetchWithRetry(positionsUrl);
        const validPositions: DriverPosition[] = positionsData.filter((pos: any) =>
          pos?.driver_number && pos?.position && pos?.date
        );
        setPositions(validPositions);
        setLoadingStatus(prev => ({ ...prev, positions: true }));

        // Fetch intervals
        const intervalsUrl = `https://api.openf1.org/v1/intervals?session_key=${sessionKey}`;
        const intervalsData: any[] = await fetchWithRetry(intervalsUrl);
        const validIntervals: Interval[] = intervalsData.filter((int: any) =>
          int?.driver_number && (int?.interval !== undefined || int?.gap_to_leader !== undefined)
        );
        setIntervals(validIntervals);
        setLoadingStatus(prev => ({ ...prev, intervals: true }));

        // Fetch lap times
        const lapTimesUrl = `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;
        const lapTimesData: any[] = await fetchWithRetry(lapTimesUrl);
        const validLapTimes: LapTime[] = lapTimesData.filter((lap: any) =>
          lap?.driver_number && lap?.lap_number && lap?.date_start
        );
        setLapTimes(validLapTimes);
        setLoadingStatus(prev => ({ ...prev, lapTimes: true }));

        // Process lap start times
        const lapStartMap = new Map<number, string>();
        const sortedLapTimes = [...validLapTimes].sort((a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

        const sortedPositions = [...validPositions].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (sortedPositions.length > 0) {
          lapStartMap.set(1, sortedPositions[0].date);
        }

        sortedLapTimes.forEach(lap => {
          const positions = validPositions.filter((pos: DriverPosition) =>
            new Date(pos.date).getTime() <= new Date(lap.date_start).getTime()
          );

          if (positions.length > 0) {
            const leaderPosition = positions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .find(pos => pos.position === 1);

            if (leaderPosition && leaderPosition.driver_number === lap.driver_number) {
              lapStartMap.set(lap.lap_number, lap.date_start);
            }
          }
        });

        setLeaderLapStartTimes(lapStartMap);
        setLoading(false);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionKey, meetingKey]);

  const formatGap = (gap: number | string | null, isLeader: boolean): string => {
    if (isLeader) return '';
    if (!gap || gap === null) return '-';
    if (typeof gap === 'string') return gap;
    return `+${gap.toFixed(3)}s`;
  };

  useEffect(() => {
    if (!currentTime || drivers.length === 0) return;

    const processStandings = () => {
      const relevantPositions = new Map<number, DriverPosition>();
      const relevantIntervals = new Map<number, Interval>();

      try {
        switch (viewMode) {
          case 'chrono':
            const currentTimeMs = new Date(currentTime).getTime();

            positions.forEach(pos => {
              if (!pos?.date || !pos?.driver_number) return;
              const posTime = new Date(pos.date).getTime();
              if (posTime <= currentTimeMs) {
                const existing = relevantPositions.get(pos.driver_number);
                if (!existing || new Date(pos.date) > new Date(existing.date)) {
                  relevantPositions.set(pos.driver_number, pos);
                }
              }
            });

            intervals.forEach(int => {
              if (!int?.date || !int?.driver_number) return;
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
            const lapStartTime = leaderLapStartTimes.get(currentLap);
            if (lapStartTime) {
              const lapStartMs = new Date(lapStartTime).getTime();

              positions.forEach(pos => {
                if (!pos?.date || !pos?.driver_number) return;
                const posTime = new Date(pos.date).getTime();
                if (posTime <= lapStartMs) {
                  const existing = relevantPositions.get(pos.driver_number);
                  if (!existing || new Date(pos.date) > new Date(existing.date)) {
                    relevantPositions.set(pos.driver_number, pos);
                  }
                }
              });

              intervals.forEach(int => {
                if (!int?.date || !int?.driver_number) return;
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
              if (!pos?.date || !pos?.driver_number) return;
              const existing = relevantPositions.get(pos.driver_number);
              if (!existing || new Date(pos.date) > new Date(existing.date)) {
                relevantPositions.set(pos.driver_number, pos);
              }
            });

            intervals.forEach(int => {
              if (!int?.date || !int?.driver_number) return;
              const existing = relevantIntervals.get(int.driver_number);
              if (!existing || new Date(int.date) > new Date(existing.date)) {
                relevantIntervals.set(int.driver_number, int);
              }
            });
            break;
        }

        let standings = drivers
          .filter(driver => driver?.driver_number)
          .map(driver => {
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

        standings.sort((a, b) => {
          if (a.status === 'active' && b.status === 'active') {
            return a.position - b.position;
          }
          if (a.status === 'active') return -1;
          if (b.status === 'active') return 1;
          return 0;
        });

        setEnhancedStandings(standings);

        if (standings.length > 0) {
          const standingsData = standings
            .filter(standing => standing.status === 'active')
            .map(standing => ({
              position: standing.position,
              acronym: standing.driver_details?.name_acronym || ''
            }));

          if (onStandingsUpdate) {
            onStandingsUpdate(standingsData);
          }
        }

      } catch (err) {
        console.error('Error processing standings:', err);
        setError('Error processing standings data');
      }
    };

    processStandings();
  }, [intervals, drivers, currentTime, viewMode, currentLap, leaderLapStartTimes, onStandingsUpdate]);

  if (!sessionKey || !meetingKey) {
    return (
      <Card className="bg-[#282a2c] border border-gray-800 h-48">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-white">Session or meeting key not provided</div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <LoadingCard loadingStatus={loadingStatus} />;
  }

  if (error) {
    return <ErrorCard error={error} />;
  }

  if (isMobile) {
    return (
      <Card className="bg-[#282a2c] border border-gray-800 h-[530px]">
        <CardHeader className="pb-2">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                {viewMode === 'final' ? 'Final Ranking' : 'Driver Standings'}
              </CardTitle>
              <Trophy className="h-5 w-5 text-[#5382ec]" />
            </div>
            <Button
              variant="ghost"
              onClick={() => setGapMode((prev) => (prev === 'interval' ? 'leader' : 'interval'))}
              className="w-full bg-black/20 text-gray-300 h-10"
            >
              {gapMode === 'interval' ? 'Interval' : 'Gap to leader'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="max-h-[24rem] overflow-y-auto">
            <div className="space-y-2">
              <AnimatePresence>
                {enhancedStandings
                  .filter((standing) => standing.status === 'active')
                  .map((standing, index) => {
                    if (!standing?.driver_number) return null;

                    const isLeader = index === 0;
                    const displayValue = gapMode === 'interval' ? standing.interval : standing.gap_to_leader;
                    const teamColor = standing.driver_details?.team_colour || '2b2b2b';
                    const isExpanded = expandedDriver === standing.driver_number;
                    const isSelected = selectedDriverNumber === standing.driver_number.toString();

                    return (
                      <motion.div
                        key={standing.driver_number}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <div
                          className={`rounded-lg overflow-hidden transition-all duration-300 
                            ${isSelected ? 'ring-2 ring-inset ring-[#5382ec]' : ''}`}
                        >
                          <div
                            className="flex items-center gap-2 p-2 bg-black/20"
                            onClick={() => setExpandedDriver(isExpanded ? null : standing.driver_number)}
                          >
                            <div className={`w-6 text-center font-bold ${isLeader ? 'text-[#5382ec]' : 'text-gray-400'
                              }`}>
                              {standing.position}
                            </div>

                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              {standing.driver_details?.headshot_url ? (
                                <img
                                  src={standing.driver_details.headshot_url}
                                  alt={standing.driver_details.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ backgroundColor: `#${teamColor}33` }}
                                >
                                  <span className="text-sm font-bold text-white">
                                    {standing.driver_details?.driver_number}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {standing.driver_details?.name_acronym}
                              </div>
                            </div>

                            <div className="text-right font-mono text-xs text-gray-300">
                              {formatGap(displayValue, isLeader)}
                            </div>

                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 
                                ${isExpanded ? 'transform rotate-180' : ''}`}
                            />
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="bg-black/10 px-3 py-2"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm text-white mb-1">
                                    {standing.driver_details?.full_name}
                                  </div>
                                  <div
                                    className="text-xs px-2 py-0.5 rounded-full inline-block"
                                    style={{
                                      backgroundColor: `#${teamColor}33`,
                                      color: `#${teamColor}`,
                                    }}
                                  >
                                    {standing.driver_details?.team_name}
                                  </div>
                                </div>
                                {!isSelected && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDriver(standing.driver_number);
                                      onDriverSelect(standing.driver_number.toString());
                                    }}
                                    className="bg-[#5382ec]/10 border-[#5382ec]/20 text-[#5382ec] hover:bg-[#5382ec]/20"
                                  >
                                    Select Driver
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 h-[1050px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            {viewMode === 'final' ? 'Final Ranking' : 'Driver Standings'}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGapMode(prev => prev === 'interval' ? 'leader' : 'interval')}
              className="text-xs bg-black/20 text-gray-300"
            >
              {gapMode === 'interval' ? 'Intervals' : 'Gaps to leader'}
            </Button>
            <Trophy className="h-5 w-5 text-[#5382ec]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[990px]">
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
                  if (!standing?.driver_number) return null;

                  const isLeader = index === 0;
                  const displayValue = gapMode === 'interval' ? standing.interval : standing.gap_to_leader;
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
                      <div className={`p-3 rounded-lg relative overflow-hidden transition-all duration-300 
                        bg-black/20 backdrop-blur-sm hover:bg-black/30 
                        ${isSelected ? 'ring-2 ring-inset ring-[#5382ec]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-lg font-bold ${isLeader ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent' : 'text-gray-400'
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
                            <div className={`text-sm font-medium ${isLeader ? 'text-[#5382ec]' : 'text-gray-300'
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