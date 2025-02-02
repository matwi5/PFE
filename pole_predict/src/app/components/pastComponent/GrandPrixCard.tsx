// components/pastComponent/GrandPrixCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface GrandPrixCardProps {
    mainGP: GP | null;
    allGPs: GP[];
    selectedYear: number;
    showDropdown: boolean;
    hoveredCard: number | null;
    setShowDropdown: (show: boolean) => void;
    setHoveredCard: (card: number | null) => void;
    handleGPSelect: (gp: GP) => Promise<void>;
    handleYearChange: (year: string) => void;
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

const GrandPrixCard: React.FC<GrandPrixCardProps> = ({
    mainGP,
    allGPs,
    selectedYear,
    showDropdown,
    hoveredCard,
    setShowDropdown,
    setHoveredCard,
    handleGPSelect,
    handleYearChange
}) => {
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 ${hoveredCard === 0 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Map className="mr-2 icon-widget" /> GRAND PRIX
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-2">
                    <p className="text-xl font-bold">{mainGP?.meeting_name} ({mainGP?.year})</p>
                    <p className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 icon-widget" />
                        {mainGP?.location}, {mainGP?.country_name}
                    </p>
                    <p className="text-sm text-orange-500">{mainGP?.meeting_code}</p>
                </div>
                <div className="relative">
                    <select
                        className="mt-4 border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 p-2 rounded icon-widget mr-2"
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                    >
                        <option value={2023}>2023</option>
                        <option value={2024}>2024</option>
                    </select>
                    <Button
                        variant="outline"
                        className="mt-4 border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 icon-widget"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        Autre <ArrowRight className="ml-2 h-4 w-4 icon-widget" />
                    </Button>
                    {showDropdown && (
                        <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-800 rounded shadow-lg">
                            {allGPs
                                .filter(gp => gp.year === selectedYear)
                                .map((gp, index) => (
                                    <button
                                        key={index}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors dropdown-item"
                                        onClick={() => handleGPSelect(gp)}
                                    >
                                        {gp.meeting_name} ({gp.year})
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default GrandPrixCard;
