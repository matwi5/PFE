"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LapSlider } from './components/LapSlider';
import { PredictionWidget } from './components/PredictionWidget/PredictionWidget';
import { PredictionCache } from './types';
import { predictionTypes, LAPTIME_CONFIG } from './constants';
import { cleanLaptimeData, predictFutureLaptimes } from './utils/laptimePredictions';
import { motion } from 'framer-motion';
import VitalStatisticsWidget from '../upcoming/components/VitalStatisticsWidget';
import { Button } from '../../components/ui/button';

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
  const [predictionsCache, setPredictionsCache] = useState<PredictionCache>({});
  const [loading, setLoading] = useState(true);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(1000);
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

  async function loadLapsAndPredictions(sessionKey: string, driverId: string) {
    setIsLoadingPredictions(true);
    try {
      const lapsCollectionRef = collection(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers", driverId, "laps");
      const lapsSnapshot = await getDocs(query(lapsCollectionRef));
  
      const lapKeys = lapsSnapshot.docs
        .filter(doc => doc.id !== "lap_keys")
        .map(doc => doc.id)
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      setLaps(lapKeys);
  
      if (lapKeys.length > 0) {
        const allPredictions: PredictionCache = {};
  
        const openF1Response = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverId}`
        );
        if (!openF1Response.ok) throw new Error(`Erreur OpenF1: ${openF1Response.status}`);
        
        const openF1Data = await openF1Response.json();
        
        const lapsData = openF1Data
          .filter((lap: any) => lap.lap_duration !== null)
          .map((lap: any) => ({
            lap_number: lap.lap_number,
            lap_duration: parseFloat(lap.lap_duration),
            is_abnormal: false
          }));
  
        const maxLap = Math.max(...lapsData.map((l: any) => l.lap_number), 0);
  
        await Promise.all(lapKeys.map(async (lapKey) => {
          const currentLapNumber = parseInt(lapKey);
          allPredictions[lapKey] = {};
  
          await Promise.all(predictionTypes.filter(type => type !== 'laptime').map(async (type) => {
            try {
              const docRef = doc(db, "predictions_ia", "version 1", "sessions", sessionKey, 
                "drivers", driverId, "laps", lapKey, "predictions", type);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) allPredictions[lapKey][type] = docSnap.data();
            } catch (error) {
              console.error(`Erreur chargement ${type} pour ${lapKey}:`, error);
            }
          }));
  
          const emptyPrediction = { 
            predictions: { prediction: 0 }, 
            lap_predictions: [] 
          };
  
          if (currentLapNumber >= maxLap || lapsData.length === 0) {
            allPredictions[lapKey]['laptime'] = emptyPrediction;
            return;
          }
  
          try {
            const historicalLaps = lapsData
              .filter((l: any) => l.lap_number <= currentLapNumber)
              .sort((a: any, b: any) => a.lap_number - b.lap_number);
  
            const cleanedLaps = cleanLaptimeData(historicalLaps);
            const validLaps = cleanedLaps.filter(lap => !lap.is_abnormal);
  
            if (validLaps.length > 0) {
              const futureLaps = Math.min(
                LAPTIME_CONFIG.FUTURE_LAPS,
                10,
                maxLap - currentLapNumber
              );
  
              const predictions = predictFutureLaptimes(
                validLaps,
                currentLapNumber,
                { ...LAPTIME_CONFIG, FUTURE_LAPS: futureLaps }
              );
  
              predictions.lap_predictions = predictions.lap_predictions.map(pred => ({
                ...pred,
                actual_time: lapsData.find(l => l.lap_number === pred.lap_number)?.lap_duration
              }));
  
              allPredictions[lapKey]['laptime'] = predictions;
            } else {
              allPredictions[lapKey]['laptime'] = emptyPrediction;
            }
          } catch (error) {
            console.error(`Erreur prédiction ${lapKey}:`, error);
            allPredictions[lapKey]['laptime'] = emptyPrediction;
          }
        }));
  
        setPredictionsCache(allPredictions);
        setSelectedLap(lapKeys[0]);
      }
    } catch (error) {
      console.error("Erreur chargement principal:", error);
    } finally {
      setIsLoadingPredictions(false);
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
    setPredictionsCache({});
    loadDrivers(value);
    loadVitalStatistics(value);
  };

  const handleDriverChange = async (value: string) => {
    setIsPlaying(false);
    setSelectedDriver(value);
    setPredictionsCache({});
    setSelectedLap("");
    await loadLapsAndPredictions(selectedSession, value);
  };

  const handleLapChange = (value: string) => {
    setSelectedLap(value);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
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
          <Button
            onClick={() => router.push('/live-race')}
            className="bg-[#5382ec] hover:bg-[#436cbf] transition-colors whitespace-nowrap absolute right-0"
          >
            Go to Race Control Dashboard
          </Button>
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
          <Card className="bg-[#282a2c] border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-72">
                  <Select value={selectedSession} onValueChange={handleSessionChange}>
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
                    <Select value={selectedDriver} onValueChange={handleDriverChange}>
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
                        onLapChange={handleLapChange}
                        isPlaying={isPlaying}
                        onPlayToggle={togglePlayback}
                        disabled={isLoadingPredictions}
                      />
                    </div>
                    
                    <motion.div 
                      className={`
                        relative h-12 w-32 rounded-lg cursor-pointer overflow-hidden
                        bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]
                        p-0.5
                      `}
                      onClick={() => setIsExpertMode(!isExpertMode)}
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
        </motion.div>

        {selectedLap && !isLoadingPredictions && (
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
                      circuit_layout={vitalStats.circuit_layout || ''} // Ajout de la prop
                    />
                  </motion.div>
                </div>
              )}
              {predictionTypes.map((type, index) => {
                const predictionData = predictionsCache[selectedLap]?.[type];
                if (!predictionData) return null;
            
                return (
                  <div key={type} className="break-inside-avoid">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <PredictionWidget
                        type={type}
                        data={predictionData}
                        isExpertMode={isExpertMode}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {isLoadingPredictions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5382ec]"></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}