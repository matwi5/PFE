"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface CurrentFormWidgetProps {
  form: Race['current_form'];
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
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const CurrentFormWidget: React.FC<CurrentFormWidgetProps> = ({ form }) => (
  <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.2 }}>
    <Card className="bg-[#282a2c] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Current Form
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {form.map((point, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="p-3 bg-[#1d1f20] rounded-lg"
            >
              <p className="text-gray-200">{point}</p>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);

export default CurrentFormWidget;