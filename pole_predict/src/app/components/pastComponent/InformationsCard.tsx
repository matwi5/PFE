// components/pastComponent/InformationsCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Globe } from "lucide-react";

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
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 2 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Calendar className="mr-2 icon-widget" /> INFORMATIONS
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Date et heure</p>
                        <p className="text-xl">{formatDate(mainGP?.date_start, mainGP?.gmt_offset)}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Circuit</p>
                        <p className="text-xl">{mainGP?.circuit_short_name}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Particularités du circuit</p>
                        <p className="text-base leading-relaxed">
                            {getCircuitParticularites(mainGP?.grand_prix || "")}
                        </p>
                    </div>
                    <img
                        src={getCircuitImageUrl(mainGP?.grand_prix || "")}
                        alt={`Circuit ${mainGP?.circuit_short_name}`}
                        className="w-full h-56 object-cover rounded-lg border-2 border-orange-500 cursor-pointer icon-widget card-image"
                        onClick={() => handleImageClick(getCircuitImageUrl(mainGP?.grand_prix || ""))}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default InformationsCard;