/* eslint-disable */
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/firebaseConfig";
import { Loader2, Trophy, AlertTriangle, Activity } from "lucide-react";

const firestore = db;

interface ChampionshipData {
    lastName: string;
    points: number;
    broadcastName: string;
}

interface DriverData {
    last_name: string;
    broadcast_name: string;
    team_colour: string;
}

interface MeetingData {
    meeting_key: string;
    meeting_name: string;
    year: string;
    podium: string[];
    podium_sprint?: string[];
}

interface ChampionshipWidgetProps {
    currentStandings?: { position: number, acronym: string }[];
    meeting_key: string;
}

const racePointsScale = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPointsScale = [8, 7, 6, 5, 4, 3, 2, 1];

const fetchWithRetry = async <T,>(
    fetchFn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
): Promise<T> => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetchFn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
            }
        }
    }
    throw lastError;
};

const handleFirestoreError = (error: any): string => {
    if (error?.code === 'permission-denied') {
        return 'Access to database denied. Please check your permissions.';
    }
    if (error?.code === 'unavailable') {
        return 'Database is currently unavailable. Please try again later.';
    }
    return error?.message || 'An unknown error occurred';
};

const LoadingState = () => {
    const [loadingPhase, setLoadingPhase] = useState(0);

    useEffect(() => {
        const phases = ['Fetching drivers information...', 'Loading race results...', 'Calculating standings...'];
        let currentPhase = 0;

        const interval = setInterval(() => {
            currentPhase = (currentPhase + 1) % phases.length;
            setLoadingPhase(currentPhase);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const phases = ['Fetching drivers information...', 'Loading race results...', 'Calculating standings...'];

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[750px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Championship Standings
                    </CardTitle>
                    <Activity className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[670px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
                    <div className="text-gray-400">Loading championship data...</div>
                    <div className="text-sm text-gray-500">
                        {phases[loadingPhase]}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ErrorState = ({ error }: { error: string }) => (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[750px]">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                    Championship Standings
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[670px]">
            <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="text-red-400">{error}</div>
            </div>
        </CardContent>
    </Card>
);

const ChampionshipWidget_Live = ({ currentStandings, meeting_key }: ChampionshipWidgetProps) => {
    // Data states
    const [championshipData, setChampionshipData] = useState<ChampionshipData[]>([]);
    const [driversMap, setDriversMap] = useState<Record<string, string>>({});
    const [maxPoints, setMaxPoints] = useState(0);
    const [minPoints, setMinPoints] = useState(0);
    const [driversData, setDriversData] = useState<DriverData[]>([]);
    const [meetingsData, setMeetingsData] = useState<MeetingData[]>([]);

    // Loading states
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
        if (!isInitialLoad) {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            // Fetch both drivers and meetings data in parallel
            const [driversSnapshot, meetingsSnapshot] = await Promise.all([
                fetchWithRetry(() => getDocs(collection(firestore, 'drivers'))),
                fetchWithRetry(() => getDocs(collection(firestore, 'meetings')))
            ]);

            // Process drivers data
            const driversMapping: Record<string, string> = {};
            const newDriversData: DriverData[] = [];

            driversSnapshot.forEach(doc => {
                const data = doc.data() as DriverData;
                if (data?.last_name && data?.broadcast_name) {
                    driversMapping[data.last_name] = data.broadcast_name;
                    newDriversData.push(data);
                }
            });

            // Ne mettre à jour les données que si nous avons reçu des données valides
            if (Object.keys(driversMapping).length > 0) {
                setDriversMap(driversMapping);
                setDriversData(newDriversData);
            }

            // Process meetings data
            const meetings = meetingsSnapshot.docs
                .map(doc => {
                    const data = doc.data() as MeetingData;
                    return data?.meeting_key ? data : null;
                })
                .filter((meeting): meeting is MeetingData => meeting !== null);

            if (meetings.length > 0) {
                setMeetingsData(meetings);
            }

            setError(null);
            setHasLoadedOnce(true);

        } catch (err) {
            console.error('Error fetching data:', err);
            if (!hasLoadedOnce) {
                // Seulement afficher l'erreur si nous n'avons jamais chargé de données avec succès
                setError(handleFirestoreError(err));
            }
        } finally {
            setIsInitialLoad(false);
            setIsRefreshing(false);
        }
    };

    fetchData();
}, [isInitialLoad]);

    // Calculate championship standings
    useEffect(() => {
        if (!driversData.length || !meetingsData.length) return;

        try {
            const calculateChampionshipData = () => {
                const pointsMap: Record<string, number> = {};

                // Initialize points map for all drivers
                driversData.forEach(driver => {
                    if (driver?.last_name) {
                        pointsMap[driver.last_name] = -1;
                    }
                });

                // Find the target meeting to get its year
                const targetMeeting = meetingsData.find(meeting =>
                    parseInt(meeting?.meeting_key as string) === parseInt(meeting_key)
                );

                if (!targetMeeting) {
                    setError('Meeting not found');
                    return;
                }

                // Filter meetings for the same year and sort by meeting_key
                const meetingsForYear = meetingsData
                    .filter(meeting => meeting?.year === targetMeeting.year)
                    .sort((a, b) => parseInt(a.meeting_key) - parseInt(b.meeting_key));

                // Calculate points up to the target meeting
                for (const meeting of meetingsForYear) {
                    if (parseInt(meeting.meeting_key) >= parseInt(meeting_key)) {
                        break;
                    }

                    // Process race points
                    if (Array.isArray(meeting.podium)) {
                        meeting.podium.forEach((driver: string, index: number) => {
                            if (!driver) return;
                            if (pointsMap[driver] === -1) pointsMap[driver] = 0;
                            if (index < racePointsScale.length) {
                                pointsMap[driver] = (pointsMap[driver] || 0) + racePointsScale[index];
                            }
                        });
                    }

                    // Process sprint points
                    if (Array.isArray(meeting.podium_sprint)) {
                        meeting.podium_sprint.forEach((driver: string, index: number) => {
                            if (!driver) return;
                            if (pointsMap[driver] === -1) pointsMap[driver] = 0;
                            if (index < sprintPointsScale.length) {
                                pointsMap[driver] = (pointsMap[driver] || 0) + sprintPointsScale[index];
                            }
                        });
                    }
                }

                // Add points for the current standings if provided
                if (currentStandings && currentStandings.length > 0) {
                    currentStandings.forEach((standing, index) => {
                        if (!standing?.acronym) return;

                        const driver = Object.entries(driversMap).find(([_, broadcastName]) =>
                            broadcastName === standing.acronym
                        )?.[0];

                        if (driver && index < racePointsScale.length) {
                            if (pointsMap[driver] === -1) pointsMap[driver] = 0;
                            pointsMap[driver] = (pointsMap[driver] || 0) + racePointsScale[index];
                        }
                    });
                }

                const tempData = Object.entries(pointsMap)
                    .filter(([_, points]) => points > -1)
                    .map(([lastName, points]) => ({
                        lastName,
                        points,
                        broadcastName: driversMap[lastName] || lastName
                    }))
                    .sort((a, b) => b.points - a.points);

                const pointsValues = tempData.map(d => d.points);
                setMaxPoints(Math.max(...pointsValues, 0));
                setMinPoints(Math.min(...pointsValues, 0));
                setChampionshipData(tempData);
            };

            calculateChampionshipData();
        } catch (err) {
            console.error('Error calculating championship data:', err);
            setError('Error calculating championship standings');
        }
    }, [meeting_key, currentStandings, driversData, driversMap, meetingsData]);

    const calculateWidth = (points: number) => {
        if (maxPoints === minPoints) return 100;
        return ((points - minPoints) / (maxPoints - minPoints)) * 85 + 1;
    };

    if (isInitialLoad) return <LoadingState />;
    if (error && !hasLoadedOnce) return <ErrorState error={error} />;
    if (!championshipData.length && !hasLoadedOnce) return <ErrorState error="No championship data available" />;

    return (
        <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300 ease-out h-[750px]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Championship Standings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isRefreshing && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#5382ec]" />
                        )}
                        <Trophy className="h-5 w-5 text-[#5382ec]" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative h-[700px]">
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
                            {championshipData.map((driver, index) => {
                                const driverInfo = driversData.find(d => d.last_name === driver.lastName);
                                if (!driverInfo) return null;
                                const isLeader = index === 0;

                                return (
                                    <motion.div
                                        key={driver.lastName}
                                        className="p-3 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
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
                                                isLeader
                                                    ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent'
                                                    : 'text-gray-400'
                                            }`}>
                                                {index + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span
                                                    className="font-medium"
                                                    style={{ color: driverInfo.team_colour?.startsWith('#')
                                                            ? driverInfo.team_colour
                                                            : `#${driverInfo.team_colour}` || '#FFFFFF' }}
                                                >
                                                {driver.broadcastName}
                                            </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <motion.div
                                                    className={`h-2 rounded-full ${
                                                        isLeader
                                                            ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]'
                                                            : 'bg-gray-600'
                                                    }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${calculateWidth(driver.points)}px` }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 100,
                                                        damping: 20,
                                                        delay: index * 0.1
                                                    }}
                                                />
                                                <span className={`min-w-[60px] text-right ${
                                                    isLeader
                                                        ? 'text-[#5382ec]'
                                                        : 'text-gray-300'
                                                }`}>
                                                    {driver.points} pts
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    <div className="mt-6 rounded-lg bg-black/20 p-4">
                        <div className="text-sm text-center space-y-2">
                            <div className="text-gray-400">Points Scale</div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">{minPoints} pts</span>
                                <div className="flex-1 h-1 mx-4 rounded-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]" />
                                <span className="text-[#5382ec]">{maxPoints} pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ChampionshipWidget_Live;