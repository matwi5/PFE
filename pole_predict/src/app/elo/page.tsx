"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

// Interface definitions
import EloChart from './components/EloChart';

interface EloPageProps {}

export default function EloPage({ }: EloPageProps) {
  // Page-level state management can be added here if needed

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            ELO Ratings
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore Formula 1 driver and constructor ELO ratings
          </p>
        </motion.div>

          <EloChart />
      </div>
    </div>
  );
}