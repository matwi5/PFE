import { NextResponse } from 'next/server';
import axios from 'axios';
import { genAI } from '@/lib/googleAI';

// Types for OpenF1 data
interface PitStopData {
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

interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  date_start: string;
  is_pit_out_lap: boolean;
}

export async function GET(req: Request) {
  try {
    // Get session key from query parameters
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get('sessionKey');

    if (!sessionKey) {
      return NextResponse.json(
        { error: 'Session key is required' },
        { status: 400 }
      );
    }

    // Fetch data from OpenF1 API
    const [pitStopsRes, stintsRes, lapsRes] = await Promise.all([
      axios.get<PitStopData[]>(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`),
      axios.get<StintData[]>(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`),
      axios.get<LapData[]>(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`)
    ]);

    // Analyze pit stop statistics
    const pitStopStats = calculatePitStopStats(pitStopsRes.data);
    
    // Create the analysis prompt
    const strategyPrompt = `As an F1 strategic analyst, provide a technical analysis of the strategic choices made during this race.

EXPECTED STRUCTURE:

# TITLE: Short and factual about the dominant strategic element of the race.

## STRATEGIC CONTEXT (2-3 sentences)
- Circuit configuration
- Key parameters influencing strategy (e.g., tire compounds, track characteristics)

## DETAILED STRATEGIC ANALYSIS
1. Tire Management
    - Compounds used by each team
    - Average stint lengths
    - Observed degradation
    - Wear trends

2. Pit Stops
    - Distribution of stops
    - Average stop time: ${pitStopStats.averageDuration.toFixed(2)}s
    - Fastest stop: ${pitStopStats.fastestDuration.toFixed(2)}s
    - Impact on track position

3. Strategic Moves
    - Identified undercut/overcut attempts
    - Effectiveness of alternative strategies
    - Key turning points in the race
    - Notable position gains/losses
    
4. Adaptability and Reactivity
    - Responses to race conditions
    - Strategic adjustments made
    - Handling of unforeseen events

## KEY TAKEAWAYS
- Dominant strategy
- Crucial decisions
- Strategic lessons learned

Data to analyze:
${JSON.stringify({
pitStops: pitStopsRes.data,
stints: stintsRes.data,
laps: lapsRes.data,
statistics: pitStopStats
}, null, 2)}

For the display of the analysis:
- Use Markdown for formatting (e.g., #, ##, -, **, etc.)
- Use line breaks to space out the text
`;

    // Generate analysis using Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(strategyPrompt);
    const analysis = result.response.text();

    // Return the analysis
    return NextResponse.json({ 
      status: 'success',
      analysis,
      statistics: pitStopStats,
      timestamp: new Date().toISOString(),
      metadata: {
        sessionKey,
        dataPoints: {
          pitStops: pitStopsRes.data.length,
          stints: stintsRes.data.length,
          laps: lapsRes.data.length
        }
      }
    });

  } catch (error) {
    console.error('Error in strategy analysis:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate pit stop statistics
function calculatePitStopStats(pitStops: PitStopData[]) {
  if (pitStops.length === 0) {
    return {
      averageDuration: 0,
      fastestDuration: 0,
      slowestDuration: 0,
      totalStops: 0
    };
  }

  const durations = pitStops.map(stop => stop.pit_duration);
  
  return {
    averageDuration: durations.reduce((a, b) => a + b) / durations.length,
    fastestDuration: Math.min(...durations),
    slowestDuration: Math.max(...durations),
    totalStops: pitStops.length
  };
}