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

  const { throttle, rpm, speed, gear, drsStatus } = useMemo(() => {
    const latest = carData[carData.length - 1] || {};
    return {
      throttle: latest?.throttle || 0,
      rpm: latest?.rpm || 0,
      speed: latest?.speed || 0,
      gear: latest?.n_gear?.toString() || 'B',
      drsStatus: latest?.drs ? 'ACTIF' : 'INACTIF'
    };
  }, [carData]);

  
  const realTimeDataContent = selectedDriver ? (
    <RaceCarTelemetry
      throttle={throttle}
      rpm={rpm}
      speed={speed}
      gear={gear}
      drsStatus={drsStatus} brake={0}    />
  ) : (
    <div className="h-full bg-secondary/20 rounded-lg flex items-center justify-center">
      Select a pilot to see its race datas
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <Card>
            <CardContent className="py-4">
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{selectedDriver ? 'Pilot Information' : 'Race Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDriver ? (
                  <div className="space-y-4">
                    <Button onClick={() => router.push('/live-race')} variant="outline" className="mb-4">
                      Return to race
                    </Button>
                    <div className="flex items-center gap-4">
                      {selectedDriver.headshot_url && (
                        <img
                          src={selectedDriver.headshot_url}
                          alt={selectedDriver.full_name}
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDriver.full_name}</h2>
                        <p className="text-lg text-muted-foreground">{selectedDriver.team_name}</p>
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white"
                          style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="font-semibold">Numéro</p>
                        <p className="text-xl">{selectedDriver.driver_number}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Code</p>
                        <p className="text-xl">{selectedDriver.name_acronym}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                      {meetings.find(m => m.meeting_key.toString() === selectedMeeting)?.meeting_name || 'Select a Grand Prix'}
                    </h2>
                    <div>
                      <p className="font-semibold">Session: {sessions.find(s => s.session_key.toString() === selectedSession)?.session_name}</p>
                      <p className="font-semibold">Circuit: {sessions.find(s => s.session_key.toString() === selectedSession)?.circuit_short_name}</p>
                      {viewMode === 'lap' ? (
                        <p className="font-semibold">Tour: {currentLap} / {totalLaps}</p>
                      ) : (
                        <p className="font-semibold">
                          Heure actuelle: {currentTime ? new Date(currentTime).toLocaleTimeString() : '-'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-96">
              <CardHeader>
                <CardTitle>Real Time Data</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {realTimeDataContent}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Circuit</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 bg-secondary/20 rounded-lg flex items-center justify-center">
        Circuit map placeholder
      </div>
    </CardContent>
  </Card>

  {selectedDriver && (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle>Real Time Sector Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-3rem)] overflow-y-auto">
        <SectorAnalysis 
          driverNumber={Number(driverNumber)}
          sessionKey={selectedSession}
          currentTime={currentTime}
          currentLap={currentLap}
          viewMode={viewMode}
        />
      </CardContent>
    </Card>
  )}
</div>

          <div className="space-y-4">
            <Card className="h-[calc(43vh-2rem)]">
              <CardContent className="h-[calc(100%-4rem)] overflow-hidden">
                <DriverStandings
                  sessionKey={selectedSession}
                  meetingKey={selectedMeeting}
                  currentTime={currentTime}
                  viewMode={viewMode}
                  currentLap={currentLap}
                />
              </CardContent>
            </Card>

            <Card className="h-[calc(35vh-2rem)]">
              <CardHeader>
                <CardTitle>Messages Race Control</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)] overflow-auto">
                <EventDisplay
                  events={events}
                  sessionName={sessions.find(s => s.session_key.toString() === selectedSession)?.session_name}
                  loading={loading}
                  viewMode={viewMode}
                  currentLap={currentLap}
                  currentTime={currentTime}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceControlEvents;