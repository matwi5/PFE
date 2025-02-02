// components/pastComponent/ComparerEcuriesCard.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Team } from "@/app/page"; // Assuming Team interface is in page.tsx

interface ComparerEcuriesCardProps {
    hoveredCard: number | null;
    selectedTeam: Team | null;
    setHoveredCard: (card: number | null) => void;
    toggleTeamTab: () => void;
}


const ComparerEcuriesCard: React.FC<ComparerEcuriesCardProps> = ({ hoveredCard, selectedTeam, setHoveredCard, toggleTeamTab }) => {
    return (
        <Card
            className={`card transition-all duration-300 bg-gray-900 border border-gray-800 h-fit ${hoveredCard === 6 ? 'scale-105' : ''} ${hoveredCard === 6 && selectedTeam ? 'team-card-hover' : 'hover:border-orange-500'}`}
            onMouseEnter={() => setHoveredCard(6)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
                borderColor: hoveredCard === 6 && selectedTeam ? selectedTeam.color : undefined,
            }}
        >
            <CardHeader>
                <CardTitle className="flex items-center text-white card-header-title">
                    <Map className="mr-2 icon-widget" /> COMPARER ECURIES
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="border border-white bg-gray-800 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 compare-button icon-widget"
                        onClick={toggleTeamTab}
                    >
                        Comparer les écuries
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ComparerEcuriesCard;