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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Real-time Predictions</h1>

      <Card className="mb-8 bg-[#282a2c] border-none">
        <CardHeader>
          <CardDescription className="text-gray-400 text-center">Select a session and driver to view predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Select value={selectedSession} onValueChange={handleSessionChange}>
                <SelectTrigger className="bg-[#1B1C1D] border-gray-700 text-white w-48">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent className="bg-[#1B1C1D] border-gray-700">
                  {sessions.map((session) => (
                    <SelectItem 
                      key={session} 
                      value={session}
                      className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c]"
                    >
                      Session {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSession && (
                <Select value={selectedDriver} onValueChange={handleDriverChange}>
                  <SelectTrigger className="bg-[#1B1C1D] border-gray-700 text-white w-48">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B1C1D] border-gray-700">
                    {drivers.map((driver) => (
                      <SelectItem 
                        key={driver} 
                        value={driver}
                        className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c]"
                      >
                        Driver {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedDriver && laps.length > 0 && (
              <div className="space-y-4">
                <LapSlider 
                  laps={laps}
                  selectedLap={selectedLap || laps[0]}
                  onLapChange={handleLapChange}
                  disabled={isLoadingPredictions || isPlaying}
                />
                <div className="flex justify-center items-center gap-4">
                  <PlayButton 
                    isPlaying={isPlaying}
                    onToggle={togglePlayback}
                    disabled={isLoadingPredictions}
                  />
                  <ExpertModeToggle 
                    isExpertMode={isExpertMode}
                    onToggle={setIsExpertMode}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLap && !isLoadingPredictions && (
        <div className="grid grid-cols-3 gap-4">
          {predictionTypes.map((type, index) => {
            const predictionData = predictionsCache[selectedLap]?.[type];
            if (!predictionData) return null;
        
            return (
              <PredictionWidget
                key={type}
                type={type}
                data={predictionData}
                isExpertMode={isExpertMode}
                className={`transition-opacity duration-300 ${
                  index >= 3 ? 'col-span-3 md:col-span-1' : ''
                }`}
              />
            );
          })}
        </div>
      )}

      {isLoadingPredictions && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}