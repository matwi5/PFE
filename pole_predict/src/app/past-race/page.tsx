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
  // [États existants conservés...]
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<RaceControlEvent[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const hasLapData = events.some(e => e.lap_number != null && e.lap_number > 0);  
  const [viewMode, setViewMode] = useState<'lap' | 'chronological'>('chronological');
  const [currentLap, setCurrentLap] = useState(1);
  const [maxLap, setMaxLap] = useState(1);



   // Gérer le changement de meeting
   const handleMeetingChange = (meetingKey: string) => {
    setSelectedMeeting(meetingKey);
    setSelectedSession('');  // Réinitialiser uniquement la session
  };

   // Gérer le changement de session
   const handleSessionChange = (sessionKey: string) => {
    setSelectedSession(sessionKey);
    // Ne pas réinitialiser viewMode et currentLap ici
  };


  
   // Mettre à jour maxLap et currentLap uniquement quand les événements changent
   useEffect(() => {
    if (events.length > 0) {
      const lapsWithData = events.filter(e => e.lap_number != null && e.lap_number > 0);
      
      if (lapsWithData.length > 0) {
        const newMaxLap = Math.max(...lapsWithData.map(e => e.lap_number || 0));
        
        setMaxLap(newMaxLap);
        
        // Garder le tour actuel si valide, sinon mettre à 1
        setCurrentLap(curr => {
          if (curr > newMaxLap) return 1;
          if (curr < 1) return 1;
          return curr;
        });
        
        // Ne changer le viewMode que si nécessaire
        if (viewMode === 'chronological' && hasLapData) {
          setViewMode('chronological');
        }
      } else {
        setMaxLap(0);
        setViewMode('lap');
      }
    }
  }, [events, hasLapData]);


  
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

  const selectedGrandPrix = meetings.find(m => 
    m.meeting_key.toString() === selectedMeeting
  );

  return (
    <div className="min-h-screen bg-red-600">
      <div className="container mx-auto px-4 py-4">
        {/* Barre de sélection en haut */}
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
                currentLap={currentLap}
                maxLap={maxLap}
                onLapChange={setCurrentLap}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                hasLapData={hasLapData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-3 gap-4">
          {/* Colonne gauche */}
          <div className="space-y-4">
            {/* Informations de course */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedGrandPrix?.meeting_name || 'Sélectionnez un Grand Prix'}
                    </h2>
                  </div>
                  <div>
                    <p className="font-semibold">Tour actuel: {currentLap} / {maxLap}</p>
                    <p className="font-semibold">Session: {currentSessionName}</p>
                    <p className="font-semibold">Date: {selectedGrandPrix?.date_start ? new Date(selectedGrandPrix.date_start).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Graphiques */}
            <Card className="h-96">
              <CardHeader>
                <CardTitle>Statistiques de course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  Espace pour graphiques de course
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne centrale */}
          <div className="space-y-4">
            {/* Carte du circuit */}
            <Card>
              <CardHeader>
                <CardTitle>Circuit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  Map du GP
                </div>
              </CardContent>
            </Card>

            {/* Graphique sous la carte */}
            <Card className="h-64">
              <CardHeader>
                <CardTitle>Données de course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  Graphiques
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite */}
          <div className="space-y-4">
  {/* Classement - réduire la hauteur */}
  <Card className="h-[calc(43vh-2rem)]"> {/* ou une hauteur fixe comme h-[400px] */}
    <CardHeader>
      <CardTitle>Driver Standings</CardTitle>
    </CardHeader>
    <CardContent className="h-[calc(100%-4rem)] overflow-hidden">
      <DriverStandings
        sessionKey={selectedSession}
        meetingKey={selectedMeeting}
        currentLap={currentLap}
        viewMode={viewMode}
      />
    </CardContent>
  </Card>

  {/* Messages de course - réduire la hauteur */}
  <Card className="h-[calc(35vh-2rem)]"> {/* ou une hauteur fixe comme h-[400px] */}
    <CardHeader>
      <CardTitle>Race Control Messages</CardTitle>
    </CardHeader>
    <CardContent className="h-[calc(100%-4rem)] overflow-auto">
      <EventDisplay
        events={events}
        sessionName={currentSessionName}
        loading={loading}
        viewMode={viewMode}
        currentLap={currentLap}
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