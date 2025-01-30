'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map } from 'lucide-react';

const CircuitMap = () => {
  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Circuit Map
          </CardTitle>
          <Map className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <div className="h-full rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/30">
          <span className="text-gray-400">Live Circuit Visualization</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircuitMap;