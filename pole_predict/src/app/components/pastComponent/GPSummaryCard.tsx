import React, { useState, useEffect } from "react";
import DetailCard from "../generalDataComponent/DetailCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
      <div className="max-w-5xl mx-auto w-full"> {/* Augmentation de la largeur */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Race Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-200">
              {summary.narrative ? (
                summary.narrative.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-400 italic">
                  Race summary not available for this Grand Prix.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DetailCard>
  );
};

export default GPSummaryCard;