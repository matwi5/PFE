/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, AlertTriangle, Loader2 } from 'lucide-react';

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

const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const DriverProfile: React.FC<DriverProfileProps> = ({
  selectedDriver,
  selectedMeeting,
  selectedSession,
  viewMode,
  currentLap,
  totalLaps,
  currentTime,
  meetings = [],
  sessions = [],
  onDriverDeselect
}) => {
  const [chronoLap, setChronoLap] = useState<number>(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    const fetchLapData = async () => {
      if (viewMode !== 'chrono') return;
      if (!selectedSession) {
        setError('No session selected');
        return;
      }

      // Only show loading on initial load
      if (!initialLoadComplete) {
        setLoading(true);
      }
      setError(null);
      
      try {
        let url = `https://api.openf1.org/v1/laps?session_key=${selectedSession}`;
        
        if (selectedDriver?.driver_number) {
          url += `&driver_number=${selectedDriver.driver_number}`;
        }
        
        if (currentTime) {
          url += `&date_start<${encodeURIComponent(currentTime)}`;
        }

        setIsRetrying(true);
        const data = await fetchWithRetry(url);
        setIsRetrying(false);
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        if (!data || data.length === 0) {
          setChronoLap(1);
          return;
        }
        
        const validLaps = data.filter(lap => 
          lap?.lap_number && 
          !isNaN(lap.lap_number) && 
          lap.lap_number > 0
        );

        if (validLaps.length === 0) {
          setChronoLap(1);
          return;
        }

        const maxLap = Math.max(...validLaps.map(lap => lap.lap_number));
        setChronoLap(maxLap);
        setError(null);
      } catch (error) {
        console.error('Error fetching lap data:', error);
        setError('Failed to fetch lap data. Please try again.');
        setChronoLap(1);
      } finally {
        setLoading(false);
        setIsRetrying(false);
        setInitialLoadComplete(true);
      }
    };

    fetchLapData();
  }, [selectedDriver, selectedSession, currentTime, viewMode, totalLaps]);

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

  const getLapDisplay = () => {
    if (viewMode === 'chrono') {
      return selectedDriver
        ? `Lap ${chronoLap}/${totalLaps || '?'}`
        : `Leader's Lap ${chronoLap}/${totalLaps || '?'}`;
    }
    if (viewMode === 'lap') {
      return `Lap ${currentLap}/${totalLaps || '?'}`;
    }
    return `Number of laps: ${totalLaps || '?'}`;
  };

  const selectedMeetingData = meetings.find(m => m?.meeting_key?.toString() === selectedMeeting);
  const selectedSessionData = sessions.find(s => s?.session_key?.toString() === selectedSession);

  if (!selectedSession || !selectedMeeting) {
    return (
      <Card className="group overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300">
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-gray-400">Please select a session and meeting</p>
        </CardContent>
      </Card>
    );
  }

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
        {loading && !initialLoadComplete && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#5382ec]" />
            <span className="text-gray-400">
              Loading...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-400">
            <AlertTriangle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

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
              {selectedMeetingData?.meeting_name || 'Unknown Event'}
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5382ec]" />
                Session: {selectedSessionData?.session_name || 'Unknown Session'}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                Circuit: {selectedSessionData?.circuit_short_name || 'Unknown Circuit'}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                {getLapDisplay()}
              </p>
            </div>
          </motion.div>
        </motion.div>

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
                      style={{ backgroundColor: `#${selectedDriver.team_colour || 'FFFFFF'}` }}
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
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </motion.div>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-gray-200">
                      {selectedDriver.full_name}
                    </h2>
                    <p className="text-sm text-[#2dd4bf]">
                      {selectedDriver.team_name || 'Unknown Team'}
                    </p>
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