"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StrategyWidgetProps {
  analysis: string | null;
}

const StrategyWidget: React.FC<StrategyWidgetProps> = ({ analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#ec4899]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#ec4899] to-[#f472b6] bg-clip-text text-transparent">
              Strategy Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-[#ec4899]" />
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

export default StrategyWidget;
