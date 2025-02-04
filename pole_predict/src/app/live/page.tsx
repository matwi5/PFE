/* eslint-disable */
"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { PredictionWidget } from './components/PredictionWidget/PredictionWidget';
import { PredictionControls } from './components/PredictionControls';
import { predictionTypes } from './constants';
import { motion } from 'framer-motion';
import VitalStatisticsWidget from '../upcoming-race/components/VitalStatisticsWidget';

interface Session {
  id: string;
  session_key: number;
  session_name: string;
  meeting_key: number;
}

interface Meeting {
  meeting_key: number;
  meeting_name: string;
}

interface Driver {
  driver_number: string;
  full_name: string;
  team_name: string;
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

export default function PredictionDisplayPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [laps, setLaps] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedLap, setSelectedLap] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(3000);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [vitalStats, setVitalStats] = useState<VitalStatistics | null>(null);

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && selectedLap && laps.length > 0) {
      interval = setInterval(() => {
        const currentIndex = laps.indexOf(selectedLap);
        if (currentIndex < laps.length - 1) {
          setSelectedLap(laps[currentIndex + 1]);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, selectedLap, laps, playbackSpeed]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await loadSessions();
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function loadSessions() {
    const versionDocRef = doc(db, "predictions_ia", "version 1");
    const versionDocSnap = await getDoc(versionDocRef);

    if (versionDocSnap.exists()) {
      const sessionKeys = versionDocSnap.data().session_keys;

      const sessionsPromises = sessionKeys.map(async (key: string) => {
        const response = await fetch(`https://api.openf1.org/v1/sessions?session_key=${key}`);
        const data = await response.json();
        if (data && data[0]) {
          return {
            id: key,
            session_key: data[0].session_key,
            session_name: data[0].session_name,
            meeting_key: data[0].meeting_key
          };
        }
        return null;
      });

      const sessionsData = (await Promise.all(sessionsPromises)).filter(Boolean);

      const uniqueMeetingKeys = [...new Set(sessionsData.map(s => s?.meeting_key))];
      const meetingsData = await Promise.all(
        uniqueMeetingKeys.map(async (key) => {
          const response = await fetch(`https://api.openf1.org/v1/meetings?meeting_key=${key}`);
          const data = await response.json();
          return data[0];
        })
      );

      setMeetings(meetingsData);
      setSessions(sessionsData);
    }
  }

  async function loadVitalStatistics(sessionKey: string) {
    try {
      const session = sessions.find(s => s.id === sessionKey);
      if (!session) return;

      const meeting = meetings.find(m => m.meeting_key === session.meeting_key);
      if (!meeting) return;

      const upcomingRaceRef = doc(db, "upcoming_races", meeting.meeting_key.toString());
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
  }

  async function loadDrivers(sessionKey: string) {
    try {
      const session = sessions.find(s => s.id === sessionKey);
      if (!session) return;

      const response = await fetch(`https://api.openf1.org/v1/drivers?session_key=${session.session_key}`);
      const driversData = await response.json();

      const uniqueDrivers = driversData.reduce((acc: Driver[], current: any) => {
        if (!acc.some(d => d.driver_number === current.driver_number)) {
          acc.push({
            driver_number: current.driver_number.toString(),
            full_name: current.full_name,
            team_name: current.team_name
          });
        }
        return acc;
      }, []);

      setDrivers(uniqueDrivers);
    } catch (error) {
      console.error("Erreur chargement pilotes:", error);
    }
  }

  async function loadLaps(sessionKey: string, driverId: string) {
    try {
      const lapsCollectionRef = collection(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers", driverId, "laps");
      const lapsSnapshot = await getDocs(query(lapsCollectionRef));

      const lapKeys = lapsSnapshot.docs
        .filter(doc => doc.id !== "lap_keys")
        .map(doc => doc.id)
        .sort((a, b) => parseInt(a) - parseInt(b));

      setLaps(lapKeys);
      if (lapKeys.length > 0) {
        setSelectedLap(lapKeys[0]);
      }
    } catch (error) {
      console.error("Erreur chargement des tours:", error);
    }
  }

  const getSessionDisplay = (sessionKey: string) => {
    const session = sessions.find(s => s.session_key.toString() === sessionKey);
    if (!session) return sessionKey;

    const meeting = meetings.find(m => m.meeting_key === session.meeting_key);
    if (!meeting) return `${session.session_name}`;

    return `${meeting.meeting_name} - ${session.session_name}`;
  };

  const handleSessionChange = (value: string) => {
    setIsPlaying(false);
    setSelectedSession(value);
    setSelectedDriver("");
    setSelectedLap("");
    setDrivers([]);
    setLaps([]);
    loadDrivers(value);
    loadVitalStatistics(value);
  };

  const handleDriverChange = async (value: string) => {
    setIsPlaying(false);
    setSelectedDriver(value);
    setSelectedLap("");
    await loadLaps(selectedSession, value);
  };

  const handleLapChange = (value: string) => {
    setSelectedLap(value);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleExpertMode = () => {
    setIsExpertMode(!isExpertMode);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-4"
        >
          <div className="relative flex justify-center items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
              Real-time Predictions
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
            Explore AI-powered insights and predictions for Formula 1 races
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <PredictionControls
            sessions={sessions}
            drivers={drivers}
            laps={laps}
            selectedSession={selectedSession}
            selectedDriver={selectedDriver}
            selectedLap={selectedLap}
            isPlaying={isPlaying}
            isExpertMode={isExpertMode}
            onSessionChange={handleSessionChange}
            onDriverChange={handleDriverChange}
            onLapChange={handleLapChange}
            onPlayToggle={togglePlayback}
            onExpertModeToggle={toggleExpertMode}
            getSessionDisplay={getSessionDisplay}
          />
        </motion.div>

        {selectedLap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {vitalStats && (
                <div className="break-inside-avoid">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <VitalStatisticsWidget
                      stats={vitalStats}
                      circuit_layout={vitalStats.circuit_layout || ''}
                      showCircuitLayout={true}
                    />
                  </motion.div>
                </div>
              )}

              {predictionTypes.map((type) => (
                <div key={type} className="break-inside-avoid">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <PredictionWidget
                      type={type}
                      isExpertMode={isExpertMode}
                      sessionId={selectedSession}
                      driverId={selectedDriver}
                      lapNumber={selectedLap}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}           