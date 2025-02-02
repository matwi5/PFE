// components/pastComponent/DriverDetailCard.tsx
"use client";
import React, { useState } from "react";

interface Driver {
    flagColors: string[];
    broadcast_name: string;
    country_code: string;
    driver_number: number;
    first_name: string;
    headshot_url: string;
    last_name: string;
    team_name: string;
    team_colour: string;
    name: string;
    flag_url: string;
    year: number[];
    NumberOfPodiums: number;
    NumberOfVictories: number;
    WorldChampionships: number;
}

const DriverDetailCard: React.FC<{ driver: Driver }> = ({ driver }) => (
    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 transition-all duration-300 hover:border-orange-500 driver-card">
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-full"></div>
            <img
                src={driver.headshot_url}
                alt={`${driver.name} headshot`}
                className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-orange-500 transition-transform duration-300 hover:scale-105 icon-widget"
            />
        </div>
        <h2 className="text-3xl font-bold text-center mb-6 text-white bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            {driver.name}
        </h2>
        <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Équipe</p>
                <p className="text-white">{driver.team_name}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Numéro</p>
                <p className="text-white text-2xl font-bold">{driver.driver_number}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Nationalité</p>
                <div className="flex items-center justify-center gap-2">
                    <img
                        src={driver.flag_url}
                        alt={`${driver.country_code} flag`}
                        className="w-6 h-4 icon-widget"
                    />
                    <p className="text-white">{driver.country_code}</p>
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Code</p>
                <p className="text-white text-xl font-mono">{driver.broadcast_name}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Nombre de Victoires</p>
                <p className="text-white text-2xl font-bold">{driver.NumberOfVictories}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 card-info">
                <p className="font-semibold text-orange-400 mb-2">Nombre de Podiums</p>
                <p className="text-white text-2xl font-bold">{driver.NumberOfPodiums}</p>
            </div>
        </div>
        {driver.WorldChampionships > 0 && (
            <div className="mt-4 flex justify-center flex-wrap gap-2">
                {Array.from({ length: driver.WorldChampionships }).map((_, index) => (
                    <img
                        key={index}
                        src="/images/coupe.webp"
                        alt={`Championship Trophy ${index + 1}`}
                        className="w-16 h-16 icon-widget"
                    />
                ))}
            </div>
        )}
    </div>
);

export default DriverDetailCard;