import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {motion} from 'framer-motion';

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

const compoundColors: Record<string, string> = {
    SOFT: 'bg-red-500',
    MEDIUM: 'bg-yellow-400',
    HARD: 'bg-white',
    INTERMEDIATE: 'bg-green-500',
    WET: 'bg-blue-500',
};

const tyreImages: Record<string, string> = {
    SOFT: '/images/tyre/soft.png',
    MEDIUM: '/images/tyre/medium.png',
    HARD: '/images/tyre/hard.png',
    INTERMEDIATE: '/images/tyre/intermediate.png',
    WET: '/images/tyre/wet.png',
};

const StintVisualizer = ({ sessionKey, lap }: StintVisualizerProps) => {
    const [driverStints, setDriverStints] = useState<DriverStints>({});
    const [maxLaps, setMaxLaps] = useState(70);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const url = lap
                    ? `https://api.openf1.org/v1/stints?session_key=${sessionKey}&lap_end<${lap}`
                    : `https://api.openf1.org/v1/stints?session_key=${sessionKey}`;
                const [stintsResponse, driversResponse, positionsResponse] = await Promise.all([
                    fetch(url),
                    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`),
                    fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`)
                ]);
                console.log(`https://api.openf1.org/v1/stints?session_key=${sessionKey}&lap_end>=${lap}`)

                if (!stintsResponse.ok || !driversResponse.ok || !positionsResponse.ok) {
                    console.error('Failed to fetch data');
                }

                const [stintsData, driversData, positionsData]: [Stint[], Driver[], Position[]] =
                    await Promise.all([
                        stintsResponse.json(),
                        driversResponse.json(),
                        positionsResponse.json()
                    ]);

                const finalPositions = positionsData.reduce((acc: Map<number, Position>, pos) => {
                    const existing = acc.get(pos.driver_number);
                    if (!existing || new Date(pos.date) > new Date(existing.date)) {
                        acc.set(pos.driver_number, pos);
                    }
                    return acc;
                }, new Map());

                const driverMap = new Map(
                    driversData.map(driver => [
                        driver.driver_number,
                        {
                            acronym: driver.name_acronym,
                            teamColor: driver.team_colour
                        }
                    ])
                );

                const stintsByDriver = stintsData.reduce((acc: DriverStints, stint) => {
                    if (!acc[stint.driver_number]) {
                        const finalPos = finalPositions.get(stint.driver_number);
                        const driverInfo = driverMap.get(stint.driver_number);
                        acc[stint.driver_number] = {
                            stints: [],
                            acronym: driverInfo?.acronym || stint.driver_number.toString(),
                            teamColor: driverInfo?.teamColor || 'FFFFFF',
                            finalPosition: finalPos ? finalPos.position : 999,
                            totalLaps: 0
                        };
                    }
                    acc[stint.driver_number].stints.push(stint);
                    return acc;
                }, {});

                Object.values(stintsByDriver).forEach(driver => {
                    driver.totalLaps = Math.max(...driver.stints.map(stint => stint.lap_end));
                });

                setDriverStints(stintsByDriver);

                //setMaxLaps(maxLap);
                return Math.max(...stintsData.map(stint => stint.lap_end));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData().then(setMaxLaps);
    }, [lap, sessionKey]);

    if (loading) return <div className="p-4 text-white">Loading stint data...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    const calculateWidth = (start: number, end: number) => {
        const totalWidth = 100; // Total width of the container
        const widthPercent = ((end - start + 1) / maxLaps) * totalWidth;
        const minWidthPercent = 15; // Minimum width in percentage (adjust as needed)
        return {
            width: Math.max(widthPercent, minWidthPercent)
        };
    };

    const sortedDrivers = Object.entries(driverStints).sort(
        ([, a], [, b]) => a.finalPosition - b.finalPosition
    );

    const rowHeight = 48; // Increased row height for larger rectangles
    const scrollAreaHeight = 8 * rowHeight;

    return (
        <Card className="w-full max-w-screen-sm bg-black text-white">
            <CardHeader className="pb-2">
                <CardTitle className="gradient-text">Race Stint Visualization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <motion.div
                    className="overflow-y-auto pr-2 custom-scrollbar"
                    style={{ height: `${scrollAreaHeight}px` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {sortedDrivers.map(([driverNumber, { stints, acronym, finalPosition, teamColor, totalLaps }]) => (
                        <div key={driverNumber} className="flex items-center gap-4 h-12">
                            <div className="w-20 text-right font-bold shrink-0">
                                <span className="mr-2 text-gray-400">{finalPosition}.</span>
                                <span style={{ color: `#${teamColor}` }}>{acronym}</span>
                            </div>

                            <div className="flex-1">
                                <div className="relative h-8 flex items-center">
                                    {stints.map((stint, index) => {
                                        const { width } = calculateWidth(stint.lap_start, stint.lap_end);
                                        const imgSrc = tyreImages[stint.compound]; // Get the image source
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center"
                                                style={{ width: `${width}%` }}
                                            >
                                                {imgSrc && ( // Conditionally render the image
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={imgSrc}
                                                        alt={stint.compound}
                                                        className="w-8 h-8"
                                                    />
                                                )}
                                                <motion.div
                                                    className={`h-8 ${compoundColors[stint.compound]} rounded-lg flex items-center justify-center`}
                                                    style={{
                                                        width: `100%`,
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `100%` }}
                                                    transition={{ duration: 5, delay: index * 3 }}
                                                >
                                                <span className="text-sm font-bold text-black gradient-text">
                                                  {stint.lap_end - stint.lap_start + 1}
                                                </span>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="w-8 text-sm shrink-0 gradient-text">{totalLaps}</div>
                        </div>
                    ))}
                </motion.div>

                <div className="mt-4 flex justify-center gap-6 pt-2 border-t border-gray-800">
                    {Object.entries(compoundColors).map(([compound, colorClass]) => (
                        <div key={compound} className="flex items-center gap-2">
                            <div className={`w-4 h-4 ${colorClass} border border-gray-700 rounded`}></div>
                            <span className="text-sm capitalize gradient-text">{compound.toLowerCase()}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default StintVisualizer;

/**
 * <StintVisualizer sessionKey={raceSessionKey} lap={lap}/>
 */