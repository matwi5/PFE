// components/pastComponent/ComparerEcuriesCard.tsx
/* eslint-disable */
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface Team {
    name: string;
    color: string;
    logo_url: string;
    base: string;
    team_principal: string;
    championships: number;
    power_unit: string;
    country: string;
    country_flag: string;
    pilote1_url: string;
    pilote2_url: string;
    car_image: string;
}

interface ComparerEcuriesCardProps {
    hoveredCard: number | null;
    selectedTeam: Team | null;
    setHoveredCard: (card: number | null) => void;
    toggleTeamTab: () => void;
}

const ComparerEcuriesCard: React.FC<ComparerEcuriesCardProps> = ({ hoveredCard, selectedTeam, setHoveredCard, toggleTeamTab }) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 transition-shadow duration-300 ${hoveredCard === 6 ? 'scale-105' : ''} ${hoveredCard === 6 && selectedTeam ? '' : 'hover:border-[#5382ec]'}`}
            style={{
                border: (hoveredCard === 6 && selectedTeam) ? `2px solid #${selectedTeam.color}` : undefined
            }}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Compare Teams
                    </CardTitle>
                    <Users className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
                <Button
                    asChild
                    variant="outline"
                    className="border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300 w-full"
                    onClick={toggleTeamTab}
                >
                    <motion.div whileTap={{ scale: 0.95 }}>
                        Compare Teams
                    </motion.div>
                </Button>
            </CardContent>
        </Card>
    );
};

export default ComparerEcuriesCard;