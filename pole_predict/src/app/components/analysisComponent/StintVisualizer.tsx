'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Loader2, AlertTriangle, Activity } from 'lucide-react';

interface Stint {
    compound: string;
    driver_number: number;
    lap_start: number;
    lap_end: number;
    stint_number: number;
}

interface Driver {
    driver_number: number;
    name_acronym: string;
    team_colour: string;
}

interface Position {
    position: number;
    driver_number: number;
    date: string;
}

interface StintVisualizerProps {
    sessionKey: number;
    lap: number;
}

interface DriverStints {
    [key: number]: {
        stints: Stint[];
        acronym: string;
        finalPosition: number;
        teamColor: string;
        totalLaps: number;
    };
}

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
};

const compoundColors: Record<string, string> = {
    SOFT: 'bg-gradient-to-r from-red-500 to-red-600',
    MEDIUM: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    HARD: 'bg-gradient-to-r from-gray-200 to-gray-300',
    INTERMEDIATE: 'bg-gradient-to-r from-green-500 to-green-600',
    WET: 'bg-gradient-to-r from-[#5382ec] to-[#436cbf]',
};

const tyreImages: Record<string, string> = {
    SOFT: '/images/tyre/soft.png',
    MEDIUM: '/images/tyre/medium.png',
    HARD: '/images/tyre/hard.png',
    INTERMEDIATE: '/images/tyre/intermediate.png',
    WET: '/images/tyre/wet.png',
};

const fetchWithRetry = async (url: string, maxRetries = 5): Promise<any> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data) throw new Error('No data received');
            return data;
        } catch (error) {
            retries++;
            if (retries === maxRetries) throw error;
            console.log(`Retry attempt ${retries} for ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

const TyreCompoundsLegend = () => {
    const compounds = [
        { name: 'Soft', color: 'bg-gradient-to-r from-red-500 to-red-600' },
        { name: 'Medium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-500' },
        { name: 'Hard', color: 'bg-gradient-to-r from-gray-200 to-gray-300' },
        { name: 'Inter', color: 'bg-gradient-to-r from-green-500 to-green-600' },
        { name: 'Wet', color: 'bg-gradient-to-r from-blue-500 to-blue-600' }
    ];

    return (
        <div className="flex flex-col w-full space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-center">
            <div className="grid grid-cols-3 gap-2 md:flex md:flex-row md:gap-2">
                {compounds.map(({ name, color }) => (
                    <div
                        key={name}
                        className="flex items-center justify-center p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-all duration-200"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg`} />
                            <span className="text-xs font-medium text-gray-200">
                                {name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LoadingState = () => {
    const LoadingProgress = () => {
        const [loadingPhase, setLoadingPhase] = useState(0);
        
        useEffect(() => {
            const phases = ['Fetching stints...', 'Loading driver info...', 'Getting positions...'];
            let currentPhase = 0;
            
            const interval = setInterval(() => {
                currentPhase = (currentPhase + 1) % phases.length;
                setLoadingPhase(currentPhase);
            }, 2000);
            
            return () => clearInterval(interval);
        }, []);
        
        const phases = ['Fetching stints...', 'Loading driver info...', 'Getting positions...'];
        return <span>{phases[loadingPhase]}</span>;
    };

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[600px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Race Stint Analysis
                    </CardTitle>
                    <Activity className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
                    <div className="text-gray-400">Loading race stint data...</div>
                    <div className="text-sm text-gray-500">
                        <LoadingProgress />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ErrorState = ({ error }: { error: string }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[600px]">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                    Race Stint Analysis
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[500px]">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="text-red-400">{error}</div>
            </div>
        </CardContent>
    </Card>
);

const StintVisualizer = ({ sessionKey, lap }: StintVisualizerProps) => {
    const isMobile = useIsMobile();
    const [driverStints, setDriverStints] = useState<DriverStints>({});
    const [maxLaps, setMaxLaps] = useState(70);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!sessionKey) {
                setError("No session key provided");
                setIsInitialLoad(false);
                return;
            }

            try {
                if (!isInitialLoad) {
                    setIsRefreshing(true);
                }

                const stintsUrl = lap
                    ? `https://api.openf1.org/v1/stints?session_key=${sessionKey}&lap_end<=${lap}`
                    : `https://api.openf1.org/v1/stints?session_key=${sessionKey}`;
                const driversUrl = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
                const positionsUrl = `https://api.openf1.org/v1/position?session_key=${sessionKey}`;

                const [stintsData, driversData, positionsData] = await Promise.all([
                    fetchWithRetry(stintsUrl),
                    fetchWithRetry(driversUrl),
                    fetchWithRetry(positionsUrl)
                ]);

                if (!Array.isArray(stintsData) || stintsData.length === 0) {
                    throw new Error('No valid stints data found');
                }

                if (!Array.isArray(driversData)) {
                    throw new Error('Invalid drivers data format');
                }

                if (!Array.isArray(positionsData)) {
                    throw new Error('Invalid positions data format');
                }

                const finalPositions = positionsData.reduce((acc: Map<number, Position>, pos) => {
                    if (!pos?.driver_number || !pos?.date) return acc;

                    const existing = acc.get(pos.driver_number);
                    if (!existing || new Date(pos.date) > new Date(existing.date)) {
                        acc.set(pos.driver_number, pos);
                    }
                    return acc;
                }, new Map());

                const driverMap = new Map(
                    driversData
                        .filter(driver => driver?.driver_number && driver?.name_acronym)
                        .map(driver => [
                            driver.driver_number,
                            {
                                acronym: driver.name_acronym,
                                teamColor: driver.team_colour || 'FFFFFF'
                            }
                        ])
                );

                const stintsByDriver = stintsData.reduce((acc: DriverStints, stint) => {
                    if (!stint?.driver_number || !stint?.lap_start || !stint?.lap_end) return acc;

                    if (!acc[stint.driver_number]) {
                        const finalPos = finalPositions.get(stint.driver_number);
                        const driverInfo = driverMap.get(stint.driver_number);

                        acc[stint.driver_number] = {
                            stints: [],
                            acronym: driverInfo?.acronym || stint.driver_number.toString(),
                            teamColor: driverInfo?.teamColor || 'FFFFFF',
                            finalPosition: finalPos?.position || 999,
                            totalLaps: 0
                        };
                    }
                    acc[stint.driver_number].stints.push(stint);
                    return acc;
                }, {});

                Object.values(stintsByDriver).forEach(driver => {
                    const validStints = driver.stints.filter(stint =>
                        stint?.lap_end && !isNaN(stint.lap_end)
                    );
                    if (validStints.length > 0) {
                        driver.totalLaps = Math.max(...validStints.map(stint => stint.lap_end));
                    }
                });

                Object.values(stintsByDriver).forEach(driver => {
                    driver.stints.sort((a, b) => a.lap_start - b.lap_start);
                });

                setDriverStints(stintsByDriver);
                setMaxLaps(Math.max(...stintsData.map(stint => stint.lap_end || 0)));
                setError(null);
            } catch (err) {
                console.error('Error in fetchAllData:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsInitialLoad(false);
                setIsRefreshing(false);
            }
        };

        fetchAllData();
    }, [lap, sessionKey]);

    const sortedDrivers = Object.entries(driverStints)
        .filter(([, data]) => data.stints.length > 0)
        .sort(([, a], [, b]) => a.finalPosition - b.finalPosition);

    const calculateWidth = (start: number, end: number) => {
        if (!start || !end || isNaN(start) || isNaN(end) || end < start) return '0%';
        const width = ((end - start + 1) / maxLaps) * 100;
        return `${Math.max(width, 5)}%`;
    };

    if (!sessionKey) return <ErrorState error="No session key provided" />;
    if (isInitialLoad) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (sortedDrivers.length === 0) return <ErrorState error="No stint data available" />;

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[600px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Race Stint Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isRefreshing && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#5382ec]" />
                        )}
                        <Timer className="h-5 w-5 text-[#5382ec]" />
                    </div>
                </div>
                <TyreCompoundsLegend />
            </CardHeader>
            <CardContent className="relative h-[500px]">
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
                            {sortedDrivers.map(([driverNumber, { stints, acronym, finalPosition, teamColor, totalLaps }], driverIndex) => (
                                <motion.div
                                    key={driverNumber}
                                    className="px-3 pt-3 pb-6 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
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
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={`text-lg font-bold ${
                                            finalPosition === 1
                                                ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent'
                                                : 'text-gray-400'
                                        }`}>
                                            {finalPosition}
                                        </div>
                                        <div className="font-medium" style={{ color: `#${teamColor}` }}>
                                            {acronym}
                                        </div>
                                        <div className="ml-auto text-sm text-gray-400">
                                            {totalLaps} laps
                                        </div>
                                    </div>
    
                                    <div className="flex items-center gap-1 min-h-[2rem] relative w-full">
                                        {stints.map((stint, index) => {
                                            if (!stint?.compound || !stint?.lap_start || !stint?.lap_end) return null;
                                            const width = calculateWidth(stint.lap_start, stint.lap_end);
                                            const lapCount = stint.lap_end - stint.lap_start + 1;
    
                                            return (
                                                <motion.div
                                                    key={index}
                                                    className="h-8 relative group"
                                                    style={{ width }}
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                >
                                                    <div className={`h-full rounded-lg ${compoundColors[stint.compound]} flex items-center justify-center group-hover:brightness-110 transition-all`}>
                                                        <span className="text-xs font-bold text-black">
                                                            {lapCount}
                                                        </span>
                                                        <img
                                                            src={tyreImages[stint.compound]}
                                                            alt={stint.compound}
                                                            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6"
                                                        />
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute top-full left-0 mt-1 text-xs text-gray-400 whitespace-nowrap transition-opacity">
                                                        {stint.lap_start}-{stint.lap_end}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
};

export default StintVisualizer;