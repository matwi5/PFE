import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

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
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
        <Card className="h-full overflow-hidden">
          <CardHeader className="py-2">
           <CardTitle className="text-lg">Race Control Events</CardTitle>
        {sessionName && <CardDescription>{sessionName}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative h-[calc(100vh-12rem)] overflow-y-auto">
          <AnimatePresence>
            {currentEvents.length === 0 ? (
              <div className="text-center py-8">No events to display.</div>
            ) : (
              currentEvents.map((event, index) => (
                <motion.div
                  key={`${event.date}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: index * 0.05
                    }
                  }}
                  exit={{ opacity: 0 }}
                  className="mb-4"
                >
                  <div className="p-4 border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 rounded-full ${getFlagColor(event.flag)}`} />
                      <span className="font-medium">
                        {event.driver_number ? `Driver ${event.driver_number}` : 'General Event'} 
                        {event.lap_number ? ` - Lap ${event.lap_number}` : ''}
                      </span>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {formatEventTime(event.date)}
                      </span>
                    </div>
                    <p className="text-sm">{event.message}</p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDisplay;