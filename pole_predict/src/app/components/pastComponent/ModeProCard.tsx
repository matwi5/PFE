// components/pastComponent/ModeProCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface ModeProCardProps {
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    setIsFlagAnimating: (isAnimating: boolean) => void;
}

const ModeProCard: React.FC<ModeProCardProps> = ({ hoveredCard, setHoveredCard, setIsFlagAnimating }) => {
    return (
        <Card
            className={`group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 ${hoveredCard === 7 ? 'scale-105' : ''}`}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Pro Mode
                    </CardTitle>
                    <Map className="h-5 w-5 text-[#5382ec]" />
                </div>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <Button
                        asChild
                        variant="outline"
                        className="border border-gray-800 bg-black/20 text-gray-300 hover:bg-black/30 hover:text-[#2dd4bf] transition-all duration-300 w-full"
                        onClick={() => {
                            alert("Pro Mode activated");
                        }}
                    >
                        <motion.div whileTap={{ scale: 0.95 }}>
                            Activate Pro Mode
                        </motion.div>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModeProCard;