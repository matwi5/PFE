import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';

const ImprovedEloChart = () => {
  const [eloData, setEloData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDrivers, setSelectedDrivers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [driverDetails, setDriverDetails] = useState({});
  const [currentYear, setCurrentYear] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [current2024Drivers, setCurrent2024Drivers] = useState([]);

  // Constants for ELO calculation
  const START_YEAR = 2010;
  const END_YEAR = 2024;
  const INITIAL_ELO = 2000; // Changed based on paper recommendation
  const CAR_FACTOR = 156.974; // From linear regression analysis in paper

  // Dynamic K-Factor calculation
  const getKFactor = (driverId, raceType, seasonStart) => {
    const seasonsPassed = eloData[driverId]?.length > 0 
      ? (new Date(eloData[driverId][eloData[driverId].length - 1].date).getFullYear() - seasonStart + 1)
      : 0;
    
    if (seasonsPassed < 1) return 24; // New driver
    if (raceType === 'qualifying') return 16; // Qualifying sessions
    return 12; // Regular races
  };

  // Zero-sum normalization
  const normalizeRatings = (ratings) => {
    const driverCount = Object.keys(ratings).length;
    if (driverCount === 0) return ratings;

    const totalRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
    const targetTotal = INITIAL_ELO * driverCount;
    const adjustment = (targetTotal - totalRating) / driverCount;

    return Object.fromEntries(
      Object.entries(ratings).map(([driverId, rating]) => [
        driverId,
        rating + adjustment
      ])
    );
  };

  // Calculate car rating (Rc) using qualifying data
  const calculateRc = (qualifyingResults) => {
    if (!qualifyingResults.length) return {};
    
    // Find fastest Q3 time
    const q3Times = qualifyingResults
      .filter(r => r.Q3)
      .map(r => timeToSeconds(r.Q3));
    
    if (!q3Times.length) return {};
    
    const fastestTime = Math.min(...q3Times);
    
    // Group by team
    const teamTimes = {};
    qualifyingResults.forEach(result => {
      if (!result.Q3) return;
      const team = result.Constructor.constructorId;
      if (!teamTimes[team]) teamTimes[team] = [];
      teamTimes[team].push(timeToSeconds(result.Q3));
    });

    // Calculate Rc using formula from paper: (Tdriver - Tfastest) / Tfastest
    return Object.fromEntries(
      Object.entries(teamTimes).map(([team, times]) => [
        team,
        ((times.reduce((a, b) => a + b) / times.length) - fastestTime) / fastestTime
      ])
    );
  };

  // Helper function to convert time string to seconds
  const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(':');
    const minutes = parts.length > 1 ? parseFloat(parts[0]) : 0;
    const seconds = parseFloat(parts[parts.length - 1]);
    return minutes * 60 + seconds;
  };

  // Calculate expected score for ELO
  const getExpectedScore = (playerElo, opponentElo, playerRc, opponentRc) => {
    const adjustedPlayerElo = playerElo - (CAR_FACTOR * playerRc);
    const adjustedOpponentElo = opponentElo - (CAR_FACTOR * opponentRc);
    return 1 / (1 + Math.pow(10, (adjustedOpponentElo - adjustedPlayerElo) / 400));
  };

  // Update ELO rating
  const updateElo = (currentElo, opponentElo, actualScore, rcTeam, rcOpponent, kFactor) => {
    const expectedScore = getExpectedScore(currentElo, opponentElo, rcTeam, rcOpponent);
    return currentElo + kFactor * (actualScore - expectedScore);
  };

  // Fetch current 2024 drivers
  useEffect(() => {
    const fetch2024Drivers = async () => {
      try {
        const response = await fetch('https://ergast.com/api/f1/2024/drivers.json');
        if (!response.ok) {
          throw new Error('Failed to fetch 2024 drivers');
        }
        const data = await response.json();
        const drivers = data.MRData.DriverTable.Drivers;
        setCurrent2024Drivers(drivers.map(driver => driver.driverId));
        setSelectedDrivers(new Set(drivers.map(driver => driver.driverId)));
      } catch (error) {
        console.error('Error fetching 2024 drivers:', error);
        setError('Failed to load 2024 drivers');
      }
    };

    fetch2024Drivers();
  }, []);

  useEffect(() => {
    const fetchYearData = async (year) => {
      try {
        const [qualifyingResponse, raceResponse] = await Promise.all([
          fetch(`https://ergast.com/api/f1/${year}/qualifying.json`),
          fetch(`https://ergast.com/api/f1/${year}/results.json`)
        ]);

        if (!qualifyingResponse.ok || !raceResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const qualifyingData = await qualifyingResponse.json();
        const raceData = await raceResponse.json();

        return {
          qualifying: qualifyingData.MRData.RaceTable.Races,
          races: raceData.MRData.RaceTable.Races
        };
      } catch (err) {
        console.error(`Error fetching ${year} data:`, err);
        return null;
      }
    };

    const loadAllData = async () => {
      let currentEloRatings = {};
      let currentEloHistory = {};
      let currentDrivers = {};

      const totalYears = END_YEAR - START_YEAR + 1;

      for (let year = START_YEAR; year <= END_YEAR; year++) {
        setCurrentYear(year);
        const yearData = await fetchYearData(year);
        
        if (yearData) {
          yearData.races.forEach((race, raceIndex) => {
            const qualifyingResults = yearData.qualifying[raceIndex]?.QualifyingResults || [];
            const rcRatings = calculateRc(qualifyingResults);

            // Filter out DNFs as per research recommendation
            const finishedResults = race.Results.filter(r => r.status === 'Finished');
            const teamsDrivers = _.groupBy(finishedResults, 'Constructor.constructorId');

            // Process each team's drivers
            Object.values(teamsDrivers).forEach(teamDrivers => {
              if (teamDrivers.length !== 2) return;

              const [driver1, driver2] = teamDrivers;
              const team = driver1.Constructor.constructorId;
              const rcTeam = rcRatings[team] || 0;

              // Store driver details
              [driver1, driver2].forEach(driver => {
                const driverId = driver.Driver.driverId;
                if (!currentDrivers[driverId]) {
                  currentDrivers[driverId] = {
                    id: driverId,
                    name: `${driver.Driver.givenName} ${driver.Driver.familyName}`,
                    code: driver.Driver.code || driverId.toUpperCase()
                  };
                }
                if (!currentEloRatings[driverId]) {
                  currentEloRatings[driverId] = INITIAL_ELO;
                  currentEloHistory[driverId] = [];
                }
              });

              const driver1Id = driver1.Driver.driverId;
              const driver2Id = driver2.Driver.driverId;
              
              const actualScore = driver1.position < driver2.position ? 1 : 0;
              
              // Update ELOs using car performance adjusted formula
              const kFactor1 = getKFactor(driver1Id, 'race', START_YEAR);
              const kFactor2 = getKFactor(driver2Id, 'race', START_YEAR);

              const newElo1 = updateElo(
                currentEloRatings[driver1Id],
                currentEloRatings[driver2Id],
                actualScore,
                rcTeam,
                rcTeam,
                kFactor1
              );

              const newElo2 = updateElo(
                currentEloRatings[driver2Id],
                currentEloRatings[driver1Id],
                1 - actualScore,
                rcTeam,
                rcTeam,
                kFactor2
              );

              // Normalize ratings after each round
              const updatedRatings = normalizeRatings({
                ...currentEloRatings,
                [driver1Id]: newElo1,
                [driver2Id]: newElo2
              });

              // Store historical ELO data
              [
                [driver1Id, newElo1],
                [driver2Id, newElo2]
              ].forEach(([driverId, elo]) => {
                currentEloHistory[driverId].push({
                  date: race.date,
                  elo,
                  raceName: race.raceName,
                  rcFactor: rcTeam
                });
              });

              // Update current ratings
              currentEloRatings[driver1Id] = newElo1;
              currentEloRatings[driver2Id] = newElo2;
            });
          });

          // Update state after each year
          setEloData(currentEloHistory);
          setDriverDetails(currentDrivers);
          
          const progress = ((year - START_YEAR + 1) / totalYears) * 100;
          setLoadingProgress(progress);
        }
      }

      // Keep only 2024 drivers selected
      const currentDriverIds = new Set(current2024Drivers);
      setSelectedDrivers(currentDriverIds);
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  const handleDriverToggle = (driverId) => {
    const newSelected = new Set(selectedDrivers);
    if (newSelected.has(driverId)) {
      newSelected.delete(driverId);
    } else {
      newSelected.add(driverId);
    }
    setSelectedDrivers(newSelected);
  };

  const filteredDrivers = Object.entries(driverDetails)
    .filter(([driverId, driver]) => 
      current2024Drivers.includes(driverId) && (
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-lg">
            Loading data for {currentYear} ({Math.round(loadingProgress)}%)
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-lg text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData = Object.values(
    Object.entries(eloData)
      .filter(([driverId]) => selectedDrivers.has(driverId))
      .reduce((acc, [driverId, races]) => {
        races.forEach(race => {
          const date = race.date;
          if (!acc[date]) {
            acc[date] = { date, raceName: race.raceName };
          }
          // Include adjusted ELO (driver ELO - car factor * Rc)
          acc[date][driverId] = race.elo - (CAR_FACTOR * race.rcFactor);
        });
        return acc;
      }, {})
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
              <div className="h-96 overflow-auto border rounded p-4">
                {filteredDrivers.map(([driverId, driver]) => (
                  <div key={driverId} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id={driverId}
                      checked={selectedDrivers.has(driverId)}
                      onChange={() => handleDriverToggle(driverId)}
                    />
                    <label htmlFor={driverId} className="text-sm">
                      {driver.name} ({driver.code})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>F1 Drivers Adjusted ELO Rating Evolution (2010-2024)</CardTitle>
          </CardHeader>
          <CardContent className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  type="category"
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  label={{ value: 'Adjusted ELO Rating', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ payload, label }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-white p-4 border rounded shadow">
                          <p className="font-bold">{payload[0].payload.raceName}</p>
                          <p>{`Date: ${label}`}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {`${driverDetails[entry.dataKey]?.name}: ${Math.round(entry.value)}`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {Array.from(selectedDrivers).map((driverId, index) => (
                  <Line
                    key={driverId}
                    type="monotone"
                    dataKey={driverId}
                    name={driverDetails[driverId]?.name || driverId}
                    stroke={`hsl(${(index * 360) / selectedDrivers.size}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImprovedEloChart;