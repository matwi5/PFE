'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown_multiple from "./component/CustomDropdown_multiple";
import CustomDropdown_single, { DropdownOption } from "./component/CustomDropdown_single";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Timer, ChevronDown, AlertTriangle } from "lucide-react";

interface F1GapAnalysisProps {
    sessionKey: number;
    lap: number | null;
}

interface GapData {
    lap_number: number;
    gap_to_leader: number;
    driver_number: number;
    date: string
}

interface DriverData {
    [driverNumber: number]: {
        name_acronym: string;
        team_colour: string;
    }
}

interface LapData {
    meeting_key: number;
    session_key: number;
    driver_number: number;
    date_start: string | null;
    lap_duration: number | null;
    duration_sector_1: number | null;
    duration_sector_2: number | null;
    duration_sector_3: number | null;
    lap_number: number;
}

const LoadingCard = ({ loadingStatus }: { loadingStatus: { drivers: boolean; laps: boolean; gaps: boolean } }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 h-[calc(100vh-4rem)]">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
            <div className="text-white flex flex-col items-center gap-2">
                <div>Loading gap analysis data...</div>
                <div className="text-sm text-gray-400">
                    {!loadingStatus.drivers && "Fetching drivers..."}
                    {loadingStatus.drivers && !loadingStatus.laps && "Fetching lap data..."}
                    {loadingStatus.laps && !loadingStatus.gaps && "Fetching gap data..."}
                </div>
            </div>
        </CardContent>
    </Card>
);

const ErrorCard = ({ error }: { error: string }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 h-[calc(100vh-4rem)]">
        <CardContent className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="text-red-400">{error}</div>
            </div>
        </CardContent>
    </Card>
);


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
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const fetchDriversData = async (sessionKey: number): Promise<DriverData> => {
    try {
        const url = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
        const drivers = await fetchWithRetry(url);
        const driverDataMap: DriverData = {};
        
        drivers.forEach(driver => {
            if (driver?.driver_number) {
                driverDataMap[driver.driver_number] = {
                    name_acronym: driver.name_acronym || `Driver ${driver.driver_number}`,
                    team_colour: driver.team_colour || 'FFFFFF'
                };
            }
        });
        
        return driverDataMap;
    } catch (error) {
        console.error('Error fetching driver data:', error);
        throw error;
    }
};

const fetchLapData = async (sessionKey: number, lap: number | null): Promise<LapData[]> => {
    try {
        let url = `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;
        if (lap) {
            url += `&lap_number<=${lap}`;
        }
        return await fetchWithRetry(url);
    } catch (error) {
        console.error("Error fetching lap data:", error);
        throw error;
    }
};

const fetchGapData = async (sessionKey: number): Promise<GapData[]> => {
    try {
        const url = `https://api.openf1.org/v1/intervals?session_key=${sessionKey}`;
        return await fetchWithRetry(url);
    } catch (error) {
        console.error("Error fetching gap data:", error);
        throw error;
    }
};

const F1GapAnalysis: React.FC<F1GapAnalysisProps> = ({ sessionKey, lap }) => {
    const [driverData, setDriverData] = useState<DriverData>({});
    const [lapData, setLapData] = useState<LapData[]>([]);
    const [gapData, setGapData] = useState<GapData[]>([]);
    const [selectedMode, setSelectedMode] = useState<DropdownOption | null>(null);
    const [referenceDriver, setReferenceDriver] = useState<DropdownOption | null>(null);
    const [selectedDrivers, setSelectedDrivers] = useState<DropdownOption[]>([]);
    const [chartData, setChartData] = useState<[]>([]);
    const [driverOptions, setDriverOptions] = useState<DropdownOption[]>([]);
    const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 10]);
    const [showDots, setShowDots] = useState(false);
    const [minLapInput, setMinLapInput] = useState('2');
    const [maxLapInput, setMaxLapInput] = useState('Infinity');
    const [showLapInputs, setShowLapInputs] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dataLoadingStatus, setDataLoadingStatus] = useState({
        drivers: false,
        laps: false,
        gaps: false
    });

    const modeOptions: DropdownOption[] = [
        { label: "Gap to Leader", value: "gapToLeader" },
        { label: "Interval", value: "interval" },
    ];

    useEffect(() => {
        const loadAllData = async () => {
            if (!sessionKey) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Charger les données des pilotes
                setDataLoadingStatus(prev => ({ ...prev, drivers: true }));
                const driversData = await fetchDriversData(sessionKey);
                setDriverData(driversData);
                setDataLoadingStatus(prev => ({ ...prev, drivers: false }));
                
                const options = Object.entries(driversData)
                    .filter(([driverNumber]) => driverNumber) // Filter out invalid driver numbers
                    .map(([driverNumber, driverInfo]) => ({
                        value: driverNumber,
                        label: driverInfo.name_acronym
                    }));
                setDriverOptions(options);

                // Charger les données des tours
                setDataLoadingStatus(prev => ({ ...prev, laps: true }));
                const lapsData = await fetchLapData(sessionKey, lap);
                setLapData(lapsData);
                setDataLoadingStatus(prev => ({ ...prev, laps: false }));

                // Charger les données des écarts
                setDataLoadingStatus(prev => ({ ...prev, gaps: true }));
                const gapsData = await fetchGapData(sessionKey);
                setGapData(gapsData);
                setDataLoadingStatus(prev => ({ ...prev, gaps: false }));

                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                setLoading(false);
            }
        };

        loadAllData();
    }, [sessionKey, lap]);

    useEffect(() => {
        if (selectedMode && gapData.length > 0 && lapData.length > 0 && driverData) {
            try {
                const minLap = minLapInput === '' ? 1 : Math.max(1, parseInt(minLapInput, 10));
                const maxLap = maxLapInput === '' || maxLapInput === 'Infinity'
                    ? Infinity
                    : Math.max(minLap, parseInt(maxLapInput, 10));

                if (selectedMode.value === 'gapToLeader' && referenceDriver?.value) {
                    const driverNumber = parseInt(referenceDriver.value as string, 10);
                    const processedData = prepareGapToLeaderData(gapData, lapData, driverNumber)
                        .filter(item => item.lap_number >= minLap && item.lap_number <= maxLap);
                    setChartData(processedData);

                    const gaps = processedData.map(item => item.gap);
                    const minGap = Math.min(...gaps, 0);
                    const maxGap = Math.max(...gaps, 5);
                    setYAxisDomain([minGap, maxGap]);

                } else if (selectedMode.value === 'interval' && selectedDrivers.length === 2) {
                    const driver1Number = parseInt(selectedDrivers[0].value as string, 10);
                    const driver2Number = parseInt(selectedDrivers[1].value as string, 10);
                    const processedData = prepareIntervalData(gapData, lapData, driver1Number, driver2Number)
                        .filter(item => item.lap_number >= minLap && item.lap_number <= maxLap);

                    const intervals = processedData.map(item => item.interval);
                    const minInterval = Math.min(...intervals, -5);
                    const maxInterval = Math.max(...intervals, 5);
                    setYAxisDomain([minInterval, maxInterval]);
                    setChartData(processedData);
                } else {
                    setChartData([]);
                }
            } catch (error) {
                console.error('Error processing data:', error);
                setError('Error processing data');
            }
        } else {
            setChartData([]);
        }
    }, [
        selectedMode,
        referenceDriver,
        selectedDrivers,
        gapData,
        lapData,
        driverData,
        minLapInput,
        maxLapInput
    ]);

    useEffect(() => {
        setReferenceDriver(null);
        setSelectedDrivers([]);
    }, [selectedMode]);

    const prepareGapToLeaderData = (gapData: GapData[], lapData: LapData[], driverNumber: number) => {
        const driverGapData = gapData.filter(item => item?.driver_number === driverNumber);
        const processedData: any[] = [];

        lapData.forEach(lapItem => {
            if (!lapItem?.date_start) return;

            const lapStartDate = new Date(lapItem.date_start);
            const closestGapItem = driverGapData.reduce((closest, current) => {
                if (!current?.date) return closest;
                
                const currentDate = new Date(current.date);
                const closestDate = closest ? new Date(closest.date) : null;
                const currentTimeDiff = Math.abs(lapStartDate.getTime() - currentDate.getTime());
                const closestTimeDiff = closestDate
                    ? Math.abs(lapStartDate.getTime() - closestDate.getTime())
                    : Infinity;

                return currentTimeDiff < closestTimeDiff ? current : closest;
            }, null as GapData | null);

            if (closestGapItem && !isNaN(closestGapItem.gap_to_leader)) {
                const existingEntryIndex = processedData.findIndex(
                    entry => entry.lap_number === lapItem.lap_number
                );

                if (existingEntryIndex === -1) {
                    processedData.push({
                        lap_number: lapItem.lap_number,
                        gap: closestGapItem.gap_to_leader,
                    });
                }
            }
        });

        return processedData.sort((a, b) => a.lap_number - b.lap_number);
    };

    const prepareIntervalData = (gapData: GapData[], lapData: LapData[], driver1Number: number, driver2Number: number) => {
        const driver1GapData = gapData.filter(item => item?.driver_number === driver1Number);
        const driver2GapData = gapData.filter(item => item?.driver_number === driver2Number);
        const intervalData: any[] = [];

        lapData.forEach(lapItem => {
            if (!lapItem?.date_start) return;
            const lapStartDate = new Date(lapItem.date_start);

            const closestGap1Item = driver1GapData.reduce((closest, current) => {
                if (!current?.date) return closest;
                
                const currentDate = new Date(current.date);
                const closestDate = closest ? new Date(closest.date) : null;
                const currentTimeDiff = Math.abs(lapStartDate.getTime() - currentDate.getTime());
                const closestTimeDiff = closestDate
                    ? Math.abs(lapStartDate.getTime() - closestDate.getTime())
                    : Infinity;

                return currentTimeDiff < closestTimeDiff ? current : closest;
            }, null as GapData | null);

            const closestGap2Item = driver2GapData.reduce((closest, current) => {
                if (!current?.date) return closest;
                
                const currentDate = new Date(current.date);
                const closestDate = closest ? new Date(closest.date) : null;
                const currentTimeDiff = Math.abs(lapStartDate.getTime() - currentDate.getTime());
                const closestTimeDiff = closestDate
                    ? Math.abs(lapStartDate.getTime() - closestDate.getTime())
                    : Infinity;

                return currentTimeDiff < closestTimeDiff ? current : closest;
            }, null as GapData | null);

            if (closestGap1Item && closestGap2Item &&
                !isNaN(closestGap1Item.gap_to_leader) && 
                !isNaN(closestGap2Item.gap_to_leader)) {
                
                const existingEntryIndex = intervalData.findIndex(
                    entry => entry.lap_number === lapItem.lap_number
                );

                if (existingEntryIndex === -1) {
                    intervalData.push({
                        lap_number: lapItem.lap_number,
                        interval: closestGap1Item.gap_to_leader - closestGap2Item.gap_to_leader,
                        driver1Gap: closestGap1Item.gap_to_leader,
                        driver2Gap: closestGap2Item.gap_to_leader
                    });
                }
            }
        });

        return intervalData.sort((a, b) => a.lap_number - b.lap_number);
    };

    const getDriverName = (driverNumber: number | string) => {
        const driverNum = typeof driverNumber === 'string' ? parseInt(driverNumber, 10) : driverNumber;
        return driverData[driverNum]?.name_acronym || `Driver ${driverNumber}`;
    };

    const renderTooltipContent = (o: any) => {
        if (o?.payload?.[0]?.payload) {
            const data = o.payload[0].payload;
            return (
                <div className="p-2 bg-gray-800 text-white rounded-md shadow-md">
                    <p className="font-bold">{`Lap ${data.lap_number}`}</p>
                    {selectedMode?.value === 'gapToLeader' && (
                        <p>{`Gap to Leader: ${data.gap.toFixed(3)}s`}</p>
                    )}
                    {selectedMode?.value === 'interval' && (
                        <p>{`Interval: ${data.interval.toFixed(3)}s`}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    const gradientTextStyle = {
        background: 'linear-gradient(90deg, #5382ec 0%, #d56676 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold'
    };

    if (loading) {
        return <LoadingCard loadingStatus={dataLoadingStatus} />;
    }

    if (!sessionKey) {
        return <ErrorCard error="Please provide a valid session key" />;
    }

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[73vh]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Gap Analysis
                    </CardTitle>
                    <Timer className="h-5 w-5 text-[#5382ec]" />
                </div>

                <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex flex-wrap gap-4 relative z-50">
                        <div className="flex-1 min-w-[200px]">
                            <CustomDropdown_single
                                options={modeOptions}
                                selectedGroup={selectedMode}
                                onChange={setSelectedMode}
                                placeholder="Select Analysis Mode"
                                backgroundColor="#1a1b1e"
                                textColor="#ffffff"
                            />
                        </div>

                        {selectedMode?.value === 'gapToLeader' && (
                            <div className="flex-1 min-w-[200px]">
                                <CustomDropdown_single
                                    options={driverOptions}
                                    selectedGroup={referenceDriver}
                                    onChange={setReferenceDriver}
                                    placeholder="Select Reference Driver"
                                    backgroundColor="#1a1b1e"
                                    textColor="#ffffff"
                                />
                            </div>
                        )}

                        {selectedMode?.value === 'interval' && (
                            <div className="flex-1 min-w-[200px]">
                                <CustomDropdown_multiple
                                    options={driverOptions}
                                    selectedGroups={selectedDrivers}
                                    onChange={setSelectedDrivers}
                                    placeHolder="Select Two Drivers"
                                    maxSelections={2}
                                    backgroundColor="#1a1b1e"
                                    textColor="#ffffff"
                                />
                            </div>
                        )}
                    </div>

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
                </motion.div>
            </CardHeader>

            <CardContent className="relative h-[calc(100%-8rem)]">
                {!selectedMode || chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-center">
                            <p>Select analysis mode and drivers to view gap data</p>
                            <p className="text-sm mt-2 text-gray-500">The graph will be displayed here</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto pr-6 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 hover:scrollbar-thumb-[#2dd4bf]/80 transition-all duration-200 ease-out">
                        <div className="relative">
                            <div className="text-sm text-gray-400 text-center mt-2">
                                Lap Number
                            </div>

                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 10, right: 0, left: -30, bottom: 15 }}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="rgba(255,255,255,0.1)" 
                                    />
                                    <XAxis
                                        dataKey="lap_number"
                                        stroke="#ffffff50"
                                        tick={{ fill: '#ffffff80' }}
                                    />
                                    <YAxis
                                        stroke="#ffffff50"
                                        tick={{ fill: '#ffffff80' }}
                                        tickFormatter={(value) => value.toFixed()}
                                        domain={yAxisDomain}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload?.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="p-2 rounded-lg bg-black/80 backdrop-blur-sm border border-[#5382ec]/20">
                                                        <p className="text-[#5382ec]">Lap {data.lap_number}</p>
                                                        <p className="text-gray-300">
                                                            {selectedMode.value === 'gapToLeader'
                                                                ? `Gap: ${data.gap.toFixed(3)}s`
                                                                : `Interval: ${data.interval.toFixed(3)}s`
                                                            }
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    
                                    {selectedMode.value === 'gapToLeader' && referenceDriver && (
                                        <Line
                                            type="monotone"
                                            dataKey="gap"
                                            stroke={`#${driverData[parseInt(referenceDriver.value)]?.team_colour || 'FFFFFF'}`}
                                            strokeWidth={2}
                                            dot={showDots}
                                            activeDot={{ r: 6, fill: '#5382ec' }}
                                            name={getDriverName(referenceDriver.value)}
                                        />
                                    )}

                                    {selectedMode.value === 'interval' && selectedDrivers.length === 2 && (
                                        <Line
                                            type="monotone"
                                            dataKey="interval"
                                            stroke="#5382ec"
                                            strokeWidth={2}
                                            dot={showDots}
                                            activeDot={{ r: 6, fill: '#2dd4bf' }}
                                            name={`${getDriverName(selectedDrivers[0].value)} - ${getDriverName(selectedDrivers[1].value)}`}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-lg bg-red-900/20 border border-red-900 p-3 text-red-400">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default F1GapAnalysis;