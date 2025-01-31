import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

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

const SpeedVisualizer = ({ sessionKey, lap }: { sessionKey: number, lap: number | null}) => {
    const [driverData, setDriverData] = useState<DriverSpeedData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [maxAverageSpeed, setMaxAverageSpeed] = useState(0);
    const [minAverageSpeed, setMinAverageSpeed] = useState(0);
    const [totalSessionLaps, setTotalSessionLaps] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const url = lap
                    ? `https://api.openf1.org/v1/laps?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;
                const lapsResponse = await fetch(url);
                const lapsData:LapData[] = await lapsResponse.json();

                const url2 = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`
                const driversResponse = await fetch(url2);
                const driversData: Driver[] = await driversResponse.json();

                const driverMap = new Map(
                    driversData.map(driver => [
                        driver.driver_number,
                        {
                            acronym: driver.name_acronym,
                            teamColor: driver.team_colour
                        }
                    ])
                );

                const processedData: DriverSpeedData = {};
                const sessionLapNumbers = new Set<number>();

                // First pass: Track all laps and count total laps per driver
                lapsData.forEach(lap => {
                    sessionLapNumbers.add(lap.lap_number);

                    if (!processedData[lap.driver_number]) {
                        const driverInfo = driverMap.get(lap.driver_number);
                        processedData[lap.driver_number] = {
                            acronym: driverInfo?.acronym || lap.driver_number.toString(),
                            teamColor: driverInfo?.teamColor || 'FFFFFF',
                            averageSpeed: 0,
                            totalLaps: 0,
                            speeds: []
                        };
                    }
                    processedData[lap.driver_number].totalLaps++;
                });

                // Second pass: Collect speed data
                lapsData.forEach(lap => {
                    if (lap.st_speed) {
                        processedData[lap.driver_number].speeds.push(lap.st_speed);
                    }
                });

                // Calculate total laps in session
                const maxLap = Math.max(...Array.from(sessionLapNumbers));
                setTotalSessionLaps(maxLap);

                // Filter drivers who completed all laps
                const validDrivers = Object.entries(processedData)
                    .filter(([, data]) => data.totalLaps > maxLap-2);

                // Calculate averages for valid drivers
                validDrivers.forEach(([, data]) => {
                    data.averageSpeed = Number(
                        (data.speeds.reduce((a, b) => a + b, 0) / data.speeds.length).toFixed(1)
                    );
                });

                // Calculate speed boundaries
                const averages = validDrivers.map(([, data]) => data.averageSpeed);
                setMaxAverageSpeed(Math.max(...averages));
                setMinAverageSpeed(Math.min(...averages));

                // Create filtered dataset
                const filteredData = validDrivers.reduce((acc, [num, data]) => {
                    acc[Number(num)] = data;
                    return acc;
                }, {} as DriverSpeedData);

                //setDriverData(filteredData);
                setLoading(false);
                return filteredData;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            }
        };

        fetchAllData().then(setDriverData);
    }, [lap, sessionKey]);

    const calculateWidth = (speed: number) => {
        if (maxAverageSpeed === minAverageSpeed) return 100;
        return ((speed - minAverageSpeed) / (maxAverageSpeed - minAverageSpeed)) * 85 + 15;
    };

    const sortedDrivers = Object.entries(driverData).sort(
        ([, a], [, b]) => b.averageSpeed - a.averageSpeed
    );

    const rowHeight = 38;
    const scrollAreaHeight = 10 * rowHeight;

    if (loading) return <div className="p-4 text-white">Loading speed data...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (sortedDrivers.length === 0) return <div className="p-4 text-white">No drivers completed all {totalSessionLaps} laps</div>;

    return (
        <Card className="w-full max-w-screen-sm bg-black text-white">
            <CardHeader className="pb-2">
                <CardTitle>Average Speed Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    className="overflow-y-auto pr-2 custom-scrollbar"
                    style={{ height: `${scrollAreaHeight}px`}}
                >
                    {sortedDrivers.map(([driverNumber, data], index) => {
                        const width = calculateWidth(data.averageSpeed);
                        return (
                            <div key={driverNumber} className="flex items-center gap-2 h-10 mb-2">
                                <div className="w-15 text-right font-bold shrink-0">
                                    <span className="mr-2 text-gray-400">{index + 1}.</span>
                                    <span style={{ color: `#${data.teamColor}` }}>{data.acronym}</span>
                                </div>

                                <div className="flex-1 flex items-center">
                                    <motion.div
                                        className="h-6 rounded-lg bg-yellow-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${width}%` }}
                                        transition={{ duration: 2 }}
                                    />
                                    <span className="ml-2 text-m font-bold gradient-text">
                                        {data.averageSpeed} km/h
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-2 border-t border-gray-800 text-sm text-center gradient-text">
                    <span className="gradient-text">Width scale: </span>
                    {minAverageSpeed} km/h (min) → {maxAverageSpeed} km/h (max)
                </div>
            </CardContent>
        </Card>
    );
};

export default SpeedVisualizer;

/**
 * <SpeedVisualizer sessionKey={raceSessionKey} lap={lap} />
 */