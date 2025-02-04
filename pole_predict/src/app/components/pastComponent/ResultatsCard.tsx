// components/pastComponent/ResultatsCard.tsx
/* eslint-disable */
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface ResultatsCardProps {
    mainGP: GP | null;
    drivers: Driver[];
    hoveredCard: number | null;
    showAllPodium: boolean;
    showAllQualif: boolean;
    setHoveredCard: (card: number | null) => void;
    setShowAllPodium: (show: boolean) => void;
    setShowAllQualif: (show: boolean) => void;
    handleDriverClick: (driverName: string) => void;
    handleTeamClick: (teamName: string) => void;
}

interface GP {
    circuit_key: number;
    circuit_short_name: string;
    country_code: string;
    country_key: number;
    country_name: string;
    date_start: string;
    dist_course: string;
    gmt_offset: string;
    location: string;
    long_circuit: string;
    meeting_code: string;
    meeting_key: number;
    meeting_name: string;
    nb_tours: number;
    podium: string[];
    qualif: string[];
    year: number;
    grand_prix: string;
}

interface Driver {
    flagColors: string[];
    broadcast_name: string;
    country_code: string;
    driver_number: number;
    first_name: string;
    headshot_url: string;
    last_name: string;
    team_name: string;
    team_colour: string;
    name: string;
    flag_url: string;
    year: number[];
    NumberOfPodiums: number;
    NumberOfVictories: number;
    WorldChampionships: number;
}

const ResultatsCard: React.FC<ResultatsCardProps> = ({
    mainGP,
    drivers,
    hoveredCard,
    showAllPodium,
    showAllQualif,
    setHoveredCard,
    setShowAllPodium,
    setShowAllQualif,
    handleDriverClick,
    handleTeamClick
}) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 3 ? 'scale-105' : ''}`}

        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Results
                    </CardTitle>
                    <Medal className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#2dd4bf] mb-4">Podium</h3>
                    <Button
                        asChild
                        variant="outline"
                        className="border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300"
                        onClick={() => setShowAllPodium(!showAllPodium)}
                    >
                        <motion.div whileTap={{ scale: 0.95 }}>
                            {showAllPodium ? "Hide Results" : "Show Results"}
                        </motion.div>
                    </Button>
                </div>
                {mainGP?.podium ? (
                    <div className="space-y-2">
                        {(showAllPodium ? mainGP.podium : mainGP.podium.slice(0, 3)).map((driverName, index) => {
                            const driver = drivers.find(d => d.last_name === driverName);
                            return (
                                <motion.button
                                    key={index}
                                    className="w-full p-3 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30 flex items-center justify-between"
                                    onClick={() => handleDriverClick(driverName)}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={driver?.headshot_url}
                                            alt={`${driverName} headshot`}
                                            className="h-10 w-10 rounded-full"
                                        />
                                        <span className="text-gray-300">
                                            {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} : {driverName}
                                        </span>
                                    </div>
                                    <motion.span
                                        className="text-sm italic text-[#2dd4bf] cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTeamClick(driver?.team_name || '');
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {driver?.team_name}
                                    </motion.span>
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">Podium not available</p>
                )}

                <div className="flex items-center justify-between mt-4">
                    <h3 className="text-xl font-bold text-[#2dd4bf] mb-4">Qualification</h3>
                    <Button
                        asChild
                        variant="outline"
                        className="border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300"
                        onClick={() => setShowAllQualif(!showAllQualif)}
                    >
                        <motion.div whileTap={{ scale: 0.95 }}>
                            {showAllQualif ? "Hide Qualifications" : "Show Qualifications"}
                        </motion.div>
                    </Button>
                </div>
                {mainGP?.qualif ? (
                    <div className="space-y-2">
                        {(showAllQualif ? mainGP.qualif : mainGP.qualif.slice(0, 3)).map((driverName, index) => {
                            const driver = drivers.find(d => d.last_name === driverName);
                            return (
                                <motion.button
                                    key={index}
                                    className="w-full p-3 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30 flex items-center justify-between"
                                    onClick={() => handleDriverClick(driverName)}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={driver?.headshot_url}
                                            alt={`${driverName} headshot`}
                                            className="h-10 w-10 rounded-full"
                                        />
                                        <span className="text-gray-300">
                                            {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} : {driverName}
                                        </span>
                                    </div>
                                    <motion.span
                                        className="text-sm italic text-[#2dd4bf] cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTeamClick(driver?.team_name || '');
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {driver?.team_name}
                                    </motion.span>
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">Qualifications not available</p>
                )}
            </CardContent>
        </Card>
    );
};

export default ResultatsCard;