"use client"

import React from 'react';
import { TimelineProps } from '../types';

export const LapSlider: React.FC<TimelineProps> = ({ laps, selectedLap, onLapChange, disabled }) => {
  const minLap = Math.min(...laps.map(lap => parseInt(lap)));
  const maxLap = Math.max(...laps.map(lap => parseInt(lap)));
  
  return (
    <div className="w-full px-8 my-4">
      <div className="relative">
      <input
        type="range"
        min={minLap}
        max={maxLap}
        value={parseInt(selectedLap) || minLap}
        onChange={(e) => onLapChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-2 bg-[#1B1C1D] rounded-lg appearance-none cursor-pointer 
                  accent-[#5382ec] hover:accent-[#d56676] transition-all
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <div className="flex justify-between mt-4 font-medium text-gray-400">
        <span>Lap {minLap}</span>
        <span className="text-[#5382ec]">Lap {selectedLap || minLap}</span>
        <span>Lap {maxLap}</span>
      </div>
      </div>
    </div>
  );
};