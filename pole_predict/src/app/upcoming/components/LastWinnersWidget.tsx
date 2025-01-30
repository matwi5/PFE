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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const LastWinnersWidget: React.FC<LastWinnersWidgetProps> = ({ winners }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.4 }}>
    <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#d56676]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#d56676] to-[#5382ec] bg-clip-text text-transparent">
            Recent Winners
          </CardTitle>
          <Trophy className="h-5 w-5 text-[#d56676]" />
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {winners.map((winner, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#d56676] font-medium">{winner.year}</span>
                <span className="text-white">{winner.driver}</span>
              </div>
              <span className="text-gray-400 text-sm">{winner.team}</span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default LastWinnersWidget;