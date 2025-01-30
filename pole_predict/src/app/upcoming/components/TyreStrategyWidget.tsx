"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Cog } from 'lucide-react';

interface TyreStrategyWidgetProps {
  insights: Race['tyre_strategy_insight'];
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

const TyreStrategyWidget: React.FC<TyreStrategyWidgetProps> = ({ insights }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.45 }}>
    <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#D4582D]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#D4582D] to-[#D42D62] bg-clip-text text-transparent">
            Tyre Strategy
          </CardTitle>
          <Cog className="h-5 w-5 text-[#D4582D]" />
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {insights.map((insight, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="p-3 bg-[#1d1f20] rounded-lg"
            >
              <p className="text-gray-200">{insight}</p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default TyreStrategyWidget;