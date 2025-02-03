// components/pastComponent/DetailsCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { motion } from 'framer-motion';

interface DetailsCardProps {
    mainGP: GP | null;
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
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

const DetailsCard: React.FC<DetailsCardProps> = ({ mainGP, hoveredCard, setHoveredCard }) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 1 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Details
                    </CardTitle>
                    <Info className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Number of laps</p>
                    <p className="text-xl font-semibold text-gray-200">{mainGP?.nb_tours}</p>
                </motion.div>
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Circuit length</p>
                    <p className="text-xl font-semibold text-gray-200">{mainGP?.long_circuit}</p>
                </motion.div>
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Race distance</p>
                    <p className="text-xl font-semibold text-gray-200">{mainGP?.dist_course}</p>
                </motion.div>
            </CardContent>
        </Card>
    );
};

export default DetailsCard;