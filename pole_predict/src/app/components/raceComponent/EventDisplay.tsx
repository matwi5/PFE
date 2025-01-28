import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

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
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getFlagColor = (flag: string | undefined) => {
    switch (flag?.toUpperCase()) {
      case 'YELLOW': return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 'RED': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'BLUE': return 'bg-gradient-to-r from-[#5382ec] to-[#436cbf]';
      case 'GREEN': return 'bg-gradient-to-r from-[#2dd4bf] to-[#0d9488]';
      case 'CHEQUERED': return 'bg-gradient-to-r from-gray-800 to-gray-900';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
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
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)] h-[70vh]">
          <CardHeader className="pb-2 flex justify-between items-start">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
              Race Control
            </CardTitle>
            <Bell className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
            <div className="text-gray-400">Loading events...</div>
          </CardContent>
        </Card>
      );
    }
  
    return (
      <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)] h-[70vh]">
        <CardHeader className="pb-2 flex justify-between items-start">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
            Race Control
          </CardTitle>
          <Bell className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
        </CardHeader>
        <CardContent className="relative h-[calc(100%-4rem)]">
          <div 
            className="h-full overflow-y-auto pr-6
              scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 
              hover:scrollbar-thumb-[#d56676]/80 transition-colors duration-200"
          >
            <div className="pr-2 space-y-4">
              <AnimatePresence>
                {sortedEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No event to display</div>
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
                    >
                      <div className="p-3 rounded-lg bg-black/20 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-black/30">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${getFlagColor(event.flag)}`} />
                          <span className="text-sm font-medium bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                            {event.driver_number ? `Driver ${event.driver_number}` : 'Race Control'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {event.lap_number ? `Lap ${event.lap_number}` : ''}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            {formatEventTime(event.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{event.message}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default EventDisplay;