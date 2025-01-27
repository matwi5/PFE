// upcoming/components/RacePredictionsWidget.tsx

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { BarChart } from 'lucide-react';
import AnimatedBorderCard from './GlowingBorderCard';

interface RacePredictionsWidgetProps {
  predictions: {
    position: number;
    driver: string;
    constructor: string;
  }[];
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

const RacePredictionsWidget: React.FC<RacePredictionsWidgetProps> = ({ predictions }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.45 }}>
    <AnimatedBorderCard>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">
            Race Predictions
          </CardTitle>
          <BarChart className="h-5 w-5 text-[#10B981]" />
        </div>
      </CardHeader>
      <CardContent className="pb-9">
        <div className="h-[500px] relative">
          <div className="absolute inset-x-0 h-5 top-0 bg-gradient-to-b from-[#282a2c] to-transparent z-10" />
          <div className="absolute inset-x-0 h-5 bottom-0 bg-gradient-to-t from-[#282a2c] to-transparent z-10" />
          
          <motion.div
            className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-2 pt-1 pb-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {predictions.map((prediction) => (
              <motion.div 
                key={prediction.position}
                variants={itemVariants}
                className="flex items-center justify-between p-2 bg-[#1d1f20] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-sm bg-[#10B981]/20 flex items-center justify-center">
                    <span className="text-xs text-[#10B981]">{prediction.position}</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {prediction.driver.split('_').pop()?.replace(/^./, c => c.toUpperCase())}
                  </span>
                </div>
                <span className="text-xs text-gray-400 capitalize">
                  {prediction.constructor.replace(/_/g, ' ')}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-2 right-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-xs text-gray-400">Average error margin: ±3.1 positions</span>
        </motion.div>
      </CardContent>
    </AnimatedBorderCard>
  </motion.div>
);

export default RacePredictionsWidget;