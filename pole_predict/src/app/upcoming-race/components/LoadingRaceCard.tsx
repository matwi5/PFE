"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingRaceCard = () => (
    <Card className="bg-[#282a2c] border border-gray-800 hover:border-[#5382ec]">
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-[#1d1f20]" />
        <Skeleton className="h-6 w-full bg-[#1d1f20]" />
        <Skeleton className="h-6 w-3/4 bg-[#1d1f20]" />
      </div>
    </Card>
  );

  export default LoadingRaceCard;