"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface RaceDatesWidgetProps {
  dates: Race['dates'];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const RaceDatesWidget: React.FC<RaceDatesWidgetProps> = ({ dates }) => (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={fadeInUp.transition}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Race Weekend Schedule
            </CardTitle>
            <Calendar className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {Object.entries(dates).map(([key, value]) => value && (
            <div key={key} className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 uppercase text-sm">{key.replace('_', ' ')}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  export default RaceDatesWidget;