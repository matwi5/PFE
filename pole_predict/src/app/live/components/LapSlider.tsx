// components/LapSlider.tsx
import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface LapSliderProps {
  laps: string[];
  selectedLap: string;
  onLapChange: (lap: string) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  disabled?: boolean;
}

export const LapSlider = ({ laps, selectedLap, onLapChange, isPlaying, onPlayToggle, disabled }: LapSliderProps) => {
  const currentValue = laps.indexOf(selectedLap);
  const maxValue = laps.length - 1;

  return (
    <div className="relative h-12 flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg p-0.5">
        <div className="absolute inset-0 bg-[#1d1f20] rounded-[6px]">
          <div className="flex items-center h-full px-6 gap-4">
            <div className="flex-1 flex items-center gap-4">
              <motion.button
                onClick={onPlayToggle}
                disabled={disabled}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}
                  transition-colors
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-[#d56676]" />
                ) : (
                  <Play className="w-5 h-5 text-[#2dd4bf]" />
                )}
              </motion.button>

              {/* Affichage du tour actuel */}
              <div className="w-16">
                <div className="text-sm text-gray-400">LAP</div>
                <div className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  {selectedLap}
                </div>
              </div>

              {/* Slider personnalisé */}
              <div className="flex-1">
                <form className="relative flex-1">
                  <Slider.Root
                    className="relative flex items-center select-none touch-none h-5 cursor-pointer"
                    value={[currentValue]}
                    max={maxValue}
                    step={1}
                    disabled={disabled || isPlaying}
                    onValueChange={([value]) => {
                      onLapChange(laps[value]);
                    }}
                  >
                    <Slider.Track className="bg-gray-700 relative grow h-[3px] rounded-full">
                      <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]" />
                    </Slider.Track>
                    <Slider.Thumb
                      className="block w-5 h-5 bg-[#1d1f20] border-2 border-[#5382ec] rounded-full focus:outline-none transition-transform hover:scale-110"
                    />
                  </Slider.Root>
                </form>
              </div>

              {/* Affichage du tour total */}
              <div className="w-16 text-right">
                <div className="text-sm text-gray-400">MAX</div>
                <div className="text-xl font-bold text-gray-500">
                  {laps[maxValue]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};