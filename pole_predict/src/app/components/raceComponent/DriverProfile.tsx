'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

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
  onReturnToOverview: () => void;
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
  onReturnToOverview
}: DriverProfileProps) => {
  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300">
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
          {selectedDriver ? 'Driver Profile' : 'Event Overview'}
        </CardTitle>
        <User className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text" />
      </CardHeader>
      <CardContent>
        {selectedDriver ? (
          <motion.div className="space-y-4">
            <Button 
              onClick={onReturnToOverview}
              className="bg-gradient-to-r from-[#5382ec] to-[#436cbf] hover:from-[#436cbf] hover:to-[#325299] transition-all duration-300"
            >
              Return to Race Overview
            </Button>
            <div className="flex items-center gap-4">
              {selectedDriver.headshot_url && (
                <motion.img
                  src={selectedDriver.headshot_url}
                  alt={selectedDriver.full_name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-[#5382ec]"
                  whileHover={{ scale: 1.05 }}
                />
              )}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  {selectedDriver.full_name}
                </h2>
                <p className="text-[#2dd4bf]">{selectedDriver.team_name}</p>
                <div 
                  className="w-8 h-8 rounded-full border-2 border-[#5382ec] transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              {meetings.find(m => m.meeting_key.toString() === selectedMeeting)?.meeting_name || 'Select Event'}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5382ec]" />
                Session: {sessions.find(s => s.session_key.toString() === selectedSession)?.session_name}
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                Circuit: {sessions.find(s => s.session_key.toString() === selectedSession)?.circuit_short_name}
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                {viewMode === 'lap' 
                  ? `Lap ${currentLap}/${totalLaps}`
                  : `Time: ${currentTime ? new Date(currentTime).toLocaleTimeString() : '-'}`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverProfile;