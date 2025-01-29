"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

// Imports des composants widgets
import RaceDatesWidget from './components/RaceDatesWidget';
import VitalStatisticsWidget from './components/VitalStatisticsWidget';
import LastPoleSittersWidget from './components/LastPoleSittersWidget';
import LastWinnersWidget from './components/LastWinnersWidget';
import TyreStrategyWidget from './components/TyreStrategyWidget';
import CurrentFormWidget from './components/CurrentFormWidget';
import IconicMomentWidget from './components/IconicMomentWidget';
import LoadingRaceCard from './components/LoadingRaceCard';
import QualifyingPredictionsWidget from './components/QualifyingPredictionsWidget';
import RacePredictionsWidget from './components/RacePredictionsWidget';

interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  circuit_short_name: string;
  country_name: string;
  date_start: string;
}

interface Race {
  id: number;
  dates: {
    fp1: string;
    fp2: string;
    fp3: string;
    sprint_qualifying: string;
    sprint_race: string;
    qualifying: string;
    race: string;
  };
  vital_statistics: {
    first_grand_prix: string;
    track_length: string;
    lap_record: {
      time: string;
      driver: string;
      team: string;
      year: string;
    };
    most_pole_positions: {
      driver: string;
      poles: number;
    };
    most_wins: {
      drivers: string[];
      wins: number;
    };
    trivia: string;
    pole_run_to_turn1_braking_point: number;
    overtakes_2023: number;
    safety_car_probability: number;
    virtual_safety_car_probability: number;
    pit_stop_time_loss: number;
    notes: string;
  };
  last_five_pole_sitters: { year: string; driver: string; team: string }[];
  last_five_winners: { year: string; driver: string; team: string }[];
  tyre_strategy_insight: string[];
  current_form: string[];
  iconic_moment: string;
  qualifying_prediction: {
    position: number;
    constructor: string;
    driver: string;
  }[];
  race_prediction: {
    position: number;
    constructor: string;
    driver: string;
  }[];
  circuit_layout: string;
}

interface RaceDisplayPageProps {}

export default function RaceDisplayPage({ }: RaceDisplayPageProps) {
  const [races, setRaces] = useState<Race[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedRaceName, setSelectedRaceName] = useState<string>("");
  const [selectedRaceData, setSelectedRaceData] = useState<Race | null>(null);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingRaceData, setLoadingRaceData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('https://api.openf1.org/v1/meetings?year=2024');
        const data = await response.json();
        setMeetings(data);
      } catch (e) {
        console.error("Error fetching meetings:", e);
        setError("Failed to load meetings data.");
      }
    };

    const fetchRaces = async () => {
      setLoadingRaces(true);
      setError(null);
      try {
        const racesCollectionRef = collection(db, "upcoming_races");
        const racesSnapshot = await getDocs(query(racesCollectionRef));
        const racesList: Race[] = [];
        racesSnapshot.forEach(doc => {
          racesList.push(doc.data() as Race);
        });
        setRaces(racesList);
        setLoadingRaces(false);
      } catch (e: any) {
        setError("Failed to load races. Please check your connection.");
        console.error("Error fetching races:", e);
        setLoadingRaces(false);
      }
    };

    fetchMeetings();
    fetchRaces();
  }, []);

  useEffect(() => {
    const fetchRaceData = async () => {
      if (!selectedRaceName) {
        setSelectedRaceData(null);
        return;
      }

      setLoadingRaceData(true);
      setError(null);
      try {
        const raceDocRef = doc(db, "upcoming_races", selectedRaceName);
        const raceDocSnap = await getDoc(raceDocRef);
        if (raceDocSnap.exists()) {
          setSelectedRaceData(raceDocSnap.data() as Race);
        } else {
          setError("Race data not found.");
          setSelectedRaceData(null);
        }
        setLoadingRaceData(false);
      } catch (e: any) {
        setError("Failed to load race data.");
        console.error("Error fetching race data:", e);
        setSelectedRaceData(null);
        setLoadingRaceData(false);
      }
    };
    fetchRaceData();
  }, [selectedRaceName]);

  const handleRaceChange = (value: string) => {
    setSelectedRaceName(value);
  };

  const getMeetingName = (id: number) => {
    const meeting = meetings.find(m => m.meeting_key === Number(id));
    return meeting ? meeting.meeting_name : `Race ${id}`;
  };

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Upcoming
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore detailed information about upcoming Formula 1 races
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mb-12"
        >
          <Card className="bg-[#282a2c] border-0">
            <CardContent className="pt-6">
              <Select value={selectedRaceName} onValueChange={handleRaceChange}>
                <SelectTrigger className="w-full bg-[#1d1f20] border-0 text-white h-12">
                  <SelectValue placeholder="Select a Race" />
                </SelectTrigger>
                <SelectContent className="bg-[#1d1f20] border-0">
                  {races.map((race) => {
                    const meetingName = getMeetingName(race.id);
                    return (
                      <SelectItem
                        key={race.id}
                        value={race.id.toString()}
                        className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c]"
                      >
                        {meetingName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {selectedRaceData && !loadingRaceData && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <div className="break-inside-avoid">
              <VitalStatisticsWidget 
                stats={selectedRaceData.vital_statistics}
                circuit_layout={selectedRaceData.circuit_layout}
                showCircuitLayout={true}
              />
            </div>
            <div className="break-inside-avoid">
              <RaceDatesWidget dates={selectedRaceData.dates} />
            </div>
            <div className="break-inside-avoid">
              <CurrentFormWidget form={selectedRaceData.current_form} />
            </div>
            <div className="break-inside-avoid">
              <QualifyingPredictionsWidget predictions={selectedRaceData.qualifying_prediction} />
            </div>
            <div className="break-inside-avoid">
              <RacePredictionsWidget predictions={selectedRaceData.race_prediction} />
            </div>
            <div className="break-inside-avoid">
              <LastPoleSittersWidget poleSitters={selectedRaceData.last_five_pole_sitters} />
            </div>
            <div className="break-inside-avoid">
              <LastWinnersWidget winners={selectedRaceData.last_five_winners} />
            </div>
            <div className="break-inside-avoid">
              <TyreStrategyWidget insights={selectedRaceData.tyre_strategy_insight} />
            </div>
            <div className="break-inside-avoid">
              <IconicMomentWidget moment={selectedRaceData.iconic_moment} />
            </div>
        </div>
        )}

        {loadingRaceData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(7)].map((_, i) => (
              <LoadingRaceCard key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}