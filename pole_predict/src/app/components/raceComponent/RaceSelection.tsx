import React, { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

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

interface RaceSelectionProps {
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
  isExpertMode: boolean; // Ajout pour le mode expert
  onExpertModeToggle: () => void; // Ajout pour le toggle du mode expert
}

const RaceSelection = ({
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
}: RaceSelectionProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isLoadingLaps, setIsLoadingLaps] = useState(false);
  const [validLaps, setValidLaps] = useState<Lap[]>([]);
  const [temporaryValue, setTemporaryValue] = useState<number>(0);
  const [temporaryDisplayTime, setTemporaryDisplayTime] = useState<string | null>(null);

  // Set default session to "Race" when meeting changes
  useEffect(() => {
    if (selectedMeeting) {
      const raceSession = sessions.find((s) => s.session_name === "Race");
      if (raceSession) {
        onSessionChange(raceSession.session_key.toString());
      } else {
        onSessionChange(""); // Reset session if "Race" is not found
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
        // Corrected URL string interpolation
        const response = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${selectedSession}`
        );
        if (!response.ok) throw new Error("Failed to fetch laps");

        const data: Lap[] = await response.json();

        // Filter valid laps and sort them
        const filtered = data
          .filter((lap) => !lap.is_pit_out_lap && lap.lap_duration > 0)
          .sort((a, b) => {
            // First sort by lap number
            const lapDiff = a.lap_number - b.lap_number;
            if (lapDiff !== 0) return lapDiff;
            // If same lap number, sort by start time
            return (
              new Date(a.date_start).getTime() -
              new Date(b.date_start).getTime()
            );
          });

        setLaps(data);
        setValidLaps(filtered);

        // Set initial lap data when switching to lap mode
        // Dans le useEffect qui fetch les laps de RaceSelection
        if (viewMode === "lap" && filtered.length > 0) {
          const maxLap = Math.max(...filtered.map((lap) => lap.lap_number));
          onTotalLapsChange(maxLap);
          if (currentLap === 0) {
            onLapChange(1);
            // Prendre le premier tour le plus tôt
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
      }, 2000);
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
      onLapChange(newLap);
    }
  };

  const handleSliderCommit = (value: number) => {
    if (viewMode === "chrono") {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const newTimeMs = startMs + (endMs - startMs) * (value / 100);
      onTimeChange(new Date(newTimeMs).toISOString());
      setTemporaryDisplayTime(null);
    }
  };

  const getCurrentValue = () => {
    if (viewMode === "chrono") {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const currentMs = new Date(temporaryDisplayTime || currentTime).getTime();
      return ((currentMs - startMs) / (endMs - startMs)) * 100;
    } else if (viewMode === "lap" && totalLaps > 0) {
      return (currentLap / totalLaps) * 100;
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
      animate={{
        opacity: 1,
        y: 0,
        width: viewMode === "final" ? "1000px" : "100%"
      }}
      transition={{
        duration: 0.3,
        width: { type: "spring", stiffness: 100, damping: 20 }
      }}
    >
      <Card className="bg-transparent border-none">
        <CardContent className="p-6">
          <div className="relative h-16 flex items-center">
            <div className="absolute inset-0 rounded-lg p-0.5">
              <div className="flex items-center h-full px-6 gap-6">
                {/* Sélection GP */}
                <motion.div className="w-64" layout>
                  <Select value={selectedMeeting} onValueChange={onMeetingChange}>
                    <SelectTrigger
                      className={`h-10 border-0 transition-all ${selectedMeeting
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
                  <motion.div className="w-56" layout>
                    <Select value={selectedSession} onValueChange={onSessionChange}>
                      <SelectTrigger
                        className={`h-10 border-0 transition-all ${selectedSession
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

                <motion.div className="w-auto" layout>
                  <div className="bg-[#1d1f20] rounded-[6px] p-2">
                    <div className="flex items-center gap-4">
                      {/* Mode de vue */}
                      <motion.div className="flex gap-2" layout>
                        {["chrono", "lap", "final"].map((mode) => (
                          <motion.button
                            key={mode}
                            onClick={() => handleViewModeChange(mode as any)}
                            className={`
                              px-4 py-2 rounded-md text-sm font-medium transition-colors
                              ${viewMode === mode
                                ? "bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
                                : "bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20"
                              }
                            `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </motion.button>
                        ))}
                      </motion.div>

                      {/* Container pour les éléments à masquer en mode final */}
                      <motion.div
                        className="flex items-center gap-4"
                        layout
                        initial={{ x: viewMode === "final" ? -20 : 0, opacity: viewMode === "final" ? 0 : 1 }}
                        animate={{
                          x: viewMode === "final" ? -100 : 0,
                          opacity: viewMode === "final" ? 0 : 1,
                          width: viewMode === "final" ? 0 : "auto",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 30,
                          opacity: { duration: 0.3 },
                          x: { duration: 0.3 },
                          width: { duration: 0.3 }
                        }}
                      >
                        {(
                          <>
                            <motion.button
                              onClick={() => setIsRunning(!isRunning)}
                              className={`
                              w-10 h-10 rounded-lg flex items-center justify-center
                              ${isRunning ? "text-[#2dd4bf]" : "text-[#2dd4bf]"}
                              hover:bg-white/5 transition-colors
                            `}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              animate={{
                                opacity: viewMode === "final" ? 0 : 1,
                                scale: viewMode === "final" ? 0.8 : 1
                              }}
                              transition={{
                                duration: 0.3,
                                ease: "easeInOut"
                              }}
                            >
                              {isRunning ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </motion.button>

                            <motion.div className="w-16" layout>
                              <div className="text-sm text-gray-400">
                                {viewMode === "chrono" ? "TIME" : "LAP"}
                              </div>
                              <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                                {viewMode === "chrono"
                                  ? formatTime(temporaryDisplayTime || currentTime).split(":").slice(0, 2).join(":")
                                  : currentLap}
                              </div>
                            </motion.div>

                            <motion.div className="w-64" layout>
                              <Slider.Root
                                className="relative flex items-center select-none touch-none h-5 cursor-pointer"
                                value={[getCurrentValue()]}
                                max={100}
                                step={0.1}
                                onValueChange={([v]) => handleSliderChange(v)}
                                onValueCommit={([v]) => handleSliderCommit(v)}
                              >
                                <Slider.Track className="bg-gray-700 relative grow h-[3px] rounded-full">
                                  <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]" />
                                </Slider.Track>
                                <Slider.Thumb className="block w-5 h-5 bg-[#1d1f20] border-2 border-[#5382ec] rounded-full focus:outline-none transition-transform hover:scale-110" />
                              </Slider.Root>
                            </motion.div>

                            <motion.div className="w-16 text-right" layout>
                              <div className="text-sm text-gray-400">MAX</div>
                              <div className="text-xl font-bold text-gray-500">
                                {viewMode === "chrono"
                                  ? formatTime(sessionEndTime).split(":").slice(0, 2).join(":")
                                  : totalLaps}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Switch Mode Simple/Expert */}
                {selectedSession && (
                  <motion.div
                    className={`
                      relative h-12 w-32 rounded-lg cursor-pointer overflow-hidden
                      bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]
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
                          <span
                            className={`text-sm font-medium transition-colors ${!isExpertMode ? "text-[#5382ec]" : "text-gray-400"
                              }`}
                          >
                            Simple
                          </span>
                        </div>
                        <div className="w-full h-full flex items-center justify-center flex-shrink-0">
                          <span
                            className={`text-sm font-medium transition-colors ${isExpertMode ? "text-[#2dd4bf]" : "text-gray-400"
                              }`}
                          >
                            Expert
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RaceSelection;