/* eslint-disable */
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { AlarmClock } from 'lucide-react';
import AnimatedBorderCard from './GlowingBorderCard';

interface QualifyingPredictionsWidgetProps {
  predictions: {
    position: number;
    driver: string;
    constructor: string;
  }[];
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
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

const mobileItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const itemVariants = (index: number) => ({
  hidden: { 
    opacity: 0, 
    y: index % 2 === 0 ? 10 : 20
  },
  visible: { 
    opacity: 1, 
    y: index % 2 === 0 ? 0 : 16
  }
});

const QualifyingPredictionsWidget: React.FC<QualifyingPredictionsWidgetProps> = ({ predictions }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Vue mobile
  if (isMobile) {
    return (
      <motion.div 
        initial={fadeInUp.initial} 
        animate={fadeInUp.animate} 
        transition={{ ...fadeInUp.transition, delay: 0.25 }}
        className="h-full"
      >
        <AnimatedBorderCard>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                Qualifications Predictions
              </CardTitle>
              <AlarmClock className="h-4 w-4 text-[#8B5CF6]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px]">
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
                    variants={mobileItemVariants}
                    className="p-3 rounded-lg bg-[#1d1f20] transition-colors hover:bg-[#2d2f30]"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-sm bg-[#8B5CF6]/20 flex items-center justify-center">
                          <span className="text-xs font-mono text-[#8B5CF6] font-bold">
                            P{prediction.position}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {prediction.driver.split('_').pop()?.replace(/^./, c => c.toUpperCase())}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {prediction.constructor.split('_').pop()?.replace(/^./, c => c.toUpperCase())}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div 
              className="mt-4 flex justify-end"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.4 }}
            >
              <span className="text-xs text-gray-400">
                Average error margin: ±3.5 positions
              </span>
            </motion.div>
          </CardContent>
        </AnimatedBorderCard>
      </motion.div>
    );
  }

  // Vue desktop (inchangée)
  return (
    <motion.div 
      initial={fadeInUp.initial} 
      animate={fadeInUp.animate} 
      transition={{ ...fadeInUp.transition, delay: 0.25 }}
    >
      <AnimatedBorderCard>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              Qualifications Predictions
            </CardTitle>
            <AlarmClock className="h-5 w-5 text-[#8B5CF6]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-14">
          <motion.div
            className="grid grid-cols-2 gap-y-6 gap-x-2 min-h-[320px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {predictions.map((prediction, index) => (
              <motion.div 
                key={prediction.position}
                variants={itemVariants(index)}
                className={`relative p-2 rounded-lg bg-[#1d1f20] ${index % 2 === 0 ? 'mr-3' : 'ml-3'}`}
                transition={{ type: 'spring', stiffness: 120 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8B5CF6]">
                      P{prediction.position}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {prediction.driver.split('_').pop()?.replace(/^./, c => c.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {prediction.constructor.split('_').pop()?.replace(/^./, c => c.toUpperCase())}
                  </span>
                </div>
                
                {index < predictions.length - 2 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4/5">
                    <div className="border-b border-dashed border-[#8B5CF6]/30"/>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
          <motion.div 
            className="absolute bottom-2 right-2"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.4 }}
          >
            <span className="text-xs text-gray-400">
              Average error margin: ±3.5 positions
            </span>
          </motion.div>
        </CardContent>
      </AnimatedBorderCard>
    </motion.div>
  );
};

export default QualifyingPredictionsWidget;