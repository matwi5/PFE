import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {CartesianGrid, DotProps, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from 'recharts';
import {motion} from 'framer-motion';
import {Input} from "@/components/ui/input";
import CustomDropdown_multiple from "./component/CustomDropdown_multiple";
import {Button} from "@/components/ui/button";


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
    uniqueKey: string; // Make unique the data
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
};

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
    const [showDots, setShowDots] = useState(true);
    const [minLapInput, setMinLapInput] = useState('2'); // State for min lap input
    const [maxLapInput, setMaxLapInput] = useState('Infinity'); // State for max lap input
    const [showLapInputs, setShowLapInputs] = useState(false);

    useEffect(() => {
        const fetchDriversData = async () => {
            try {
                const url = `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`;
                const response = await fetch(url);
                const drivers = await response.json();

                const fetchedDriverData: DriverData = {};
                drivers.forEach((driver) => {
                    fetchedDriverData[driver.driver_number] = {
                        name_acronym: driver.name_acronym,
                        team_colour: driver.team_colour,
                    };
                });

                return fetchedDriverData;
            } catch (error) {
                console.error('Error fetching driver data:', error);
            }
        };

        if(sessionKey){
            fetchDriversData().then(setDriverData);
        }

    }, [sessionKey]);

    useEffect(() => {
        const fetchRaceControlData = async (): Promise<RaceControlEvent[]> => {
            try {
                const url = lap
                    ? `https://api.openf1.org/v1/race_control?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/race_control?session_key=${sessionKey}`;

                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error('Error fetching race control data:', error);
            }
        };

        fetchRaceControlData().then(setRaceControlData);
    }, [sessionKey, lap]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = lap
                    ? `https://api.openf1.org/v1/laps?session_key=${sessionKey}&lap_number<${lap}`
                    : `https://api.openf1.org/v1/laps?session_key=${sessionKey}`;

                const response = await fetch(url);
                const laps: LapData[] = await response.json();

                const validLaps = laps
                    .filter(lap =>
                        lap.duration_sector_1 &&
                        lap.duration_sector_2 &&
                        lap.duration_sector_3
                    )
                    .sort((a, b) => a.lap_number - b.lap_number);
                setAllLaps(validLaps);


                // Process race control data to determine safety car status for each lap
                const safetyCarLaps = new Set<number>();
                let isSafetyCarActive = false;

                raceControlData.forEach((event) => {
                    if (event.category === "SafetyCar" || event.category === "Flag") {
                        if (event.message.includes("DEPLOYED")) {
                            isSafetyCarActive = true;
                        } else if (event.message.includes("ENDING") || event.message.includes("IN")) {
                            isSafetyCarActive = false;
                        }
                    }

                    if (isSafetyCarActive) {
                        safetyCarLaps.add(event.lap_number);
                    }
                });

                // Update laps with safety car status
                validLaps.forEach((lap) => {
                    lap.hasSafetyCar = safetyCarLaps.has(lap.lap_number);
                });

                const lapDisplayData: DisplayLapData[] = [];


                validLaps.forEach((lap) => {
                    const totalTime = lap.duration_sector_1 + lap.duration_sector_2 + lap.duration_sector_3;
                    let improved = false;
                    const previousLap = validLaps.find(prevLap => prevLap.driver_number === lap.driver_number && prevLap.lap_number === lap.lap_number - 1);
                    if(previousLap){
                        const previousLapTime = previousLap.duration_sector_1 + previousLap.duration_sector_2 + previousLap.duration_sector_3;
                        improved = totalTime < previousLapTime;
                    }

                    lapDisplayData.push({
                        lapNumber: lap.lap_number,
                        totalTime,
                        improved,
                        isPitLap: lap.is_pit_out_lap,
                        hasSafetyCar: lap.hasSafetyCar,
                        driverNumber: lap.driver_number,
                        uniqueKey: `${lap.driver_number}-${lap.lap_number}`
                    });
                });

                setData(lapDisplayData);

                const meanTimes = lapDisplayData
                    .filter(lap => !lap.isPitLap)
                    .map(lap => lap.totalTime);


                const minMeanTime = Math.min(...meanTimes);
                const maxMeanTime = Math.max(...meanTimes);

                setTimeRange({ min: minMeanTime - 1, max: maxMeanTime + 1 });

                // Calculate the maximum lap number
                const maxLapNumber = validLaps.reduce((max, lap) => Math.max(max, lap.lap_number), 0);
                setMaxLap(maxLapNumber);
                return maxLapNumber;


            } catch (error) {
                console.error('Error fetching lap data:', error);
            }
        };
        fetchData().then(setFilterMaxLap);
    }, [sessionKey, raceControlData, lap]);

    useEffect(() => {
        let filteredData = data;
        if (selectedDrivers.length > 0) {
            filteredData = filteredData.filter(lap => selectedDrivers.some(selected => parseInt(selected.value) === lap.driverNumber));
        }

        const minLapNum = parseInt(minLapInput, 10);
        const maxLapNum = maxLapInput === 'Infinity' ? Infinity : parseInt(maxLapInput, 10);

        filteredData = filteredData.filter(lap => lap.lapNumber >= (isNaN(minLapNum)? 1 : minLapNum) && lap.lapNumber <= (isNaN(maxLapNum)? Infinity : maxLapNum));

        setFilterMinLap(isNaN(minLapNum)? 1 : minLapNum);
        setFilterMaxLap(isNaN(maxLapNum)? Infinity : maxLapNum);

        setDisplayData(filteredData);

        const lapTimes = filteredData.map(lap => lap.totalTime);
        if (lapTimes.length > 0) {
            setTimeRange({
                min: Math.min(...lapTimes) - 1,
                max: Math.max(...lapTimes) + 1
            });
        }

    }, [data, selectedDrivers, minLapInput, maxLapInput]);


    /*const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length && tooltipPayload) {
            const data = tooltipPayload;
            return (
                <div className="bg-black text-white p-4 border border-white rounded shadow">
                    <p className="font-bold">{driverData[data.driverNumber]?.name_acronym}</p>
                    <p className="font-bold">Lap {data.lapNumber}</p>
                    <p>Time: {formatTime(data.totalTime)}</p>
                    <p>{data.improved ? "Improved" : "Slower"} Lap</p>
                    {data.hasSafetyCar && <p>Safety Car Active</p>}
                </div>
            );
        }
        return null;
    };*/

    const renderDot = (props: DotProps) => {
        const { payload } = props;

        let fill: string;
        let radius = 5; // Default radius

        if (payload.isPitLap) {
            fill = "#00bfff";
        } else if (payload.hasSafetyCar) {
            fill = "#ffff00";
        } else if (payload.improved) {
            fill = "#00ff00";
        } else {
            fill = "#ff0000";
        }

        if (!showDots) {
            radius = 0; // Effectively hides the dot
        }

        return (
            <circle
                cx={props.cx}
                cy={props.cy}
                r={radius} // Use the determined radius
                fill={fill}
                stroke="none" // Optional: remove the stroke to make it completely invisible when hidden
            />
        );
    };

    const driverOptions = allLaps.length > 0
        ? [...new Set(allLaps.map(lap => lap.driver_number))]
            .map(driverNumber => ({
                label: driverData[driverNumber]?.name_acronym || `Driver ${driverNumber}`,
                value: String(driverNumber),
            }))
        : [];


    return (
        <Card className="w-full max-w-3xl bg-black text-white">
            <CardHeader>
                <CardTitle className="gradient-text">F1 Lap Time Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-2 items-center">
                    <CustomDropdown_multiple
                        options={driverOptions}
                        selectedGroups={selectedDrivers}
                        onChange={setSelectedDrivers}
                        backgroundColor="#1e1e1e"
                        textColor="#ffffff"
                        placeHolder={"Select Drivers"}
                    />

                    <div className="flex flex-row gap-2 items-center">
                        <Button onClick={() => setShowDots(!showDots)} size={"sm"}>
                            {showDots ? 'Hide Dots' : 'Show Dots'}
                        </Button>
                        <Button onClick={() => setShowLapInputs(!showLapInputs)} size={"sm"}>
                            {showLapInputs ? 'Hide Lap Inputs' : 'Show Lap Inputs'}
                        </Button>
                    </div>

                    {showLapInputs && (
                        <div className="flex flex-row gap-2 items-center">
                            <label htmlFor="minLap" className="gradient-text mr-2">Min Lap:</label>
                            <Input
                                type="text"
                                id="minLap"
                                className="gradient-text w-16"
                                value={minLapInput}
                                onChange={(e) => setMinLapInput(e.target.value)}
                            />
                            <label htmlFor="maxLap" className="gradient-text mr-2">Max Lap:</label>
                            <Input
                                type="text"
                                id="maxLap"
                                className="gradient-text w-16"
                                value={maxLapInput}
                                onChange={(e) => setMaxLapInput(e.target.value)}
                            />
                        </div>
                    )}



                </div>

                <motion.div
                    className="relative"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <div className="absolute -left-10 top-1/2 py-40  transform -rotate-90 gradient-text">
                        Lap Time
                    </div>
                </motion.div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={displayData}
                        margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#666"/>
                        <XAxis dataKey="lapNumber" type="number"
                               domain={[filterMinLap, filterMaxLap === Infinity ? maxLap : filterMaxLap]}
                               stroke="#fff"/>
                        <YAxis domain={[timeRange.min, timeRange.max]} tickFormatter={formatTime} stroke="#fff"/>
                        <Legend wrapperStyle={{paddingLeft: 20}}/>
                        {
                            [...new Set(displayData.map(lap => lap.driverNumber))].map(driverNumber => {
                                const driverDataForLine = displayData.filter(lap => lap.driverNumber === driverNumber);
                                return (
                                    <Line
                                        key={`line-${driverNumber}`}
                                        type="monotone"
                                        dataKey="totalTime"
                                        data={driverDataForLine}
                                        stroke={`#${driverData[driverNumber]?.team_colour}`}
                                        strokeWidth={2}
                                        dot={renderDot}
                                        name={`${driverData[driverNumber]?.name_acronym}`}
                                    />
                                );
                            })
                        }
                    </LineChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-4 text-white mt-2">
                            <span className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                <span className="gradient-text">Improved Lap</span>
                            </span>
                    <span className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                                <span className="gradient-text">Slower Lap</span>
                            </span>
                    <span className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-1"></span>
                                <span className="gradient-text">Pit Lap</span>
                            </span>
                    <span className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                                <span className="gradient-text">Safety Car Lap</span>
                            </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default F1LapAnalysis;

//<F1LapAnalysis sessionKey={sessionKey} lap={lap}/>