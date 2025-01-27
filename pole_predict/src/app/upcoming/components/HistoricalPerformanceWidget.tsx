"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { History, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Driver {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
}

interface Constructor {
  constructorId: string;
  name: string;
}

interface HistoricalResult {
  season: number;
  position: number;
  entityId: string;
  name: string;
  retired: boolean;
}

interface CacheData {
  circuitId: string;
  results: {
    [key: string]: HistoricalResult[];
  };
  timestamp: number;
}

interface HistoricalPerformanceWidgetProps {
  meeting_key: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const colors = ['#5382ec', '#2dd4bf', '#D4582D', '#D42D62', '#8B5CF6'];
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCacheKey = (circuitId: string, mode: 'drivers' | 'constructors') => `historical-${circuitId}-${mode}`;

const HistoricalPerformanceWidget: React.FC<HistoricalPerformanceWidgetProps> = ({ meeting_key }) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [historicalData, setHistoricalData] = useState<{ [key: string]: HistoricalResult[] }>({});
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'drivers' | 'constructors'>('drivers');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [availableConstructors, setAvailableConstructors] = useState<Constructor[]>([]);
  const [circuitId, setCircuitId] = useState<string>('');
  const [loadingCircuit, setLoadingCircuit] = useState(true);
  const [selectValue, setSelectValue] = useState<string>('');

  const getMeetingInfo = (key: number) => {
    const baseYear = 2024;
    const baseRound = 16;
    const diff = key - 1244;
    return { season: baseYear, round: baseRound + diff };
  };

  const getFromCache = (cacheKey: string): CacheData | null => {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return data;
  };

  const saveToCache = (cacheKey: string, circuitId: string, data: { [key: string]: HistoricalResult[] }) => {
    const cacheData: CacheData = {
      circuitId,
      results: data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  const fetchHistoricalResults = async (entityId: string, mode: 'drivers' | 'constructors') => {
    if (!circuitId) return [];

    let currentSeason = 2023;
    let count = 0;
    const results: HistoricalResult[] = [];

    while (count < 10 && currentSeason >= 2014) {
      let url;
      if (mode === 'drivers') {
        url = `https://ergast.com/api/f1/${currentSeason}/circuits/${circuitId}/drivers/${entityId}/results.json`;
      } else {
        url = `https://ergast.com/api/f1/${currentSeason}/circuits/${circuitId}/constructors/${entityId}/results.json`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        
        const race = data.MRData.RaceTable.Races[0];
        if (race) {
          if (mode === 'drivers') {
            const result = race.Results[0];
            if (result) {
              results.push({
                season: currentSeason,
                position: parseInt(result.position),
                entityId: entityId,
                name: `${result.Driver.givenName} ${result.Driver.familyName}`,
                retired: result.positionText === "R"
              });
              count++;
            }
          } else {
            const teamResults = race.Results.filter(
              result => result.Constructor.constructorId === entityId
            );
            
            if (teamResults.length > 0) {
              const bestPosition = Math.min(
                ...teamResults.map(r => parseInt(r.position))
              );
              const allRetired = teamResults.every(r => r.positionText === "R");
              
              results.push({
                season: currentSeason,
                position: bestPosition,
                entityId: entityId,
                name: teamResults[0].Constructor.name,
                retired: allRetired
              });
              count++;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      currentSeason--;
    }

    return results;
  };

  const preloadDataInBackground = async (drivers: Driver[], constructors: Constructor[]) => {
    if (!circuitId) return;

    const preloadEntity = async (entityId: string, entityType: 'drivers' | 'constructors') => {
      const cacheKey = getCacheKey(circuitId, entityType);
      const cached = getFromCache(cacheKey);
      if (cached?.results[entityId]) return;

      try {
        const results = await fetchHistoricalResults(entityId, entityType);
        if (results.length > 0) {
          const newCache = {
            ...cached?.results || {},
            [entityId]: results
          };
          saveToCache(cacheKey, circuitId, newCache);
        }
      } catch (error) {
        console.error(`Error preloading data for ${entityId}:`, error);
      }
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const driver of drivers) {
      await preloadEntity(driver.driverId, 'drivers');
      await delay(100);
    }

    for (const constructor of constructors) {
      await preloadEntity(constructor.constructorId, 'constructors');
      await delay(100);
    }
  };

  useEffect(() => {
    const fetchCircuitId = async () => {
      setLoadingCircuit(true);
      const { season, round } = getMeetingInfo(meeting_key);
      try {
        const response = await fetch(
          `https://ergast.com/api/f1/${season}/${round}/results.json`
        );
        const data = await response.json();
        const newCircuitId = data.MRData.RaceTable.Races[0]?.Circuit.circuitId;
        setCircuitId(newCircuitId);
      } catch (error) {
        console.error('Error fetching circuit ID:', error);
      } finally {
        setLoadingCircuit(false);
      }
    };

    fetchCircuitId();
  }, [meeting_key]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const { season, round } = getMeetingInfo(meeting_key);
      try {
        const driversResponse = await fetch(
          `https://ergast.com/api/f1/${season}/${round}/driverStandings.json`
        );
        const driversData = await driversResponse.json();
        const drivers = driversData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings.map(
          (standing: any) => standing.Driver
        ) || [];
        setAvailableDrivers(drivers);

        const constructorsResponse = await fetch(
          `https://ergast.com/api/f1/${season}/${round}/constructorStandings.json`
        );
        const constructorsData = await constructorsResponse.json();
        const constructors = constructorsData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings.map(
          (standing: any) => standing.Constructor
        ) || [];
        setAvailableConstructors(constructors);
        
        if (circuitId) {
          preloadDataInBackground(drivers, constructors);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    fetchParticipants();
  }, [meeting_key, circuitId]);

  const handleEntitySelect = async (entityId: string) => {
    if (selectedEntities.length >= 5 || selectedEntities.includes(entityId)) return;
  
    const cacheKey = getCacheKey(circuitId, currentMode);
    const cached = getFromCache(cacheKey);
    const cachedData = cached?.results[entityId];
  
    if (cachedData) {
      // Données déjà en cache, mise à jour directe sans loader
      setSelectedEntities(prev => [...prev, entityId]);
      setHistoricalData(prev => ({
        ...prev,
        [entityId]: cachedData
      }));
    } else {
      // Données non trouvées en cache, on active le loader
      setLoading(true);
      const entityData = await fetchHistoricalResults(entityId, currentMode);
      
      if (entityData?.length > 0) {
        setSelectedEntities(prev => [...prev, entityId]);
        setHistoricalData(prev => ({
          ...prev,
          [entityId]: entityData
        }));
      }
      
      setLoading(false);
    }
  };

  const removeEntity = (entityId: string) => {
    setSelectedEntities(selectedEntities.filter(id => id !== entityId));
    const newHistoricalData = { ...historicalData };
    delete newHistoricalData[entityId];
    setHistoricalData(newHistoricalData);
  };

  const toggleMode = () => {
    setCurrentMode(currentMode === 'drivers' ? 'constructors' : 'drivers');
    setSelectedEntities([]);
    setHistoricalData({});
    setSelectValue('');
  };

  const getAllDataPoints = () => {
    const uniqueSeasons = new Set<number>();
    Object.values(historicalData).forEach(results => {
      results.forEach(result => uniqueSeasons.add(result.season));
    });

    const seasons = Array.from(uniqueSeasons).sort((a, b) => b - a);

    return seasons.map(season => {
      const dataPoint: any = { season };
      
      selectedEntities.forEach(entityId => {
        const result = historicalData[entityId]?.find(r => r.season === season);
        if (result) {
          dataPoint[`${entityId}`] = result.position;
          dataPoint[`${entityId}Retired`] = result.retired;
        }
      });
      
      return dataPoint;
    });
  };

  return (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.35 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Historical Performance
            </CardTitle>
            <History className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={toggleMode}
                variant="outline" 
                className="bg-[#1d1f20] hover:bg-[#282a2c] border-0 text-white"
                disabled={loading || loadingCircuit}
              >
                {currentMode === 'drivers' ? 'Switch to Constructors' : 'Switch to Drivers'}
              </Button>
              {selectedEntities.length < 5 && (
                <Badge variant="outline" className="bg-[#1d1f20] text-white border-0">
                  {5 - selectedEntities.length} slots remaining
                </Badge>
              )}
            </div>

            {loadingCircuit ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#5382ec]" />
              </div>
            ) : (
              <>
                {selectedEntities.length < 5 && (
                  <Select 
                    value={selectValue}
                    onValueChange={(value) => {
                      setSelectValue(value);
                      handleEntitySelect(value);
                    }} 
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full bg-[#1d1f20] border-0 text-white">
                      <SelectValue placeholder={`Select ${currentMode === 'drivers' ? 'drivers' : 'constructors'}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1d1f20] border-0">
                      <SelectGroup>
                        {currentMode === 'drivers' 
                          ? availableDrivers.map((driver) => (
                              <SelectItem 
                                key={driver.driverId} 
                                value={driver.driverId}
                                className={`text-white hover:bg-[#282a2c] focus:bg-[#282a2c] ${
                                  selectedEntities.includes(driver.driverId) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={selectedEntities.includes(driver.driverId)}
                              >
                                {`${driver.givenName} ${driver.familyName}`}
                              </SelectItem>
                            ))
                          : availableConstructors.map((constructor) => (
                              <SelectItem 
                                key={constructor.constructorId} 
                                value={constructor.constructorId}
                                className={`text-white hover:bg-[#282a2c] focus:bg-[#282a2c] ${
                                  selectedEntities.includes(constructor.constructorId) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={selectedEntities.includes(constructor.constructorId)}
                              >
                                {constructor.name}
                              </SelectItem>
                            ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}

                {loading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5382ec]" />
                  </div>
                )}

                {selectedEntities.length > 0 && !loading && (
                  <div className="w-full h-96">
                    <ResponsiveContainer>
                      <LineChart
                        data={getAllDataPoints()}
                        margin={{ top: 30, right: 40, left: -18, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis 
                          dataKey="season" 
                          stroke="#ffffff"
                          reversed
                          tickMargin={10}
                          label={{ 
                            value: 'Season', 
                            position: 'bottom', 
                            offset: 10,
                            style: { fill: '#ffffff' }
                          }}
                        />
                        <YAxis 
                          stroke="#ffffff"
                          domain={[0, 20]}
                          reversed
                          ticks={[1, 5, 10, 15, 20]}
                          tickMargin={10}
                          label={{ 
                            value: 'Position', 
                            position: 'top',
                            offset: 13,
                            dx: 30,
                            style: { fill: '#ffffff' }
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1d1f20', border: 'none' }}
                          labelStyle={{ color: '#ffffff' }}
                          formatter={(value: any, name: string) => {
                            if (value === undefined || value === null) return ['-', ''];
                            const entityId = name.replace('Position', '');
                            const dataPoint = getAllDataPoints().find(
                              (point) => point[entityId] === value
                            );
                            const retired = dataPoint?.[`${entityId}Retired`];
                            return [
                              `Position: ${value}${retired ? ' (DNF)' : ''}`,
                              historicalData[entityId]?.[0]?.name || entityId
                            ];
                          }}
                        />
                        {selectedEntities.map((entityId, index) => (
                          <React.Fragment key={entityId}>
                            <Line
                              type="monotone"
                              dataKey={entityId}
                              name={`${entityId}Position`}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              dot={(props: any) => {
                                const value = props.payload[entityId];
                                if (value === undefined || value === null) return null;
                                const retired = props.payload[`${entityId}Retired`];
                                return (
                                  <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={4}
                                    fill={retired ? '#FF4444' : colors[index % colors.length]}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={2}
                                  />
                                );
                              }}
                              activeDot={(props: any) => {
                                const value = props.payload[entityId];
                                if (value === undefined || value === null) return null;
                                const retired = props.payload[`${entityId}Retired`];
                                return (
                                  <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={8}
                                    fill={retired ? '#FF4444' : colors[index % colors.length]}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={2}
                                  />
                                );
                              }}
                              connectNulls
                            />
                          </React.Fragment>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center items-center gap-4  text-sm text-gray-400 -mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF4444]" />
                        <span>DNF (Did Not Finish)</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedEntities.map((entityId, index) => (
                      <Badge 
                          key={entityId}
                          className="bg-[#1d1f20] text-white hover:bg-[#FF4444] cursor-pointer transition-colors px-2 py-0.5 flex items-center gap-1 text-xs"  // Modifié ici
                          onClick={() => removeEntity(entityId)}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"  // Réduit de w-3 h-3 à w-2 h-2
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          {historicalData[entityId]?.[0]?.name || entityId}
                          <span className="ml-0.5">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  export default HistoricalPerformanceWidget;