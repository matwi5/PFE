"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Map, MapPin, Info, Calendar, Medal, Globe, Trophy, Flag, Car, Timer, History, ClockArrowUp, DatabaseZap, X, Hourglass, ClockArrowDown, TimerReset } from "lucide-react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

import GrandPrixCard from "../components/pastComponent/GrandPrixCard";
import DetailsCard from "../components/pastComponent/DetailsCard";
import InformationsCard from "../components/pastComponent/InformationsCard";
import ResultatsCard from "../components/pastComponent/ResultatsCard";
import LocalisationCard from "../components/pastComponent/LocalisationCard";
import ComparerPilotesCard from "../components/pastComponent/ComparerPilotesCard";
import ComparerEcuriesCard from "../components/pastComponent/ComparerEcuriesCard";
import ModeProCard from "../components/pastComponent/ModeProCard";
import TeamDetailCard from "../components/pastComponent/TeamDetailCard";
import DriverDetailCard from "../components/pastComponent/DriverDetailCard";


interface GP {
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
}

interface Driver {
    flagColors: string[];
    broadcast_name: string;
    country_code: string;
    driver_number: number;
    first_name: string;
    headshot_url: string;
    last_name: string;
    team_name: string;
    team_colour: string;
    name: string;
    flag_url: string;
    year: number[];
    NumberOfPodiums: number;
    NumberOfVictories: number;
    WorldChampionships: number;
}

interface Team {
    name: string;
    color: string;
    logo_url: string;
    base: string;
    team_principal: string;
    championships: number;
    power_unit: string;
    country: string;
    country_flag: string;
    pilote1_url: string;
    pilote2_url: string;
    car_image: string;
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


const GrandPrixCards = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allGPs, setAllGPs] = useState<GP[]>([]);
    const [gp, setGP] = useState<GrandPrix[]>([]);
    const [mainGP, setMainGP] = useState<GP | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showAllPodium, setShowAllPodium] = useState(false);
    const [showAllQualif, setShowAllQualif] = useState(false);
    const [isFlagAnimating, setIsFlagAnimating] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2023);
    const [isImageVisible, setIsImageVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");

    const [isOpen, setIsOpen] = useState(false);
    const [isTeamComparisonOpen, setIsTeamComparisonOpen] = useState(false);
    const [comparisonType, setComparisonType] = useState("driver");
    const [meetings, setMeetings] = useState<any[]>([]);
    const [selectedDrivers, setSelectedDrivers] = useState<{ [key: number]: any }>({
        0: {},
        1: {},
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: number]: boolean }>({});
    const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
    const [isDropdownOpenMeeting, setIsDropdownOpenMeeting] = useState<boolean>(false);
    const [averageSector1, setAverageSector1] = useState<number | null>(null);
    const [sessionDuration, setSessionDuration] = useState<string | null>(null);
    const [driverData, setDriverData] = useState<{ [key: number]: any }>({
        0: {},
        1: {},
    });
    const [selectedMeetingIndex, setSelectedMeetingIndex] = useState<number>(0);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [isDropdownOpenYear, setIsDropdownOpenYear] = useState<boolean>(false);
    const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState<{ [key: number]: any }>({
        0: {},
        1: {},
    });
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState<{ [key: number]: boolean }>({});
    const [teamData, setTeamData] = useState<{ [key: number]: any }>({ // State for team data, mirroring driverData structure
        0: {},
        1: {},
    });


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [gpsResponse, driversResponse, teamsResponse, gpResponse] = await Promise.all([
                    fetch('/api/pastseasons'),
                    fetch('/api/drivers'),
                    fetch('/api/teams'),
                    fetch('/api/gp')
                ]);

                if (!gpsResponse.ok) throw new Error('Erreur lors de la récupération des grands prix');
                if (!driversResponse.ok) throw new Error('Erreur lors de la récupération des pilotes');
                if (!teamsResponse.ok) throw new Error('Erreur lors de la récupération des équipes');
                if (!gpResponse.ok) throw new Error('Erreur lors de la récupération des infos des GP');

                const [gpsData, driversData, teamsData, GrandPData] = await Promise.all([
                    gpsResponse.json(),
                    driversResponse.json(),
                    teamsResponse.json(),
                    gpResponse.json(),
                ]);

                setAllGPs(gpsData.data);
                setDrivers(driversData.data);
                setTeams(teamsData.data);
                setGP(GrandPData.data);

                if (gpsData.data.length > 0) {
                    setMainGP(gpsData.data[0]);
                    await fetchCoordinates(gpsData.data[0].location + ", " + gpsData.data[0].country_name);
                }
            } catch (error) {
                setError("Impossible de récupérer les données.");
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const fetchDrivers = async () => {
        try {
            const driversCollection = collection(db, "drivers");
            const driverDocs = await getDocs(driversCollection);
            const fetchedDrivers = driverDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDrivers(fetchedDrivers);

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
    const fetchMeetings = async (year: string | null) => {
        try {
            const meetingsCollection = collection(db, "meetings");
            const meetingDocs = await getDocs(meetingCollection);
            let fetchedMeetings = meetingDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Extract available years from meetings data
            const years = [...new Set(fetchedMeetings.map(meeting => meeting.year).filter(y => y != null))]; // Filter out null years if any
            setAvailableYears(years.map(String)); // Ensure years are strings

            if (year) {
                fetchedMeetings = fetchedMeetings.filter(meeting => String(meeting.year) === year); // Filter meetings by selected year, convert to String for comparison
            }
            setMeetings(fetchedMeetings);
            if (fetchedMeetings.length > 0) {
                setSelectedMeeting(fetchedMeetings[0] || null); // Select the first meeting of the filtered year or null if none
            } else {
                setSelectedMeeting(null); // No meetings for this year, reset selected meeting
            }


        } catch (error) {
            console.error("Erreur lors de la récupération des meetings :", error);
        }
    };

    const fetchTeamAverageData = async (index: number) => { // New function to fetch and average team data
        if (selectedTeamsForComparison[index] && selectedMeeting) {
            const teamName = selectedTeamsForComparison[index].name;
            const meetingKey = selectedMeeting.meeting_key;
            const yearSession = selectedMeeting.year;

            // Find drivers for the selected team and meeting
            const teamDrivers = drivers.filter(driver =>
                driver.team_name === teamName && driver.year.includes(yearSession)
            );

            if (teamDrivers.length === 0) {
                console.warn(`No drivers found for team ${teamName} in meeting ${selectedMeeting.meeting_name}`);
                setTeamData(prevState => ({
                    ...prevState,
                    [index]: { error: 'No data available for this team at this GP' } // Indicate no data
                }));
                return;
            }

            let teamRaceDurations: number[] = [];
            let teamMaxSpeeds: number[] = [];
            let teamAvgSector1s: number[] = [];
            let teamAvgSector2s: number[] = [];
            let teamAvgSector3s: number[] = [];
            let teamAvgLapTimes: number[] = [];
            let teamAvgPitDurations: number[] = [];
            let teamBestPitDurations: number[] = [];

            for (const driver of teamDrivers) {
                try {
                    const sessionsResponse = await fetch(
                        `https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&year=${yearSession}`
                    );
                    const sessionsData = await sessionsResponse.json();

                    const raceSession = sessionsData.find((session: any) => session.session_name === 'Race');
                    let sessionKeyToUse = meetingKey;
                    if (raceSession) {
                        sessionKeyToUse = raceSession.session_key;
                    } else {
                        sessionKeyToUse = meetingKey; // Fallback to meeting key
                        console.warn("Race session not found, fetching laps for meeting key instead for team avg.");
                    }


                    const lapsResponse = await fetch(
                        `https://api.openf1.org/v1/laps?session_key=${sessionKeyToUse}&driver_number=${driver.driver_number}`
                    );
                    const lapData = await lapsResponse.json();

                    if (!Array.isArray(lapData)) {
                        console.error("Lap data is not an array for driver:", driver.name, lapData);
                        continue; // Skip to next driver if lap data is invalid
                    }

                    // Race Duration
                    const raceDurations = lapData
                        .map((lap: any) => lap.lap_duration)
                        .filter((duration: any) => duration !== null);
                    const totalRaceDuration = raceDurations.reduce((sum: number, duration: number) => sum + duration, 0);
                    if (totalRaceDuration > 0) teamRaceDurations.push(totalRaceDuration);

                    // Lap Data Calculation
                    const sector1Durations = lapData.map((lap: any) => lap.duration_sector_1).filter((val: any) => val !== null);
                    const sector2Durations = lapData.map((lap: any) => lap.duration_sector_2).filter((val: any) => val !== null);
                    const sector3Durations = lapData.map((lap: any) => lap.duration_sector_3).filter((val: any) => val !== null);
                    const lapDurations = lapData.map((lap: any) => lap.lap_duration).filter((val: any) => val !== null);
                    const pitDurations = lapData
                        .filter((lap: any) => lap.is_pit_out_lap)
                        .map((lap: any) => lap.lap_duration);

                    const bestPitDuration = pitDurations.length > 0 ? Math.min(...pitDurations) : null;
                    const averagePitDuration = pitDurations.length > 0 ? pitDurations.reduce((sum: number, duration: number) => sum + duration, 0) / pitDurations.length : null;

                    const maxSpeed = Math.max(...lapData.map((lap: any) => lap.i1_speed).filter((val: any) => val !== null), 0);

                    if (maxSpeed > 0) teamMaxSpeeds.push(maxSpeed);
                    if (sector1Durations.length > 0) teamAvgSector1s.push(sector1Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector1Durations.length);
                    if (sector2Durations.length > 0) teamAvgSector2s.push(sector2Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector2Durations.length);
                    if (sector3Durations.length > 0) teamAvgSector3s.push(sector3Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector3Durations.length);
                    if (lapDurations.length > 0) teamAvgLapTimes.push(lapDurations.reduce((sum: number, duration: number) => sum + duration, 0) / lapDurations.length);
                    if (averagePitDuration !== null) teamAvgPitDurations.push(averagePitDuration);
                    if (bestPitDuration !== null) teamBestPitDurations.push(bestPitDuration);


                } catch (apiError) {
                    console.error("Error fetching lap data for driver:", driver.name, apiError);
                    // Consider how to handle API errors for individual drivers within a team. For now, skip driver stats if error occurs.
                }
            }


            const avgRaceDuration = teamRaceDurations.length > 0 ? `${(teamRaceDurations.reduce((sum, duration) => sum + duration, 0) / teamRaceDurations.length / 60).toFixed(2)} minutes` : 'N/A';
            const avgMaxSpeed = teamMaxSpeeds.length > 0 ? (teamMaxSpeeds.reduce((sum, speed) => sum + speed, 0) / teamMaxSpeeds.length).toFixed(0) : 'N/A';
            const avgSector1 = teamAvgSector1s.length > 0 ? (teamAvgSector1s.reduce((sum, duration) => sum + duration, 0) / teamAvgSector1s.length).toFixed(2) + ' s' : 'N/A';
            const avgSector2 = teamAvgSector2s.length > 0 ? (teamAvgSector2s.reduce((sum, duration) => sum + duration, 0) / teamAvgSector2s.length).toFixed(2) + ' s' : 'N/A';
            const avgSector3 = teamAvgSector3s.length > 0 ? (teamAvgSector3s.reduce((sum, duration) => sum + duration, 0) / teamAvgSector3s.length).toFixed(2) + ' s' : 'N/A';
            const avgLapTime = teamAvgLapTimes.length > 0 ? (teamAvgLapTimes.reduce((sum, duration) => sum + duration, 0) / teamAvgLapTimes.length).toFixed(2) + ' s' : 'N/A';
            const avgPitTime = teamAvgPitDurations.length > 0 ? (teamAvgPitDurations.reduce((sum, duration) => sum + duration, 0) / teamAvgPitDurations.length).toFixed(2) + ' s' : 'N/A';
            const bestPitTime = teamBestPitDurations.length > 0 ? Math.min(...teamBestPitDurations).toFixed(2) + ' s' : 'N/A';


            setTeamData((prevState) => ({
                ...prevState,
                [index]: {
                    raceDuration: avgRaceDuration,
                    maxSpeed: avgMaxSpeed,
                    averageSector1: avgSector1,
                    averageSector2: avgSector2,
                    averageSector3: avgSector3,
                    averageLapTime: avgLapTime,
                    averagePitDuration: avgPitTime,
                    bestPitDuration: bestPitTime,
                },
            }));


        }
    };


    const fetchDriverLapAndRaceData = async (index: number) => {
        if (selectedDrivers[index] && selectedMeeting) {
            const driverNumber = selectedDrivers[index].driver_number;
            const meetingKey = selectedMeeting.meeting_key;
            const yearSession = selectedMeeting.year;

            try {
                const sessionsResponse = await fetch(
                    `https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&year=${yearSession}`
                );
                const sessionsData = await sessionsResponse.json();

                const raceSession = sessionsData.find((session: any) => session.session_name === 'Race');
                let sessionKeyToUse = meetingKey;
                if (raceSession) {
                    sessionKeyToUse = raceSession.session_key;
                } else {
                    sessionKeyToUse = meetingKey; // Use meeting key if race session not found, as fallback
                    console.warn("Race session not found, fetching laps for meeting key instead. Consider showing a warning to user.");
                }

                const lapsResponse = await fetch(
                    `https://api.openf1.org/v1/laps?session_key=${sessionKeyToUse}&driver_number=${driverNumber}`
                );
                const lapData = await lapsResponse.json();

                // Ensure lapData is an array before proceeding
                if (!Array.isArray(lapData)) {
                    console.error("Lap data is not an array:", lapData);
                    setDriverData((prevState) => ({
                        ...prevState,
                        [index]: {
                            ...prevState[index],
                            raceDuration: 'N/A',
                            maxSpeed: 'N/A',
                            averageSector1: 'N/A',
                            averageSector2: 'N/A',
                            averageSector3: 'N/A',
                            averageLapTime: 'N/A',
                            averagePitDuration: 'N/A',
                            bestPitDuration: 'N/A',
                        },
                    }));
                    return; // Exit the function if lapData is not valid
                }


                // Race Duration Calculation
                const raceDurations = lapData
                    .map((lap: any) => lap.lap_duration)
                    .filter((duration: any) => duration !== null);
                const totalRaceDuration = raceDurations.reduce((sum: number, duration: number) => sum + duration, 0);
                const formattedRaceDuration = totalRaceDuration > 0 ? `${(totalRaceDuration / 60).toFixed(2)} minutes` : 'N/A';


                // Lap Data Calculation
                const sector1Durations = lapData.map((lap: any) => lap.duration_sector_1).filter((val: any) => val !== null);
                const sector2Durations = lapData.map((lap: any) => lap.duration_sector_2).filter((val: any) => val !== null);
                const sector3Durations = lapData.map((lap: any) => lap.duration_sector_3).filter((val: any) => val !== null);
                const lapDurations = lapData.map((lap: any) => lap.lap_duration).filter((val: any) => val !== null);
                const pitDurations = lapData
                    .filter((lap: any) => lap.is_pit_out_lap)
                    .map((lap: any) => lap.lap_duration);

                const bestPitDuration = pitDurations.length > 0 ? Math.min(...pitDurations) : null;
                const averagePitDuration = pitDurations.length > 0 ? pitDurations.reduce((sum: number, duration: number) => sum + duration, 0) / pitDurations.length : null;


                const maxSpeed = Math.max(...lapData.map((lap: any) => lap.i1_speed).filter((val: any) => val !== null), 0);
                const averageSector1 = sector1Durations.length > 0 ? sector1Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector1Durations.length : null;
                const averageSector2 = sector2Durations.length > 0 ? sector2Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector2Durations.length : null;
                const averageSector3 = sector3Durations.length > 0 ? sector3Durations.reduce((sum: number, duration: number) => sum + duration, 0) / sector3Durations.length : null;
                const averageLapTime = lapDurations.length > 0 ? lapDurations.reduce((sum: number, duration: number) => sum + duration, 0) / lapDurations.length : null;


                setDriverData((prevState) => ({
                    ...prevState,
                    [index]: {
                        ...prevState[index],
                        raceDuration: formattedRaceDuration,
                        maxSpeed: maxSpeed > 0 ? maxSpeed : 'N/A',
                        averageSector1: averageSector1 !== null ? averageSector1.toFixed(2) + ' s' : 'N/A',
                        averageSector2: averageSector2 !== null ? averageSector2.toFixed(2) + ' s' : 'N/A',
                        averageSector3: averageSector3 !== null ? averageSector3.toFixed(2) + ' s' : 'N/A',
                        averageLapTime: averageLapTime !== null ? averageLapTime.toFixed(2) + ' s' : 'N/A',
                        averagePitDuration: averagePitDuration !== null ? averagePitDuration.toFixed(2) + ' s' : 'N/A',
                        bestPitDuration: bestPitDuration !== null ? bestPitDuration.toFixed(2) + ' s' : 'N/A',
                    },
                }));


            } catch (error) {
                console.error("Error fetching lap and race data:", error);
                setDriverData((prevState) => ({
                    ...prevState,
                    [index]: {
                        ...prevState[index],
                        raceDuration: 'Error fetching data',
                        maxSpeed: 'Error',
                        averageSector1: 'Error',
                        averageSector2: 'Error',
                        averageSector3: 'Error',
                        averageLapTime: 'Error',
                        averagePitDuration: 'Error',
                        bestPitDuration: 'Error',
                    },
                }));
            }
        }
    };


    const fetchCoordinates = async (location: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
            const data = await response.json();
            if (data && data[0]) {
                setCoordinates({
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des coordonnées:", error);
        }
    };

    const formatDate = (date: string, offset: string) => {
        if (!date) return 'Date à venir';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleGPSelect = async (gp: GP) => {
        setMainGP(gp);
        setSelectedMeeting(gp); // Update selectedMeeting when GP is selected from dropdown
        setShowDropdown(false);
        await fetchCoordinates(gp.location + ", " + gp.country_name);
    };

    const handleDriverClick = (driverName: string) => {
        const driver = drivers.find(d => d.last_name === driverName);
        if (driver) {
            setSelectedDriver(driver);
        }
    };

    const handleTeamClick = (teamName: string) => {
        const team = teams.find(t => t.name === teamName);
        if (team) {
            setSelectedTeam(team);
        }
    };

    const getCircuitParticularites = (grandPrixName: string) => {
        const grandPrix = gp.find(g => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.particularites : '';
    };

    const getCircuitImageUrl = (grandPrixName: string) => {
        const grandPrix = gp.find(g => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.image_circuit : '';
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageVisible(true);
    };

    useEffect(() => {
        fetchDrivers();
        // Fetch all meetings initially to populate years dropdown
        fetchMeetings(String(selectedYear)); // Fetch meetings for initial selected year
    }, []);

    useEffect(() => {
        // Refetch meetings when selectedYear changes
        if (selectedYear) {
            fetchMeetings(String(selectedYear));
        } else {
            fetchMeetings(null); // Fetch all meetings if no year is selected, or you can decide to show default meetings.
        }
    }, [selectedYear]);


    useEffect(() => {
        if (selectedDrivers[0] && selectedMeeting) {
            fetchDriverLapAndRaceData(0);
        }
    }, [selectedDrivers[0], selectedMeeting]);

    useEffect(() => {
        if (selectedDrivers[1] && selectedMeeting) {
            fetchDriverLapAndRaceData(1);
        }
    }, [selectedDrivers[1], selectedMeeting]);

    useEffect(() => {
        if (selectedTeamsForComparison[0] && selectedMeeting) {
            fetchTeamAverageData(0);
        }
    }, [selectedTeamsForComparison[0], selectedMeeting]);

    useEffect(() => {
        if (selectedTeamsForComparison[1] && selectedMeeting) {
            fetchTeamAverageData(1);
        }
    }, [selectedTeamsForComparison[1], selectedMeeting]);


    const toggleTab = () => setIsOpen(!isOpen);
    const toggleTeamTab = () => setIsTeamComparisonOpen(!isTeamComparisonOpen);

    const toggleDropdown = (index: number) => {
        setIsDropdownOpen((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };
    const toggleDropdownMeeting = () => {
        setIsDropdownOpenMeeting(!isDropdownOpenMeeting);
    };
    const toggleDropdownYear = () => {
        setIsDropdownOpenYear(!isDropdownOpenYear);
    };
    const toggleTeamDropdown = (index: number) => {
        setIsTeamDropdownOpen((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };


    const handleDriverChange = (index: number, driver: any) => {
        setSelectedDrivers((prevState) => ({
            ...prevState,
            [index]: driver,
        }));
        toggleDropdown(index);
    };

    const handleMeetingChange = (meeting: any, index: number) => {
        setSelectedMeeting(meeting);
        setSelectedMeetingIndex(index);
        toggleDropdownMeeting();
    };
    const handleYearChange = (year: string) => {
        setSelectedYear(Number(year));
        setSelectedMeeting(null);
        toggleDropdownYear();
    };
    const handleTeamChange = (index: number, team: any) => {
        setSelectedTeamsForComparison((prevState) => ({
            ...prevState,
            [index]: team,
        }));
        toggleTeamDropdown(index);
    };


    const getComparisonStyle = (value1: number, value2: number, isHigherBetter: boolean) => {
        if (value1 === null || value2 === null) return {};

        if (isHigherBetter) {
            return value1 > value2 ? { color: "green" } : { color: "red" };
        } else {
            return value1 < value2 ? { color: "green" } : { color: "red" };
        }
    };


    return (
        <div className="min-h-screen bg-[#1B1C1D]">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Chargement des données...</p>
                </div>
            )}

            <div className={loading ? 'hidden' : 'content-wrapper'}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 space-y-4 container mx-auto px-4 py-16"
                >
                    <div className="relative flex justify-center items-center gap-4">
                        <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
                            Past Seasons
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
                        Explore historical Formula 1 Grand Prix data, results, and comparisons.
                    </p>
                </motion.div>

                <div className="container mx-auto px-4 py-16">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <GrandPrixCard
                                mainGP={mainGP}
                                allGPs={allGPs}
                                selectedYear={selectedYear}
                                showDropdown={showDropdown}
                                hoveredCard={hoveredCard}
                                setShowDropdown={setShowDropdown}
                                setHoveredCard={setHoveredCard}
                                handleGPSelect={handleGPSelect}
                                handleYearChange={handleYearChange}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <DetailsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <InformationsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                gp={gp}
                                setHoveredCard={setHoveredCard}
                                formatDate={formatDate}
                                getCircuitParticularites={getCircuitParticularites}
                                getCircuitImageUrl={getCircuitImageUrl}
                                handleImageClick={handleImageClick}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ResultatsCard
                                mainGP={mainGP}
                                drivers={drivers}
                                hoveredCard={hoveredCard}
                                showAllPodium={showAllPodium}
                                showAllQualif={showAllQualif}
                                setHoveredCard={setHoveredCard}
                                setShowAllPodium={setShowAllPodium}
                                setShowAllQualif={setShowAllQualif}
                                handleDriverClick={handleDriverClick}
                                handleTeamClick={handleTeamClick}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <LocalisationCard
                                coordinates={coordinates}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                setIsMapVisible={setIsMapVisible}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ComparerPilotesCard
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                toggleTab={toggleTab}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ComparerEcuriesCard
                                hoveredCard={hoveredCard}
                                selectedTeam={selectedTeam}
                                setHoveredCard={setHoveredCard}
                                toggleTeamTab={toggleTeamTab}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ModeProCard
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                setIsFlagAnimating={setIsFlagAnimating}
                            />
                        </motion.div>
                    </div>


                    {isMapVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 map-modal"
                            onClick={() => setIsMapVisible(false)}
                        >
                            <div
                                className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4 map-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
                                    onClick={() => setIsMapVisible(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                    <Globe className="mr-2 icon-widget" /> Localisation du Grand Prix
                                </h2>
                                <div className="flex justify-center">
                                    <img
                                        src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates?.lon},${coordinates?.lat}&z=1&l=map&size=600,400&pt=${coordinates?.lon},${coordinates?.lat},pm2rdm`}
                                        alt="Map of Circuit Location"
                                        className="w-full h-96 object-cover rounded-lg border-2 border-orange-500 map-popup-image icon-widget"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedDriver && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 driver-modal"
                            onClick={() => setSelectedDriver(null)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
                                    onClick={() => setSelectedDriver(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                                <DriverDetailCard driver={selectedDriver} />
                            </div>
                        </div>
                    )}

                    {selectedTeam && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 team-modal"
                            onClick={() => setSelectedTeam(null)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
                                    onClick={() => setSelectedTeam(null)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                                <TeamDetailCard team={selectedTeam} />
                            </div>
                        </div>
                    )}


                    {isImageVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 image-modal"
                            onClick={() => setIsImageVisible(false)}
                        >
                            <div
                                className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4 image-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
                                    onClick={() => setIsImageVisible(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                    Circuit of the Grand Prix
                                </h2>
                                <img
                                    src={selectedImageUrl}
                                    alt="Grand Prix Circuit"
                                    className="w-full h-full object-cover rounded-lg circuit-popup-image icon-widget"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={toggleTab}>
                        <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-3/4 max-w-5xl z-50" onClick={(e) => e.stopPropagation()}>
                            {/* Header Section */}
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-orange-500">Driver Comparison</h2>
                                    {selectedMeeting && (
                                        <p className="text-sm text-gray-400">
                                            Comparing drivers at: {selectedMeeting.meeting_name} ({selectedMeeting.year})
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">

                                    <button
                                        onClick={toggleTab}
                                        className="bg-transparent hover:bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        <X className="h-6 w-6" />
                                        <span className="sr-only">Close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Comparison Content */}
                            {comparisonType === "driver" && ( // Still check if comparison type is driver, though it's now fixed.
                                <div className="grid grid-cols-2 gap-8">
                                    {[0, 1].map((index) => (
                                        <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-md">
                                            {selectedDrivers[index] ? (
                                                <>
                                                    {/* Driver Selection Dropdown */}
                                                    <div className="relative mb-0">
                                                        <div className="relative">
                                                            {isDropdownOpen[index] && (
                                                                <div className="absolute bg-white text-gray-800 border border-gray-200 rounded-md shadow-lg mt-1 w-60 z-20">
                                                                    <ul className="max-h-56 overflow-y-auto py-1">
                                                                        {drivers.map((driver) => (
                                                                            <li
                                                                                key={driver.id}
                                                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                                                                                onClick={() => handleDriverChange(index, driver)}
                                                                            >
                                                                                <img
                                                                                    src={driver.headshot_url}
                                                                                    alt={`${driver.name} avatar`}
                                                                                    className="w-6 h-6 rounded-full"
                                                                                />
                                                                                <span>{driver.name}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>


                                                    {/* Driver Info */}
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <img
                                                            src={selectedDrivers[index].headshot_url}
                                                            alt={`${selectedDrivers[index].full_name} headshot`}
                                                            className="w-24 h-24 rounded-full border-4 border-orange-500"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold text-xl">{selectedDrivers[index].full_name}</h3>
                                                            <p className="text-gray-300">Pilote: {selectedDrivers[index].name}</p>
                                                            <p className="text-gray-300">Team: {selectedDrivers[index].team_name}</p>
                                                            <p className='text-gray-300'>GP: {selectedMeeting?.meeting_name || 'N/A'}</p>
                                                            <button
                                                                onClick={() => toggleDropdown(index)}
                                                                className="mt-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 "
                                                            >
                                                                Change Driver
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Performance Metrics */}
                                                    <div className="space-y-4">
                                                        <div className="bg-gray-700 rounded-lg p-4">
                                                            <p className="flex items-center text-gray-100"><ClockArrowUp className="mr-3 w-5 h-5 text-orange-500" />Race Time: <span className="ml-auto font-semibold">{driverData[index]?.raceDuration || 'N/A'}</span></p>
                                                        </div>

                                                        <div className="bg-gray-700 rounded-lg p-4">
                                                            <h4 className="font-bold text-lg text-orange-500 mb-3"><DatabaseZap className="inline-block mr-2 w-5 h-5"/>General Stats</h4>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-gray-100">Max Speed:</span>
                                                                <span className="font-semibold">{driverData[index]?.maxSpeed} km</span>
                                                            </div>
                                                            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: driverData[index]?.maxSpeed && typeof driverData[index].maxSpeed === 'number' ? `${(driverData[index].maxSpeed / 400) * 100}%` : '0%' }}></div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-2 mb-2">
                                                                <span className="text-gray-100">Avg Lap Time:</span>
                                                                <span className="font-semibold">{driverData[index]?.averageLapTime}</span>
                                                            </div>
                                                            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: driverData[index]?.averageLapTime && typeof driverData[index].averageLapTime === 'string' && driverData[index].averageLapTime !== 'N/A' ? `${(parseFloat(driverData[index].averageLapTime.replace(' s', '')) / 200) * 100}%` : '0%' }}></div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-700 rounded-lg p-4">
                                                            <h4 className="font-bold text-lg text-orange-500 mb-3"><History className="inline-block mr-2 w-5 h-5"/>Sector Details</h4>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-gray-100">Avg Sector 1:</span>
                                                                <span className="font-semibold">{driverData[index]?.averageSector1}</span>
                                                            </div>
                                                            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: driverData[index]?.averageSector1 && typeof driverData[index].averageSector1 === 'string' && driverData[index].averageSector1 !== 'N/A' ? `${(parseFloat(driverData[index].averageSector1.replace(' s', '')) / 80) * 100}%` : '0%' }}></div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-2 mb-2">
                                                                <span className="text-gray-100">Avg Sector 2:</span>
                                                                <span className="font-semibold">{driverData[index]?.averageSector2}</span>
                                                            </div>
                                                            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: driverData[index]?.averageSector2 && typeof driverData[index].averageSector2 === 'string' && driverData[index].averageSector2 !== 'N/A' ? `${(parseFloat(driverData[index].averageSector2.replace(' s', '')) / 80) * 100}%` : '0%' }}></div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-2">
                                                                <span className="text-gray-100">Avg Sector 3:</span>
                                                                <span className="font-semibold">{driverData[index]?.averageSector3}</span>
                                                            </div>
                                                            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: driverData[index]?.averageSector3 && typeof driverData[index].averageSector3 === 'string' && driverData[index].averageSector3 !== 'N/A' ? `${(parseFloat(driverData[index].averageSector3.replace(' s', '')) / 40) * 100}%` : '0%' }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-700 rounded-lg p-4">
                                                            <p className="flex items-center text-gray-100"><Hourglass className="mr-3 w-5 h-5 text-orange-500" />Best pit time: <span className="ml-auto font-semibold">{driverData[index]?.bestPitDuration}</span></p>
                                                            <p className="flex items-center text-gray-100"><ClockArrowDown className="mr-3 w-5 h-5 text-orange-500" />Average pit time: <span className="ml-auto font-semibold">{driverData[index]?.averagePitDuration}</span></p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center text-gray-400">Loading data...</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {isTeamComparisonOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={toggleTeamTab}>
                        <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg w-3/4 max-w-5xl z-50" onClick={(e) => e.stopPropagation()}>
                            {/* Team Comparison Modal */}
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-orange-500">Team Comparison</h2>
                                    {selectedMeeting && (
                                        <p className="text-sm text-gray-400">
                                            Comparing teams at: {selectedMeeting.meeting_name} ({selectedMeeting.year})
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">

                                    <button
                                        onClick={toggleTeamTab}
                                        className="bg-transparent hover:bg-gray-800 rounded-full p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        <X className="h-6 w-6" />
                                        <span className="sr-only">Close</span>
                                    </button>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-8">
                                {[0, 1].map((index) => (
                                    <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-md">
                                        {selectedTeamsForComparison[index] ? (
                                            <>
                                                {/* Team Selection Dropdown */}
                                                <div className="relative mb-0">
                                                    <div className="relative">
                                                        <h3 className="font-semibold text-xl text-center mb-2">{selectedTeamsForComparison[index].name}</h3>
                                                        <div className="flex justify-center mb-4">
                                                            <Button
                                                                onClick={() => toggleTeamDropdown(index)}
                                                                className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 "
                                                            >
                                                                {selectedTeamsForComparison[index].name}
                                                            </Button>
                                                        </div>

                                                        {isTeamDropdownOpen[index] && (
                                                            <div className="absolute bg-white text-gray-800 border border-gray-200 rounded-md shadow-lg mt-1 w-60 z-20 left-1/2 transform -translate-x-1/2">
                                                                <ul className="max-h-56 overflow-y-auto py-1">
                                                                    {teams.map((team) => (
                                                                        <li
                                                                            key={team.name}
                                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2 justify-center"
                                                                            onClick={() => handleTeamChange(index, team)}
                                                                        >
                                                                            <span>{team.name}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>


                                                {/* Team Info - Removed Images */}


                                                {/* Performance Metrics */}
                                                <div className="space-y-4">
                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <p className="flex items-center text-gray-100"><ClockArrowUp className="mr-3 w-5 h-5 text-orange-500" />Avg Race Time: <span className="ml-auto font-semibold">{teamData[index]?.raceDuration || 'N/A'}</span></p>
                                                    </div>

                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <h4 className="font-bold text-lg text-orange-500 mb-3"><DatabaseZap className="inline-block mr-2 w-5 h-5"/>General Stats (Average of Drivers)</h4>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-gray-100">Avg Max Speed:</span>
                                                            <span className="font-semibold">{teamData[index]?.maxSpeed} km</span>
                                                        </div>
                                                        <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: teamData[index]?.maxSpeed && typeof teamData[index].maxSpeed === 'string' && teamData[index].maxSpeed !== 'N/A' ? `${(parseFloat(teamData[index].maxSpeed) / 400) * 100}%` : '0%' }}></div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2 mb-2">
                                                            <span className="text-gray-100">Avg Lap Time:</span>
                                                            <span className="font-semibold">{teamData[index]?.averageLapTime}</span>
                                                        </div>
                                                        <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: teamData[index]?.averageLapTime && typeof teamData[index].averageLapTime === 'string' && teamData[index].averageLapTime !== 'N/A' ? `${(parseFloat(teamData[index].averageLapTime.replace(' s', '')) / 200) * 100}%` : '0%' }}></div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <h4 className="font-bold text-lg text-orange-500 mb-3"><History className="inline-block mr-2 w-5 h-5"/>Sector Details (Average of Drivers)</h4>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-gray-100">Avg Sector 1:</span>
                                                            <span className="font-semibold">{teamData[index]?.averageSector1}</span>
                                                        </div>
                                                        <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: teamData[index]?.averageSector1 && typeof teamData[index].averageSector1 === 'string' && teamData[index].averageSector1 !== 'N/A' ? `${(parseFloat(teamData[index].averageSector1.replace(' s', '')) / 80) * 100}%` : '0%' }}></div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2 mb-2">
                                                            <span className="text-gray-100">Avg Sector 2:</span>
                                                            <span className="font-semibold">{teamData[index]?.averageSector2}</span>
                                                        </div>
                                                        <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: teamData[index]?.averageSector2 && typeof teamData[index].averageSector2 === 'string' && teamData[index].averageSector2 !== 'N/A' ? `${(parseFloat(teamData[index].averageSector2.replace(' s', '')) / 80) * 100}%` : '0%' }}></div>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-gray-100">Avg Sector 3:</span>
                                                            <span className="font-semibold">{teamData[index]?.averageSector3}</span>
                                                        </div>
                                                        <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{ width: teamData[index]?.averageSector3 && typeof teamData[index].averageSector3 === 'string' && teamData[index].averageSector3 !== 'N/A' ? `${(parseFloat(teamData[index].averageSector3.replace(' s', '')) / 40) * 100}%` : '0%' }}></div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-center text-gray-400">Loading team data...</p>
                                        )}
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrandPrixCards;