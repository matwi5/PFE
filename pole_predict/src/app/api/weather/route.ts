/* eslint-disable */
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Types pour les données OpenF1
interface WeatherData {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_direction: number;
  wind_speed: number;
  rainfall: number;
  date: string;
}

interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  date_start: string;
}

interface StintData {
  driver_number: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  tyre_age_at_start: number;
}

// Validation du paramètre de requête
const QuerySchema = z.object({
  sessionKey: z.string().min(1, "Session key is required")
});

export async function GET(req: Request) {
  try {
    // Validation de la sessionKey
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
    const [weatherRes, lapsRes, stintsRes] = await Promise.all([
      fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`)
    ]);

    const [weatherData, lapsData, stintsData] = await Promise.all([
      weatherRes.json(),
      lapsRes.json(),
      stintsRes.json()
    ]) as [WeatherData[], LapData[], StintData[]];

    // Analyse des données
    const analysis = {
      weather: {
        track_temp: {
          min: Math.min(...weatherData.map(w => w.track_temperature)),
          max: Math.max(...weatherData.map(w => w.track_temperature)),
          avg: weatherData.reduce((sum, w) => sum + w.track_temperature, 0) / weatherData.length
        },
        air_temp: {
          min: Math.min(...weatherData.map(w => w.air_temperature)),
          max: Math.max(...weatherData.map(w => w.air_temperature)),
          avg: weatherData.reduce((sum, w) => sum + w.air_temperature, 0) / weatherData.length
        },
        humidity: {
          avg: weatherData.reduce((sum, w) => sum + w.humidity, 0) / weatherData.length
        },
        rainfall: weatherData.some(w => w.rainfall > 0),
        wind: {
          speed_kmh: (weatherData.reduce((sum, w) => sum + w.wind_speed, 0) / weatherData.length) * 3.6, // Conversion en km/h
          direction: calculateDominantWindDirection(weatherData)
        }
      },
      performance: {
        lap_times: {
          fastest: Math.min(...lapsData.filter(l => l.lap_duration > 0).map(l => l.lap_duration)),
          slowest: Math.max(...lapsData.filter(l => l.lap_duration > 0).map(l => l.lap_duration)),
          average: calculateAverageLapTime(lapsData),
          consistency: calculateConsistencyScore(lapsData)
        },
        track_evolution: calculateTrackEvolution(weatherData, lapsData)
      },
      tyre_performance: analyzeStints(stintsData)
    };

    return NextResponse.json({
      status: 'success',
      data: analysis,
      metadata: {
        sessionKey,
        dataPoints: {
          weather: weatherData.length,
          laps: lapsData.length,
          stints: stintsData.length
        }
      }
    });

  } catch (error) {
    console.error('Error in weather analysis:', error);
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
function calculateDominantWindDirection(weatherData: WeatherData[]): string {
  const direction = weatherData.reduce((sum, w) => sum + w.wind_direction, 0) / weatherData.length;
  const cardinalDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((direction % 360) / 45)) % 8;
  return cardinalDirections[index];
}

function calculateAverageLapTime(lapsData: LapData[]): number {
  const validLaps = lapsData.filter(lap => lap.lap_duration > 0);
  return validLaps.reduce((sum, lap) => sum + lap.lap_duration, 0) / validLaps.length;
}

function calculateConsistencyScore(lapsData: LapData[]): number {
  const validLaps = lapsData.filter(lap => lap.lap_duration > 0);
  const avgLapTime = calculateAverageLapTime(validLaps);
  const variations = validLaps.map(lap => Math.abs(lap.lap_duration - avgLapTime));
  const avgVariation = variations.reduce((sum, var_) => sum + var_, 0) / variations.length;
  
  // Convertir en score de 0 à 100 (plus c'est bas, plus c'est consistant)
  return Math.max(0, 100 - (avgVariation * 20));
}

function calculateTrackEvolution(weatherData: WeatherData[], lapsData: LapData[]): string {
  const early_laps = lapsData.slice(0, Math.floor(lapsData.length * 0.2));
  const late_laps = lapsData.slice(Math.floor(lapsData.length * 0.8));
  
  const early_avg = calculateAverageLapTime(early_laps);
  const late_avg = calculateAverageLapTime(late_laps);
  
  const improvement = ((early_avg - late_avg) / early_avg) * 100;
  
  if (improvement > 2) return "Significant improvement";
  if (improvement > 0.5) return "Slight improvement";
  if (improvement < -0.5) return "Deteriorating";
  return "Stable";
}

function analyzeStints(stintsData: StintData[]): Record<string, {
  averageLaps: number;
  totalStints: number;
  performance: string;
}> {
  const compounds = new Map<string, StintData[]>();
  
  stintsData.forEach(stint => {
    if (!compounds.has(stint.compound)) {
      compounds.set(stint.compound, []);
    }
    compounds.get(stint.compound)?.push(stint);
  });

  const result: Record<string, any> = {};
  
  compounds.forEach((stints, compound) => {
    const avgLaps = stints.reduce((sum, s) => sum + (s.lap_end - s.lap_start), 0) / stints.length;
    const totalStints = stints.length;
    
    let performance = "Unknown";
    if (avgLaps > 20) performance = "Long-lasting";
    else if (avgLaps > 15) performance = "Good durability";
    else if (avgLaps > 10) performance = "Average durability";
    else performance = "Short-lived";
    
    result[compound] = {
      averageLaps: Math.round(avgLaps),
      totalStints,
      performance
    };
  });

  return result;
}