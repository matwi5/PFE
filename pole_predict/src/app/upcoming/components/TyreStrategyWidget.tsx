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

const TyreStrategyWidget: React.FC<TyreStrategyWidgetProps> = ({ insights }) => (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.4 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#2dd4bf] to-[#5382ec] bg-clip-text text-transparent">
              Tyre Strategy
            </CardTitle>
            <Cog className="h-5 w-5 text-[#2dd4bf]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-[#1d1f20] rounded-lg">
              <p className="text-gray-200">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  export default TyreStrategyWidget;