"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Slider } from '../../../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  year: number;
  date_start: string;
}

interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
}

interface RaceSelectionProps {
  meetings: Meeting[];
  sessions: Session[];
  selectedMeeting: string;
  selectedSession: string;
  onMeetingChange: (value: string) => void;
  onSessionChange: (value: string) => void;
  currentLap: number;
  maxLap: number;
  onLapChange: (lap: number) => void;
  viewMode: 'lap' | 'chronological';
  onViewModeChange: (mode: 'lap' | 'chronological') => void;
  hasLapData: boolean;
}

const RaceSelection = ({
  meetings,
  sessions,
  selectedMeeting,
  selectedSession,
  onMeetingChange,
  onSessionChange,
  currentLap,
  maxLap,
  onLapChange,
  viewMode,
  onViewModeChange,
  hasLapData
}: RaceSelectionProps) => {
  const [defaultMeeting, setDefaultMeeting] = useState<string | null>(null);
  const [defaultSession, setDefaultSession] = useState<string | null>(null);

  useEffect(() => {
    if (meetings.length > 0) {
      const latestMeeting = meetings.reduce((prev, current) =>
        new Date(current.date_start) > new Date(prev.date_start) ? current : prev
      );
      setDefaultMeeting(latestMeeting.meeting_key.toString());
      onMeetingChange(latestMeeting.meeting_key.toString());
    }

    if (sessions.length > 0) {
      const latestSession = sessions.reduce((prev, current) =>
        new Date(current.date_start) > new Date(prev.date_start) ? current : prev
      );
      setDefaultSession(latestSession.session_key.toString());
      onSessionChange(latestSession.session_key.toString());
    }
  }, [meetings, sessions, onMeetingChange, onSessionChange]);

  return (
    <Card className="w-full max-w-4xl mx-auto mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-6 h-6" />
          Select Race Session
        </CardTitle>
        <div className="mt-4 space-y-4">
          <Select value={selectedMeeting} onValueChange={onMeetingChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Grand Prix" />
            </SelectTrigger>
            <SelectContent>
              {meetings.map(m => (
                <SelectItem key={m.meeting_key} value={m.meeting_key.toString()}>
                  {m.meeting_name} ({m.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedMeeting && (
            <Select value={selectedSession} onValueChange={onSessionChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(s => (
                  <SelectItem key={s.session_key} value={s.session_key.toString()}>
                    {s.session_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedSession && (
            <Tabs value={viewMode} onValueChange={v => onViewModeChange(v as 'lap' | 'chronological')}>
              <TabsList className="w-full">
                <TabsTrigger value="chronological" className="flex-1">Chronological</TabsTrigger>
                <TabsTrigger value="lap" className="flex-1" disabled={!hasLapData}>By Lap</TabsTrigger>
              </TabsList>
              <TabsContent value="lap">
                {viewMode === 'lap' && maxLap > 0 && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => onLapChange(Math.max(1, currentLap - 1))}
                        disabled={currentLap === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span>Lap {currentLap} / {maxLap}</span>
                      <Button
                        onClick={() => onLapChange(Math.min(maxLap, currentLap + 1))}
                        disabled={currentLap === maxLap}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Slider
                      value={[currentLap]}
                      onValueChange={([v]) => onLapChange(v)}
                      min={1}
                      max={maxLap}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default RaceSelection;
