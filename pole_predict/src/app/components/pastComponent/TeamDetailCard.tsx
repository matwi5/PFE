// components/pastComponent/TeamDetailCard.tsx
"use client";
import React, { useState } from "react";

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

const TeamDetailCard: React.FC<{ team: Team }> = ({ team }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-300 w-full max-w-4xl mx-auto team-card"
            style={{ boxShadow: isHovered ? `0 0 20px 5px ${team.color}` : '0 0 0 0 transparent' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ... rest of your TeamDetailCard component content ... */}
            <div className="grid grid-cols-12 gap-4">
                {/* Logo et nom de l'équipe */}
                <div className="col-span-12 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4">
                        <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="w-20 h-20 object-contain icon-widget"
                        />
                        <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                            {team.name}
                        </h2>
                    </div>
                </div>

                {/* Informations principales */}
                <div className="col-span-12 grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                        <p className="font-semibold mb-2" style={{ color: team.color }}>Base</p>
                        <div className="flex items-center gap-2">
                            <img
                                src={team.country_flag}
                                alt={`${team.country} flag`}
                                className="w-5 h-5 icon-widget"
                            />
                            <p className="text-white">{team.base}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                        <p className="font-semibold mb-2" style={{ color: team.color }}>Team Principal</p>
                        <p className="text-white">{team.team_principal}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 col-span-2 card-info">
                        <p className="font-semibold mb-2" style={{ color: team.color }}>Power Unit</p>
                        <p className="text-white">{team.power_unit}</p>
                    </div>
                </div>

                {/* Image de la voiture */}
                <div className="col-span-12">
                    <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 text-center card-info">
                        <p className="font-semibold mb-4" style={{ color: team.color }}>Car</p>
                        <img
                            src={team.car_image}
                            alt={`${team.name} car`}
                            className="w-80 mx-auto rounded-lg transition-transform duration-300 hover:scale-105 icon-widget"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailCard;