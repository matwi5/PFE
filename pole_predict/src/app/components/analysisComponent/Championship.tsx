import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import CustomDropdown_single from "./component/CustomDropdown_single";
import { collection, getDocs } from 'firebase/firestore';
import {db} from "@/firebaseConfig";

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
    podium?: string[];
    year?: string;
    meeting_name?: string;
}

const racePointsScale = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPointsScale = [8, 7, 6, 5, 4, 3, 2, 1];

const ChampionshipWidget = ({ podium, year: propYear, meeting_name: propMeeting }: ChampionshipWidgetProps) => {
    const [selectedYear, setSelectedYear] = useState<string | null>(propYear || null);
    const [selectedMeeting, setSelectedMeeting] = useState<string | null>(propMeeting || null);
    const [meetingsData, setMeetingsData] = useState<MeetingData[]>([]);
    const [championshipData, setChampionshipData] = useState<ChampionshipData[]>([]);
    const [driversMap, setDriversMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maxPoints, setMaxPoints] = useState(0);
    const [minPoints, setMinPoints] = useState(0);
    const [driversData, setDriversData] = useState<DriverData[]>([]);

    // Fetch drivers and meetings data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [driversSnapshot, meetingsSnapshot] = await Promise.all([
                    getDocs(collection(firestore, 'drivers')),
                    getDocs(collection(firestore, 'meetings')),
                ]);

                const driversMapping: Record<string, string> = {};
                const newDriversData: DriverData[] = [];
                driversSnapshot.forEach(doc => {
                    const data = doc.data() as DriverData;
                    driversMapping[data.last_name] = data.broadcast_name;
                    newDriversData.push(data);
                });
                setDriversMap(driversMapping);
                setDriversData(newDriversData);

                const meetings = meetingsSnapshot.docs.map(doc => doc.data() as MeetingData);
                //setMeetingsData(meetings);
                setLoading(false);
                return meetings;
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
            }
        };

        fetchData().then(setMeetingsData);
    }, []);

    // Calculate championship data when selectedYear or selectedMeeting changes
    useEffect(() => {
        if (!selectedYear || !selectedMeeting || !driversData.length) return;

        const calculateChampionshipData = () => {
            const pointsMap: Record<string, number> = {};

            driversData.forEach(driver => {
                if (driver && driver.last_name) {
                    pointsMap[driver.last_name] = -1;
                }
            });

            const meetingsForYear = meetingsData
                .filter(meeting => meeting.year.toString() === selectedYear.toString())
                .sort((a, b) => parseInt(a.meeting_key) - parseInt(b.meeting_key));

            const selectedMeetingData = meetingsForYear.find(meeting => meeting.meeting_name === selectedMeeting);

            if (!selectedMeetingData) {
                setError('Selected meeting not found');
                return;
            }

            for (const meeting of meetingsForYear) {
                if (Array.isArray(meeting.podium)) {
                    meeting.podium.forEach((driver: string, index: number) => {
                        if (pointsMap[driver] < 0)
                            pointsMap[driver] = 0;
                        if (index < 10) {
                            const pointsToAdd = racePointsScale[index] || 0;
                            pointsMap[driver] = (pointsMap[driver] || 0) + pointsToAdd;
                        }
                    });
                }

                if (Array.isArray(meeting.podium_sprint)) {
                    meeting.podium_sprint.forEach((driver: string, index: number) => {
                        if (index < 8) {
                            const pointsToAdd = sprintPointsScale[index] || 0;
                            pointsMap[driver] = (pointsMap[driver] || 0) + pointsToAdd;
                        }
                    });
                }

                if (meeting.meeting_key === selectedMeetingData.meeting_key) {
                    break;
                }
            }

            // Add points based on the provided podium
            if (podium) {
                podium.forEach((driver: string, index: number) => {
                    if (pointsMap[driver] < 0)
                        pointsMap[driver] = 0;
                    if (index < 10) {
                        const pointsToAdd = racePointsScale[index] || 0;
                        pointsMap[driver] = (pointsMap[driver] || 0) + pointsToAdd;
                    }
                });
            }

            const tempData = Object.entries(pointsMap)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, points]) => points > -1)
                .map(([lastName, points]) => ({
                    lastName,
                    points,
                    broadcastName: driversMap[lastName] || lastName
                }))
                .sort((a, b) => b.points - a.points);

            const pointsValues = tempData.map(d => d.points);
            setMaxPoints(Math.max(...pointsValues));
            setMinPoints(Math.min(...pointsValues));
            setChampionshipData(tempData);
        };

        calculateChampionshipData();
    }, [selectedYear, selectedMeeting, meetingsData, driversMap, driversData, podium]);

    // Reset selected meeting and championship data when year changes
    useEffect(() => {
        if (!propYear) {
            setSelectedMeeting(null);
            setChampionshipData([]);
            setError(null);
        }
    }, [selectedYear, propYear]);

    // Memoize meeting options to avoid recalculating on every render
    const meetingOptions = useMemo(() => {
        return meetingsData
            .filter(meeting => meeting.year.toString() === selectedYear)
            .map(meeting => ({
                label: meeting.meeting_name,
                value: meeting.meeting_name
            }));
    }, [meetingsData, selectedYear]);

    const selectedMeetingName = meetingsData.find(meeting => meeting.meeting_name === selectedMeeting)?.meeting_name || 'Select Meeting';

    const calculateWidth = (points: number) => {
        if (maxPoints === minPoints) return 100;
        return ((points - minPoints) / (maxPoints - minPoints)) * 85 + 1;
    };

    const rowHeight = 38;
    const visibleDrivers = 10;

    if (loading) return <div className="p-4 text-white">Loading championship data...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <Card className="w-full max-w-screen-sm bg-black text-white">
            <CardHeader className="pb-2">
                <CardTitle className="gradient-text">Championship Standings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    {!propYear && (
                        <CustomDropdown_single
                            options={[
                                { label: '2023', value: '2023' },
                                { label: '2024', value: '2024' }
                            ]}
                            selectedGroup={{ label: selectedYear || 'Select Year', value: selectedYear || '' }}
                            onChange={(selected) => selected && setSelectedYear(selected.value)}
                            backgroundColor="#000000"
                            textColor="#FFFFFF"
                            placeholder="Select a year..."
                        />
                    )}
                    {!propMeeting && (
                        <CustomDropdown_single
                            options={meetingOptions}
                            selectedGroup={{ label: selectedMeetingName, value: selectedMeeting || '' }}
                            onChange={(selected) => selected && setSelectedMeeting(selected.value)}
                            backgroundColor="#000000"
                            textColor="#FFFFFF"
                            placeholder="Select a meeting..."
                        />
                    )}
                </div>
            </CardContent>
            {selectedYear && selectedMeeting && (
                <CardContent className="space-y-4">
                    <div
                        className="overflow-y-auto pr-2 custom-scrollbar"
                        style={{ height: `${visibleDrivers * rowHeight}px` }}
                    >
                        {championshipData.map((driver, index) => {
                            const driverInfo = driversData.find(d => d.last_name === driver.lastName);
                            return (
                                <div key={driver.lastName} className="flex items-center gap-2 h-10 mb-2">
                                    <div className="w-20 flex items-center">
                                        <span className="mr-2 text-gray-400 w-6 text-right">
                                            {index + 1}.
                                        </span>
                                        <span
                                            className="font-bold truncate"
                                            style={{ color: driverInfo?.team_colour || '#FFFFFF' }}
                                        >
                                            {driver.broadcastName}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex items-center">
                                        {driver.points > 0 && (
                                            <motion.div
                                                className="h-6 rounded-lg bg-yellow-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${calculateWidth(driver.points)}%` }}
                                                transition={{ duration: 2 }}
                                            />
                                        )}
                                        <span className="ml-2 text-m font-bold gradient-text">
                                            {driver.points} pts
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-2 border-t border-gray-800 text-sm text-center gradient-text">
                        <span className="gradient-text">Points scale: </span>
                        {minPoints} pts (min) → {maxPoints} pts (max)
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ChampionshipWidget; 

/**
 * <ChampionshipWidget year="2023" meeting_name="Bahrain Grand Prix"/>
 * <ChampionshipWidget year={selectedYear} meeting_name={selectedMeetingName} />
 */