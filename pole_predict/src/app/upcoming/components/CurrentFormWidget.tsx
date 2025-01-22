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

const CurrentFormWidget: React.FC<CurrentFormWidgetProps> = ({ form }) => (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ ...fadeInUp.transition, delay: 0.5 }}>
      <Card className="bg-[#282a2c] border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Current Form
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5382ec]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.map((point, index) => (
            <div key={index} className="p-3 bg-[#1d1f20] rounded-lg">
              <p className="text-gray-200">{point}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  export default CurrentFormWidget;