import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';

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

interface EventDisplayProps {
  events: RaceControlEvent[];
  sessionName?: string;
  loading?: boolean;
  viewMode: 'lap' | 'chronological';
  currentLap: number;
}

const EventDisplay = ({ events, sessionName, loading, viewMode, currentLap }: EventDisplayProps) => {
  const currentEvents = viewMode === 'lap' ? events.filter(e => e.lap_number === currentLap) : events;

  const getFlagColor = (flag: string | undefined) => {
    switch (flag?.toUpperCase()) {
      case 'YELLOW': return 'bg-yellow-400';
      case 'RED': return 'bg-red-600';
      case 'BLUE': return 'bg-blue-500';
      case 'GREEN': return 'bg-green-500';
      case 'CHEQUERED': return 'bg-black';
      default: return 'bg-gray-400';
    }
  };

  const formatEventTime = (date: string) => 
    new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Race Control Events</CardTitle>
        {sessionName && <CardDescription>{sessionName}</CardDescription>}
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">No events to display.</div>
        ) : (
          <div className="space-y-4">
            {currentEvents.map((e, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getFlagColor(e.flag)}`} />
                  <span>
                    {e.driver_number ? `Driver ${e.driver_number}` : 'General Event'} 
                    {e.lap_number ? ` - Lap ${e.lap_number}` : ''}
                  </span>
                </div>
                <p>{e.message}</p>
                <p>{formatEventTime(e.date)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDisplay;