/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";

// Définition des interfaces
interface Position {
    x: number;
    y: number;
    date: string;
    driverNumber: string;
}
interface DriverInfo {
    NumberOfPodiums: number;
    NumberOfVictories: number;
    WorldChampionships: number;
    broadcast_name: string;
    country_code: string;
    driver_number: number;
    first_name: string;
    flagColors: string[];
    flag_url: string;
    headshot_url: string;
    last_name: string;
    name: string;
    team_colour: string;
    team_name: string;
    year: number[];
}
interface CircuitWidgetProps { }
interface Meeting {
    circuit_key: number;
    circuit_short_name: string;
    country_code: string;
    country_key: number;
    country_name: string;
    date_start: string;
    dist_course: string;
    gmt_offset: string;
    location: string;
    long_circuit: string;
    meeting_code: string;
    meeting_key: number;
    meeting_name: string;
    nb_tours: number;
    podium: string[];
    qualif: string[];
    year: number;
    grand_prix: string;
    DecalageX: number;
    DecalageY: number;
    Rotation: number;
    Zoom: number;
}
interface GrandPrix {
    grand_prix: string;
    pays_flag: string;
    ville: string;
    nombre_de_tours: number;
    particularites: string;
    record_de_circuit: string;
    recordman_circuit: string;
    image_circuit: string;
}

const CircuitWidget: React.FC<CircuitWidgetProps> = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [error, setError] = useState<string | null>(null);
    const baseTimestampRef = useRef<Date | null>(null);
    const [scale, setScale] = useState(1.18);
    const [offsetX, setOffsetX] = useState(33);
    const [offsetY, setOffsetY] = useState(3);
    const [rotationAngle, setRotationAngle] = useState(0);
    const circleSize = 9;
    const [loading, setLoading] = useState(true);
    const [selectedCircuitImage, setSelectedCircuitImage] = useState<string | null>("/images/circuit-singapour.png");
    const [allGPs, setAllGPs] = useState<Meeting[]>([]);
    const [gp, setGP] = useState<GrandPrix[]>([]);
    const [selectedMeetingName, setSelectedMeetingName] = useState<string | null>(null);
    const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
    const [raceSessionKey, setRaceSessionKey] = useState<number | null>(null);
    const [raceDateStart, setRaceDateStart] = useState<string | null>(null);
    const [dbDrivers, setDbDrivers] = useState<DriverInfo[]>([]);
    const [selectedYear, setSelectedYear] = useState("2024");

    // Filtrer les meetings par année sélectionnée
    const meetingsOfYear = allGPs.filter((meeting: Meeting) => meeting.year.toString() === selectedYear);

    // Fetch initial data (meetings, grand prix, drivers)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [gpsResponse, gpResponse, driversResponse] = await Promise.all([
                    fetch('/api/meetingslastseasons'),
                    fetch('/api/gp'),
                    fetch('/api/drivers')
                ]);

                if (!gpsResponse.ok) throw new Error('Erreur lors de la récupération des meetings');
                if (!gpResponse.ok) throw new Error('Erreur lors de la récupération des infos des GP');
                if (!driversResponse.ok) throw new Error('Erreur lors de la récupération des infos des drivers');

                const [gpsData, GrandPData, driversData] = await Promise.all([
                    gpsResponse.json(),
                    gpResponse.json(),
                    driversResponse.json(),
                ]);
                setAllGPs(gpsData.data);
                setGP(GrandPData.data);
                setDbDrivers(driversData.data);

                if (gpsData.data && gpsData.data.length > 0) {
                    const initialMeetingOfYear = gpsData.data.find((meeting: Meeting) => meeting.year.toString() === selectedYear);
                    if (initialMeetingOfYear) {
                        setSelectedMeetingName(initialMeetingOfYear.meeting_name);
                        setSelectedMeetingKey(initialMeetingOfYear.meeting_key);

                        const initialGrandPrixName = initialMeetingOfYear.grand_prix;
                        const initialGrandPrixData = GrandPData.data.find((g: GrandPrix) => g.grand_prix === initialGrandPrixName);
                        setSelectedCircuitImage(initialGrandPrixData?.image_circuit || "/images/circuit-singapour.png");

                        setScale(initialMeetingOfYear.Zoom ?? 1.18);
                        setOffsetX(initialMeetingOfYear.DecalageX ?? 33);
                        setOffsetY(initialMeetingOfYear.DecalageY ?? 3);
                        setRotationAngle(initialMeetingOfYear.Rotation ?? 0);

                        await fetchSessionData(initialMeetingOfYear.meeting_key, initialMeetingOfYear.year);
                    }
                    else {
                        resetCircuitData();
                        console.log("Aucun meeting trouvé pour l'année par défaut.");
                    }
                }
            } catch (error) {
                setError("Impossible de récupérer les données.");
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [selectedYear]);

    // Helper function to fetch session data
    const fetchSessionData = async (meetingKey: number, year: number) => {
        try {
            const sessionsResponse = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&year=${year}`);
            if (!sessionsResponse.ok) {
                throw new Error('Erreur lors de la récupération des sessions');
            }
            const sessionsData = await sessionsResponse.json();
            const raceSession = sessionsData.find((session: any) => session.session_name === "Race");

            if (raceSession) {
                setRaceSessionKey(raceSession.session_key);
                setRaceDateStart(raceSession.date_start);
                baseTimestampRef.current = new Date(raceSession.date_start);
            } else {
                resetSessionData();
                console.log("Session 'Race' non trouvée pour ce meeting.");
            }
        } catch (error) {
            resetSessionData();
            setError("Erreur lors de la récupération des détails de la session.");
            console.error("Error fetching session details", error);
        }
    };

    // Reset position tracking when session data is not found
    const resetSessionData = () => {
        setRaceSessionKey(null);
        setRaceDateStart(null);
        baseTimestampRef.current = null;
    };

    const resetCircuitData = () => {
        setSelectedMeetingName(null);
        setSelectedMeetingKey(null);
        setSelectedCircuitImage("/images/circuit-singapour.png");
        resetSessionData();
    };

    // Fetch position data
    useEffect(() => {
        const fetchPositions = async () => {
            if (!raceSessionKey || !baseTimestampRef.current) return;
            try {
                const currentTime = new Date(baseTimestampRef.current);
                const beforeTime = new Date(currentTime.getTime() + 500);
                const afterTime = new Date(currentTime.getTime() - 500);

                const response = await fetch(
                    `https://api.openf1.org/v1/location?session_key=${raceSessionKey}&date>${afterTime.toISOString()}&date<${beforeTime.toISOString()}`
                );

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                const latestPositions = new Map<string, Position>();

                data
                    .filter((item: any) => item && item.x !== undefined)
                    .forEach((item: any) => {
                        const driverNumber = item.driver_number.toString();
                        const currentDate = new Date(item.date);

                        const existingPosition = latestPositions.get(driverNumber);
                        if (!existingPosition || new Date(existingPosition.date) < currentDate) {
                            const rawX = item.x;
                            const rawY = item.y;
                            const scaledX = ((rawX - -10000) / 20000) * 200 - 100;
                            const scaledY = ((rawY - -10000) / 20000) * 200 - 100;

                            latestPositions.set(driverNumber, {
                                x: scaledX,
                                y: scaledY,
                                date: item.date,
                                driverNumber: driverNumber
                            });
                        }
                    });
                setPositions(Array.from(latestPositions.values()));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Une erreur est survenue");
            }
        };

        if (raceSessionKey && raceDateStart) {
            fetchPositions();
            const interval = setInterval(() => {
                fetchPositions();
                if (baseTimestampRef.current) {
                    baseTimestampRef.current.setMilliseconds(
                        baseTimestampRef.current.getMilliseconds() + 500
                    );
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, [raceSessionKey, raceDateStart]);

    useEffect(() => {
        if (raceDateStart) {
            baseTimestampRef.current = new Date(raceDateStart);
        } else {
            baseTimestampRef.current = null;
        }
    }, [raceDateStart]);

    // Apply transformation to positions
    const adjustedPositions = positions.map(pos => {
        const angleRad = rotationAngle * Math.PI / 180;
        const rotatedX = pos.x * Math.cos(angleRad) - pos.y * Math.sin(angleRad);
        const rotatedY = pos.x * Math.sin(angleRad) + pos.y * Math.cos(angleRad);

        return {
            ...pos,
            x: rotatedX * scale + offsetX,
            y: rotatedY * scale + offsetY
        };
    });

    // Handle meeting change
    const handleMeetingChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedMeetingNameFromDropdown = event.target.value;
        setSelectedMeetingName(selectedMeetingNameFromDropdown);

        const selectedMeeting = meetingsOfYear.find((meeting: Meeting) => meeting.meeting_name === selectedMeetingNameFromDropdown);
        if (selectedMeeting) {
            setSelectedMeetingKey(selectedMeeting.meeting_key);

            const grandPrixName = selectedMeeting.grand_prix;
            const selectedGrandPrixData = gp.find((gpItem: GrandPrix) => gpItem.grand_prix === grandPrixName);
            setSelectedCircuitImage(selectedGrandPrixData?.image_circuit || "/images/circuit-singapour.png");

            setScale(selectedMeeting.Zoom ?? 1.18);
            setOffsetX(selectedMeeting.DecalageX ?? 33);
            setOffsetY(selectedMeeting.DecalageY ?? 3);
            setRotationAngle(selectedMeeting.Rotation ?? 0);
            await fetchSessionData(selectedMeeting.meeting_key, selectedMeeting.year);
        }
    };

    // Handle year change
    const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value);
        resetCircuitData();
        setScale(1.18);
        setOffsetX(33);
        setOffsetY(3);
        setRotationAngle(0);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-4xl font-bold text-center text-orange-500 mb-8">
                🏎️ Trace des Pilotes en Temps Réel ⏱️
            </h1>

            <div className="mb-4 flex items-center space-x-4">
                <label htmlFor="year-select" className="block text-sm font-medium text-gray-300">
                    Choisir :
                </label>
                <div className="inline-block">
                    <select
                        id="year-select"
                        className="bg-gray-700 border border-gray-600 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm"
                        value={selectedYear}
                        onChange={handleYearChange}
                    >
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
                <div className="inline-block ml-2">
                    <select
                        id="meeting-select"
                        className="bg-gray-700 border border-gray-600 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm"
                        value={selectedMeetingName || ""}
                        onChange={handleMeetingChange}
                        disabled={meetingsOfYear.length === 0}
                    >
                        {meetingsOfYear.length === 0 ? (
                            <option>Aucun Grand Prix disponible pour {selectedYear}</option>
                        ) : (
                            meetingsOfYear.map((meeting: Meeting) => (
                                <option key={meeting.meeting_key} value={meeting.meeting_name}>
                                    {meeting.meeting_name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 mb-4">
                <div className="relative">
                    <img
                        src={selectedCircuitImage ?? "/images/circuit-singapour.png"}
                        className="rounded-md w-full h-auto"
                        alt={selectedMeetingName || "Circuit"}
                    />
                    <svg
                        viewBox="0 0 800 500"
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    >
                        {adjustedPositions
                            .map(pos => {
                                const driverInfo = dbDrivers.find(d => d.driver_number === parseInt(pos.driverNumber));
                                if (driverInfo?.team_colour) {
                                    return (
                                        <g key={pos.driverNumber}>
                                            <circle
                                                cx={(pos.x + 140) * 4}
                                                cy={(60 - pos.y) * 4}
                                                r={circleSize}
                                                fill={driverInfo.team_colour}
                                            />
                                            <text
                                                x={(pos.x + 140) * 4}
                                                y={(60 - pos.y) * 4}
                                                fontSize={12}
                                                fill="#000000"
                                                textAnchor="middle"
                                                dy=".3em"
                                                className="font-bold"
                                            >
                                                {pos.driverNumber}
                                            </text>
                                        </g>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                    </svg>
                </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {loading && <div className="text-gray-400 text-center">Chargement en cours...</div>}
        </div>
    );
};

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans antialiased flex justify-center">
            <div className="w-full max-w-6xl px-4 py-10">
                <div className="col-span-1 row-span-1">
                    <CircuitWidget />
                </div>
            </div>
        </div>
    );
}