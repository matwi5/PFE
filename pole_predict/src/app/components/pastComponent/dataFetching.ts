// src/utils/dataFetching.ts
import { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig"; // Assurez-vous que le chemin est correct
import { collection, getDocs } from "firebase/firestore";
import { GP, Driver, Team, GrandPrix } from "./types"; // Assurez-vous d'avoir un fichier types.ts avec ces interfaces

export const useDataFetching = () => {
  const [allGPs, setAllGPs] = useState<GP[]>([]);
  const [gp, setGP] = useState<GrandPrix[]>([]);
  const [mainGP, setMainGP] = useState<GP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [driverData, setDriverData] = useState<{ [key: number]: any }>({
    0: {},
    1: {},
  });
  const [teamData, setTeamData] = useState<{ [key: number]: any }>({
    0: {},
    1: {},
  });
  const [selectedDrivers, setSelectedDrivers] = useState<{ [key: number]: any }>(
    {
      0: {},
      1: {},
    }
  );
  const [selectedTeamsForComparison, setSelectedTeamsForComparison] = useState<{
    [key: number]: any;
  }>({
    0: {},
    1: {},
  });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gpsResponse, driversResponse, teamsResponse, gpResponse] =
          await Promise.all([
            fetch("/api/pastseasons"),
            fetch("/api/drivers"),
            fetch("/api/teams"),
            fetch("/api/gp"),
          ]);

        if (!gpsResponse.ok)
          throw new Error("Erreur lors de la récupération des grands prix");
        if (!driversResponse.ok)
          throw new Error("Erreur lors de la récupération des pilotes");
        if (!teamsResponse.ok)
          throw new Error("Erreur lors de la récupération des équipes");
        if (!gpResponse.ok)
          throw new Error("Erreur lors de la récupération des infos des GP");

        const [gpsData, driversData, teamsData, GrandPData] =
          await Promise.all([
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
      const meetingDocs = await getDocs(meetingsCollection);
      let fetchedMeetings = meetingDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const years = [
        ...new Set(
          fetchedMeetings.map((meeting) => meeting.year).filter((y) => y != null)
        ),
      ];
      setAvailableYears(years.map(String));

      if (year) {
        fetchedMeetings = fetchedMeetings.filter(
          (meeting) => String(meeting.year) === year
        );
      }
      setMeetings(fetchedMeetings);
      if (fetchedMeetings.length > 0) {
        setSelectedMeeting(fetchedMeetings[0] || null);
      } else {
        setSelectedMeeting(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des meetings :", error);
    }
  };

  const fetchTeamAverageData = async (index: number) => {
    // Implémentation similaire à votre code original
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
    // Implémentation similaire à votre code original
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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}`
      );
      const data = await response.json();
      if (data && data[0]) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des coordonnées:", error);
    }
  };

    useEffect(() => {
        if (mainGP) {
            fetchCoordinates(mainGP.location + ", " + mainGP.country_name);
        }
    }, [mainGP]);

  useEffect(() => {
    fetchDrivers();
    fetchMeetings(String(selectedYear));
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchMeetings(String(selectedYear));
    } else {
      fetchMeetings(null);
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

  return {
    allGPs,
    gp,
    mainGP,
    loading,
    error,
    drivers,
    teams,
    selectedYear,
    meetings,
    selectedMeeting,
    driverData,
    teamData,
    selectedDrivers,
    selectedTeamsForComparison,
    setMainGP,
    setSelectedMeeting,
    setSelectedYear,
    setSelectedDrivers,
    setSelectedTeamsForComparison,
    availableYears,
    setAvailableYears,
    setMeetings,
    coordinates,
    fetchCoordinates,
    setDrivers
  };
};