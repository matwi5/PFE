// components/pastComponent/GrandPrixCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 0 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Grand Prix
                    </CardTitle>
                    <Map className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300">
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-xl font-bold text-gray-200">{mainGP?.meeting_name} ({mainGP?.year})</p>
                    <p className="flex items-center text-gray-300">
                        <MapPin className="mr-2 h-4 w-4" />
                        {mainGP?.location}, {mainGP?.country_name}
                    </p>
                    <p className="text-sm text-[#5382ec]">{mainGP?.meeting_code}</p>
                </motion.div>
                <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
                    <Select onValueChange={handleYearChange} value={selectedYear.toString()}>
                        <SelectTrigger
                            className={`w-full md:w-auto border-0 transition-all ${selectedYear
                                ? "bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
                                : "bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20"
                                }`}
                        >
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#282a2c] border-0">
                            {[2023, 2024].map((year) => (
                                <SelectItem
                                    key={year}
                                    value={year.toString()}
                                    className="text-gray-300 hover:bg-[#5382ec]/20 focus:bg-[#5382ec]/30"
                                >
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => {
                        const selectedGP = allGPs.find(gp => gp.meeting_key === parseInt(value));
                        if (selectedGP) {
                            handleGPSelect(selectedGP);
                        }
                    }}
                    >
                        <SelectTrigger
                            className={`w-full md:w-auto border-0 transition-all border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300`}
                        >
                            <SelectValue placeholder="Other" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#282a2c] border-0">
                            {allGPs
                                .filter(gp => gp.year === selectedYear)
                                .map((gp) => (
                                    <SelectItem
                                        key={gp.meeting_key}
                                        value={gp.meeting_key.toString()}
                                        className="text-gray-300 hover:bg-[#5382ec]/20 focus:bg-[#5382ec]/30" 
                                    >
                                        {gp.meeting_name} ({gp.year})
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};

export default GrandPrixCard;