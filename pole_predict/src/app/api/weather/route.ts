import { NextResponse } from 'next/server';
import axios from 'axios';
import { genAI } from '@/lib/googleAI';

// Types for OpenF1 data
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
    const [weatherRes, lapsRes, stintsRes] = await Promise.all([
      axios.get<WeatherData[]>(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`),
      axios.get<LapData[]>(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`),
      axios.get<StintData[]>(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`)
    ]);

    // Create the analysis prompt
    const weatherPrompt = `As an F1 weather analyst, provide a technical analysis of the conditions and their impact on the race.

    EXPECTED STRUCTURE:
    
    # TITLE: Short and factual about the dominant weather aspect of the race.
    
    ## OVERVIEW OF CONDITIONS (2-3 sentences)
    - Summary of general conditions
    - Main variations during the session
    
    ## DETAILED ANALYSIS
    1. Track conditions
       - Asphalt temperature and evolution
       - Impact on grip and tire wear
       - Critical areas of the circuit
    
    2. Atmospheric conditions
       - Air temperature
       - Humidity and precipitation
       - Wind direction and strength
    
    3. Impact on performance
       - Correlation between lap times / conditions
       - Most affected sectors
       - Observed technical adaptations
    
    4. Strategic implications
       - Optimal tire usage windows
       - Required adjustments
       - Identified risks
    
    ## CONCLUSION
    Key technical points to remember
    
    Data to analyze:
    ${JSON.stringify({
      weather: weatherRes.data,
      laps: lapsRes.data,
      stints: stintsRes.data
    }, null, 2)}
    
    For the display of the analysis, 
     - Use Markdown for formatting (e.g., #, ##, -, **, etc.)
     - Use line breaks to space out the text
    `;

    // Generate analysis using Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(weatherPrompt);
    const analysis = result.response.text();

    // Return the analysis
    return NextResponse.json({ 
      status: 'success',
      analysis,
      timestamp: new Date().toISOString(),
      metadata: {
        sessionKey,
        dataPoints: {
          weather: weatherRes.data.length,
          laps: lapsRes.data.length,
          stints: stintsRes.data.length
        }
      }
    });

  } catch (error) {
    console.error('Error in weather analysis:', error);
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