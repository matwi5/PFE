// components/pastComponent/DetailsCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

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
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 ${hoveredCard === 1 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Info className="mr-2 icon-widget" /> DETAILS
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-2">
                    <div className="bg-gray-800 p-3 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Nombre de tours</p>
                        <p className="text-lg">{mainGP?.nb_tours}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Longueur du circuit</p>
                        <p className="text-lg">{mainGP?.long_circuit}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg card-info">
                        <p className="text-sm text-orange-500">Distance de course</p>
                        <p className="text-lg">{mainGP?.dist_course}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DetailsCard;