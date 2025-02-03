// components/pastComponent/ComparerPilotesCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface ComparerPilotesCardProps {
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    toggleTab: () => void;
}

const ComparerPilotesCard: React.FC<ComparerPilotesCardProps> = ({ hoveredCard, setHoveredCard, toggleTab }) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 5 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Compare Drivers
                    </CardTitle>
                    <Users className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <Button
                        asChild
                        variant="outline"
                        className="border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300 w-full"
                        onClick={toggleTab}
                    >
                        <motion.div whileTap={{ scale: 0.95 }}>
                            Compare Drivers
                        </motion.div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComparerPilotesCard;