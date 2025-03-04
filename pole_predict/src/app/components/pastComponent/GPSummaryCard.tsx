import React, { useState, useEffect } from "react";
import DetailCard from "../generalDataComponent/DetailCard";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FileText } from 'lucide-react';

interface GP {
  meeting_name: string;
  year: number;
  location: string;
  country_name: string;
  meeting_code: string;
  sessionKey: string;
}

interface RaceSummary {
  general: {
    name: string;
    circuit: string;
    date: string;
    laps: number;
    circuitLength: string;
  };
  conditions: {
    weather: string;
    trackTemp: number;
    airTemp: number;
    events: Array<{
      type: string;
      lap: number;
      description: string;
    }>;
  };
  results: {
    podium: Array<{
      position: number;
      driver: string;
      team: string;
      time: string;
    }>;
    fastestLap: {
      driver: string;
      time: string;
      lap: number;
    };
    topTen: Array<{
      position: number;
      driver: string;
      team: string;
      gap: string;
    }>;
  };
  narrative?: string[];
}

const GPSummaryCard: React.FC<{ gp: GP }> = ({ gp }) => {
  const [summary, setSummary] = useState<RaceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/summary?sessionKey=${gp.sessionKey}`);
        const data = await response.json();

        if (data.status === 'error') {
          throw new Error(data.message);
        }

        setSummary(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (gp.sessionKey) {
      fetchSummary();
    }
  }, [gp.sessionKey]);

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <Alert variant="destructive">
      <AlertTitle>Error generating summary: {error}</AlertTitle>
    </Alert>
  );

  if (!summary) return null;

  return (
<DetailCard>
  <div className="max-w-6xl mx-auto w-full">
    <CardHeader className="pb-2 px-2 sm:px-4 md:px-8">
      <CardTitle className="text-2xl sm:text-3xl pb-4">
        <div className="animate-gradient-text bg-gradient-to-r from-[#5382ec] to-[#d56676] 
           bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shine font-bold
           tems-center w-full pb-4">
          <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
          AI Race Summary
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="px-3 sm:px-4 md:px-8">
      <div className="space-y-6 text-gray-200">
        {summary.narrative ? (
          summary.narrative.map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-base sm:text-lg hover:text-gray-100 
                                  transition-colors duration-200 rounded-lg">
              {paragraph}
            </p>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#5382ec] 
                        border-r-[#d56676] border-b-[#5382ec] border-l-[#d56676] 
                        animate-spin"></div>
            <p className="text-gray-400 italic text-lg animate-pulse">
              Generating race summary...
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </div>
</DetailCard>
  );
};

export default GPSummaryCard;