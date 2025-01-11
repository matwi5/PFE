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
  // Initialiser une seule fois au montage du composant
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeeting) {
      const latestMeeting = meetings.reduce((prev, current) =>
        new Date(current.date_start) > new Date(prev.date_start) ? current : prev
      );
      onMeetingChange(latestMeeting.meeting_key.toString());
    }
  }, [meetings, selectedMeeting, onMeetingChange]);

  // Initialiser la session uniquement quand les sessions changent et qu'aucune n'est sélectionnée
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      const latestSession = sessions.reduce((prev, current) =>
        new Date(current.date_start) > new Date(prev.date_start) ? current : prev
      );
      onSessionChange(latestSession.session_key.toString());
    }
  }, [sessions, selectedSession, onSessionChange]);

  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1">
            <Flag className="w-5 h-5" />
          </div>
          
          <div className="col-span-4">
            <Select value={selectedMeeting} onValueChange={onMeetingChange}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select GP" />
              </SelectTrigger>
              <SelectContent>
                {meetings.map(m => (
                  <SelectItem key={m.meeting_key} value={m.meeting_key.toString()}>
                    {m.meeting_name} ({m.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-3">
            {selectedMeeting && (
              <Select value={selectedSession} onValueChange={onSessionChange}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Session" />
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
          </div>

          <div className="col-span-4">
            {selectedSession && (
              <Tabs value={viewMode} onValueChange={v => onViewModeChange(v as 'lap' | 'chronological')} className="h-8">
                <TabsList className="h-8">
                  <TabsTrigger value="chronological" className="px-2 h-8">Chrono</TabsTrigger>
                  <TabsTrigger value="lap" className="px-2 h-8" disabled={!hasLapData}>
                    Lap {currentLap}/{maxLap}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {viewMode === 'lap' && hasLapData && (
            <div className="col-span-12 flex items-center gap-2">
              <Button size="sm" onClick={() => onLapChange(Math.max(1, currentLap - 1))} disabled={currentLap === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Slider
                className="flex-1"
                value={[currentLap]}
                onValueChange={([v]) => onLapChange(v)}
                min={1}
                max={maxLap}
              />
              <Button size="sm" onClick={() => onLapChange(Math.min(maxLap, currentLap + 1))} disabled={currentLap === maxLap}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceSelection;