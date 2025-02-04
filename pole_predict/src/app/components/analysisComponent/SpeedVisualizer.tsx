'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Loader2, AlertTriangle } from 'lucide-react';

interface LapData {
    driver_number: number;
    lap_number: number;
    st_speed: number;
}

interface Driver {
    driver_number: number;
    name_acronym: string;
    team_colour: string;
}

interface DriverSpeedData {
    [key: number]: {
        acronym: string;
        teamColor: string;
        averageSpeed: number;
        totalLaps: number;
        speeds: number[];
    };
}

const LoadingCard = ({ progress }: { progress: { laps: boolean; drivers: boolean } }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 h-48">
        <CardContent className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
            <div className="text-white flex flex-col items-center gap-2">
                <div>Loading speed data...</div>
                <div className="text-sm text-gray-400">
                    {!progress.laps && "Fetching lap times..."}
                    {progress.laps && !progress.drivers && "Fetching driver info..."}
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


// Fonction utilitaire pour retry les appels API
const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant de réessayer
            console.log(`Retry attempt ${retries} for ${url}`);
        }
    }
};

const SpeedVisualizer = ({ sessionKey, lap }: { sessionKey: number, lap: number | null}) => {
    const [driverData, setDriverData] = useState<DriverSpeedData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maxAverageSpeed, setMaxAverageSpeed] = useState(0);
    const [minAverageSpeed, setMinAverageSpeed] = useState(0);
    const [totalSessionLaps, setTotalSessionLaps] = useState(0);
    const [dataFetchProgress, setDataFetchProgress] = useState({ 
        laps: false, 
        drivers: false 
    });

    useEffect(() => {
        const fetchAllData = async () => {
            if (!sessionKey) {
                setError("No session key provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setDataFetchProgress({ laps: false, drivers: false });

                // Fetch laps data
                const url = lap
                    ? `https://api.openf1.org/v1/laps?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;
                
                const lapsData: LapData[] = await fetchWithRetry(url);
                setDataFetchProgress(prev => ({ ...prev, laps: true }));

                // Validate laps data
                if (!Array.isArray(lapsData)) {
                    throw new Error('Invalid laps data format received');
                }

                // Fetch drivers data
                const url2 = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
                const driversData: Driver[] = await fetchWithRetry(url2);
                setDataFetchProgress(prev => ({ ...prev, drivers: true }));

                // Validate drivers data
                if (!Array.isArray(driversData)) {
                    throw new Error('Invalid drivers data format received');
                }

                const driverMap = new Map(
                    driversData.filter(driver => driver?.driver_number && driver?.name_acronym).map(driver => [
                        driver.driver_number,
                        {
                            acronym: driver.name_acronym,
                            teamColor: driver.team_colour || 'FFFFFF'
                        }
                    ])
                );

                const processedData: DriverSpeedData = {};
                const sessionLapNumbers = new Set<number>();

                // First pass: Track all valid laps and count total laps per driver
                lapsData.forEach(lap => {
                    if (!lap?.lap_number || !lap?.driver_number) return;
                    
                    sessionLapNumbers.add(lap.lap_number);

                    if (!processedData[lap.driver_number]) {
                        const driverInfo = driverMap.get(lap.driver_number);
                        if (!driverInfo) return;

                        processedData[lap.driver_number] = {
                            acronym: driverInfo.acronym,
                            teamColor: driverInfo.teamColor,
                            averageSpeed: 0,
                            totalLaps: 0,
                            speeds: []
                        };
                    }
                    processedData[lap.driver_number].totalLaps++;
                });

                // Second pass: Collect valid speed data
                lapsData.forEach(lap => {
                    if (lap?.st_speed && !isNaN(lap.st_speed) && lap?.driver_number) {
                        processedData[lap.driver_number]?.speeds.push(lap.st_speed);
                    }
                });

                // Calculate total laps in session
                const maxLap = Math.max(...Array.from(sessionLapNumbers));
                setTotalSessionLaps(maxLap);

                if (maxLap === 0) {
                    throw new Error('No valid lap data found');
                }

                // Filter drivers who completed most laps (allowing for 2 laps margin)
                const validDrivers = Object.entries(processedData)
                    .filter(([, data]) => data.totalLaps > maxLap-2 && data.speeds.length > 0);

                if (validDrivers.length === 0) {
                    throw new Error('No drivers with complete data found');
                }

                // Calculate averages for valid drivers
                validDrivers.forEach(([, data]) => {
                    const validSpeeds = data.speeds.filter(speed => !isNaN(speed));
                    if (validSpeeds.length === 0) return;
                    
                    data.averageSpeed = Number(
                        (validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length).toFixed(1)
                    );
                });

                // Calculate speed boundaries
                const averages = validDrivers.map(([, data]) => data.averageSpeed).filter(speed => !isNaN(speed));
                if (averages.length === 0) {
                    throw new Error('No valid speed data found');
                }

                setMaxAverageSpeed(Math.max(...averages));
                setMinAverageSpeed(Math.min(...averages));

                // Create filtered dataset
                const filteredData = validDrivers.reduce((acc, [num, data]) => {
                    if (data.averageSpeed > 0) {
                        acc[Number(num)] = data;
                    }
                    return acc;
                }, {} as DriverSpeedData);

                setDriverData(filteredData);
                setLoading(false);
                setError(null);

            } catch (err) {
                console.error('Error in fetchAllData:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                setLoading(false);
            }
        };

        fetchAllData();
    }, [lap, sessionKey]);

    const calculateWidth = (speed: number) => {
        if (!speed || isNaN(speed)) return 0;
        if (maxAverageSpeed === minAverageSpeed) return 100;
        return ((speed - minAverageSpeed) / (maxAverageSpeed - minAverageSpeed)) * 85 + 15;
    };

    const sortedDrivers = Object.entries(driverData)
        .filter(([, data]) => data.averageSpeed > 0)
        .sort(([, a], [, b]) => b.averageSpeed - a.averageSpeed);

    const rowHeight = 38;
    const scrollAreaHeight = Math.min(10 * rowHeight, sortedDrivers.length * rowHeight);

    if (!sessionKey) return <ErrorCard error="No session key provided" />;
    if (loading) return <LoadingCard progress={dataFetchProgress} />;
    if (error) return <ErrorCard error={error} />;

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[570px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Speed Analysis
                    </CardTitle>
                    <Gauge className="h-5 w-5 text-[#5382ec]" />
                </div>
                <div className="mt-2 text-sm text-gray-400 flex items-center justify-between px-2">
                    <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]" />
                        <span>Min: {minAverageSpeed} km/h</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span>Max: {maxAverageSpeed} km/h</span>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5382ec]" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative h-[490px]">
                <div className="h-full overflow-y-auto pr-6 scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-[#5382ec]/80 hover:scrollbar-thumb-[#2dd4bf]/80 transition-all duration-200 ease-out">
                    <motion.div 
                        className="pr-2 space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { 
                                    staggerChildren: 0.05, 
                                    delayChildren: 0.1 
                                }
                            }
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedDrivers.map(([driverNumber, data], index) => {
                                const width = calculateWidth(data.averageSpeed);
                                
                                return (
                                    <motion.div
                                        key={driverNumber}
                                        className="px-3 py-3 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
                                        variants={{
                                            hidden: { opacity: 0, y: 20, scale: 0.95 },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 200,
                                                    damping: 20
                                                }
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`text-lg font-bold ${
                                                index === 0 
                                                    ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent' 
                                                    : 'text-gray-400'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <span 
                                                className="font-medium"
                                                style={{ color: `#${data.teamColor}` }}
                                            >
                                                {data.acronym}
                                            </span>
                                            
                                            <div className="flex-1 relative h-6">
                                                <motion.div
                                                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] opacity-20"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                <motion.div
                                                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${width}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                />
                                            </div>
                                            
                                            <span className="text-sm font-medium text-gray-200">
                                                {data.averageSpeed} km/h
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SpeedVisualizer;