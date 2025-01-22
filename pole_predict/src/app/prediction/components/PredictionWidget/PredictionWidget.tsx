// components/PredictionWidget/PredictionWidget.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';
import { PredictionWidgetProps } from '../../types';
import { PREDICTION_TITLES } from '../../constants';
import { SimplePredictionDisplay } from './SimplePredictionDisplay';
import { BarChartPrediction } from './BarChartPrediction';
import { LaptimeTable } from './LaptimeTable';
import { LaptimeGraph } from './LaptimeGraph';

export const PredictionWidget = ({ type, data, className, isExpertMode }: PredictionWidgetProps) => {

    const renderContent = () => {
        if (!data) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500">
                    Data not available
                </div>
            );
        }

        if (type === 'laptime') {
            return (
                <div className={`flip-container ${isExpertMode ? 'animate-flip-card' : ''}`}>
                    <div className="flip-front">
                        <LaptimeTable data={data} />
                    </div>
                    <div className="flip-back">
                        <LaptimeGraph data={data} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className={`flip-container ${isExpertMode ? 'animate-flip-card' : ''}`}>
                    <div className="flip-front">
                        <SimplePredictionDisplay type={type} data={data} />
                    </div>
                    <div className="flip-back">
                        <BarChartPrediction type={type} data={data} />
                    </div>
                </div>
            );
        }
    };


    return (
        <Card className={`${className} perspective-1000 overflow-hidden bg-[#282a2c] border-0`}>
            <CardHeader className="pb-2 flex justify-between items-start">
                <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
                    {PREDICTION_TITLES[type as keyof typeof PREDICTION_TITLES]}
                </CardTitle>
                <Sparkles className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
            </CardHeader>
            <CardContent className="h-56 relative -mt-7">
                {renderContent()}
            </CardContent>
        </Card>
    );
};