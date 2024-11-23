"use client";

import React from "react";
import { AnimatedRadarChart } from "@/app/components/Hexagon"; // Assurez-vous que le chemin est correct

const RadarTestPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg">
        <AnimatedRadarChart />
      </div>
    </main>
  );
};

export default RadarTestPage;
