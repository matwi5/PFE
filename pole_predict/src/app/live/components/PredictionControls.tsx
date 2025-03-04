//PredictionControls.tsx

"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LapSlider } from './LapSlider';

interface Session {
  id: string;
  session_key: number;
  session_name: string;
  meeting_key: number;
}

interface Driver {
  driver_number: string;
  full_name: string;
  team_name: string;
}

interface PredictionControlsProps {
  sessions: Session[];
  drivers: Driver[];
  laps: string[];
  selectedSession: string;
  selectedDriver: string;
  selectedLap: string;
  isPlaying: boolean;
  isExpertMode: boolean;
  onSessionChange: (value: string) => void;
  onDriverChange: (value: string) => void;
  onLapChange: (value: string) => void;
  onPlayToggle: () => void;
  onExpertModeToggle: () => void;
  getSessionDisplay: (sessionKey: string) => string;
}

export const PredictionControls = ({
  sessions,
  drivers,
  laps,
  selectedSession,
  selectedDriver,
  selectedLap,
  isPlaying,
  isExpertMode,
  onSessionChange,
  onDriverChange,
  onLapChange,
  onPlayToggle,
  onExpertModeToggle,
  getSessionDisplay,
}: PredictionControlsProps) => {
  return (
    <Card className="bg-[#282a2c] border-none">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-72">
            <Select value={selectedSession} onValueChange={onSessionChange}>
              <SelectTrigger className="bg-[#1d1f20] border-0 text-white h-12 hover:bg-gray-800/50 transition-colors">
                <SelectValue placeholder="Select a session..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1d1f20] border-0">
                {sessions.map((session) => (
                  <SelectItem 
                    key={session.id}
                    value={session.id}
                    className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] cursor-pointer"
                  >
                    {getSessionDisplay(session.session_key.toString())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-72"
            >
              <Select value={selectedDriver} onValueChange={onDriverChange}>
                <SelectTrigger className="bg-[#1d1f20] border-0 text-white h-12 hover:bg-gray-800/50 transition-colors">
                  <SelectValue placeholder="Select a driver..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1d1f20] border-0">
                  {drivers.map((driver) => (
                    <SelectItem 
                      key={driver.driver_number} 
                      value={driver.driver_number}
                      className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] cursor-pointer"
                    >
                      {`${driver.full_name} - ${driver.team_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {selectedDriver && laps.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              <div className="w-96">
                <LapSlider 
                  laps={laps}
                  selectedLap={selectedLap || laps[0]}
                  onLapChange={onLapChange}
                  isPlaying={isPlaying}
                  onPlayToggle={onPlayToggle}
                />
              </div>
              
              <motion.div 
                className={`
                  relative h-12 w-32 rounded-lg cursor-pointer overflow-hidden
                  bg-gradient-to-r from-[#5382ec] to-[#d56676]
                  p-0.5
                `}
                onClick={onExpertModeToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={`
                    absolute inset-0 bg-[#1d1f20] m-0.5 rounded-[6px]
                    flex items-center justify-center
                    overflow-hidden
                  `}
                  initial={false}
                >
                  <motion.div
                    className="absolute inset-0 flex"
                    animate={{ x: isExpertMode ? "-100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
                      <span className={`text-sm font-medium transition-colors ${!isExpertMode ? 'text-[#5382ec]' : 'text-gray-400'}`}>
                        Simple
                      </span>
                    </div>
                    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
                      <span className={`text-sm font-medium transition-colors ${isExpertMode ? 'text-[#2dd4bf]' : 'text-gray-400'}`}>
                        Expert
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};