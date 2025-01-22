"use client";

import React, { useState, useEffect } from 'react';
import RaceSelection from '../components/raceComponent/RaceSelection';
import EventDisplay from '../components/raceComponent/EventDisplay';
import DriverStandings from '../components/raceComponent/DriverStanding';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

const RaceControlEvents = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<RaceControlEvent[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<string>('');
  const [sessionEndTime, setSessionEndTime] = useState<string>('');
  const [currentLap, setCurrentLap] = useState<number>(0);
  const [totalLaps, setTotalLaps] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'chrono' | 'lap' | 'final'>('final');

  // Fetch meetings
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

        // Select the latest meeting and session by default
        if (sortedMeetings.length > 0) {
          const latestMeeting = sortedMeetings[0];
          setSelectedMeeting(latestMeeting.meeting_key.toString());

          const responseSessions = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${latestMeeting.meeting_key}`);
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
        setError('Error fetching meetings');
        console.error(err);
      }
    };
    fetchMeetings();
  }, []);

  // Fetch sessions for selected meeting
  useEffect(() => {
    if (!selectedMeeting) return;
    const fetchSessions = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${selectedMeeting}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError('Error fetching sessions');
        console.error(err);
      }
    };
    fetchSessions();
  }, [selectedMeeting]);

  // Fetch events for selected session
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

        // Get session details to set time bounds
        const sessionDetails = sessions.find(s => s.session_key.toString() === selectedSession);
        if (sessionDetails) {
          setSessionStartTime(sessionDetails.date_start);
          setSessionEndTime(sessionDetails.date_end);
          setCurrentTime(sessionDetails.date_end);
          setTotalLaps(sessionDetails.total_laps || 0);
          setCurrentLap(sessionDetails.total_laps || 0);
        }
      } catch (err) {
        setError('Error fetching events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedSession, sessions]);
  

  // Fetch laps data for selected session (by lap number)
  useEffect(() => {
    if (!selectedSession) return;

    const fetchLapsData = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${selectedSession}`);
        const data = await response.json();
        setLapsData(data);

        // Calculate total laps
        const maxLap = Math.max(...data.map((lap: LapData) => lap.lap_number));
        setTotalLaps(maxLap);
      } catch (err) {
        console.error('Error fetching laps data:', err);
      }
    };

    fetchLapsData();
  }, [selectedSession]);

  const handleMeetingChange = (meetingKey: string) => {
    setSelectedMeeting(meetingKey);
    setSelectedSession('');
  };

  const handleSessionChange = (sessionKey: string) => {
    setSelectedSession(sessionKey);
    setViewMode('chrono');
  };

  const handleTimeChange = (time: string) => {
    setCurrentTime(time);
  };

  const handleLapChange = (lap: number) => {
    setCurrentLap(lap);
  };

  const handleViewModeChange = (mode: 'chrono' | 'lap' | 'final') => {
    setViewMode(mode);
    if (mode === 'final') {
      setCurrentTime(sessionEndTime);
    } else if (mode === 'lap') {
      setCurrentLap(0);
    }
  };

  const currentSessionDetails = sessions.find(s =>
    s.session_key.toString() === selectedSession
  );

  const selectedGrandPrix = meetings.find(m =>
    m.meeting_key.toString() === selectedMeeting
  );

  const handleTotalLapsChange = (total: number) => {
    setTotalLaps(total);
  };

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
                onMeetingChange={handleMeetingChange}
                onSessionChange={handleSessionChange}
                currentTime={currentTime}
                sessionStartTime={sessionStartTime}
                sessionEndTime={sessionEndTime}
                onTimeChange={handleTimeChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                currentLap={currentLap}
                totalLaps={totalLaps}
                onLapChange={setCurrentLap}
                onTotalLapsChange={handleTotalLapsChange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Race Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedGrandPrix?.meeting_name || 'Select a Grand Prix'}
                    </h2>
                  </div>
                  <div>
                    <p className="font-semibold">Session: {currentSessionDetails?.session_name}</p>
                    <p className="font-semibold">Circuit: {currentSessionDetails?.circuit_short_name}</p>
                    {viewMode === 'lap' ? (
                      <p className="font-semibold">Lap: {currentLap} / {totalLaps}</p>
                    ) : (
                      <p className="font-semibold">
                        Current Time: {currentTime ? new Date(currentTime).toLocaleTimeString() : '-'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Race statistics */}
            <Card className="h-96">
              <CardHeader>
                <CardTitle>Race Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full bg-secondary/20 rounded-lg flex items-center justify-center">
                  Race statistics placeholder
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle column */}
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

            <Card className="h-64">
              <CardHeader>
                <CardTitle>Race Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full bg-secondary/20 rounded-lg flex items-center justify-center">
                  Race data graphs placeholder
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
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
                <CardTitle>Race Control Messages</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)] overflow-auto">
              <EventDisplay
                events={events}
                sessionName={currentSessionDetails?.session_name}
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
