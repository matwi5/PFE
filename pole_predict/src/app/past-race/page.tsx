"use client";

import React, { useState, useEffect } from 'react';
import RaceSelection from '../components/raceComponent/RaceSelection';
import EventDisplay from '../components/raceComponent/EventDisplay';
import DriverStandings from '../components/raceComponent/DriverStanding';

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  year: number;
  date_start: string;
}

interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
}

interface RaceControlEvent {
  category: string;
  date: string;
  driver_number?: number;
  flag?: string;
  lap_number?: number;
  message: string;
  scope: string;
  meeting_key: number;
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
  const hasLapData = events.some(e => e.lap_number != null);

  
  // New states for lap navigation
  const [viewMode, setViewMode] = useState<'lap' | 'chronological'>('chronological');
  const [currentLap, setCurrentLap] = useState(1);
  const [maxLap, setMaxLap] = useState(1);

  // Update maxLap when events change
  useEffect(() => {
    const laps = events.filter(e => e.lap_number != null);
    const maxLapNumber = laps.length ? Math.max(...laps.map(e => e.lap_number || 0)) : 0;
    setMaxLap(maxLapNumber);
    setCurrentLap(maxLapNumber > 0 ? 1 : 0);
    if (maxLapNumber === 0) setViewMode('chronological');
  }, [events]);

  // Fetch meetings on mount
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('https://api.openf1.org/v1/meetings');
        if (!response.ok) throw new Error('Failed to fetch meetings');
        const data = await response.json();
        setMeetings(data.sort((a: Meeting, b: Meeting) => 
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        ));
      } catch (err) {
        setError('Error fetching meetings');
        console.error(err);
      }
    };
    fetchMeetings();
  }, []);

  // Fetch sessions when a meeting is selected
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

  // Fetch events when a session is selected
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
      } catch (err) {
        setError('Error fetching events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedSession]);

  const currentSessionName = sessions.find(s => 
    s.session_key.toString() === selectedSession
  )?.session_name;

  return (
    <div className="space-y-4">
      <RaceSelection
        meetings={meetings}
        sessions={sessions}
        selectedMeeting={selectedMeeting}
        selectedSession={selectedSession}
        onMeetingChange={setSelectedMeeting}
        onSessionChange={setSelectedSession}
        currentLap={currentLap}
        maxLap={maxLap}
        onLapChange={setCurrentLap}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasLapData={hasLapData}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EventDisplay
          events={events}
          sessionName={currentSessionName}
          loading={loading}
          viewMode={viewMode}
          currentLap={currentLap}
        />
        <DriverStandings
          sessionKey={selectedSession}
          meetingKey={selectedMeeting}
          currentLap={currentLap}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};
export default RaceControlEvents;