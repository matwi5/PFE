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
import { predictionTypes } from './constants';

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

  async function loadLapsAndPredictions(sessionKey: string, driverKey: string) {
    setIsLoadingPredictions(true);
    try {
      const lapsCollectionRef = collection(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers", driverKey, "laps");
      const lapsQuery = query(lapsCollectionRef);
      const lapsSnapshot = await getDocs(lapsQuery);

      const lapKeys: string[] = [];
      lapsSnapshot.forEach((doc) => {
        if (doc.id !== "lap_keys") {
          lapKeys.push(doc.id);
        }
      });

      const sortedLaps = lapKeys.sort((a, b) => parseInt(a) - parseInt(b));
      setLaps(sortedLaps);

      if (sortedLaps.length > 0) {
        const allPredictions: PredictionCache = {};
        
        await Promise.all(sortedLaps.map(async (lap) => {
          allPredictions[lap] = {};
          await Promise.all(predictionTypes.map(async (type) => {
            try {
              const predictionDocRef = doc(db, "predictions_ia", "version 1", "sessions", sessionKey, "drivers", driverKey, "laps", lap, "predictions", type);
              const predictionDocSnap = await getDoc(predictionDocRef);
              
              if (predictionDocSnap.exists()) {
                allPredictions[lap][type] = predictionDocSnap.data();
              }
            } catch (error) {
              console.error(`Error fetching ${type} prediction for lap ${lap}:`, error);
            }
          }));
        }));

        setPredictionsCache(allPredictions);
        setSelectedLap(sortedLaps[0]);
      }
    } catch (error) {
      console.error("Error loading laps and predictions:", error);
    }
    setIsLoadingPredictions(false);
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
                className={`transition-opacity duration-300 ${index === 3 ? 'col-span-1' : ''}`}
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