"use client"

import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlayButtonProps { 
  isPlaying: boolean; 
  onToggle: () => void;
  disabled: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onToggle, disabled }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors
    ${disabled 
      ? 'bg-gray-300 cursor-not-allowed' 
      : isPlaying 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
  >
    {isPlaying ? (
      <>
        <Pause className="w-5 h-5 mr-2" />
        Pause
      </>
    ) : (
      <>
        <Play className="w-5 h-5 mr-2" />
        Play
      </>
    )}
  </button>
);