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
      // Calcul des statistiques d'équipe
      const allPitStops = team.drivers.flatMap(d => d.pit_stops);
      const avgTeamPitDuration = allPitStops.length > 0 
        ? allPitStops.reduce((sum, p) => sum + p.pit_duration, 0) / allPitStops.length 
        : 0;
      
      const teamAnalysis = {
        team_name: team.team_name,
        team_colour: team.team_colour,
        team_stats: {
          total_pit_stops: allPitStops.length,
          avg_pit_duration: avgTeamPitDuration,
          best_pit_stop: allPitStops.length > 0 
            ? Math.min(...allPitStops.map(p => p.pit_duration))
            : 0,
          pit_stop_consistency: calculatePitConsistency(allPitStops),
        },
        drivers: team.drivers.map(driver => {
          const stintAnalysis = analyzeStints(driver.stints);
          const pitAnalysis = analyzePitStops(driver.pit_stops);

          // Détecter les undercuts/overcuts avec les autres pilotes de l'équipe
          const otherDrivers = team.drivers.filter(d => d.number !== driver.number);
          const strategyMoves = otherDrivers.flatMap(otherDriver => 
            detectPitStrategyMoves(
              driver.pit_stops, 
              otherDriver.pit_stops,
              otherDriver.name
            )
          );

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
              moves: strategyMoves
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

function calculatePitConsistency(pitStops: PitData[]): number {
  if (pitStops.length < 2) return 100;
  
  const durations = pitStops.map(p => p.pit_duration);
  const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
  
  // Convertir la variance en score de consistance (0-100)
  // Plus la variance est faible, plus le score est élevé
  const maxAcceptableVariance = 4; // 2 secondes d'écart-type
  return Math.max(0, 100 * (1 - variance / maxAcceptableVariance));
}

// Types
type StrategyMoveType = 'undercut' | 'overcut';

interface StrategyMove {
  type: StrategyMoveType;
  lap: number;
  againstDriver: string;
  gap: number;
  successful?: boolean;
}

function detectPitStrategyMoves(
  driver1Pits: PitData[], 
  driver2Pits: PitData[], 
  otherDriverName: string,
): StrategyMove[] {
  const moves: StrategyMove[] = [];
  
  for (const pit1 of driver1Pits) {
    // Pour undercut: chercher si l'autre pilote s'arrête 1-3 tours plus tard
    const laterPits = driver2Pits.filter(p => 
      p.lap_number > pit1.lap_number && 
      p.lap_number <= pit1.lap_number + 3
    );
    
    if (laterPits.length > 0) {
      moves.push({
        type: 'undercut',
        lap: pit1.lap_number,
        againstDriver: otherDriverName,
        gap: laterPits[0].lap_number - pit1.lap_number,
      });
    }

    // Pour overcut: chercher si l'autre pilote s'est arrêté 2-4 tours avant
    const earlierPits = driver2Pits.filter(p =>
      pit1.lap_number > p.lap_number &&
      pit1.lap_number <= p.lap_number + 4 &&
      pit1.lap_number >= p.lap_number + 2
    );

    if (earlierPits.length > 0) {
      moves.push({
        type: 'overcut',
        lap: pit1.lap_number,
        againstDriver: otherDriverName,
        gap: pit1.lap_number - earlierPits[0].lap_number,
      });
    }
  }
  
  return moves;
}