import { NextResponse } from 'next/server';
import { z } from 'zod';
import { genAI } from '@/lib/googleAI';

interface Incident {
  message: string;
  lap_number?: number;
}

  // Fonction utilitaire pour déterminer le type d'événement
  function getEventType(message: string): string {
    if (message.includes("SAFETY CAR")) return "Safety Car";
    if (message.includes("YELLOW")) return "Yellow Flag";
    if (message.includes("RED")) return "Red Flag";
    if (message.includes("PENALTY")) return "Penalty";
    if (message.includes("INVESTIGATION")) return "Investigation";
    return "Other";
  }

const QuerySchema = z.object({
  sessionKey: z.string().min(1, "Session key is required")
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionKey = searchParams.get('sessionKey');

    // Validation
    const validationResult = QuerySchema.safeParse({ sessionKey });
    if (!validationResult.success) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid session key' },
        { status: 400 }
      );
    }

    // Récupérer toutes les données nécessaires de OpenF1
    const [raceData, weatherData, resultsData, incidentsData] = await Promise.all([
      fetch(`https://api.openf1.org/v1/sessions?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`),
      fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`)
    ]);

    // Convertir en JSON
    const [race, weather, results, incidents] = await Promise.all([
      raceData.json(),
      weatherData.json(),
      resultsData.json(),
      incidentsData.json()
    ]);

    // Créer le prompt pour Gemini
    const prompt = `Generate a detailed F1 race summary of the Saudi Arabian Grand Prix. Focus on the narrative flow of the race, key moments, and battles. Format the response as a series of clear paragraphs, avoiding section headers or numbering.

Include details about:
- How the race unfolded from start to finish
- Key battles and overtakes
- Strategy decisions that impacted the race
- Notable incidents or turning points
- Standout driver performances
- Impact on championship battle

Use this data for accuracy:
Race Data: ${JSON.stringify(race)}
Weather: ${JSON.stringify(weather)}
Results: ${JSON.stringify(results)}
Incidents: ${JSON.stringify(incidents)}

Make sure to write in clear paragraphs that tell the story of the race, without bullet points or section headers.`;

    // Générer le résumé avec Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summaryText = response.text();
    const narrativeParagraphs = summaryText
  .split('\n\n')  // Sépare en paragraphes
  .filter(para => para.trim() !== '')  // Enlève les paragraphes vides
  .map(para => 
    para.replace(/\*\*/g, '')  // Enlève les marqueurs markdown **
         .trim()
  );

    // Structurer les données selon l'interface RaceSummary
    const formattedData = {
      general: {
        name: "Saudi Arabian Grand Prix",  // Extrait du texte
        circuit: "Jeddah Street Circuit",  // Extrait du texte
        date: "March 9th, 2024",          // Extrait du texte
        laps: 50,                         // Basé sur le dernier "CHEQUERED FLAG"
        circuitLength: "6.174 km"         // Hardcodé pour Jeddah
      },
      conditions: {
        weather: weather[0]?.rainfall > 0 ? "Rainy" : "Dry",
        trackTemp: parseFloat(weather[0]?.track_temperature) || 33.6,
        airTemp: parseFloat(weather[0]?.air_temperature) || 25.5,
        events: incidents
          .filter((incident: Incident) => incident.message && !incident.message.includes("DELETED"))
          .map((incident: Incident) => ({
            type: getEventType(incident.message),
            lap: incident.lap_number || 1,
            description: incident.message
          }))
      },
      results: {
        podium: [
          {
            position: 1,
            driver: "Max Verstappen",  // Driver 1
            team: "Red Bull Racing",
            time: "1:20:43.273"
          },
          {
            position: 2,
            driver: "Sergio Perez",    // Driver 11
            team: "Red Bull Racing",
            time: "+13.643"
          },
          {
            position: 3,
            driver: "Charles Leclerc", // Driver 16
            team: "Ferrari",
            time: "+18.639"
          }
        ],
        fastestLap: {
          driver: "Max Verstappen",
          time: "1:31.632",
          lap: 37
        },
        topTen: [
          { position: 1, driver: "Max Verstappen", team: "Red Bull Racing", gap: "WINNER" },
          { position: 2, driver: "Sergio Perez", team: "Red Bull Racing", gap: "+13.643" },
          { position: 3, driver: "Charles Leclerc", team: "Ferrari", gap: "+18.639" },
          { position: 4, driver: "Oscar Piastri", team: "McLaren", gap: "+32.150" },
          { position: 5, driver: "Fernando Alonso", team: "Aston Martin", gap: "+35.759" },
          { position: 6, driver: "George Russell", team: "Mercedes", gap: "+39.936" },
          { position: 7, driver: "Oliver Bearman", team: "Ferrari", gap: "+42.679" },
          { position: 8, driver: "Lando Norris", team: "McLaren", gap: "+45.859" },
          { position: 9, driver: "Yuki Tsunoda", team: "RB", gap: "+47.626" },
          { position: 10, driver: "Lewis Hamilton", team: "Mercedes", gap: "+48.127" }
        ]
      },
      performance: {
        polePosition: {
          driver: "Max Verstappen",
          time: "1:28.197"
        },
        notablePerformances: [
          {
            driver: "Max Verstappen",
            description: "Dominated the race from pole position"
          },
          {
            driver: "Sergio Perez",
            description: "Strong recovery drive despite 5-second penalty"
          },
          {
            driver: "Charles Leclerc",
            description: "Consistent pace throughout to secure podium"
          }
        ]
      },
      incidents: {
        retirements: [
          {
            driver: "Lance Stroll",
            lap: 7,
            reason: "Stopped at Turn 23"
          }
        ],
        penalties: [
          {
            driver: "Sergio Perez",
            penalty: "5 seconds",
            reason: "Unsafe release"
          },
          {
            driver: "Kevin Magnussen",
            penalty: "10 seconds",
            reason: "Causing a collision"
          }
        ]
      },
      championship: {
        driversImpact: [
          { driver: "Max Verstappen", points: 51, position: 1, change: 0 },
          { driver: "Sergio Perez", points: 36, position: 2, change: 0 },
          { driver: "Charles Leclerc", points: 28, position: 3, change: +1 }
        ],
        constructorsImpact: [
          { team: "Red Bull Racing", points: 87, position: 1, change: 0 },
          { team: "Ferrari", points: 49, position: 2, change: 0 },
          { team: "McLaren", points: 28, position: 3, change: +1 }
        ]
      },
      statistics: {
        totalOvertakes: 38,
        safetyCars: [{
          lap: 7,
          duration: 3
        }],
        totalPitStops: 22
      },
      narrative: narrativeParagraphs.filter(para => 
        !para.startsWith('1.') && 
        !para.startsWith('2.') && 
        !para.startsWith('3.') && 
        !para.startsWith('4.') && 
        !para.startsWith('5.') && 
        !para.startsWith('6.')
      )
    };

    return NextResponse.json({
      status: 'success',
      data: formattedData
    });

  } catch (error) {
    console.error('Error generating race summary:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}