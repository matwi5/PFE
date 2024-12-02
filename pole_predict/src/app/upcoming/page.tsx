'use client';

import { useState, useEffect } from 'react';

// Définir les types pour les données de l'API du classement général
interface Constructor {
  name: string;
}

interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
}

interface DriverStanding {
  Driver: Driver;
  Constructors: Constructor[];
  points: string;  // points might be a string but should be displayed as a number
}

interface F1RankingResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: {
        DriverStandings: DriverStanding[];  // Classement général
      }[]; 
    };
  };
}

// Définir les types pour les résultats de la course
interface RaceResult {
  position: string;
  Driver: Driver;
  time: {
    time: string;
  };
}

interface RaceResultsResponse {
  MRData: {
    RaceTable: {
      Races: {
        Results: RaceResult[];
      }[];
    };
  };
}

// Définir les types pour les résultats des qualifications
interface QualifyingResult {
  position: string;
  Driver: Driver;
  time: {
    time: string;
  };
}

interface QualifyingResultsResponse {
  MRData: {
    RaceTable: {
      Races: {
        QualifyingResults: QualifyingResult[];
      }[];
    };
  };
}

const F1Ranking = () => {
  const [ranking, setRanking] = useState<DriverStanding[]>([]);  // Classement général
  const [brazilResults, setBrazilResults] = useState<RaceResult[]>([]);  // Résultats Brésil
  const [qualifyingResults, setQualifyingResults] = useState<QualifyingResult[]>([]);  // Résultats Qualifs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de classement général
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('https://ergast.com/api/f1/current/driverStandings.json');
        if (!response.ok) {
          throw new Error('Erreur de réseau');
        }
        const data: F1RankingResponse = await response.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        setRanking(standings);
      } catch (error) {
        console.error("Erreur de récupération des données :", error);
        setError('Impossible de charger les données');
      }
    };

    // Charger les résultats du Grand Prix du Brésil 2023
    const fetchBrazilGPResults = async () => {
      try {
        const response = await fetch('https://ergast.com/api/f1/2023/21/results.json'); // Course 21 = Brésil
        if (!response.ok) {
          throw new Error('Erreur de réseau');
        }
        const data: RaceResultsResponse = await response.json();
        const results = data.MRData.RaceTable.Races[0]?.Results || [];
        setBrazilResults(results.slice(0, 3)); // Prendre uniquement les 3 premiers
      } catch (error) {
        console.error("Erreur de récupération des résultats du Brésil :", error);
        setError('Impossible de charger les résultats du Brésil');
      }
    };

    // Charger les résultats des qualifications du Grand Prix du Brésil 2023
    const fetchQualifyingResults = async () => {
      try {
        const response = await fetch('https://ergast.com/api/f1/2023/21/qualifying.json'); // Qualifications Course 21 = Brésil
        if (!response.ok) {
          throw new Error('Erreur de réseau');
        }
        const data: QualifyingResultsResponse = await response.json();
        const results = data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
        setQualifyingResults(results.slice(0, 3)); // Prendre uniquement les 3 premiers
      } catch (error) {
        console.error("Erreur de récupération des résultats des qualifications :", error);
        setError('Impossible de charger les résultats des qualifications');
      }
    };

    fetchRanking();
    fetchBrazilGPResults();
    fetchQualifyingResults();
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ backgroundColor: 'black', color: 'white', padding: '20px' }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "2rem" }}>
        Classement Général, Podium et Qualifs du Grand Prix du Brésil 2023
      </h1>

      {/* Tableau du classement général */}
      <h2>Classement Général des Pilotes</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid white' }}>Position</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Pilote</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {ranking.slice(0, 5).map((driver, index) => (
            <tr key={driver.Driver.driverId}>
              <td style={{ padding: '10px', border: '1px solid white' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {driver.Driver.givenName} {driver.Driver.familyName}
              </td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {parseFloat(driver.points).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tableau du podium du Grand Prix du Brésil 2023 */}
      <h2>Podium du Grand Prix du Brésil 2023</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid white' }}>Position</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Pilote</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Temps</th>
          </tr>
        </thead>
        <tbody>
          {brazilResults.map((result, index) => (
            <tr key={result.Driver.driverId}>
              <td style={{ padding: '10px', border: '1px solid white' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {result.Driver.givenName} {result.Driver.familyName}
              </td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {result.time?.time || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tableau des résultats des qualifications du Grand Prix du Brésil 2023 */}
      <h2>Résultats des Qualifications du Grand Prix du Brésil 2023</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid white' }}>Position</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Pilote</th>
            <th style={{ padding: '10px', border: '1px solid white' }}>Temps</th>
          </tr>
        </thead>
        <tbody>
          {qualifyingResults.map((result, index) => (
            <tr key={result.Driver.driverId}>
              <td style={{ padding: '10px', border: '1px solid white' }}>{index + 1}</td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {result.Driver.givenName} {result.Driver.familyName}
              </td>
              <td style={{ padding: '10px', border: '1px solid white' }}>
                {result.time?.time || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default F1Ranking;
