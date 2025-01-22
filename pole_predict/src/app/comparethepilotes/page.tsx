"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Timer, History, Medal, ClockArrowUp, DatabaseZap } from "lucide-react";

const F1DriverComparison = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [comparisonType, setComparisonType] = useState("driver");
    const [drivers, setDrivers] = useState<any[]>([]); // Stockage des pilotes
    const [meetings, setMeetings] = useState<any[]>([]); // Stockage des meetings
    const [selectedDrivers, setSelectedDrivers] = useState<{ [key: number]: any }>({}); // Stockage des pilotes sélectionnés
    const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: number]: boolean }>({}); // Gérer les listes déroulantes pour chaque bouton
    const [selectedMeeting, setSelectedMeeting] = useState<{ [key: number]: any }>({}); // Stockage des pilotes sélectionnés
    const [isDropdownOpenMeeting, setIsDropdownOpenMeeting] = useState<{ [key: number]: boolean }>({}); // Gérer les listes déroulantes pour chaque bouton
    const [averageSector1, setAverageSector1] = useState<number | null>(null); // Moyenne du premier secteur
    const [sessionDuration, setSessionDuration] = useState<string | null>(null); // Durée de la session


    // Fonction pour récupérer les pilotes depuis Firebase
    // Fonction pour récupérer les pilotes depuis Firebase
    const fetchDrivers = async () => {
        try {
            const driversCollection = collection(db, "drivers");
            const driverDocs = await getDocs(driversCollection);
            const fetchedDrivers = driverDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDrivers(fetchedDrivers);

            // Par défaut, sélectionner les deux premiers pilotes
            if (fetchedDrivers.length > 0) {
                setSelectedDrivers({
                    0: fetchedDrivers[0],
                    1: fetchedDrivers[1],
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des pilotes :", error);
        }
    };

    const fetchMeetings = async () => {
        try {
            const meetingsCollection = collection(db, "meetings");
            const meetingDocs = await getDocs(meetingsCollection);
            const fetchedMeetings = meetingDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMeetings(fetchedMeetings);

            // Par défaut, sélectionner le premier meeting pour chaque pilote
            if (fetchedMeetings.length > 0) {
                setSelectedMeeting({
                    0: fetchedMeetings[0], // Premier meeting pour le pilote 1
                    1: fetchedMeetings[0], // Premier meeting pour le pilote 2
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des meetings :", error);
        }
    };

    const fetchLapData = async () => {
        if (selectedDrivers[0] && selectedMeeting[0]) {
            const driverNumber = selectedDrivers[0].driver_number;
            const meetingKey = selectedMeeting[0].meeting_key;

            try {
                const response = await fetch(
                    `https://api.openf1.org/v1/laps?meeting_key=${meetingKey}&driver_number=${driverNumber}`
                );
                const lapData = await response.json();

                // Calcul de la moyenne pour duration_sector_1
                const sector1Durations = lapData.map((lap: any) => lap.duration_sector_1).filter((val: any) => val !== null);
                const average =
                    sector1Durations.reduce((sum: number, duration: number) => sum + duration, 0) /
                    sector1Durations.length;

                setAverageSector1(average);
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        }
    };

    const fetchLapDataForDriver = async (index: number) => {
        if (selectedDrivers[index] && selectedMeeting[index]) {
            const driverNumber = selectedDrivers[index].driver_number;
            const meetingKey = selectedMeeting[index].meeting_key;

            try {
                const response = await fetch(
                    `https://api.openf1.org/v1/laps?meeting_key=${meetingKey}&driver_number=${driverNumber}`
                );
                const lapData = await response.json();

                // Calculs pour les informations du pilote
                const sector1Durations = lapData.map((lap: any) => lap.duration_sector_1).filter((val: any) => val !== null);
                const sector2Durations = lapData.map((lap: any) => lap.duration_sector_2).filter((val: any) => val !== null);
                const sector3Durations = lapData.map((lap: any) => lap.duration_sector_3).filter((val: any) => val !== null);
                const lapDurations = lapData.map((lap: any) => lap.lap_duration).filter((val: any) => val !== null);
                const pitDurations = lapData
                    .filter((lap: any) => lap.is_pit_out_lap)
                    .map((lap: any) => lap.lap_duration);

                const maxSpeed = Math.max(...lapData.map((lap: any) => lap.i1_speed).filter((val: any) => val !== null));
                const averageSector1 =
                    sector1Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector1Durations.length;
                const averageSector2 =
                    sector2Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector2Durations.length;
                const averageSector3 =
                    sector3Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector3Durations.length;
                const averageLapTime =
                    lapDurations.reduce((sum: number, duration: number) => sum + duration, 0) / lapDurations.length;
                const averagePitDuration =
                    pitDurations.reduce((sum: number, duration: number) => sum + duration, 0) / pitDurations.length;

                // Stockage des données dans l'état correspondant au pilote
                setDriverData((prevState) => ({
                    ...prevState,
                    [index]: {
                        maxSpeed,
                        averageSector1,
                        averageSector2,
                        averageSector3,
                        averageLapTime,
                        averagePitDuration,
                    },
                }));
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            }
        }
    };

    const fetchSessionData = async (meetingKey: number) => {
        try {
            const response = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&session_name=Practice%201`);
            const data = await response.json();

            if (data && data.length > 0) {
                const session = data[0];
                const dateStart = new Date(session.date_start);
                const dateEnd = new Date(session.date_end);
                const duration = (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60); // Durée en minutes
                setSessionDuration(`${Math.floor(duration)} minutes`);
            } else {
                setSessionDuration("Aucune donnée disponible");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données de session :", error);
            setSessionDuration("Erreur lors de la récupération des données");
        }
    };


    useEffect(() => {
        // Lorsque le meeting sélectionné change, récupérer la durée de la course
        const meetingKey = selectedMeeting[0]?.id; // Exemple : utiliser le meeting_key du premier pilote
        if (meetingKey) {
            fetchSessionData(meetingKey);
        }
    }, [selectedMeeting]);

    useEffect(() => {
        fetchDrivers();
        fetchMeetings();
    }, []);

    useEffect(() => {
        fetchLapData();
    }, [selectedDrivers, selectedMeeting]);

    useEffect(() => {
        fetchLapDataForDriver(0); // Met à jour les données du pilote 1
    }, [selectedDrivers[0], selectedMeeting[0]]);

    useEffect(() => {
        fetchLapDataForDriver(1); // Met à jour les données du pilote 2
    }, [selectedDrivers[1], selectedMeeting[1]]);





    const toggleTab = () => setIsOpen(!isOpen);

    const toggleDropdown = (index: number) => {
        setIsDropdownOpen((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };
    const toggleDropdownMeeting = (index: number) => {
        setIsDropdownOpenMeeting((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const handleDriverChange = (index: number, driver: any) => {
        setSelectedDrivers((prevState) => ({
            ...prevState,
            [index]: driver,
        }));
        toggleDropdown(index); // Fermer la liste déroulante après la sélection
    };

    const handleDriverChangeMeeting = (index: number, meeting: any) => {
        setSelectedMeeting((prevState) => ({
            ...prevState,
            [index]: meeting,
        }));
        toggleDropdownMeeting(index); // Fermer la liste déroulante après la sélection
    };

    const [driverData, setDriverData] = useState<{ [key: number]: any }>({
        0: {},
        1: {},
    });

    const getComparisonStyle = (value1: number, value2: number, isHigherBetter: boolean) => {
        if (value1 === null || value2 === null) return {}; // Pas de comparaison possible

        if (isHigherBetter) {
            return value1 > value2 ? { color: "green" } : { color: "red" };
        } else {
            return value1 < value2 ? { color: "green" } : { color: "red" };
        }
    };




    return (
        <div className="p-4">
            <button
                onClick={toggleTab}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Compare Drivers
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-red-500 p-6 rounded-lg w-3/4 max-w-4xl z-50">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={toggleTab}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold">Driver Comparison</h2>
                            <select
                                value={comparisonType}
                                onChange={(e) => setComparisonType(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="driver">Driver</option>
                                <option value="grand prix">Grand Prix</option>
                            </select>
                        </div>

                        {comparisonType === "driver" && (
                            <div className="grid grid-cols-2 gap-4">
                                {[0, 1].map((index) => (
                                    <div key={index}>
                                        {selectedDrivers[index] ? (
                                            <>
                                                <div className="flex flex-col items gap-2">
                                                    <div className="relative">
                                                        {isDropdownOpen[index] && (
                                                            <div className="absolute bg-white border rounded shadow-md mt-1 w-40 z-10">
                                                                <ul className="max-h-48 overflow-y-auto">
                                                                    {drivers.map((driver) => (
                                                                        <li
                                                                            key={driver.id}
                                                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                                                            onClick={() => handleDriverChange(index, driver)}
                                                                        >
                                                                            {driver.name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {isDropdownOpenMeeting[index] && (
                                                            <div className="absolute bg-white border rounded shadow-md mt-1 w-40 z-10">
                                                                <ul className="max-h-48 overflow-y-auto">
                                                                    {meetings.map((meeting) => (
                                                                        <li
                                                                            key={meeting.id}
                                                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                                                            onClick={() => handleDriverChangeMeeting(index, meeting)}
                                                                        >
                                                                            {meeting.meeting_name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={selectedDrivers[index].headshot_url}
                                                            alt={`${selectedDrivers[index].full_name} headshot`}
                                                            className="w-20 h-20 rounded-full border-2 border-red"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold">
                                                                {selectedDrivers[index].full_name}
                                                            </h3>
                                                            <p>Pilote: {selectedDrivers[index].name}</p>
                                                            <p>Écurie: {selectedDrivers[index].team_name}</p>
                                                            <p>GP: {selectedMeeting[index]?.meeting_name || "Aucun GP sélectionné"}</p>
                                                            <button
                                                                onClick={() => toggleDropdown(index)}
                                                                className="bg-gray-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-600"
                                                            >
                                                                Pilote
                                                            </button>
                                                            <button
                                                                onClick={() => toggleDropdownMeeting(index)}
                                                                className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded hover:bg-orange-600 ml-2"
                                                            >
                                                                GP
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Informations stylisées */}
                                                <div className="mt-4 space-y-4">
                                                    <div className="p-4 bg-gray-100 rounded-lg">
                                                        <p className="flex items-center">
                                                            <Timer className="mr-2 w-4 h4" /> {/* L'icône Timer avec un espace à droite */}
                                                            Durée de la course:{sessionDuration || "Chargement..."}
                                                        </p>
                                                        <p className="flex items-center">
                                                            <ClockArrowUp className="mr-2 w-4 h4" /> {/* L'icône Timer avec un espace à droite */}
                                                            Durée pour finir la course: {driverData[index]?.raceDuration || "Non disponible"}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 bg-gray-100 rounded-lg">
                                                        <p className="font-bold text-lg">Général :</p>
                                                        <p>Vitesse max: {driverData[index]?.maxSpeed ? `${driverData[index].maxSpeed} km/h` : "Non disponible"}</p>

                                                        {/* Gauge */}
                                                        <div className="mt-2 mb-4 h-2 w-1/2 rounded relative bg-gradient-to-r from-green-500 to-red-500">
                                                            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((val) => (
                                                                <div
                                                                    key={val}
                                                                    className="absolute top-0 h-full border-l border-white"
                                                                    style={{ left: `${(val / 400) * 100}%` }}
                                                                ></div>
                                                            ))}
                                                            {driverData[index]?.maxSpeed && (
                                                                <div
                                                                    className="absolute top-0 h-full border-l-4 border-blue-800"
                                                                    style={{
                                                                        left: `${(driverData[index].maxSpeed / 400) * 100}%`,
                                                                        height: "150%",
                                                                        transform: "translateY(-20%)",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                        <p>Moyenne d'un tour: {driverData[index]?.averageLapTime ? `${driverData[index].averageLapTime.toFixed(2)} s` : "Non disponible"}</p>
                                                        <div className="mt-2 mb-4 h-2 w-1/2 rounded relative bg-gradient-to-r from-green-500 to-red-500">
                                                            {[0, 50, 100, 150, 200].map((val) => (
                                                                <div
                                                                    key={val}
                                                                    className="absolute top-0 h-full border-l border-white"
                                                                    style={{ left: `${(val / 200) * 100}%` }}
                                                                ></div>
                                                            ))}
                                                            {driverData[index]?.averageLapTime && (
                                                                <div
                                                                    className="absolute top-0 h-full border-l-4 border-blue-800"
                                                                    style={{
                                                                        left: `${(driverData[index].averageLapTime / 200) * 100}%`,
                                                                        height: "150%",
                                                                        transform: "translateY(-20%)",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-lg">Détails Secteurs :</p>
                                                        <p>Moyenne 1er Secteur: {driverData[index]?.averageSector1 ? `${driverData[index].averageSector1.toFixed(2)} s` : "Non disponible"}</p>
                                                        <div className="mt-2 mb-4 h-2 w-1/2 rounded relative bg-gradient-to-r from-green-500 to-red-500">
                                                            {[0, 20, 40, 60, 80].map((val) => (
                                                                <div
                                                                    key={val}
                                                                    className="absolute top-0 h-full border-l border-white"
                                                                    style={{ left: `${(val / 80) * 100}%` }}
                                                                ></div>
                                                            ))}
                                                            {driverData[index]?.averageSector1 && (
                                                                <div
                                                                    className="absolute top-0 h-full border-l-4 border-blue-800"
                                                                    style={{
                                                                        left: `${(driverData[index].averageSector1 / 80) * 100}%`,
                                                                        height: "150%",
                                                                        transform: "translateY(-20%)",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>


                                                        <p>Moyenne 2ème Secteur: {driverData[index]?.averageSector2 ? `${driverData[index].averageSector2.toFixed(2)} s` : "Non disponible"}</p>
                                                        <div className="mt-2 mb-4 h-2 w-1/2 rounded relative bg-gradient-to-r from-green-500 to-red-500">
                                                            {[0, 20, 40, 60, 80].map((val) => (
                                                                <div
                                                                    key={val}
                                                                    className="absolute top-0 h-full border-l border-white"
                                                                    style={{ left: `${(val / 80) * 100}%` }}
                                                                ></div>
                                                            ))}
                                                            {driverData[index]?.averageSector2 && (
                                                                <div
                                                                    className="absolute top-0 h-full border-l-4 border-blue-800"
                                                                    style={{
                                                                        left: `${(driverData[index].averageSector2 / 80) * 100}%`,
                                                                        height: "150%",
                                                                        transform: "translateY(-20%)",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                        <p>Moyenne 3ème Secteur: {driverData[index]?.averageSector3 ? `${driverData[index].averageSector3.toFixed(2)} s` : "Non disponible"}</p>
                                                        <div className="mt-2 mb-4 h-2 w-1/2 rounded relative bg-gradient-to-r from-green-500 to-red-500">
                                                            {[0, 10, 20, 30, 40].map((val) => (
                                                                <div
                                                                    key={val}
                                                                    className="absolute top-0 h-full border-l border-white"
                                                                    style={{ left: `${(val / 40) * 100}%` }}
                                                                ></div>
                                                            ))}
                                                            {driverData[index]?.averageSector3 && (
                                                                <div
                                                                    className="absolute top-0 h-full border-l-4 border-blue-800"
                                                                    style={{
                                                                        left: `${(driverData[index].averageSector3 / 40) * 100}%`,
                                                                        height: "150%",
                                                                        transform: "translateY(-20%)",
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p>Chargement...</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {comparisonType === "grand prix" && (
                            <div>
                                
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

    );
};

export default F1DriverComparison;