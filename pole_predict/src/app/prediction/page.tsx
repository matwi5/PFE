// page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LapSlider } from './components/LapSlider';
import { PlayButton } from './components/PlayButton';
import { ExpertModeToggle } from './components/ExpertModeToggle';
import { PredictionWidget } from './components/PredictionWidget';
import { PredictionCache } from './types';
import { predictionTypes, LAPTIME_CONFIG  } from './constants';
import { cleanLaptimeData, predictFutureLaptimes } from './utils/laptimePredictions';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

export default function PredictionDisplayPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [laps, setLaps] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedLap, setSelectedLap] = useState<string>("");
  const [predictionsCache, setPredictionsCache] = useState<PredictionCache>({});
  const [loading, setLoading] = useState(true);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed] = useState(300);
  const [isExpertMode, setIsExpertMode] = useState(false);

  const [laptimeData, setLaptimeData] = useState<{
    [lap: string]: { lap_duration: number; lap_number: number }[]
  }>({});

  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

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
      setSessions(sessionKeys);
    }
  }

  async function loadDrivers(sessionKey: string) {
    const driversCollectionRef = collection(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers");
    const driversQuery = query(driversCollectionRef);
    const driversSnapshot = await getDocs(driversQuery);

    const driverKeys: string[] = [];
    driversSnapshot.forEach((doc) => {
      if (doc.id !== "driver_keys") {
        driverKeys.push(doc.id);
      }
    });
    setDrivers(driverKeys);
  }

  async function loadLapsAndPredictions(sessionKey: string, driverId: string) {
    setIsLoadingPredictions(true);
    try {
      // Chargement des clés de tours depuis Firebase
      const lapsCollectionRef = collection(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers", driverId, "laps");
      const lapsSnapshot = await getDocs(query(lapsCollectionRef));
  
      const lapKeys = lapsSnapshot.docs
        .filter(doc => doc.id !== "lap_keys")
        .map(doc => doc.id)
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      setLaps(lapKeys);
  
      if (lapKeys.length > 0) {
        const allPredictions: PredictionCache = {};
  
        // Récupération des données OpenF1 avec validation
        const openF1Response = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverId}`
        );
        if (!openF1Response.ok) throw new Error(`Erreur OpenF1: ${openF1Response.status}`);
        
        const openF1Data = await openF1Response.json();
        
        // Transformation sécurisée des données
        const lapsData = openF1Data
          .filter((lap: any) => lap.lap_duration !== null)
          .map((lap: any) => ({
            lap_number: lap.lap_number,
            lap_duration: parseFloat(lap.lap_duration),
            is_abnormal: false
          }));
  
        const maxLap = Math.max(...lapsData.map((l: any) => l.lap_number), 0);
  
        // Traitement parallélisé des tours
        await Promise.all(lapKeys.map(async (lapKey) => {
          const currentLapNumber = parseInt(lapKey);
          allPredictions[lapKey] = {};
  
          // Chargement des prédictions existantes
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
  
          // Configuration de base pour les prédictions
          const emptyPrediction = { 
            predictions: { prediction: 0 }, 
            lap_predictions: [] 
          };
  
          // Vérification des données minimales
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
  
              // Mappage des temps réels
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

  const handleSessionChange = (value: string) => {
    setIsPlaying(false);
    setSelectedSession(value);
    setSelectedDriver("");
    setSelectedLap("");
    setDrivers([]);
    setLaps([]);
    setPredictionsCache({});
    loadDrivers(value);
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
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Real-time Predictions
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                <div className="w-44">
                  <Select value={selectedSession} onValueChange={handleSessionChange}>
                    <SelectTrigger className="bg-[#1d1f20] border-0 text-white h-12 hover:bg-gray-800/50 transition-colors">
                      <SelectValue placeholder="Select a race..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1f20] border-0">
                      {sessions.map((session) => (
                        <SelectItem 
                          key={session} 
                          value={session}
                          className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] cursor-pointer"
                        >
                          Race {session}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSession && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-44"
                  >
                    <Select value={selectedDriver} onValueChange={handleDriverChange}>
                      <SelectTrigger className="bg-[#1d1f20] border-0 text-white h-12 hover:bg-gray-800/50 transition-colors">
                        <SelectValue placeholder="Select a driver..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1d1f20] border-0">
                        {drivers.map((driver) => (
                          <SelectItem 
                            key={driver} 
                            value={driver}
                            className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] cursor-pointer"
                          >
                            Driver {driver}
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
                    
                    {/* Switch Expert Mode */}
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
            <div className="grid grid-cols-3 gap-4">
              {predictionTypes.map((type, index) => {
                const predictionData = predictionsCache[selectedLap]?.[type];
                if (!predictionData) return null;
            
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PredictionWidget
                      type={type}
                      data={predictionData}
                      isExpertMode={isExpertMode}
                      className={`transition-opacity duration-300 ${
                        index >= 3 ? 'col-span-3 md:col-span-1' : ''
                      }`}
                    />
                  </motion.div>
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