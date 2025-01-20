"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles } from 'lucide-react';
import { FormattedPredictionData, PredictionData, PredictionWidgetProps } from '../types';
import { PREDICTION_CLASS_ORDER, PREDICTION_TITLES } from '../constants';

const lightenColor = (color: string, factor: number) => {
  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;
    const r = Math.min(255, Math.round(parseInt(rgb[0]) * (1 + factor)));
    const g = Math.min(255, Math.round(parseInt(rgb[1]) * (1 + factor)));
    const b = Math.min(255, Math.round(parseInt(rgb[2]) * (1 + factor)));
    return `rgb(${r}, ${g}, ${b})`;
  }
  return color;
};

export const PredictionWidget = ({ type, data, className, isExpertMode }: PredictionWidgetProps) => {
  const formatPredictionData = (): FormattedPredictionData[] => {
    if (!data?.predictions) return [];
    
    const predictions = data.predictions;
    const orderArray = PREDICTION_CLASS_ORDER[type as keyof typeof PREDICTION_CLASS_ORDER];
    
    return orderArray.map(className => {
      const key = `proba_${className}`;
      let displayName = className;
  
      if (type === 'pneu') {
        if (className === 'Unknown') displayName = 'None';
        if (className === 'INTERMEDIATE') displayName = 'Inter';
        if (className === 'SOFT') displayName = 'Soft';
        if (className === 'MEDIUM') displayName = 'Medium';
        if (className === 'HARD') displayName = 'Hard';
        if (className === 'WET') displayName = 'Wet';
      } else if (type === 'depassement') {
        if (className === 'True') displayName = 'Overtake';
        if (className === 'False') displayName = 'Stay';
      }
  
      return {
        name: type === 'position' ? className.replace('.0', '') : displayName,
        probability: (predictions[key] as number) || 0
      };
    });
  };

  const getPredictionDisplay = () => {
    if (!data?.predictions) return '';
    
    const pred = data.predictions.prediction;
    
    switch (type) {
      case 'depassement':
        return pred === 0 ? 'No Overtake' : 'Overtake Expected';
      case 'pitstop':
        return pred === 'Never' ? 'No more stops planned' : `Stop in ${pred} laps`;
      case 'pneu':
        return pred === 'Unknown' ? 'No more changes planned' : `${pred} tires`;
      case 'position':
        return `${pred}`;
      default:
        return '';
    }
  };

  const renderSimpleMode = () => (
    <div className="flex items-center justify-center h-36">
      <h3 className={`font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center
        ${type === 'position' ? 'text-9xl  mt-1' : 'text-4xl'}`}>
        {getPredictionDisplay()}
      </h3>
    </div>
  );

  const renderExpertMode = () => {
    const data = formatPredictionData();
    const getBarColor = (index: number) => {
      const totalBars = data.length - 1;
      if (totalBars === 0) return "#5382ec";
      
      const startColor = [83, 130, 236];
      const endColor = [213, 102, 118];
      
      const r = startColor[0] + (endColor[0] - startColor[0]) * (index / totalBars);
      const g = startColor[1] + (endColor[1] - startColor[1]) * (index / totalBars);
      const b = startColor[2] + (endColor[2] - startColor[2]) * (index / totalBars);
      
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    return (
      <div className="h-40 flex items-center justify-center">
        <ResponsiveContainer width="90%" height="170%">
          <BarChart 
            data={data}
            margin={{ top: 48, right: 0, left: -10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              strokeOpacity={0.5} 
              stroke="#7e8385"
            />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              interval={0}
              tick={{ fontSize: 12, fill: "#7e8385" }}
              stroke="#7e8385"
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
              tick={{ fill: "#7e8385" }}
              stroke="#7e8385"
            />
            <Tooltip 
              formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              contentStyle={{
                backgroundColor: '#282a2c',
                borderRadius: '8px',
                padding: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'white' }}
              itemStyle={{ color: 'white' }}
            />
            <Bar 
              dataKey="probability" 
              animationDuration={300}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(index)}
                  onMouseOver={(props) => {
                    const currentColor = getBarColor(index);
                    props.target.style.fill = lightenColor(currentColor, 0.2);
                  }}
                  onMouseOut={(props) => {
                    props.target.style.fill = getBarColor(index);
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className={`${className} perspective-1000 overflow-hidden bg-[#282a2c] border-0`}>
      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
          {PREDICTION_TITLES[type as keyof typeof PREDICTION_TITLES]}
        </CardTitle>
        <Sparkles className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
      </CardHeader>
      <CardContent className="h-56 relative">
        {data ? (
          <div className={`flip-container ${isExpertMode ? 'animate-flip-card' : ''}`}>
            <div className="flip-front">
              {renderSimpleMode()}
            </div>
            <div className="flip-back">
              {renderExpertMode()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Data not available
          </div>
        )}
      </CardContent>
    </Card>
  );
};