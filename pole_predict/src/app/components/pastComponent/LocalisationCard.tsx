// components/pastComponent/LocalisationCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface LocalisationCardProps {
    coordinates: { lat: number; lon: number } | null;
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    setIsMapVisible: (visible: boolean) => void;
}

const LocalisationCard: React.FC<LocalisationCardProps> = ({ coordinates, hoveredCard, setHoveredCard, setIsMapVisible }) => {
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-[500px] ${hoveredCard === 4 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(4)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Globe className="mr-2 icon-widget" /> LOCALISATION
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                {coordinates ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsMapVisible(true)}
                            className="w-full transition-transform duration-300 hover:scale-105 focus:outline-none map-button"
                        >
                            <img
                                src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates.lon},${coordinates.lat}&z=12&l=map&size=600,400&pt=${coordinates.lon},${coordinates.lat},pm2rdm`}
                                alt="Circuit Location Map"
                                className="w-full h-96 object-cover rounded-lg border-2 border-orange-500 icon-widget map-image"
                            />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p>Chargement de la carte...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LocalisationCard;