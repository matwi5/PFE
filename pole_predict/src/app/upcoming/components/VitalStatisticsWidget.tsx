"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from 'lucide-react';

interface VitalStatisticsWidgetProps {
  stats: Race['vital_statistics'];
  circuit_layout: string;
  showCircuitLayout: boolean;
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

const VitalStatisticsWidget: React.FC<VitalStatisticsWidgetProps> = ({ stats, circuit_layout, showCircuitLayout }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
    <Card className="bg-[#282a2c] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Circuit Statistics
          </CardTitle>
          <Info className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="p-3 bg-[#1d1f20] rounded-lg">
            <span className="text-gray-400 text-sm">Lap Record</span>
            <div className="mt-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                {stats.lap_record.time}
              </span>
              <div className="text-white mt-1">
                {stats.lap_record.driver}
                <span className="text-gray-400 text-sm ml-2">
                  {stats.lap_record.team}, {stats.lap_record.year}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">Track Length</span>
              <div className="text-xl font-bold text-white mt-1">{stats.track_length}</div>
            </div>
            <div className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">First GP</span>
              <div className="text-xl font-bold text-white mt-1">{stats.first_grand_prix}</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">Safety Car Probability</span>
              <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                {stats.safety_car_probability}%
              </div>
            </div>
            <div className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">Pit Stop Time Loss</span>
              <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                {stats.pit_stop_time_loss}s
              </div>
            </div>
          </motion.div>

          {/* Condition pour afficher le tracé du circuit */}
          {showCircuitLayout && (
            <motion.div variants={itemVariants} className="p-3 bg-[#1d1f20] rounded-lg">
              <span className="text-gray-400 text-sm">Circuit Layout</span>
              <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden mt-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={circuit_layout}
                    alt="Circuit layout"
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error loading circuit image');
                      e.currentTarget.src = '/fallback-circuit-image.png';
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default VitalStatisticsWidget;