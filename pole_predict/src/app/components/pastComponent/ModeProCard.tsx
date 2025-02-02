// components/pastComponent/ModeProCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModeProCardProps {
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    setIsFlagAnimating: (isAnimating: boolean) => void;
}

const ModeProCard: React.FC<ModeProCardProps> = ({ hoveredCard, setHoveredCard, setIsFlagAnimating }) => {
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit mode-pro-card ${hoveredCard === 7 ? 'scale-105' : ''}`}
            onMouseEnter={() => {
                setHoveredCard(7);
                setIsFlagAnimating(true);
            }}
            onMouseLeave={() => {
                setHoveredCard(null);
                setIsFlagAnimating(false);
            }}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Map className="mr-2 icon-widget" /> MODE PRO
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 mode-pro-button icon-widget"
                        onClick={() => {
                            alert("Mode Pro activé");
                        }}
                    >
                        Activer le mode Pro
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModeProCard;