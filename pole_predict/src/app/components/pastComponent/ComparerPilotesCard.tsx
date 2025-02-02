// components/pastComponent/ComparerPilotesCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComparerPilotesCardProps {
    hoveredCard: number | null;
    setHoveredCard: (card: number | null) => void;
    toggleTab: () => void;
}

const ComparerPilotesCard: React.FC<ComparerPilotesCardProps> = ({ hoveredCard, setHoveredCard, toggleTab }) => {
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 5 ? 'scale-105' : ''}`}
            onMouseEnter={() => setHoveredCard(5)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Map className="mr-2 icon-widget" /> COMPARER PILOTES
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 compare-button icon-widget"
                        onClick={toggleTab}
                    >
                        Comparer les pilotes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComparerPilotesCard;