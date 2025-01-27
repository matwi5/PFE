"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

interface LastPoleSittersWidgetProps {
  poleSitters: Race['last_five_pole_sitters'];
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

const LastPoleSittersWidget: React.FC<LastPoleSittersWidgetProps> = ({ poleSitters }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.20 }}>
    <Card className="bg-[#282a2c] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#2DD4CF] to-[#fbbf24] bg-clip-text text-transparent">
            Recent Pole Positions
          </CardTitle>
          <Timer className="h-5 w-5 text-[#fbbf24]" />
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {poleSitters.map((sitter, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#fbbf24] font-medium">{sitter.year}</span>
                <span className="text-white">{sitter.driver}</span>
              </div>
              <span className="text-gray-400 text-sm">{sitter.team}</span>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default LastPoleSittersWidget;