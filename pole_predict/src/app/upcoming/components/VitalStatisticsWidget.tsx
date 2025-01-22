"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface VitalStatisticsWidgetProps {
  stats: Race['vital_statistics'];
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const VitalStatisticsWidget: React.FC<VitalStatisticsWidgetProps> = ({ stats }) => (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
              Circuit Statistics
            </CardTitle>
            <Info className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-[#1d1f20] rounded-lg">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">Track Length</span>
                <div className="text-xl font-bold text-white mt-1">{stats.track_length}</div>
              </div>
              <div className="p-3 bg-[#1d1f20] rounded-lg">
                <span className="text-gray-400 text-sm">First GP</span>
                <div className="text-xl font-bold text-white mt-1">{stats.first_grand_prix}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  export default VitalStatisticsWidget;