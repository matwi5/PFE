'use client';

import React, { useState, useEffect, useMemo } from "react";
import RaceSelectionMobile from "../components/raceComponent/RaceSelectionMobile";
import EventDisplay from "../components/raceComponent/EventDisplay";
import DriverStandings from "../components/raceComponent/DriverStanding";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import RaceCarTelemetry from "../components/raceComponent/RaceCarTelemetry";
import SectorAnalysis from "../components/raceComponent/SectorAnalysis";
import DriverProfile from "../components/raceComponent/DriverProfile";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";
import VitalStatisticsWidget from '../upcoming-race/components/VitalStatisticsWidget';
import { PredictionWidget } from '../live/components/PredictionWidget/PredictionWidget';
import { predictionTypes } from '../live/constants';
import WidgetCustomizer, { Widget } from '../components/WidgetCustomizer';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Brain } from 'lucide-react';

import StintVisualizer from "../components/analysisComponent/StintVisualizer";
import SpeedVisualizer from "../components/analysisComponent/SpeedVisualizer";
import F1LapAnalysis from "../components/analysisComponent/F1LapAnalysis";
import F1GapAnalysis from "../components/analysisComponent/F1GapAnalysis";
import ChampionshipWidget_Live from "../components/analysisComponent/ChampionshipWidget_Live";

import { Loader2 } from "lucide-react";
import WeatherMap from "@/app/components/weatherComponent/WeatherMap";

import DriverMap from "../components/raceComponent/DriverMap";

const PredictionAlert = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Alert
        className="bg-[#282a2c] border border-gray-800 max-w-md w-full cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-500/10">
            <Brain className="h-6 w-6 text-[#5382ec]" />
          </div>
        </div>
        <AlertTitle className="text-lg font-semibold text-white text-center">
          AI Predictions Unavailable
        </AlertTitle>
        <AlertDescription className="text-gray-400 mt-2 text-center space-y-2">
          <p>To enable AI predictions, please ensure:</p>
          <ul className="text-sm list-disc list-inside text-left space-y-1">
            <li>A race session is selected (not practice or qualifying)</li>
            <li>A driver is selected from the standings</li>
            <li>You are not in final mode</li>
          </ul>
          <p className="text-sm italic pt-2">
            Switch to chronological mode and select a driver to see AI predictions during the race.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const RaceSelectionDesktop = dynamic(
  () => import('../components/raceComponent/RaceSelectionDesktop'),
  { ssr: false }
);

interface WidgetConfig {
  order: string[];
  visibility: {
    [key: string]: boolean;
  };
}

interface VitalStatistics {
  first_grand_prix: string;
  track_length: string;
  lap_record: {
    time: string;
    driver: string;
    team: string;
    year: string;
  };
  most_pole_positions: {
    driver: string;
    poles: number;
  };
  most_wins: {
    drivers: string[];
    wins: number;
  };
  trivia: string;
  pole_run_to_turn1_braking_point: number;
  overtakes_2023: number;
  safety_car_probability: number;
  virtual_safety_car_probability: number;
  pit_stop_time_loss: number;
  notes: string;
  circuit_layout: string;
}

export interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_colour?: string;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  session_key?: number;
  meeting_key?: number;
}

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  year: number;
  date_start: string;
}

interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_short_name: string;
  country_name: string;
  total_laps?: number;
}

interface RaceControlEvent {
  category: string;
  date: string;
  driver_number?: number;
  flag?: string;
  message: string;
  scope: string;
  meeting_key: number;
  session_key: number;
  lap_number?: number;
}

interface LapData {
  date_start: string;
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  session_key: number;
}

interface CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Return false during SSR, actual value after mount
  return hasMounted ? isMobile : false;
};

const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt === maxRetries) throw error;
      console.log(`Retrying fetch attempt ${attempt} of ${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
};

// État global pour la gestion des erreurs et du chargement
interface GlobalLoadingState {
  meetings: boolean;
  sessions: boolean;
  events: boolean;
  lapsData: boolean;
  carData: boolean;
  vitalStats: boolean;
}

interface GlobalErrorState {
  meetings: string | null;
  sessions: string | null;
  events: string | null;
  lapsData: string | null;
  carData: string | null;
  vitalStats: string | null;
}


const MobileView = ({
  meetings,
  sessions,
  selectedMeeting,
  selectedSession,
  setSelectedMeeting,
  setSelectedSession,
  currentTime,
  sessionStartTime,
  sessionEndTime,
  setCurrentTime,
  viewMode,
  setViewMode,
  currentLap,
  totalLaps,
  setCurrentLap,
  setTotalLaps,
  selectedDriver,
  isExpertMode,
  setIsExpertMode,
  widgetConfig,
  widgetComponents
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showPredictionAlert, setShowPredictionAlert] = useState(false);

  // Get current session details
  const currentSession = sessions.find(s => s.session_key.toString() === selectedSession);
  const isRaceSession = currentSession?.session_type === "Race";
  const isFinal = viewMode === "final";

  // Check if predictions can be enabled
  const canEnablePrediction = selectedSession && selectedDriver && isRaceSession && !isFinal;

  const handleTabChange = (tabName) => {
    if (tabName === 'predictions') {
      if (!canEnablePrediction) {
        setShowPredictionAlert(true);
        return;
      }

      // Check if any prediction widgets are visible
      const hasPredictions = Object.entries(widgetComponents)
        .filter(([key]) => key.startsWith('prediction-'))
        .some(([key]) => widgetConfig.visibility[key]);

      if (!hasPredictions) {
        setShowPredictionAlert(true);
        return;
      }
    }
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <div className="container mx-auto px-4 py-16">
        {/* Header section - simplified for mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-4"
        >
          <div className="relative flex justify-center items-center gap-4">
            <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
              Live
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
            Live race monitoring with real-time telemetry and AI-powered predictions
          </p>
        </motion.div>

        {/* Race Selection - Full width on mobile */}
        <div className="mb-8">
          <RaceSelectionMobile
            meetings={meetings}
            sessions={sessions}
            selectedMeeting={selectedMeeting}
            selectedSession={selectedSession}
            onMeetingChange={setSelectedMeeting}
            onSessionChange={setSelectedSession}
            currentTime={currentTime}
            sessionStartTime={sessionStartTime}
            sessionEndTime={sessionEndTime}
            onTimeChange={setCurrentTime}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentLap={currentLap}
            totalLaps={totalLaps}
            onLapChange={setCurrentLap}
            onTotalLapsChange={setTotalLaps}
            isDriverMode={!!selectedDriver}
            isExpertMode={isExpertMode}
            onExpertModeToggle={() => setIsExpertMode(!isExpertMode)}
          />
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex mb-4 border-b border-gray-800">
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'info'
              ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
              : 'text-gray-400'
              }`}
            onClick={() => handleTabChange('info')}
          >
            Race Info
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'telemetry'
              ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
              : 'text-gray-400'
              }`}
            onClick={() => handleTabChange('telemetry')}
          >
            Telemetry
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${activeTab === 'predictions'
              ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
              : 'text-gray-400'
              }`}
            onClick={() => handleTabChange('predictions')}
          >
            AI Predictions
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-4">
          {activeTab === 'info' && (
            <>
              {widgetConfig.visibility['driver-profile'] && widgetComponents['driver-profile']}
              {widgetConfig.visibility['driver-standings'] && widgetComponents['driver-standings']}
              {widgetConfig.visibility['vital-statistics'] && widgetComponents['vital-statistics']}
              {widgetConfig.visibility['event-display'] && widgetComponents['event-display']}
              {widgetConfig.visibility['championship'] && widgetComponents['championship']}
              {widgetConfig.visibility['weather-map'] && widgetComponents['weather-map']}
            </>
          )}

          {activeTab === 'telemetry' && (
            <>
              {widgetConfig.visibility['telemetry'] && widgetComponents['telemetry']}
              {widgetConfig.visibility['driver-map'] && widgetComponents['driver-map']}
              {widgetConfig.visibility['sector-analysis'] && widgetComponents['sector-analysis']}
              {widgetConfig.visibility['stint-visualizer'] && widgetComponents['stint-visualizer']}
              {widgetConfig.visibility['speed-visualizer'] && widgetComponents['speed-visualizer']}
              {widgetConfig.visibility['lap-analysis'] && widgetComponents['lap-analysis']}
              {widgetConfig.visibility['gap-analysis'] && widgetComponents['gap-analysis']}
            </>
          )}

          {activeTab === 'predictions' && canEnablePrediction && (
            <>
              {Object.entries(widgetComponents)
                .filter(([key]) => key.startsWith('prediction-'))
                .map(([key, component]) =>
                  widgetConfig.visibility[key] && <div key={key}>{component}</div>
                )}
            </>
          )}
        </div>

        <PredictionAlert
          open={showPredictionAlert}
          onClose={() => setShowPredictionAlert(false)}
        />
      </div>
    </div>
  );
};

const RaceControlEvents = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<RaceControlEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [sessionStartTime, setSessionStartTime] = useState<string>("");
  const [sessionEndTime, setSessionEndTime] = useState<string>("");
  const [currentLap, setCurrentLap] = useState<number>(0);
  const [totalLaps, setTotalLaps] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"chrono" | "lap" | "final">("final");
  const [lapsData, setLapsData] = useState<LapData[]>([]);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [carData, setCarData] = useState<CarData[]>([]);
  const [carDataLoading, setCarDataLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [vitalStats, setVitalStats] = useState<VitalStatistics | null>(null);
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);
  const [currentStandings, setCurrentStandings] = useState<{ position: number, acronym: string }[]>([]);

  const [globalLoading, setGlobalLoading] = useState<GlobalLoadingState>({
    meetings: false,
    sessions: false,
    events: false,
    lapsData: false,
    carData: false,
    vitalStats: false
  });

  const [globalError, setGlobalError] = useState<GlobalErrorState>({
    meetings: null,
    sessions: null,
    events: null,
    lapsData: null,
    carData: null,
    vitalStats: null
  });

  const setLoadingState = (key: keyof GlobalLoadingState, value: boolean) => {
    setGlobalLoading(prev => ({ ...prev, [key]: value }));
  };

  // Helper pour mettre à jour l'état d'erreur
  const setErrorState = (key: keyof GlobalErrorState, value: string | null) => {
    setGlobalError(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const currentSession = sessions.find(s => s.session_key.toString() === selectedSession);
  const isRaceSession = currentSession?.session_type === "Race";

  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    order: [
      'driver-profile',
      'driver-standings',
      'telemetry',
      'driver-map',
      'sector-analysis',
      'event-display',
      'stint-visualizer',
      'speed-visualizer',
      'lap-analysis',
      'gap-analysis',
      'championship',
      'weather-map',
      'vital-statistics',
      ...predictionTypes.map(type => `prediction-${type}`)
    ],
    visibility: {
      'driver-profile': true,
      'driver-standings': true,
      'vital-statistics': true,
      'telemetry': true,
      'driver-map': true,
      'sector-analysis': true,
      'stint-visualizer': true,
      'speed-visualizer': true,
      'lap-analysis': true,
      'gap-analysis': true,
      'championship': true,
      'weather-map': true,
      'event-display': true,
      ...Object.fromEntries(predictionTypes.map(type => [`prediction-${type}`, true]))
    }
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoadingState('meetings', true);
      try {
        const data = await fetchWithRetry("https://api.openf1.org/v1/meetings");

        const monzaDate = new Date("2024-08-30T11:30:00+00:00");
        const filteredMeetings = data.filter((meeting: Meeting) => {
          const meetingDate = new Date(meeting.date_start);
          return meeting.year === 2024 && meetingDate >= monzaDate;
        });

        const sortedMeetings = filteredMeetings.sort((a: Meeting, b: Meeting) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

        setMeetings(sortedMeetings);
        setErrorState('meetings', null);

        if (sortedMeetings.length > 0) {
          const latestMeeting = sortedMeetings[0];
          setSelectedMeeting(latestMeeting.meeting_key.toString());

          // Fetch initial sessions
          const sessionsData = await fetchWithRetry(
            `https://api.openf1.org/v1/sessions?meeting_key=${latestMeeting.meeting_key}`
          );

          setSessions(sessionsData);

          if (sessionsData.length > 0) {
            const latestSession = sessionsData[sessionsData.length - 1];
            setSelectedSession(latestSession.session_key.toString());
            setSessionStartTime(latestSession.date_start);
            setSessionEndTime(latestSession.date_end);
            setCurrentTime(latestSession.date_end);
            setTotalLaps(latestSession.total_laps || 0);
            setCurrentLap(latestSession.total_laps || 0);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch meetings';
        setErrorState('meetings', errorMessage);
        console.error('Error fetching meetings:', err);
      } finally {
        setLoadingState('meetings', false);
      }
    };
    fetchMeetings();
  }, []);


  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedMeeting) return;

      setLoadingState('sessions', true);
      try {
        const data = await fetchWithRetry(
          `https://api.openf1.org/v1/sessions?meeting_key=${selectedMeeting}`
        );
        setSessions(data);
        setErrorState('sessions', null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
        setErrorState('sessions', errorMessage);
        console.error('Error fetching sessions:', err);
      } finally {
        setLoadingState('sessions', false);
      }
    };

    fetchSessions();
    setSelectedDriverNumber(null);
    setSelectedDriver(null);
  }, [selectedMeeting]);

  useEffect(() => {
    if (!selectedMeeting) return;
    loadVitalStatistics(selectedMeeting);
  }, [selectedMeeting]);

  // Dans le useEffect qui gère selectedSession
  useEffect(() => {
    const fetchEventsAndLaps = async () => {
      if (!selectedSession) return;

      setLoadingState('events', true);
      setLoadingState('lapsData', true);
      try {
        // Fetch des événements et des tours en parallèle
        const [eventsData, lapsData] = await Promise.all([
          fetchWithRetry(`/api/race-selection?session_key=${selectedSession}`),
          fetchWithRetry(`https://api.openf1.org/v1/laps?session_key=${selectedSession}`)
        ]);

        // Traitement des événements
        setEvents(
          eventsData.sort(
            (a: RaceControlEvent, b: RaceControlEvent) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );

        // Traitement des tours
        setLapsData(lapsData);

        const sessionDetails = sessions.find(
          (s) => s.session_key.toString() === selectedSession
        );

        // Calculer le nombre total de tours en prenant le maximum entre
        // les tours de la session et les tours dans lapsData
        let maxLapsFromData = 0;
        if (lapsData && Array.isArray(lapsData) && lapsData.length > 0) {
          maxLapsFromData = Math.max(...lapsData.map((lap: LapData) => lap?.lap_number || 0));
        }

        const sessionTotalLaps = sessionDetails?.total_laps || 0;
        const finalTotalLaps = Math.max(maxLapsFromData, sessionTotalLaps);

        if (sessionDetails) {
          setSessionStartTime(sessionDetails.date_start);
          setSessionEndTime(sessionDetails.date_end);
          setCurrentTime(sessionDetails.date_end);
          setTotalLaps(finalTotalLaps);
          setCurrentLap(finalTotalLaps);
        }

        setErrorState('events', null);
        setErrorState('lapsData', null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setErrorState('events', errorMessage);
        setErrorState('lapsData', errorMessage);
        console.error('Error fetching events and laps:', err);
      } finally {
        setLoadingState('events', false);
        setLoadingState('lapsData', false);
      }
    };

    fetchEventsAndLaps();
    setSelectedDriverNumber(null);
    setSelectedDriver(null);
  }, [selectedSession, sessions]);

  useEffect(() => {
    const fetchCarData = async () => {
      if (selectedDriverNumber && selectedSession && currentTime) {
        try {
          setCarDataLoading(true);
          const response = await fetch(
            `https://api.openf1.org/v1/car_data?` +
            `driver_number=${selectedDriverNumber}&` +
            `session_key=${selectedSession}&` +
            `date<=${currentTime}`
          );
          const data = await response.json();
          setCarData(
            data.filter(
              (d: CarData) =>
                d.brake !== null && d.throttle !== null && d.rpm !== null
            )
          );
        } catch (error) {
          console.error("Error fetching car data:", error);
        } finally {
          setCarDataLoading(false);
        }
      }
    };
    fetchCarData();
  }, [selectedDriverNumber, selectedSession, currentTime]);

  useEffect(() => {
    const fetchDriver = async () => {
      if (selectedDriverNumber) {
        try {
          const response = await fetch(
            `https://api.openf1.org/v1/drivers?driver_number=${selectedDriverNumber}`
          );
          const data = await response.json();
          setSelectedDriver(data[0] || null);
        } catch (error) {
          console.error("Error fetching driver:", error);
        }
      } else {
        setSelectedDriver(null);
      }
    };
    fetchDriver();
  }, [selectedDriverNumber]);

  useEffect(() => {
    if (viewMode === 'chrono' && lapsData.length > 0 && currentTime) {
      const sortedLaps = [...lapsData].sort((a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      );

      const currentLapEntry = sortedLaps
        .filter(lap => lap.date_start && new Date(lap.date_start) <= new Date(currentTime))
        .pop();

      if (currentLapEntry) {
        setCurrentLap(currentLapEntry.lap_number);
      }
    }
  }, [currentTime, lapsData, viewMode]);

  const { throttle, rpm, speed, gear, drsStatus, brake } = useMemo(() => {
    const latest = carData[carData.length - 1] || {};
    return {
      throttle: latest?.throttle || 0,
      rpm: latest?.rpm || 0,
      speed: latest?.speed || 0,
      gear: latest?.n_gear?.toString() || "B",
      drsStatus: latest?.drs ? "ACTIF" : "INACTIF",
      brake: latest?.brake || 0,
    };
  }, [carData]);

  const loadVitalStatistics = async (meetingKey: string) => {
    try {
      const meeting = meetings.find(m => m.meeting_key.toString() === meetingKey);
      if (!meeting) return;

      const upcomingRaceRef = doc(db, "upcoming_races", meetingKey);
      const upcomingRaceSnap = await getDoc(upcomingRaceRef);

      if (upcomingRaceSnap.exists()) {
        const raceData = upcomingRaceSnap.data();
        setVitalStats({
          ...raceData.vital_statistics,
          circuit_layout: raceData.circuit_layout
        });
      }
    } catch (error) {
      console.error("Erreur chargement statistiques vitales:", error);
    }
  };

  const GlobalLoadingOverlay = () => {
    const isLoading = Object.values(globalLoading).some(Boolean);

    if (!isLoading) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#282a2c] p-6 rounded-lg shadow-xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
            <p className="text-white">Loading race data...</p>
          </div>
        </div>
      </div>
    );
  };

  // Composant d'affichage des erreurs
  const GlobalErrorDisplay = () => {
    const errors = Object.entries(globalError)
      .filter(([, error]) => error !== null)
      .map(([key, error]) => ({ key, error }));

    if (errors.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50">
        {errors.map(({ key, error }) => (
          <Alert key={key} className="mb-2 bg-red-900/90 text-white border-red-700">
            <AlertTitle className="text-white">Error in {key}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };


  const realTimeDataContent = selectedDriver && viewMode === "chrono" ? (
    <RaceCarTelemetry
      throttle={throttle}
      rpm={rpm}
      speed={speed}
      gear={gear}
      drsStatus={drsStatus}
      brake={brake}
    />
  ) : (
    <Card className="bg-[#282a2c] border border-gray-800 h-[20vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Live Telemetry
          </CardTitle>
          <Gauge className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
        <span className="text-gray-400">
          {viewMode !== "chrono"
            ? "Telemetry only available in chrono mode"
            : "Select a pilot to see telemetry data"}
        </span>
      </CardContent>
    </Card>
  );

  const handleDriverSelection = (driverNumber: string | null) => {
    setSelectedDriverNumber(driverNumber);
    if (!driverNumber) {
      setCarData([]);
      setSelectedDriver(null);
    }
  };

  const handleWidgetOrderChange = (newWidgets: Widget[]) => {
    setWidgetConfig(prev => ({
      ...prev,
      order: newWidgets.map(w => w.id),
      visibility: Object.fromEntries(newWidgets.map(w => [w.id, w.enabled]))
    }));
  };

  const handleWidgetVisibilityChange = (newWidgets: Widget[]) => {
    setWidgetConfig(prev => ({
      ...prev,
      visibility: Object.fromEntries(newWidgets.map(w => [w.id, w.enabled]))
    }));
  };

  const widgetComponents: { [key: string]: JSX.Element } = {
    'driver-profile': (
      <DriverProfile
        selectedDriver={selectedDriver}
        selectedMeeting={selectedMeeting}
        selectedSession={selectedSession}
        viewMode={viewMode}
        currentLap={currentLap}
        totalLaps={totalLaps}
        currentTime={currentTime}
        meetings={meetings}
        sessions={sessions}
        onDriverDeselect={() => handleDriverSelection(null)}
      />
    ),
    'driver-standings': (
      <DriverStandings
        sessionKey={selectedSession}
        meetingKey={selectedMeeting}
        currentTime={currentTime}
        viewMode={viewMode}
        currentLap={currentLap}
        onDriverSelect={handleDriverSelection}
        selectedDriverNumber={selectedDriverNumber}
        onStandingsUpdate={setCurrentStandings}
      />
    ),

    'vital-statistics': vitalStats && (
      <VitalStatisticsWidget
        stats={vitalStats}
        circuit_layout={vitalStats.circuit_layout || ''}
        showCircuitLayout={false}
      />
    ),
    'telemetry': realTimeDataContent,
    'sector-analysis': selectedDriver && (
      <SectorAnalysis
        driverNumber={Number(selectedDriverNumber)}
        sessionKey={selectedSession}
        currentTime={currentTime}
        currentLap={currentLap}
        viewMode={viewMode}
      />
    ),
    'event-display': (
      <EventDisplay
        events={events}
        sessionName={sessions.find(
          (s) => s.session_key.toString() === selectedSession
        )?.session_name}
        loading={loading}
        viewMode={viewMode}
        currentLap={currentLap}
        currentTime={currentTime}
      />
    ),
    'driver-map': (
      <DriverMap
        sessionKey={selectedSession}
        meetingKey={selectedMeeting}
        currentTime={currentTime}
        viewMode={viewMode}
      />
    ),
    'stint-visualizer': (
      <StintVisualizer
        sessionKey={parseInt(selectedSession)}
        lap={viewMode === "final" || currentLap === totalLaps ? null : currentLap}
      />
    ),
    'speed-visualizer': (
      <SpeedVisualizer
        sessionKey={parseInt(selectedSession)}
        lap={viewMode === "final" || currentLap === totalLaps ? null : currentLap}
      />
    ),
    'lap-analysis': (
      <F1LapAnalysis
        sessionKey={parseInt(selectedSession)}
        lap={viewMode === "final" || currentLap === totalLaps ? null : currentLap}
      />
    ),
    'gap-analysis': (
      <F1GapAnalysis
        sessionKey={parseInt(selectedSession)}
        lap={viewMode === "final" || currentLap === totalLaps ? null : currentLap}
      />
    ),
    'championship': (
      <ChampionshipWidget_Live
        meeting_key={selectedMeeting}
        currentStandings={currentStandings}
      />
    ),
    'weather-map': (
      <WeatherMap
        meeting_name={selectedMeeting}
        date={currentTime}
      />
    ),
    ...Object.fromEntries(predictionTypes.map(type => [
      `prediction-${type}`,
      selectedSession && selectedDriver && isRaceSession && (
        <PredictionWidget
          key={`prediction-${type}-${currentTime}-${currentLap}`}
          type={type}
          isExpertMode={isExpertMode}
          sessionId={selectedSession}
          driverId={selectedDriverNumber}
          lapNumber={currentLap.toString()}
          viewMode={viewMode}
        />
      )
    ]))
  };

  if (!hasMounted) {
    return null;
  }

  if (isMobile) {
    return (
      <MobileView
        meetings={meetings}
        sessions={sessions}
        selectedMeeting={selectedMeeting}
        selectedSession={selectedSession}
        setSelectedMeeting={setSelectedMeeting}
        setSelectedSession={setSelectedSession}
        currentTime={currentTime}
        sessionStartTime={sessionStartTime}
        sessionEndTime={sessionEndTime}
        setCurrentTime={setCurrentTime}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentLap={currentLap}
        totalLaps={totalLaps}
        setCurrentLap={setCurrentLap}
        setTotalLaps={setTotalLaps}
        selectedDriver={selectedDriver}
        isExpertMode={isExpertMode}
        setIsExpertMode={setIsExpertMode}
        widgetConfig={widgetConfig}
        widgetComponents={widgetComponents}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <GlobalLoadingOverlay />
      <GlobalErrorDisplay />
      <div className="container mx-auto px-4 py-16">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-4"
        >
          <div className="relative flex justify-center items-center gap-4">
            <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
              Live
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
            Live race monitoring with real-time telemetry and AI-powered predictions
          </p>
        </motion.div>

        {/* Section de sélection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 flex justify-center w-full"
        >
          <RaceSelectionDesktop
            meetings={meetings}
            sessions={sessions}
            selectedMeeting={selectedMeeting}
            selectedSession={selectedSession}
            onMeetingChange={setSelectedMeeting}
            onSessionChange={setSelectedSession}
            currentTime={currentTime}
            sessionStartTime={sessionStartTime}
            sessionEndTime={sessionEndTime}
            onTimeChange={setCurrentTime}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentLap={currentLap}
            totalLaps={totalLaps}
            onLapChange={setCurrentLap}
            onTotalLapsChange={setTotalLaps}
            isDriverMode={!!selectedDriver}
            isExpertMode={isExpertMode}
            onExpertModeToggle={() => setIsExpertMode(!isExpertMode)}
          />
        </motion.div>

        {/* Widget Customizer */}
        <WidgetCustomizer
          onOrderChange={handleWidgetOrderChange}
          onVisibilityChange={handleWidgetVisibilityChange}
          selectedSession={selectedSession}
          selectedDriver={selectedDriver}
          isRaceSession={isRaceSession}
          isFinal={viewMode === "final"}
        />

        {/* Widgets Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {widgetConfig.order.map((widgetId, index) =>
              widgetConfig.visibility[widgetId] && widgetComponents[widgetId] && (
                <motion.div
                  key={widgetId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid"
                >
                  {/* Rendu conditionnel pour chaque type de widget */}
                  {widgetId === 'driver-profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {widgetComponents['driver-profile']}
                    </motion.div>
                  )}

                  {widgetId === 'driver-standings' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {widgetComponents['driver-standings']}
                    </motion.div>
                  )}

                  {widgetId === 'vital-statistics' && vitalStats && (
                    <div className="break-inside-avoid">
                      {widgetComponents['vital-statistics']}
                    </div>
                  )}

                  {widgetId === 'telemetry' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {widgetComponents['telemetry']}
                    </motion.div>
                  )}

                  {widgetId === 'driver-map' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['driver-map']}
                    </motion.div>
                  )}

                  {widgetId === 'sector-analysis' && selectedDriver && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {widgetComponents['sector-analysis']}
                    </motion.div>
                  )}

                  {widgetId === 'event-display' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {widgetComponents['event-display']}
                    </motion.div>
                  )}

                  {widgetId === 'stint-visualizer' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['stint-visualizer']}
                    </motion.div>
                  )}

                  {widgetId === 'speed-visualizer' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['speed-visualizer']}
                    </motion.div>
                  )}

                  {widgetId === 'lap-analysis' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['lap-analysis']}
                    </motion.div>
                  )}

                  {widgetId === 'gap-analysis' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['gap-analysis']}
                    </motion.div>
                  )}

                  {widgetId === 'championship' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['championship']}
                    </motion.div>
                  )}

                  {widgetId === 'weather-map' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {widgetComponents['weather-map']}
                    </motion.div>
                  )}

                  {/* Gestion des widgets de prédiction */}
                  {widgetId.startsWith('prediction-') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="break-inside-avoid"
                    >
                      {selectedSession && selectedDriver && isRaceSession && (
                        <PredictionWidget
                          key={`${widgetId}-${viewMode === 'chrono' ? currentLap : currentTime}-${currentLap}`}
                          type={widgetId.replace('prediction-', '')}
                          isExpertMode={isExpertMode}
                          sessionId={selectedSession}
                          driverId={selectedDriverNumber}
                          lapNumber={currentLap.toString()}
                          viewMode={viewMode}
                        />
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RaceControlEvents;