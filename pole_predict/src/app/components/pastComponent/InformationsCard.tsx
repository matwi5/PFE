// components/pastComponent/InformationsCard.tsx
/* eslint-disable */
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { motion } from 'framer-motion';

interface InformationsCardProps {
    mainGP: GP | null;
    hoveredCard: number | null;
    gp: GrandPrix[];
    setHoveredCard: (card: number | null) => void;
    formatDate: (date: string, offset: string) => string;
    getCircuitParticularites: (grandPrixName: string) => string;
    getCircuitImageUrl: (grandPrixName: string) => string;
    handleImageClick: (imageUrl: string) => void;
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

interface GrandPrix {
    grand_prix: string;
    pays_flag: string;
    ville: string;
    nombre_de_tours: number;
    particularites: string;
    record_de_circuit: string;
    recordman_circuit: string;
    image_circuit: string;
}

const InformationsCard: React.FC<InformationsCardProps> = ({
    mainGP,
    hoveredCard,
    gp,
    setHoveredCard,
    formatDate,
    getCircuitParticularites,
    getCircuitImageUrl,
    handleImageClick
}) => {
    // Gestion des valeurs `undefined` pour `date_start` et `gmt_offset`
    const formattedDate = formatDate(mainGP?.date_start || "", mainGP?.gmt_offset || "");

    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 2 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Information
                    </CardTitle>
                    <Globe className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Date and Time</p>
                    <p className="text-xl font-semibold text-gray-200">{formattedDate}</p>
                </motion.div>
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Circuit</p>
                    <p className="text-xl font-semibold text-gray-200">{mainGP?.circuit_short_name}</p>
                </motion.div>
                <motion.div
                    className="p-4 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                >
                    <p className="text-sm text-[#5382ec] mb-2">Circuit characteristics</p>
                    <p className="text-base leading-relaxed text-gray-300">
                        {getCircuitParticularites(mainGP?.grand_prix || "")}
                    </p>
                </motion.div>
                <motion.div
                    className="transition-all duration-300 ease-out hover:scale-[1.02]"
                    whileHover={{ scale: 1.05 }}
                >
                    <img
                        src={getCircuitImageUrl(mainGP?.grand_prix || "")}
                        alt={`Circuit ${mainGP?.circuit_short_name}`}
                        className="w-full h-56 object-cover rounded-lg border border-[#5382ec]/30 cursor-pointer"
                        onClick={() => handleImageClick(getCircuitImageUrl(mainGP?.grand_prix || ""))}
                    />
                </motion.div>
            </CardContent>
        </Card>
    );
};

export default InformationsCard;