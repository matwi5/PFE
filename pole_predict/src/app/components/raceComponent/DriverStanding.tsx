// src/components/DriverStandings.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDrivers, fetchRaceControlEvents, fetchMeetings, fetchSessions } from '../../../lib/openF1api';
import { collection, addDoc } from "firebase/firestore";

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
}

interface LapData {
  date_start: string;
  date_end: string;
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  meeting_key: number;
  session_key: number;
}

interface EnhancedPosition {
  position: number;
  driver_number: number;
  driver_details: Driver | null;
  lap_number: number | null;
  lap_time: number | null;
  gap_to_leader: number | null;
  date: string;
  status: 'active' | 'inactive';
}

interface DriverStandingsProps {
  sessionKey: string;
  meetingKey: string;
  currentLap: number;
  viewMode: 'lap' | 'chronological';
}

const DriverStandings: React.FC<DriverStandingsProps> = ({
  sessionKey,
  meetingKey,
  currentLap,
  viewMode
}) => {
  const [positions, setPositions] = useState<DriverPosition[]>([]);
  const [laps, setLaps] = useState<LapData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [enhancedStandings, setEnhancedStandings] = useState<EnhancedPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch all necessary data
  useEffect(() => {
    if (!sessionKey || !meetingKey) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all drivers first to ensure we have the complete grid
        const driversResponse = await fetchDrivers();
        const driversData = driversResponse;

        // Get unique drivers (some might appear multiple times)
        const uniqueDrivers = Array.from(new Map(
          driversData.map((driver: Driver) => [driver.driver_number, driver])
        ).values());

        setDrivers(uniqueDrivers);

        // Fetch positions
        const positionsResponse = await fetch(
          `https://api.openf1.org/v1/position?session_key=${sessionKey}&meeting_key=${meetingKey}`
        );
        const positionsData = await positionsResponse.json();

        // Fetch lap times
        const lapsResponse = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${sessionKey}&meeting_key=${meetingKey}`
        );
        const lapsData = await lapsResponse.json();

        setPositions(positionsData);
        setLaps(lapsData);

      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionKey, meetingKey]);

  // Process and combine position and lap data
  useEffect(() => {
    if (drivers.length === 0) return;

    const processStandings = () => {
      let standings: EnhancedPosition[] = [];

      if (viewMode === 'lap' && currentLap > 0) {
        // Get lap start time for the current lap
        const currentLapData = laps.filter(lap => lap.lap_number === currentLap);

        if (currentLapData.length > 0) {
          const lapStartTime = new Date(currentLapData[0].date_start).getTime();
          const relevantPositions = new Map<number, DriverPosition>();

          // Find positions closest to lap start time for each driver
          positions.forEach(pos => {
            const posTime = new Date(pos.date).getTime();
            const existing = relevantPositions.get(pos.driver_number);

            if (!existing ||
                Math.abs(posTime - lapStartTime) < Math.abs(new Date(existing.date).getTime() - lapStartTime)) {
              relevantPositions.set(pos.driver_number, pos);
            }
          });

          // Create standings for all drivers
          drivers.forEach(driver => {
            const position = relevantPositions.get(driver.driver_number);
            const driverLap = currentLapData.find(lap => lap.driver_number === driver.driver_number);

            standings.push({
              position: position?.position || 999,
              driver_number: driver.driver_number,
              driver_details: driver,
              lap_number: currentLap,
              lap_time: driverLap?.lap_duration || null,
              gap_to_leader: null, // Will be calculated below
              date: position?.date || new Date().toISOString(),
              status: position ? 'active' : 'inactive'
            });
          });

          // Sort by position
          standings.sort((a, b) => {
            if (a.status === 'active' && b.status === 'active') {
              return a.position - b.position;
            }
            if (a.status === 'active') return -1;
            if (b.status === 'active') return 1;
            return 0;
          });

          // Calculate gaps to leader
          const activePilots = standings.filter(s => s.status === 'active');
          if (activePilots.length > 0) {
            const leaderLapTime = activePilots[0].lap_time;
            activePilots.forEach((standing, index) => {
              if (index > 0 && leaderLapTime && standing.lap_time) {
                standing.gap_to_leader = standing.lap_time - leaderLapTime;
              }
            });
          }
        }
      } else {
        // Chronological mode - get latest positions
        const latestPositions = new Map<number, DriverPosition>();

        positions.forEach(pos => {
          const existing = latestPositions.get(pos.driver_number);
          if (!existing || new Date(pos.date) > new Date(existing.date)) {
            latestPositions.set(pos.driver_number, pos);
          }
        });

        // Create standings for all drivers
        drivers.forEach(driver => {
          const position = latestPositions.get(driver.driver_number);

          standings.push({
            position: position?.position || 999,
            driver_number: driver.driver_number,
            driver_details: driver,
            lap_number: null,
            lap_time: null,
            gap_to_leader: null,
            date: position?.date || new Date().toISOString(),
            status: position ? 'active' : 'inactive'
          });
        });

        // Sort by position
        standings.sort((a, b) => {
          if (a.status === 'active' && b.status === 'active') {
            return a.position - b.position;
          }
          if (a.status === 'active') return -1;
          if (b.status === 'active') return 1;
          return 0;
        });
      }

      // Reassign positions for display (1 to N)
      standings.forEach((standing, index) => {
        standing.position = index + 1;
      });

      setEnhancedStandings(standings);
    };

    processStandings();
  }, [positions, laps, drivers, currentLap, viewMode]);

  const formatTime = (time: number | null): string => {
    if (time === null) return '-';
    return (time / 1000).toFixed(3);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="text-center text-red-500 p-4">
          {error}
        </CardContent>
      </Card>
    );
  }

 return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="py-2">
    <CardTitle className="text-lg">Driver Standings</CardTitle>
  </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-38rem)] overflow-y-auto">
          <AnimatePresence>
            {enhancedStandings.map((standing, index) => (
              <motion.div
                key={standing.driver_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: index * 64,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }
                }}
                exit={{ opacity: 0 }}
                className="absolute w-full"
              >
                <div className={`flex items-center p-4 rounded mx-2 h-14
                  ${standing.status === 'active' ? 'bg-secondary/50' : 'bg-secondary/20'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-bold min-w-8">{standing.position}</span>
                    <div className="flex items-center gap-2 min-w-48">
                      <span className={`font-medium ${standing.status === 'inactive' ? 'text-muted-foreground' : ''}`}>
                        {standing.driver_details?.full_name || `Driver #${standing.driver_number}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({standing.driver_details?.name_acronym || standing.driver_number})
                      </span>
                    </div>
                    {viewMode === 'lap' && standing.status === 'active' && (
                      <>
                        <span className="min-w-24">
                          {formatTime(standing.lap_time)}s
                        </span>
                        <span className="text-muted-foreground">
                          {standing.gap_to_leader ? `+${formatTime(standing.gap_to_leader)}` : 'Leader'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverStandings;
