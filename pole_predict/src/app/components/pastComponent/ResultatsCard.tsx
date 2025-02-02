// components/pastComponent/ResultatsCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 3 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Medal className="mr-2 icon-widget" /> RESULTATS
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-orange-500 mb-4">Podium</h3>
                        <Button
                            variant="outline"
                            className="border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 icon-widget"
                            onClick={() => setShowAllPodium(!showAllPodium)}
                        >
                            {showAllPodium ? "Masquer le résultat" : "Afficher le résultat"}
                        </Button>
                    </div>
                    {mainGP?.podium ? (
                        <div className="space-y-2">
                            {(showAllPodium ? mainGP.podium : mainGP.podium.slice(0, 3)).map((driverName, index) => {
                                const driver = drivers.find(d => d.last_name === driverName);
                                return (
                                    <button
                                        key={index}
                                        className="w-full bg-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-gray-700 podium-item"
                                        onClick={() => handleDriverClick(driverName)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <img
                                                src={driver?.headshot_url}
                                                alt={`${driverName} headshot`}
                                                className="w-10 h-10 rounded-full mr-2 icon-widget"
                                            />
                                            <span>
                                                {index + 1}{index === 0 ? 'er' : 'ème'} : {driverName}
                                            </span>
                                            <span
                                                className="text-sm italic text-orange-500 cursor-pointer team-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTeamClick(driver?.team_name || '');
                                                }}
                                            >
                                                {driver?.team_name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">Podium non disponible</p>
                    )}

                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-orange-500 mb-4">Qualification</h3>
                        <Button
                            variant="outline"
                            className="border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 icon-widget"
                            onClick={() => setShowAllQualif(!showAllQualif)}
                        >
                            {showAllQualif ? "Masquer les qualifications" : "Afficher les qualifications"}
                        </Button>
                    </div>
                    {mainGP?.qualif ? (
                        <div className="space-y-2">
                            {(showAllQualif ? mainGP.qualif : mainGP.qualif.slice(0, 3)).map((driverName, index) => {
                                const driver = drivers.find(d => d.last_name === driverName);
                                return (
                                    <button
                                        key={index}
                                        className="w-full bg-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-gray-700 qualif-item"
                                        onClick={() => handleDriverClick(driverName)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <img
                                                src={driver?.headshot_url}
                                                alt={`${driverName} headshot`}
                                                className="w-10 h-10 rounded-full mr-2 icon-widget"
                                            />
                                            <span>
                                                {index + 1}{index === 0 ? 'er' : 'ème'} : {driverName}
                                            </span>
                                            <span
                                                className="text-sm italic text-orange-500 cursor-pointer team-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTeamClick(driver?.team_name || '');
                                                }}
                                            >
                                                {driver?.team_name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">Qualifications non disponibles</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ResultatsCard;