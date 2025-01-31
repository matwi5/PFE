"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { History } from 'lucide-react';

interface IconicMomentWidgetProps {
  moment: Race['iconic_moment'];
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

const IconicMomentWidget: React.FC<IconicMomentWidgetProps> = ({ moment }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.5 }}>
    <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#fbbf24]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#fbbf24] to-[#d56676] bg-clip-text text-transparent">
                Iconic Moment
              </CardTitle>
              <motion.span variants={itemVariants}>
                <History className="h-5 w-5 text-[#fbbf24]" />
              </motion.span>
            </div>
          </CardHeader>
        </motion.div>

        <motion.div variants={itemVariants}>
          <CardContent>
            <div className="p-4 bg-[#1d1f20] rounded-lg">
              <p className="text-gray-200 italic">{moment}</p>
            </div>
          </CardContent>
        </motion.div>
      </motion.div>
    </Card>
  </motion.div>
);

export default IconicMomentWidget;