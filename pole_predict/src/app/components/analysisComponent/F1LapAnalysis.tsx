/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartesianGrid, DotProps, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import CustomDropdown_multiple from "./component/CustomDropdown_multiple";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, Timer, AlertTriangle } from "lucide-react";

interface LapData {
    lap_number: number;
    duration_sector_1: number;
    duration_sector_2: number;
    duration_sector_3: number;
    is_pit_out_lap: boolean;
    driver_number: number;
    hasSafetyCar?: boolean;
}

interface DisplayLapData {
    lapNumber: number;
    totalTime: number;
    improved: boolean;
    isPitLap: boolean;
    hasSafetyCar?: boolean;
    driverNumber: number;
    uniqueKey: string;
}

interface DriverData {
    [driverNumber: number]: {
        name_acronym: string;
        team_colour: string;
    }
}

interface F1LapAnalysisProps {
    sessionKey: number;
    lap: number | null;
}

interface RaceControlEvent {
    category: string;
    message: string;
    lap_number: number;
}

const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00.000";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Fonction utilitaire pour retry les appels API
const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant de réessayer
        }
    }
};

const LoadingCard = () => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 h-48">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
            <div className="text-white flex flex-col items-center gap-2">
                <div>Loading lap time data...</div>
                <div className="text-sm text-gray-400">
                    Fetching race information...
                </div>
            </div>
        </CardContent>
    </Card>
);

const ErrorCard = ({ error }: { error: string }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 h-48">
        <CardContent className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="text-red-400">{error}</div>
            </div>
        </CardContent>
    </Card>
);

const F1LapAnalysis: React.FC<F1LapAnalysisProps> = ({ sessionKey, lap }) => {
    const [allLaps, setAllLaps] = useState<LapData[]>([]);
    const [data, setData] = useState<DisplayLapData[]>([]);
    const [timeRange, setTimeRange] = useState({ min: 0, max: 0 });
    const [selectedDrivers, setSelectedDrivers] = useState<{ label: string; value: string }[]>([]);
    const [displayData, setDisplayData] = useState<DisplayLapData[]>([]);
    const [raceControlData, setRaceControlData] = useState<RaceControlEvent[]>([]);
    const [maxLap, setMaxLap] = useState<number>(0);
    const [driverData, setDriverData] = useState<DriverData>({});
    const [filterMinLap, setFilterMinLap] = useState<number>(2);
    const [filterMaxLap, setFilterMaxLap] = useState<number>(Infinity);
    const [showDots, setShowDots] = useState(false);
    const [minLapInput, setMinLapInput] = useState('2');
    const [maxLapInput, setMaxLapInput] = useState('Infinity');
    const [showLapInputs, setShowLapInputs] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDriversData = async () => {
            if (!sessionKey) return;

            try {
                const url = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
                const drivers = await fetchWithRetry(url);

                const fetchedDriverData: DriverData = {};
                drivers.forEach((driver: any) => {
                    if (driver?.driver_number && driver?.name_acronym) {
                        fetchedDriverData[driver.driver_number] = {
                            name_acronym: driver.name_acronym,
                            team_colour: driver.team_colour || 'FFFFFF',
                        };
                    }
                });

                setDriverData(fetchedDriverData);
            } catch (error) {
                setError('Error fetching driver data. Retrying...');
                console.error('Error fetching driver data:', error);
            }
        };

        setIsLoading(true);
        fetchDriversData();
    }, [sessionKey]);

    useEffect(() => {
        const fetchRaceControlData = async () => {
            if (!sessionKey) return;

            try {
                const url = lap
                    ? `https://api.openf1.org/v1/race_control?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/race_control?session_key=${sessionKey}`;

                const data = await fetchWithRetry(url);
                setRaceControlData(data);
            } catch (error) {
                setError('Error fetching race control data. Retrying...');
                console.error('Error fetching race control data:', error);
            }
        };

        fetchRaceControlData();
    }, [sessionKey, lap]);

    useEffect(() => {
        const fetchData = async () => {
            if (!sessionKey) return;

            try {
                const url = lap
                    ? `https://api.openf1.org/v1/laps?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;

                const laps: LapData[] = await fetchWithRetry(url);

                const validLaps = laps
                    .filter(lap =>
                        lap?.duration_sector_1 &&
                        lap?.duration_sector_2 &&
                        lap?.duration_sector_3 &&
                        !isNaN(lap.duration_sector_1) &&
                        !isNaN(lap.duration_sector_2) &&
                        !isNaN(lap.duration_sector_3)
                    )
                    .sort((a, b) => a.lap_number - b.lap_number);

                setAllLaps(validLaps);

                const safetyCarLaps = new Set<number>();
                let isSafetyCarActive = false;

                raceControlData.forEach((event) => {
                    if (event?.category === "SafetyCar" || event?.category === "Flag") {
                        if (event.message?.includes("DEPLOYED")) {
                            isSafetyCarActive = true;
                        } else if (event.message?.includes("ENDING") || event.message?.includes("IN")) {
                            isSafetyCarActive = false;
                        }
                    }

                    if (isSafetyCarActive && event?.lap_number) {
                        safetyCarLaps.add(event.lap_number);
                    }
                });

                validLaps.forEach((lap) => {
                    lap.hasSafetyCar = safetyCarLaps.has(lap.lap_number);
                });

                const lapDisplayData: DisplayLapData[] = [];

                validLaps.forEach((lap) => {
                    if (!lap) return;

                    const totalTime = lap.duration_sector_1 + lap.duration_sector_2 + lap.duration_sector_3;
                    if (isNaN(totalTime)) return;

                    let improved = false;
                    const previousLap = validLaps.find(prevLap =>
                        prevLap?.driver_number === lap.driver_number &&
                        prevLap?.lap_number === lap.lap_number - 1
                    );

                    if (previousLap) {
                        const previousLapTime = previousLap.duration_sector_1 + previousLap.duration_sector_2 + previousLap.duration_sector_3;
                        improved = totalTime < previousLapTime;
                    }

                    lapDisplayData.push({
                        lapNumber: lap.lap_number,
                        totalTime,
                        improved,
                        isPitLap: lap.is_pit_out_lap || false,
                        hasSafetyCar: lap.hasSafetyCar,
                        driverNumber: lap.driver_number,
                        uniqueKey: `${lap.driver_number}-${lap.lap_number}`
                    });
                });

                setData(lapDisplayData);

                const meanTimes = lapDisplayData
                    .filter(lap => !lap.isPitLap)
                    .map(lap => lap.totalTime);

                if (meanTimes.length > 0) {
                    const minMeanTime = Math.min(...meanTimes);
                    const maxMeanTime = Math.max(...meanTimes);
                    setTimeRange({ min: minMeanTime - 1, max: maxMeanTime + 1 });
                }

                const maxLapNumber = validLaps.reduce((max, lap) => Math.max(max, lap?.lap_number || 0), 0);
                setMaxLap(maxLapNumber);
                setFilterMaxLap(maxLapNumber);
                setIsLoading(false);
                setError(null);

            } catch (error) {
                setError('Error fetching lap data. Retrying...');
                console.error('Error fetching lap data:', error);
            }
        };

        fetchData();
    }, [sessionKey, raceControlData, lap]);

    useEffect(() => {
        try {
            let filteredData = selectedDrivers.length > 0
                ? data.filter(lap => selectedDrivers.some(selected => parseInt(selected.value) === lap.driverNumber))
                : [];

            const minLapNum = parseInt(minLapInput, 10);
            const maxLapNum = maxLapInput === 'Infinity' ? Infinity : parseInt(maxLapInput, 10);

            filteredData = filteredData.filter(lap =>
                lap.lapNumber >= (isNaN(minLapNum) ? 1 : minLapNum) &&
                lap.lapNumber <= (isNaN(maxLapNum) ? Infinity : maxLapNum)
            );

            setFilterMinLap(isNaN(minLapNum) ? 1 : minLapNum);
            setFilterMaxLap(isNaN(maxLapNum) ? Infinity : maxLapNum);

            setDisplayData(filteredData);

            const lapTimes = filteredData.map(lap => lap.totalTime);
            if (lapTimes.length > 0) {
                setTimeRange({
                    min: Math.min(...lapTimes) - 1,
                    max: Math.max(...lapTimes) + 1
                });
            }
        } catch (error) {
            console.error('Error filtering data:', error);
        }
    }, [data, selectedDrivers, minLapInput, maxLapInput]);

    const renderDot = (props: DotProps & { payload?: DisplayLapData }) => {
        if (!props.payload) return <circle cx={props.cx} cy={props.cy} r={0} fill="transparent" />;

        const { payload } = props;
        let fill = "#ff0000";
        let radius = 5;

        if (payload.isPitLap) {
            fill = "#00bfff";
        } else if (payload.hasSafetyCar) {
            fill = "#ffff00";
        } else if (payload.improved) {
            fill = "#00ff00";
        }

        if (!showDots) {
            radius = 0;
        }

        return (
            <circle
                cx={props.cx}
                cy={props.cy}
                r={radius}
                fill={fill}
                stroke="none"
            />
        );
    };

    const driverOptions = allLaps.length > 0
        ? [...new Set(allLaps.map(lap => lap?.driver_number))]
            .filter(Boolean)
            .map(driverNumber => ({
                label: driverData[driverNumber]?.name_acronym || `Driver ${driverNumber}`,
                value: String(driverNumber),
            }))
        : [];

    if (isLoading) return <LoadingCard />;
    if (!sessionKey) return <ErrorCard error="Please provide a valid session key" />;

    return (
        <Card className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out ${showLapInputs ? 'h-[590px]' : 'h-[510px]'}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Lap Time Analysis
                    </CardTitle>
                    <Timer className="h-5 w-5 text-[#5382ec]" />
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <CustomDropdown_multiple
                                options={driverOptions}
                                selectedGroups={selectedDrivers}
                                onChange={setSelectedDrivers}
                                backgroundColor="#1a1b1e"
                                textColor="#ffffff"
                                placeHolder="Select Drivers"
                            />
                        </div>

                        {selectedDrivers.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDots(!showDots)}
                                    className="bg-black/20 border-[#5382ec]/20 text-[#5382ec] hover:bg-[#5382ec]/20"
                                >
                                    {showDots ? 'Hide Points' : 'Show Points'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowLapInputs(!showLapInputs)}
                                    className="bg-black/20 border-[#5382ec]/20 text-[#5382ec] hover:bg-[#5382ec]/20"
                                >
                                    <span>Lap Range</span>
                                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showLapInputs ? 'rotate-180' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {showLapInputs && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="p-3 rounded-lg bg-black/20 backdrop-blur-sm flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-400">Min Lap</label>
                                        <Input
                                            type="text"
                                            value={minLapInput}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || /^\d+$/.test(val)) {
                                                    setMinLapInput(val);
                                                }
                                            }}
                                            className="w-20 bg-black/30 border-gray-700 text-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-400">Max Lap</label>
                                        <Input
                                            type="text"
                                            value={maxLapInput}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'Infinity' || val === '' || /^\d+$/.test(val)) {
                                                    setMaxLapInput(val);
                                                }
                                            }}
                                            className="w-20 bg-black/30 border-gray-700 text-white"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardHeader>

            <CardContent className="relative h-[380px]">
                {selectedDrivers.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-center">
                            <p>Select one or more drivers to analyze lap times</p>
                            <p className="text-sm mt-2 text-gray-500">Data will be displayed here</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto pr-6 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 hover:scrollbar-thumb-[#2dd4bf]/80 transition-all duration-200 ease-out">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={displayData}
                                    margin={{ top: 10, right: 0, left: -20, bottom: 15 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(255,255,255,0.1)"
                                    />
                                    <XAxis
                                        dataKey="lapNumber"
                                        type="number"
                                        domain={[filterMinLap, filterMaxLap === Infinity ? maxLap : filterMaxLap]}
                                        stroke="#ffffff50"
                                        tick={{ fill: '#ffffff80' }}
                                    />
                                    <YAxis
                                        domain={[timeRange.min, timeRange.max]}
                                        tickFormatter={formatTime}
                                        stroke="#ffffff50"
                                        tick={{ fill: '#ffffff80' }}
                                    />
                                    <Legend
                                        wrapperStyle={{
                                            paddingLeft: 20,
                                            color: '#fff'
                                        }}
                                    />
                                    {
                                        [...new Set(displayData.map(lap => lap.driverNumber))]
                                            .filter(Boolean)
                                            .map(driverNumber => {
                                                if (!driverNumber) return null;
                                                const driverDataForLine = displayData.filter(lap => lap.driverNumber === driverNumber);
                                                if (!driverDataForLine.length) return null;

                                                return (
                                                    <Line
                                                        key={`line-${driverNumber}`}
                                                        type="monotone"
                                                        dataKey="totalTime"
                                                        data={driverDataForLine}
                                                        stroke={`#${driverData[driverNumber]?.team_colour || 'FFFFFF'}`}
                                                        strokeWidth={2}
                                                        dot={renderDot}
                                                        name={driverData[driverNumber]?.name_acronym || `Driver ${driverNumber}`}
                                                        connectNulls
                                                    />
                                                );
                                            })
                                    }
                                </LineChart>
                            </ResponsiveContainer>

                            <div className="p-3 rounded-lg bg-black/20 backdrop-blur-sm">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-sm text-gray-300">Improved Lap</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-sm text-gray-300">Slower Lap</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#5382ec]" />
                                        <span className="text-sm text-gray-300">Pit Lap</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <span className="text-sm text-gray-300">Safety Car</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default F1LapAnalysis;