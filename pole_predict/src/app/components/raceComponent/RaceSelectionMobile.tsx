import React, { useEffect, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { motion } from "framer-motion";
import { Card, CardContent } from '../../../components/ui/card';

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

interface Lap {
  date_start: string;
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  session_key: number;
}

interface RaceSelectionMobileProps {
  meetings: Meeting[];
  sessions: Session[];
  selectedMeeting: string;
  selectedSession: string;
  onMeetingChange: (value: string) => void;
  onSessionChange: (value: string) => void;
  currentTime: string;
  sessionStartTime: string;
  sessionEndTime: string;
  onTimeChange: (time: string) => void;
  viewMode: "chrono" | "lap" | "final";
  onViewModeChange: (mode: "chrono" | "lap" | "final") => void;
  currentLap: number;
  totalLaps: number;
  onLapChange: (lap: number) => void;
  onTotalLapsChange: (total: number) => void;
  isDriverMode?: boolean;
  isExpertMode: boolean;
  onExpertModeToggle: () => void;
}

const RaceSelectionMobile = ({
  meetings,
  sessions,
  selectedMeeting,
  selectedSession,
  onMeetingChange,
  onSessionChange,
  currentTime,
  sessionStartTime,
  sessionEndTime,
  onTimeChange,
  viewMode,
  onViewModeChange,
  currentLap,
  totalLaps,
  onLapChange,
  onTotalLapsChange,
  isDriverMode,
  isExpertMode,
  onExpertModeToggle,
}: RaceSelectionMobileProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isLoadingLaps, setIsLoadingLaps] = useState(false);
  const [validLaps, setValidLaps] = useState<Lap[]>([]);
  const [temporaryLap, setTemporaryLap] = useState<number | null>(null);
  const [temporaryDisplayTime, setTemporaryDisplayTime] = useState<string | null>(null);

  // Set default session to "Race" when meeting changes
  useEffect(() => {
    if (selectedMeeting) {
      const raceSession = sessions.find((s) => s.session_name === "Race");
      if (raceSession) {
        onSessionChange(raceSession.session_key.toString());
      } else {
        onSessionChange("");
      }
    }
  }, [selectedMeeting, sessions]);

  // Reset view mode to "final" when session changes
  useEffect(() => {
    onViewModeChange("final");
  }, [selectedSession, onViewModeChange]);

  // Fetch laps data when session changes
  useEffect(() => {
    const fetchLaps = async () => {
      if (!selectedSession) return;

      setIsLoadingLaps(true);
      try {
        const response = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${selectedSession}`
        );
        if (!response.ok) throw new Error("Failed to fetch laps");

        const data: Lap[] = await response.json();

        const filtered = data
          .filter((lap) => !lap.is_pit_out_lap && lap.lap_duration > 0)
          .sort((a, b) => {
            const lapDiff = a.lap_number - b.lap_number;
            if (lapDiff !== 0) return lapDiff;
            return (
              new Date(a.date_start).getTime() -
              new Date(b.date_start).getTime()
            );
          });

        setLaps(data);
        setValidLaps(filtered);

        if (viewMode === "lap" && filtered.length > 0) {
          const maxLap = Math.max(...filtered.map((lap) => lap.lap_number));
          onTotalLapsChange(maxLap);
          if (currentLap === 0) {
            onLapChange(1);
            const firstLap = filtered
              .filter((lap) => lap.lap_number === 1)
              .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())[0];
            if (firstLap) {
              onTimeChange(firstLap.date_start);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching laps:", error);
      } finally {
        setIsLoadingLaps(false);
      }
    };

    fetchLaps();
  }, [selectedSession, viewMode]);

  // Timer logic for chrono mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && viewMode === "chrono") {
      timer = setInterval(() => {
        const newTime = new Date(currentTime);
        newTime.setSeconds(newTime.getSeconds() + 1);
        if (newTime <= new Date(sessionEndTime)) {
          onTimeChange(newTime.toISOString());
        } else {
          setIsRunning(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, currentTime, sessionEndTime, viewMode]);

  // Timer logic for lap mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      isRunning &&
      viewMode === "lap" &&
      !isLoadingLaps &&
      validLaps.length > 0
    ) {
      timer = setInterval(() => {
        if (currentLap < totalLaps) {
          const nextLap = currentLap + 1;
          const lapData = validLaps.find((lap) => lap.lap_number === nextLap);
          if (lapData) {
            onLapChange(nextLap);
            onTimeChange(lapData.date_start);
          }
        } else {
          setIsRunning(false);
        }
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isRunning, currentLap, totalLaps, viewMode, validLaps, isLoadingLaps]);

  const handleSliderChange = (value: number) => {
    if (viewMode === "chrono") {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const newTimeMs = startMs + (endMs - startMs) * (value / 100);
      setTemporaryDisplayTime(new Date(newTimeMs).toISOString());
    } else if (viewMode === "lap") {
      const newLap = Math.max(1, Math.round((totalLaps * value) / 100));
      setTemporaryLap(newLap);
    }
  };

  const handleSliderCommit = (value: number) => {
    if (viewMode === "chrono") {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const newTimeMs = startMs + (endMs - startMs) * (value / 100);
      onTimeChange(new Date(newTimeMs).toISOString());
      setTemporaryDisplayTime(null);
    } else if (viewMode === "lap") {
      if (temporaryLap !== null) {
        onLapChange(temporaryLap);
        const lapData = validLaps.find(lap => lap.lap_number === temporaryLap);
        if (lapData) {
          onTimeChange(lapData.date_start);
        }
        setTemporaryLap(null);
      }
    }
  };

  const getCurrentValue = () => {
    if (viewMode === "chrono") {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const currentMs = new Date(temporaryDisplayTime || currentTime).getTime();
      return ((currentMs - startMs) / (endMs - startMs)) * 100;
    } else if (viewMode === "lap" && totalLaps > 0) {
      const displayedLap = temporaryLap !== null ? temporaryLap : currentLap;
      return (displayedLap / totalLaps) * 100;
    }
    return 0;
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const handleViewModeChange = (newMode: "chrono" | "lap" | "final") => {
    onViewModeChange(newMode);
    if (newMode === "lap") {
      onLapChange(1);
      const firstLap = validLaps.find(lap => lap.lap_number === 1);
      if (firstLap) {
        onTimeChange(firstLap.date_start);
      }
    } else if (newMode === "final") {
      onLapChange(totalLaps);
      onTimeChange(sessionEndTime);
    } else if (newMode === "chrono") {
      onTimeChange(sessionStartTime);
    }
    setTemporaryDisplayTime(null);
  };

  return (
    <motion.div
      className="bg-[#282a2c] border-none rounded-xl border border-gray-800 hover:border-[#5382ec]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, width: "100%" }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-transparent border-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Sélection GP */}
            <motion.div className="w-full">
              <Select value={selectedMeeting} onValueChange={onMeetingChange}>
                <SelectTrigger 
                  className={`w-full h-12 border-0 transition-all ${
                    selectedMeeting 
                      ? "bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
                      : "bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20"
                  }`}
                >
                  <SelectValue placeholder="Select GP" />
                </SelectTrigger>
                <SelectContent className="bg-[#282a2c] border-0">
                  {meetings.map((m) => (
                    <SelectItem
                      key={m.meeting_key}
                      value={m.meeting_key.toString()}
                      className="text-gray-300 hover:bg-[#5382ec]/20 focus:bg-[#5382ec]/30"
                    >
                      {m.meeting_name} ({m.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Sélection Session */}
            {selectedMeeting && (
              <motion.div className="w-full">
                <Select value={selectedSession} onValueChange={onSessionChange}>
                  <SelectTrigger 
                    className={`w-full h-12 border-0 transition-all ${
                      selectedSession 
                        ? "bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
                        : "bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20"
                    }`}
                  >
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282a2c] border-0">
                    {sessions.map((s) => (
                      <SelectItem
                        key={s.session_key}
                        value={s.session_key.toString()}
                        className="text-gray-300 hover:bg-[#5382ec]/20 focus:bg-[#5382ec]/30"
                      >
                        {s.session_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Contrôles principaux */}
            <div className="bg-[#1d1f20] rounded-lg p-4">
              <div className="flex flex-col">
                {/* Mode de vue */}
                <div className="grid grid-cols-3 gap-2">
                  {["chrono", "lap", "final"].map((mode) => (
                    <motion.button
                      key={mode}
                      onClick={() => handleViewModeChange(mode as any)}
                      className={`p-2 text-sm rounded-md ${
                        viewMode === mode
                          ? "bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
                          : "bg-[#282a2c] text-gray-300"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {mode.toUpperCase()}
                    </motion.button>
                  ))}
                </div>

                {/* Contrôles temporels */}
                <motion.div 
                  className="flex flex-col gap-2"
                  initial={{ height: viewMode === "final" ? 0 : "auto", opacity: viewMode === "final" ? 0 : 1 }}
                  animate={{ 
                    height: viewMode === "final" ? 0 : "auto",
                    opacity: viewMode === "final" ? 0 : 1,
                    marginTop: viewMode === "final" ? 0 : 16
                  }}
                  transition={{
                    height: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 },
                    marginTop: { duration: 0.3 }
                  }}
                >
                  {viewMode !== "final" && (
                    <>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-lg text-gray-400">
                          {viewMode === "chrono" ? "CURRENT TIME" : "CURRENT LAP"}
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                          {viewMode === "chrono"
                            ? formatTime(temporaryDisplayTime || currentTime).split(":").slice(0, 2).join(":")
                            : (temporaryLap !== null ? temporaryLap : currentLap)}
                        </div>
                      </div>

                      <motion.div
                        className="relative w-full py-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Slider.Root
                          className="relative flex items-center select-none touch-none h-8 cursor-grab active:cursor-grabbing"
                          value={[getCurrentValue()]}
                          max={100}
                          step={0.1}
                          onValueChange={([v]) => handleSliderChange(v)}
                          onValueCommit={([v]) => handleSliderCommit(v)}
                        >
                          <Slider.Track className="bg-gray-700 relative grow h-2 rounded-full">
                            <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]" />
                          </Slider.Track>

                          <Slider.Thumb asChild>
                            <motion.div
                              className="w-8 h-8 flex items-center justify-center bg-[#1d1f20] border-2 border-[#5382ec] rounded-full shadow-lg"
                              whileTap={{
                                scale: 1.2,
                                boxShadow: "0 4px 8px rgba(83, 130, 236, 0.3)"
                              }}
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <div className="w-2 h-2 bg-[#5382ec] rounded-full" />
                            </motion.div>
                          </Slider.Thumb>
                        </Slider.Root>
                      </motion.div>

                      <div className="flex justify-center items-center gap-4 -mt-4">
                        <motion.button
                          onClick={() => {
                            if (viewMode === "chrono") {
                              const currentMs = new Date(currentTime).getTime();
                              const newTime = new Date(currentMs - 60000);
                              if (newTime >= new Date(sessionStartTime)) {
                                onTimeChange(newTime.toISOString());
                              }
                            } else {
                              if (currentLap > 1) {
                                onLapChange(currentLap - 1);
                                const lapData = validLaps.find(lap => lap.lap_number === currentLap - 1);
                                if (lapData) {
                                  onTimeChange(lapData.date_start);
                                }
                              }
                            }
                          }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <ChevronLeft className="w-7 h-7 text-[#2dd4bf]" />
                        </motion.button>

                        <motion.button
                          onClick={() => setIsRunning(!isRunning)}
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          whileTap={{ scale: 0.9 }}
                        >
                          {isRunning ? (
                            <Pause className="w-7 h-7 text-[#2dd4bf]" />
                          ) : (
                            <Play className="w-7 h-7 text-[#2dd4bf]" />
                          )}
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            if (viewMode === "chrono") {
                              const currentMs = new Date(currentTime).getTime();
                              const newTime = new Date(currentMs + 60000); // +1 minute
                              if (newTime <= new Date(sessionEndTime)) {
                                onTimeChange(newTime.toISOString());
                              }
                            } else {
                              if (currentLap < totalLaps) {
                                onLapChange(currentLap + 1);
                                const lapData = validLaps.find(lap => lap.lap_number === currentLap + 1);
                                if (lapData) {
                                  onTimeChange(lapData.date_start);
                                }
                              }
                            }
                          }}
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <ChevronRight className="w-7 h-7 text-[#2dd4bf]" />
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Mode Expert */}
            {selectedSession && (
              <motion.div
                className={`
                  relative h-12 w-full rounded-lg cursor-pointer overflow-hidden
                  bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]
                  p-0.5
                `}
                onClick={onExpertModeToggle}
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
                      <span className={`text-sm font-medium ${!isExpertMode ? "text-[#5382ec]" : "text-gray-400"}`}>
                        Simple
                      </span>
                    </div>
                    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
                      <span className={`text-sm font-medium ${isExpertMode ? "text-[#2dd4bf]" : "text-gray-400"}`}>
                        Expert
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RaceSelectionMobile;