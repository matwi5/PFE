"use client";

import React, { useState, useEffect, useMemo } from 'react';
import RaceSelection from '../components/raceComponent/RaceSelection';
import EventDisplay from '../components/raceComponent/EventDisplay';
import DriverStandings from '../components/raceComponent/DriverStanding';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import RaceCarTelemetry from '../components/raceComponent/RaceCarTelemetry';
import SectorAnalysis from '../components/raceComponent/SectorAnalysis';
import DriverProfile from '../components/raceComponent/DriverProfile';
import CircuitMap from '../components/raceComponent/CircuitMap';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import { Trophy } from 'lucide-react';

export interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_colour?: string;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  session_key?: number;
  meeting_key?: number;
}

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  year: number;
  date_start: string;
}

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_short_name: string;
  country_name: string;
  total_laps?: number;
}

interface RaceControlEvent {
  category: string;
  date: string;
  driver_number?: number;
  flag?: string;
  message: string;
  scope: string;
  meeting_key: number;
  session_key: number;
  lap_number?: number;
}

interface LapData {
  date_start: string;
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  session_key: number;
}

interface CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

const RaceControlEvents = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<RaceControlEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<string>('');
  const [sessionEndTime, setSessionEndTime] = useState<string>('');
  const [currentLap, setCurrentLap] = useState<number>(0);
  const [totalLaps, setTotalLaps] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'chrono' | 'lap' | 'final'>('final');
  const [lapsData, setLapsData] = useState<LapData[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverNumber = searchParams.get('driver');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [carData, setCarData] = useState<CarData[]>([]);
  const [carDataLoading, setCarDataLoading] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('https://api.openf1.org/v1/meetings');
        if (!response.ok) throw new Error('Failed to fetch meetings');
        const data = await response.json();
        const sortedMeetings = data.sort((a: Meeting, b: Meeting) =>
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        );
        setMeetings(sortedMeetings);

        if (sortedMeetings.length > 0) {
          const latestMeeting = sortedMeetings[0];
          setSelectedMeeting(latestMeeting.meeting_key.toString());
          const responseSessions = await fetch(
            `https://api.openf1.org/v1/sessions?meeting_key=${latestMeeting.meeting_key}`
          );
          if (!responseSessions.ok) throw new Error('Failed to fetch sessions');
          const sessionsData = await responseSessions.json();
          setSessions(sessionsData);

          if (sessionsData.length > 0) {
            const latestSession = sessionsData[0];
            setSelectedSession(latestSession.session_key.toString());
            setSessionStartTime(latestSession.date_start);
            setSessionEndTime(latestSession.date_end);
            setCurrentTime(latestSession.date_end);
            setTotalLaps(latestSession.total_laps || 0);
            setCurrentLap(latestSession.total_laps || 0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (!selectedMeeting) return;
    const fetchSessions = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${selectedMeeting}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessions();
  }, [selectedMeeting]);

  useEffect(() => {
    if (!selectedSession) return;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/race-selection?session_key=${selectedSession}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data.sort((a: RaceControlEvent, b: RaceControlEvent) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));

        const sessionDetails = sessions.find(s => s.session_key.toString() === selectedSession);
        if (sessionDetails) {
          setSessionStartTime(sessionDetails.date_start);
          setSessionEndTime(sessionDetails.date_end);
          setCurrentTime(sessionDetails.date_end);
          setTotalLaps(sessionDetails.total_laps || 0);
          setCurrentLap(sessionDetails.total_laps || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedSession, sessions]);

  useEffect(() => {
    if (!selectedSession) return;
    const fetchLapsData = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${selectedSession}`);
        const data = await response.json();
        setLapsData(data);
        const maxLap = Math.max(...data.map((lap: LapData) => lap.lap_number));
        setTotalLaps(maxLap);
      } catch (err) {
        console.error('Error fetching laps data:', err);
      }
    };
    fetchLapsData();
  }, [selectedSession]);

  useEffect(() => {
    const fetchCarData = async () => {
      if (driverNumber && selectedSession && currentTime) {
        try {
          setCarDataLoading(true);
          const response = await fetch(
            `https://api.openf1.org/v1/car_data?` +
            `driver_number=${driverNumber}&` +
            `session_key=${selectedSession}&` +
            `date<=${currentTime}`
          );
          const data = await response.json();
          setCarData(data.filter((d: CarData) => 
            d.brake !== null && 
            d.throttle !== null && 
            d.rpm !== null
          ));
        } catch (error) {
          console.error('Error fetching car data:', error);
        } finally {
          setCarDataLoading(false);
        }
      }
    };
    fetchCarData();
  }, [driverNumber, selectedSession, currentTime]);

  useEffect(() => {
    const fetchDriver = async () => {
      if (driverNumber) {
        try {
          const response = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${driverNumber}`);
          const data = await response.json();
          setSelectedDriver(data[0] || null);
        } catch (error) {
          console.error('Error fetching driver:', error);
        }
      } else {
        setSelectedDriver(null);
      }
    };
    fetchDriver();
  }, [driverNumber]);

  const { throttle, rpm, speed, gear, drsStatus, brake } = useMemo(() => {
    const latest = carData[carData.length - 1] || {};
    return {
      throttle: latest?.throttle || 0,
      rpm: latest?.rpm || 0,
      speed: latest?.speed || 0,
      gear: latest?.n_gear?.toString() || 'B',
      drsStatus: latest?.drs ? 'ACTIF' : 'INACTIF',
      brake: latest?.brake || 0
    };
  }, [carData]);
  
  const realTimeDataContent = selectedDriver ? (
    <RaceCarTelemetry
      throttle={throttle}
      rpm={rpm}
      speed={speed}
      gear={gear}
      drsStatus={drsStatus}
      brake={brake}
    />
  ) : (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]">
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
          Live Telemetry
        </CardTitle>
        <Gauge className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
        <span className="text-gray-400">Select a pilot to see telemetry data</span>
      </CardContent>
    </Card>
  );


  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <div className="container mx-auto px-4 py-16">
        {/* En-tête - inchangé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-4"
        >
          <div className="relative flex justify-center items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
              Race Control Dashboard
            </h1>
            <Button
              onClick={() => router.push('/live')}
              className="bg-[#5382ec] hover:bg-[#436cbf] transition-colors whitespace-nowrap absolute right-0"
            >
              Go to Race Predictions
            </Button>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
            Live race monitoring with real-time telemetry and race control events
          </p>
        </motion.div>

        {/* Section de sélection - inchangée */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16"
        >
          <Card className="bg-[#282a2c] border-none">
            <CardContent className="p-6">
              <RaceSelection
                meetings={meetings}
                sessions={sessions}
                selectedMeeting={selectedMeeting}
                selectedSession={selectedSession}
                onMeetingChange={setSelectedMeeting}
                onSessionChange={setSelectedSession}
                currentTime={currentTime}
                sessionStartTime={sessionStartTime}
                sessionEndTime={sessionEndTime}
                onTimeChange={setCurrentTime}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentLap={currentLap}
                totalLaps={totalLaps}
                onLapChange={setCurrentLap}
                onTotalLapsChange={setTotalLaps}
                isDriverMode={!!selectedDriver}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Nouvelle section avec masonry columns */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {/* Profil du pilote / Aperçu événement */}
            <div className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <DriverProfile
                  selectedDriver={selectedDriver}
                  selectedMeeting={selectedMeeting}
                  selectedSession={selectedSession}
                  viewMode={viewMode}
                  currentLap={currentLap}
                  totalLaps={totalLaps}
                  currentTime={currentTime}
                  meetings={meetings}
                  sessions={sessions}
                  onReturnToOverview={() => router.push('/live-race')}
                />
              </motion.div>
            </div>

            {/* Classement des pilotes */}
            <div className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DriverStandings
                  sessionKey={selectedSession}
                  meetingKey={selectedMeeting}
                  currentTime={currentTime}
                  viewMode={viewMode}
                  currentLap={currentLap}
                />
              </motion.div>
            </div>

            {/* Télémétrie en temps réel */}
            <div className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {realTimeDataContent}
              </motion.div>
            </div>

            {/* Carte du circuit */}
            <div className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CircuitMap />
              </motion.div>
            </div>

            {/* Analyse sectorielle (conditionnelle) */}
            {selectedDriver && (
              <div className="break-inside-avoid">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SectorAnalysis 
                    driverNumber={Number(driverNumber)}
                    sessionKey={selectedSession}
                    currentTime={currentTime}
                    currentLap={currentLap}
                    viewMode={viewMode}
                  />
                </motion.div>
              </div>
            )}

            {/* Affichage des événements */}
            <div className="break-inside-avoid">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <EventDisplay
                  events={events}
                  sessionName={sessions.find(s => s.session_key.toString() === selectedSession)?.session_name}
                  loading={loading}
                  viewMode={viewMode}
                  currentLap={currentLap}
                  currentTime={currentTime}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RaceControlEvents;