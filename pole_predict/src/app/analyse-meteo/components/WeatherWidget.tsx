"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WeatherWidgetProps {
  analysis: string | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#3b82f6]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
              Weather Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-[#3b82f6]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analysis && (
            <div className="p-4 bg-[#1d1f20] rounded-lg">
              <ReactMarkdown className="text-gray-200">{analysis}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherWidget;
