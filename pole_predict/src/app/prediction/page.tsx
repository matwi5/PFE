"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, DocumentData, collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Play, Pause } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Sparkles } from 'lucide-react';


interface PredictionData {
  predictions: {
    prediction: number | string;
    [key: string]: number | string;
  };
}

interface FormattedPredictionData {
  name: string;
  probability: number;
}

interface TimelineProps {
  laps: string[];
  selectedLap: string;
  onLapChange: (lap: string) => void;
  disabled: boolean;
}

interface PredictionCache {
  [lapNumber: string]: {
    depassement?: PredictionData;
    pitstop?: PredictionData;
    pneu?: PredictionData;
    position?: PredictionData;
  };
}

interface PredictionWidgetProps {
  type: string;
  data: PredictionData | null;
  className?: string;
  isExpertMode: boolean;
}

interface ExpertModeToggleProps {
  isExpertMode: boolean;
  onToggle: (checked: boolean) => void;
}

const PREDICTION_CLASS_ORDER = {
  depassement: ['False', 'True'],
  pitstop: ['Never', '1-5', '5-15', '>15'],
  pneu: ['SOFT', 'MEDIUM', 'HARD', 'Unknown', 'WET', 'INTERMEDIATE'],
  position: Array.from({length: 20}, (_, i) => (i + 1).toString() + '.0')
};

const PREDICTION_TITLES = {
  depassement: 'Overtake prediction for next lap',
  pitstop: 'Pit stop window prediction',
  pneu: 'Next tire prediction',
  position: 'Final position prediction'
};

const LapSlider: React.FC<TimelineProps> = ({ laps, selectedLap, onLapChange, disabled }) => {
  const minLap = Math.min(...laps.map(lap => parseInt(lap)));
  const maxLap = Math.max(...laps.map(lap => parseInt(lap)));
  
  return (
    <div className="w-full px-8 my-4">
      <div className="relative">
      <input
        type="range"
        min={minLap}
        max={maxLap}
        value={parseInt(selectedLap) || minLap}
        onChange={(e) => onLapChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-2 bg-[#1B1C1D] rounded-lg appearance-none cursor-pointer 
                  accent-[#5382ec] hover:accent-[#d56676] transition-all
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <div className="flex justify-between mt-4 font-medium text-gray-400">
        <span>Lap {minLap}</span>
        <span className="text-[#5382ec]">Lap {selectedLap || minLap}</span>
        <span>Lap {maxLap}</span>
      </div>
      </div>
    </div>
  );
};

const PlayButton: React.FC<{ isPlaying: boolean; onToggle: () => void; disabled: boolean }> = ({ 
  isPlaying, 
  onToggle,
  disabled 
}) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors
    ${disabled 
      ? 'bg-gray-300 cursor-not-allowed' 
      : isPlaying 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
  >
    {isPlaying ? (
      <>
        <Pause className="w-5 h-5 mr-2" />
        Pause
      </>
    ) : (
      <>
        <Play className="w-5 h-5 mr-2" />
        Play
      </>
    )}
  </button>
);

const ExpertModeToggle: React.FC<ExpertModeToggleProps> = ({ isExpertMode, onToggle }) => (
  <div className="flex items-center gap-2">
    <Switch
      checked={isExpertMode}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-blue-500"
    />
    <span className=" font-medium text-white">
      {isExpertMode ? 'Expert Mode' : 'Simple Mode'}
    </span>
  </div>
);

const PredictionWidget = ({ type, data, className, isExpertMode }) => {

  const formatPredictionData = (): FormattedPredictionData[] => {
    if (!data?.predictions) return [];
    
    const predictions = data.predictions;
    const orderArray = PREDICTION_CLASS_ORDER[type as keyof typeof PREDICTION_CLASS_ORDER];
    
    return orderArray.map(className => {
      const key = `proba_${className}`;
      let displayName = className;
  
      // Gestion des cas spéciaux pour l'affichage
      if (type === 'pneu') {
        if (className === 'Unknown') displayName = 'None';
        if (className === 'INTERMEDIATE') displayName = 'Inter';
        if (className === 'SOFT') displayName = 'Soft';
        if (className === 'MEDIUM') displayName = 'Medium';
        if (className === 'HARD') displayName = 'Hard';
        if (className === 'WET') displayName = 'Wet';
      } else if (type === 'depassement') {
        if (className === 'True') displayName = 'Overtake';
        if (className === 'False') displayName = 'Stay';
      }
  
      return {
        name: type === 'position' ? className.replace('.0', '') : displayName,
        probability: (predictions[key] as number) || 0
      };
    });
  };

  const getPredictionDisplay = () => {
    if (!data?.predictions) return '';
    
    const pred = data.predictions.prediction;
    
    switch (type) {
      case 'depassement':
        return pred === 0 ? 'No Overtake' : 'Overtake Expected';
      case 'pitstop':
        return pred === 'Never' ? 'No more stops planned' : `Stop in ${pred} laps`;
      case 'pneu':
        return pred === 'Unknown' ? 'No more changes planned' : `${pred} tires`;
      case 'position':
        return `${pred}`;
      default:
        return '';
    }
  };

  const renderSimpleMode = () => (
    <div className="flex items-center justify-center h-36">
      <h3 className={`font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center
        ${type === 'position' ? 'text-9xl  mt-1' : 'text-4xl'}`}>
        {getPredictionDisplay()}
      </h3>
    </div>
  );

  // Ajouter cette fonction avant le composant
  const lightenColor = (color: string, factor: number) => {
    // Si la couleur est au format rgb
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g);
      if (!rgb) return color;
      const r = Math.min(255, Math.round(parseInt(rgb[0]) * (1 + factor)));
      const g = Math.min(255, Math.round(parseInt(rgb[1]) * (1 + factor)));
      const b = Math.min(255, Math.round(parseInt(rgb[2]) * (1 + factor)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
  };

  const renderExpertMode = () => {
    const data = formatPredictionData();
    const getBarColor = (index: number) => {
      const totalBars = data.length - 1;
      if (totalBars === 0) return "#5382ec";
      
      const startColor = [83, 130, 236]; // RGB de #5382ec
      const endColor = [213, 102, 118];   // RGB de #d56676
      
      const r = startColor[0] + (endColor[0] - startColor[0]) * (index / totalBars);
      const g = startColor[1] + (endColor[1] - startColor[1]) * (index / totalBars);
      const b = startColor[2] + (endColor[2] - startColor[2]) * (index / totalBars);
      
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    return (
      <div className="h-40 flex items-center justify-center">
        <ResponsiveContainer width="90%" height="170%">
          <BarChart 
            data={data}
            margin={{ top: 48, right: 0, left: -10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              strokeOpacity={0.5} 
              stroke="#7e8385" // Nouvelle couleur pour la grille
            />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              interval={0}
              tick={{ fontSize: 12, fill: "#7e8385" }} // Nouvelle couleur pour le texte
              stroke="#7e8385" // Nouvelle couleur pour l'axe
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
              tick={{ fill: "#7e8385" }} // Nouvelle couleur pour le texte
              stroke="#7e8385" // Nouvelle couleur pour l'axe
            />
            <Tooltip 
              formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              contentStyle={{
                backgroundColor: '#282a2c',
                borderRadius: '8px',
                padding: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'white' }}  // Label en blanc
              itemStyle={{ color: 'white' }}   // Items en blanc
            />
            <Bar 
              dataKey="probability" 
              animationDuration={300}
              animationBegin={0}
            >
              {
                data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(index)}
                    onMouseOver={(props) => {
                      // Effet d'éclaircissement au hover
                      const currentColor = getBarColor(index);
                      props.target.style.fill = lightenColor(currentColor, 0.2);
                    }}
                    onMouseOut={(props) => {
                      props.target.style.fill = getBarColor(index);
                    }}
                  />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className={`${className} perspective-1000 overflow-hidden bg-[#282a2c]`}>
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
          {PREDICTION_TITLES[type]}
        </CardTitle>
        <Sparkles className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
      </CardHeader>
      <CardContent className="h-56 relative">
        {data ? (
          <div className={`flip-container ${isExpertMode ? 'animate-flip-card' : ''}`}>
            <div className="flip-front">
              {renderSimpleMode()}
            </div>
            <div className="flip-back">
              {renderExpertMode()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Data not available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PredictionDisplayPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [laps, setLaps] = useState<string[]>([]);
  const [predictionTypes] = useState<string[]>(["depassement", "pitstop", "pneu", "position"]);
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
                allPredictions[lap][type] = predictionDocSnap.data() as PredictionData;
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
                  <SelectValue placeholder="Sélectionnez une session" />
                </SelectTrigger>
                <SelectContent className="bg-[#1B1C1D] border-gray-700">
                  {sessions.map((session) => (
                    <SelectItem 
                      key={session} 
                      value={session}
                      className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] focus:text-white"
                    >
                      Session {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSession && (
                <Select value={selectedDriver} onValueChange={handleDriverChange}>
                  <SelectTrigger className="bg-[#1B1C1D] border-gray-700 text-white w-48">
                    <SelectValue placeholder="Sélectionnez un pilote" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B1C1D] border-gray-700">
                    {drivers.map((driver) => (
                      <SelectItem 
                        key={driver} 
                        value={driver}
                        className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c] focus:text-white"
                      >
                        Pilote {driver}
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