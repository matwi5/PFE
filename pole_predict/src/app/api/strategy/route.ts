import { NextResponse } from 'next/server';
import { z } from 'zod';

interface PitData {
  driver_number: number;
  lap_number: number;
  pit_duration: number;
  date: string;
}

interface StintData {
  driver_number: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
}

interface DriverData {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_name: string;
  team_colour: string;
}

// Validation du paramètre de requête
const QuerySchema = z.object({
  sessionKey: z.string().min(1, "Session key is required")
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get('sessionKey');

    const validationResult = QuerySchema.safeParse({ sessionKey });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Invalid session key',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Récupération des données depuis OpenF1
    const [pitsRes, stintsRes, driversRes] = await Promise.all([
      fetch(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`)
    ]);

    const [pitsData, stintsData, driversData] = await Promise.all([
      pitsRes.json(),
      stintsRes.json(),
      driversRes.json()
    ]) as [PitData[], StintData[], DriverData[]];

    // Organiser les données par équipe
    const teamStrategies = new Map<string, {
      team_name: string;
      team_colour: string;
      drivers: Array<{
        number: number;
        name: string;
        pit_stops: PitData[];
        stints: StintData[];
        avg_pit_duration: number;
      }>;
    }>();

    driversData.forEach(driver => {
      if (!teamStrategies.has(driver.team_name)) {
        teamStrategies.set(driver.team_name, {
          team_name: driver.team_name,
          team_colour: driver.team_colour,
          drivers: []
        });
      }

      const driverPits = pitsData.filter(p => p.driver_number === driver.driver_number);
      const driverStints = stintsData.filter(s => s.driver_number === driver.driver_number);
      
      teamStrategies.get(driver.team_name)?.drivers.push({
        number: driver.driver_number,
        name: `${driver.first_name} ${driver.last_name}`,
        pit_stops: driverPits,
        stints: driverStints,
        avg_pit_duration: driverPits.length > 0 
          ? driverPits.reduce((sum, p) => sum + p.pit_duration, 0) / driverPits.length 
          : 0
      });
    });

    // Analyser les stratégies
    const analysis = Array.from(teamStrategies.values()).map(team => {
      const teamAnalysis = {
        team_name: team.team_name,
        team_colour: team.team_colour,
        drivers: team.drivers.map(driver => {
          const stintAnalysis = analyzeStints(driver.stints);
          const pitAnalysis = analyzePitStops(driver.pit_stops);

          return {
            driver_number: driver.number,
            driver_name: driver.name,
            strategy: {
              total_pit_stops: driver.pit_stops.length,
              avg_pit_duration: driver.avg_pit_duration,
              pit_window: pitAnalysis.pit_window,
              tyre_strategy: stintAnalysis.tyre_sequence,
              stint_lengths: stintAnalysis.stint_lengths,
              total_stints: driver.stints.length,
              strategy_type: determineStrategyType(driver.pit_stops.length),
            }
          };
        })
      };

      return teamAnalysis;
    });

    return NextResponse.json({
      status: 'success',
      data: analysis,
      metadata: {
        sessionKey,
        dataPoints: {
          pit_stops: pitsData.length,
          stints: stintsData.length,
          drivers: driversData.length
        }
      }
    });

  } catch (error) {
    console.error('Error in strategy analysis:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function analyzeStints(stints: StintData[]) {
  const sortedStints = stints.sort((a, b) => a.stint_number - b.stint_number);

  const tyre_sequence = sortedStints.map(stint => stint.compound);
  const stint_lengths = sortedStints.map(stint => stint.lap_end - stint.lap_start);

  return {
    tyre_sequence,
    stint_lengths
  };
}

function analyzePitStops(pits: PitData[]) {
  const sortedPits = pits.sort((a, b) => a.lap_number - b.lap_number);

  if (sortedPits.length === 0) {
    return { pit_window: [] };
  }

  const pit_window = sortedPits.map(pit => ({
    lap: pit.lap_number,
    duration: pit.pit_duration
  }));

  return { pit_window };
}

function determineStrategyType(pitStops: number): string {
  switch (pitStops) {
    case 0:
      return "No Stop";
    case 1:
      return "One Stop";
    case 2:
      return "Two Stop";
    case 3:
      return "Three Stop";
    default:
      return `${pitStops} Stops`;
  }
}