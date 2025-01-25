import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Flag, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Slider } from "../../../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

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
  viewMode: 'chrono' | 'lap' | 'final';
  onViewModeChange: (mode: 'chrono' | 'lap' | 'final') => void;
  currentLap: number;
  totalLaps: number;
  onLapChange: (lap: number) => void;
  onTotalLapsChange: (total: number) => void;
  isDriverMode?: boolean;
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
  isDriverMode
}: RaceSelectionProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [isLoadingLaps, setIsLoadingLaps] = useState(false);
  const [validLaps, setValidLaps] = useState<Lap[]>([]);

  // Fetch laps data when session changes
  useEffect(() => {
    const fetchLaps = async () => {
      if (!selectedSession) return;

      setIsLoadingLaps(true);
      try {
        // Corrected URL string interpolation
        const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${selectedSession}`);
        if (!response.ok) throw new Error('Failed to fetch laps');

        const data: Lap[] = await response.json();

        // Filter valid laps and sort them
        const filtered = data
          .filter(lap => !lap.is_pit_out_lap && lap.lap_duration > 0)
          .sort((a, b) => {
            // First sort by lap number
            const lapDiff = a.lap_number - b.lap_number;
            if (lapDiff !== 0) return lapDiff;
            // If same lap number, sort by start time
            return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
          });

        setLaps(data);
        setValidLaps(filtered);

        // Set initial lap data when switching to lap mode
        if (viewMode === 'lap' && filtered.length > 0) {
          const maxLap = Math.max(...filtered.map(lap => lap.lap_number));
          onTotalLapsChange(maxLap);
          if (currentLap === 0) {
            onLapChange(1);
            const firstLap = filtered.find(lap => lap.lap_number === 1);
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
    if (isRunning && viewMode === 'chrono') {
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
    if (isRunning && viewMode === 'lap' && !isLoadingLaps && validLaps.length > 0) {
      timer = setInterval(() => {
        if (currentLap < totalLaps) {
          const nextLap = currentLap + 1;
          const lapData = validLaps.find(lap => lap.lap_number === nextLap);
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
    if (viewMode === 'chrono') {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const newTimeMs = startMs + (endMs - startMs) * (value / 100);
      onTimeChange(new Date(newTimeMs).toISOString());
    } else if (viewMode === 'lap' && validLaps.length > 0) {
      const newLap = Math.max(1, Math.round((totalLaps * value) / 100));
      const lapData = validLaps.find(lap => lap.lap_number === newLap);
      if (lapData) {
        onLapChange(newLap);
        onTimeChange(lapData.date_start);
      }
    }
  };

  const getCurrentValue = () => {
    if (viewMode === 'chrono') {
      const startMs = new Date(sessionStartTime).getTime();
      const endMs = new Date(sessionEndTime).getTime();
      const currentMs = new Date(currentTime).getTime();
      return ((currentMs - startMs) / (endMs - startMs)) * 100;
    } else if (viewMode === 'lap' && totalLaps > 0) {
      return (currentLap / totalLaps) * 100;
    }
    return 0;
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const handleViewModeChange = (newMode: 'chrono' | 'lap' | 'final') => {
    onViewModeChange(newMode);
    if (newMode === 'lap' && validLaps.length > 0) {
      const firstLap = validLaps.find(lap => lap.lap_number === 1);
      if (firstLap) {
        onLapChange(1);
        onTimeChange(firstLap.date_start);
      }
    } else if (newMode === 'final') {
      onTimeChange(sessionEndTime);
    } else if (newMode === 'chrono') {
      onTimeChange(sessionStartTime);
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1">
            <Flag className="w-5 h-5" />
          </div>
  
          <div className="col-span-4">
            <Select value={selectedMeeting} onValueChange={onMeetingChange}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select GP" />
              </SelectTrigger>
              <SelectContent>
                {meetings.map((m) => (
                  <SelectItem key={m.meeting_key} value={m.meeting_key.toString()}>
                    {m.meeting_name} ({m.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          <div className="col-span-3">
            {selectedMeeting && (
              <Select value={selectedSession} onValueChange={onSessionChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.session_key} value={s.session_key.toString()}>
                      {s.session_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
  
          <div className="col-span-4 flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'chrono' ? 'secondary' : 'outline'}
              onClick={() => handleViewModeChange('chrono')}
            >
              Chrono
            </Button>
            {!isDriverMode && (
              <>
                <Button
                  size="sm"
                  variant={viewMode === 'lap' ? 'secondary' : 'outline'}
                  onClick={() => handleViewModeChange('lap')}
                >
                  Lap
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'final' ? 'secondary' : 'outline'}
                  onClick={() => handleViewModeChange('final')}
                >
                  Final
                </Button>
              </>
            )}
          </div>
  
          {viewMode !== 'final' && (
            <>
              <div className="col-span-12 flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    if (viewMode === 'chrono') {
                      const newTime = new Date(currentTime);
                      newTime.setSeconds(newTime.getSeconds() - 10);
                      if (newTime >= new Date(sessionStartTime)) {
                        onTimeChange(newTime.toISOString());
                      }
                    } else if (viewMode === 'lap' && currentLap > 1) {
                      const newLap = currentLap - 1;
                      const lapData = validLaps.find(lap => lap.lap_number === newLap);
                      if (lapData) {
                        onLapChange(newLap);
                        onTimeChange(lapData.date_start);
                      }
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Slider
                  className="flex-1"
                  value={[getCurrentValue()]}
                  onValueChange={([v]) => handleSliderChange(v)}
                  min={0}
                  max={100}
                  step={0.1}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (viewMode === 'chrono') {
                      const newTime = new Date(currentTime);
                      newTime.setSeconds(newTime.getSeconds() + 10);
                      if (newTime <= new Date(sessionEndTime)) {
                        onTimeChange(newTime.toISOString());
                      }
                    } else if (viewMode === 'lap' && currentLap < totalLaps) {
                      const newLap = currentLap + 1;
                      const lapData = validLaps.find(lap => lap.lap_number === newLap);
                      if (lapData) {
                        onLapChange(newLap);
                        onTimeChange(lapData.date_start);
                      }
                    }
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
  
              <div className="col-span-12 flex items-center justify-center mt-4">
                <Button
                  onClick={() => setIsRunning((prev) => !prev)}
                  className="flex items-center gap-2"
                  disabled={viewMode !== 'chrono' && viewMode !== 'lap'}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? "Pause" : "Play"}
                </Button>
              </div>
  
              <div className="col-span-12 text-center mt-4">
                {viewMode === 'chrono' ? (
                  <>
                    <p className="text-lg font-bold">
                      Session Time: {formatTime(currentTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Session Start: {formatTime(sessionStartTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Session End: {formatTime(sessionEndTime)}
                    </p>
                  </>
                ) : viewMode === 'lap' ? (
                  <>
                    {isLoadingLaps ? (
                      <p className="text-lg font-bold">Loading laps data...</p>
                    ) : (
                      <>
                        <p className="text-lg font-bold">
                          Lap: {currentLap} / {totalLaps}
                        </p>
                        {validLaps.length > 0 && currentLap > 0 && (
                          <p className="text-sm text-gray-500">
                            Lap Start Time: {formatTime(validLaps.find(l => l.lap_number === currentLap)?.date_start || '')}
                          </p>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceSelection;