import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_colour?: string;
}

interface DriverProfileProps {
  selectedDriver: Driver | null;
  selectedMeeting: string;
  selectedSession: string;
  viewMode: 'chrono' | 'lap' | 'final';
  currentLap: number;
  totalLaps: number;
  currentTime: string;
  meetings: any[];
  sessions: any[];
  onDriverDeselect: () => void;
}

const DriverProfile = ({
  selectedDriver,
  selectedMeeting,
  selectedSession,
  viewMode,
  currentLap,
  totalLaps,
  currentTime,
  meetings,
  sessions,
  onDriverDeselect
}: DriverProfileProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <Card className="group overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Race Information
          </CardTitle>
          <Info className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Overview - Always visible */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <motion.div 
            variants={itemVariants}
            className="p-3 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
          >
            <h2 className="text-lg font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent mb-2">
              {meetings.find(m => m.meeting_key.toString() === selectedMeeting)?.meeting_name || 'Select Event'}
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5382ec]" />
                Session: {sessions.find(s => s.session_key.toString() === selectedSession)?.session_name}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                Circuit: {sessions.find(s => s.session_key.toString() === selectedSession)?.circuit_short_name}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                {viewMode === 'lap'
                  ? `Lap ${currentLap}/${totalLaps}`
                  : `Time: ${currentTime ? new Date(currentTime).toLocaleTimeString() : '-'}`}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Driver Profile - Animated container */}
        <AnimatePresence mode="popLayout">
          {selectedDriver && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <div className="p-3 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
                    />
                    <span className="text-sm font-medium bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                      Driver {selectedDriver.driver_number}
                    </span>
                  </div>
                  <Button
                    onClick={onDriverDeselect}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-gray-400 hover:text-[#5382ec] hover:bg-[#5382ec]/10 transition-colors"
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  {selectedDriver.headshot_url && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <motion.img
                        src={selectedDriver.headshot_url}
                        alt={selectedDriver.full_name}
                        className="h-16 w-16 rounded-full object-cover border border-[#5382ec]/30"
                      />
                    </motion.div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-gray-200">
                      {selectedDriver.full_name}
                    </h2>
                    <p className="text-sm text-[#2dd4bf]">{selectedDriver.team_name}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DriverProfile;