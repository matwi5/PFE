"use client"

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { ExpertModeToggleProps } from '../types';

export const ExpertModeToggle: React.FC<ExpertModeToggleProps> = ({ isExpertMode, onToggle }) => (
  <div className="flex items-center gap-2">
    <Switch
      checked={isExpertMode}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-blue-500"
    />
    <span className=" font-medium text-white">
      {isExpertMode ? 'Expert Mode' : 'Simple Mode'}
    </span>
  </div>
);