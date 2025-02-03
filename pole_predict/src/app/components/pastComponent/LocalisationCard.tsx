// components/pastComponent/LocalisationCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { motion } from 'framer-motion';

interface LocalisationCardProps {
    coordinates: { lat: number; lon: number } | null;
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    setIsMapVisible: (visible: boolean) => void;
}

const LocalisationCard: React.FC<LocalisationCardProps> = ({ coordinates, hoveredCard, setHoveredCard, setIsMapVisible }) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 h-[500px] ${hoveredCard === 4 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                         Location
                    </CardTitle>
                    <Info className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300">
                {coordinates ? (
                    <div className="space-y-4">
                        <motion.button
                            onClick={() => setIsMapVisible(true)}
                            className="w-full focus:outline-none"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.img
                                src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates.lon},${coordinates.lat}&z=12&l=map&size=600,400&pt=${coordinates.lon},${coordinates.lat},pm2rdm`}
                                alt="Circuit Location Map"
                                className="w-full h-96 object-cover rounded-lg border border-[#5382ec]/30 cursor-pointer"
                            />
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-400">Chargement de la carte...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LocalisationCard;