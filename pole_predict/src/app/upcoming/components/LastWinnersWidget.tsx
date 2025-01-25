"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface LastWinnersWidgetProps {
  winners: Race['last_five_winners'];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const LastWinnersWidget: React.FC<LastWinnersWidgetProps> = ({ winners }) => (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.3 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#d56676] to-[#5382ec] bg-clip-text text-transparent">
              Recent Winners
            </CardTitle>
            <Trophy className="h-5 w-5 text-[#d56676]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {winners.map((winner, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-[#d56676] font-medium">{winner.year}</span>
                <span className="text-white">{winner.driver}</span>
              </div>
              <span className="text-gray-400 text-sm">{winner.team}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  export default LastWinnersWidget;