"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Flag, 
  Info, 
  Calendar,
  Cog,
  TrendingUp, 
  History,
  Award,
  Timer,
  Sparkles
} from 'lucide-react';

interface Race {
  name: string;
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
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const RaceDatesWidget = ({ dates }: { dates: Race['dates'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Race Weekend Schedule
            </CardTitle>
            <Calendar className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {Object.entries(dates).map(([key, value]) => value && (
            <div key={key} className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 uppercase text-sm">{key.replace('_', ' ')}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const VitalStatisticsWidget = ({ stats }: { stats: Race['vital_statistics'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
              Circuit Statistics
            </CardTitle>
            <Info className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">Lap Record</span>
              <div className="mt-1">
                <span className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  {stats.lap_record.time}
                </span>
                <div className="text-white mt-1">
                  {stats.lap_record.driver}
                  <span className="text-gray-400 text-sm ml-2">
                    {stats.lap_record.team}, {stats.lap_record.year}
                  </span>
                </div>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">Track Length</span>
                <div className="text-xl font-bold text-white mt-1">{stats.track_length}</div>
              </div>
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">First GP</span>
                <div className="text-xl font-bold text-white mt-1">{stats.first_grand_prix}</div>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">Safety Car Probability</span>
                <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  {stats.safety_car_probability}%
                </div>
              </div>
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">Pit Stop Time Loss</span>
                <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  {stats.pit_stop_time_loss}s
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const LastPoleSittersWidget = ({ poleSitters }: { poleSitters: Race['last_five_pole_sitters'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#fbbf24] bg-clip-text text-transparent">
              Recent Pole Positions
            </CardTitle>
            <Timer className="h-5 w-5 text-[#fbbf24]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {poleSitters.map((sitter, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-[#fbbf24] font-medium">{sitter.year}</span>
                <span className="text-white">{sitter.driver}</span>
              </div>
              <span className="text-gray-400 text-sm">{sitter.team}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  const LastWinnersWidget = ({ winners }: { winners: Race['last_five_winners'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#d56676] to-[#5382ec] bg-clip-text text-transparent">
              Recent Winners
            </CardTitle>
            <Trophy className="h-5 w-5 text-[#d56676]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {winners.map((winner, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-[#d56676] font-medium">{winner.year}</span>
                <span className="text-white">{winner.driver}</span>
              </div>
              <span className="text-gray-400 text-sm">{winner.team}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const TyreStrategyWidget = ({ insights }: { insights: Race['tyre_strategy_insight'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#2dd4bf] to-[#5382ec] bg-clip-text text-transparent">
              Tyre Strategy
            </CardTitle>
            <Cog className="h-5 w-5 text-[#2dd4bf]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-[#1d1f20] rounded-lg">
              <p className="text-gray-200">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const CurrentFormWidget = ({ form }: { form: Race['current_form'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Current Form
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.map((point, index) => (
            <div key={index} className="p-3 bg-[#1d1f20] rounded-lg">
              <p className="text-gray-200">{point}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
  
  const IconicMomentWidget = ({ moment }: { moment: Race['iconic_moment'] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#fbbf24] to-[#d56676] bg-clip-text text-transparent">
              Iconic Moment
            </CardTitle>
            <History className="h-5 w-5 text-[#fbbf24]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-[#1d1f20] rounded-lg">
            <p className="text-gray-200 italic">{moment}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const LoadingRaceCard = () => (
    <Card className="bg-[#282a2c] border-0">
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-[#1d1f20]" />
        <Skeleton className="h-6 w-full bg-[#1d1f20]" />
        <Skeleton className="h-6 w-3/4 bg-[#1d1f20]" />
      </div>
    </Card>
  );

export default function RaceDisplayPage({ }: RaceDisplayPageProps) {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceName, setSelectedRaceName] = useState<string>("");
  const [selectedRaceData, setSelectedRaceData] = useState<Race | null>(null);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingRaceData, setLoadingRaceData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
                  {races.map((race) => (
                    <SelectItem
                      key={race.name}
                      value={race.name}
                      className="text-white hover:bg-[#282a2c] focus:bg-[#282a2c]"
                    >
                      {race.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {selectedRaceData && !loadingRaceData && (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <div className="break-inside-avoid">
            <VitalStatisticsWidget stats={selectedRaceData.vital_statistics} />
            </div>
            <div className="break-inside-avoid">
            <RaceDatesWidget dates={selectedRaceData.dates} />
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
            <CurrentFormWidget form={selectedRaceData.current_form} />
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