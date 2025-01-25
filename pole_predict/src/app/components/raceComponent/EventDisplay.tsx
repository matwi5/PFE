import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
  viewMode: 'chrono' | 'lap' | 'final';
  currentLap: number;
  currentTime: string;
}

const EventDisplay = ({ 
  events, 
  sessionName, 
  loading, 
  viewMode, 
  currentLap,
  currentTime 
}: EventDisplayProps) => {
  const getFilteredEvents = () => {
    const now = new Date(currentTime);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      
      switch(viewMode) {
        case 'chrono':
          return eventDate <= now;
          
        case 'lap':
          return event.lap_number === currentLap;
          
        case 'final':
          return true;
          
        default:
          return false;
      }
    });
  };

  const sortedEvents = [...getFilteredEvents()].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime() // Plus récent en premier
  );

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
    new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center py-8">Chargement des événements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="py-2">
        <CardTitle className="text-lg">Messages Race Control</CardTitle>
        {sessionName && <span className="text-sm text-muted-foreground">{sessionName}</span>}
      </CardHeader>
      <CardContent className="h-[calc(100%-3.5rem)]">
        <div className="h-full overflow-y-auto pr-2">
          <AnimatePresence>
            {sortedEvents.length === 0 ? (
              <div className="text-center py-8">Aucun événement à afficher</div>
            ) : (
              sortedEvents.map((event, index) => (
                <motion.div
                  key={`${event.date}-${event.message}-${index}`}
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
                  className="mb-2"
                >
                  <div className="p-3 border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${getFlagColor(event.flag)}`} />
                      <span className="text-sm font-medium">
                        {event.driver_number ? `Pilote ${event.driver_number}` : 'Race Control'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.lap_number ? `Tour ${event.lap_number}` : ''}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
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