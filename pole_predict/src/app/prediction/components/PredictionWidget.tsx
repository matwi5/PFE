// components/PredictionWidget.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { Sparkles } from 'lucide-react';
import { FormattedPredictionData, PredictionData, PredictionWidgetProps } from '../types';
import { PREDICTION_CLASS_ORDER, PREDICTION_TITLES, TIME_FORMAT, LAPTIME_COLORS, DEBUG_LAP_TIME } from '../constants';

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

  const renderLaptimeTable = () => {
    if (!data?.lap_predictions) return null;
  
    return (
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-gray-400">Lap</th>
              <th className="px-2 py-1 text-right text-gray-400">Predicted</th>
              {DEBUG_LAP_TIME && (
                <th className="px-2 py-1 text-right text-gray-400">Actual</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.lap_predictions.slice(0, 10).map((pred) => (
              <tr key={pred.lap_number} className="border-t border-gray-700">
                <td className="px-2 py-1 text-left">{pred.lap_number}</td>
                <td className="px-2 py-1 text-right font-mono">
                  {TIME_FORMAT.format(pred.predicted_time)}
                </td>
                {DEBUG_LAP_TIME && (
                  <td className="px-2 py-1 text-right font-mono">
                    {pred.actual_time ? TIME_FORMAT.format(pred.actual_time) : '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderLaptimeGraph = () => {
    if (!data?.lap_predictions) return null;
  
    const chartData = data.lap_predictions.map(pred => ({
      lap: pred.lap_number,
      predicted: pred.predicted_time,
      actual: pred.actual_time
    }));
  
    // Correction: utiliser la clé correcte 'predicted' au lieu de 'predicted_time'
    const predictedTimes = chartData.map(d => d.predicted);
    const centerTime = predictedTimes.reduce((sum, time) => sum + time, 0) / predictedTimes.length;
    
    // Domaine fixe basé uniquement sur les prédictions
    const yDomain = [centerTime - 1, centerTime + 1];
  
    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} stroke="#7e8385" />
            <XAxis 
              dataKey="lap"
              stroke="#7e8385"
            />
            <YAxis 
              stroke="#7e8385"
              domain={yDomain}
              tickFormatter={(value) => TIME_FORMAT.format(value)}
              scale="linear"
              allowDataOverflow={true} // Permet aux données de dépasser le domaine
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#282a2c',
                border: '1px solid #7e8385',
                borderRadius: '4px'
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number) => [TIME_FORMAT.format(value), 'Time']}
            />
            
            {/* Ligne des temps réels (peut dépasser l'échelle) */}
            {DEBUG_LAP_TIME && (
              <Line
                type="monotone"
                dataKey="actual"
                stroke={LAPTIME_COLORS.NORMAL}
                strokeWidth={2}
                dot
                name="Actual Time"
                isAnimationActive={false}
              />
            )}
  
            {/* Ligne de prédiction (détermine l'échelle) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke={LAPTIME_COLORS.PREDICTED}
              strokeWidth={2}
              dot
              name="Predicted Time"
              isAnimationActive={false}
            />
  
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Rendu spécifique pour le widget de temps au tour
  if (type === 'laptime') {
    return (
      <Card className={`${className} perspective-1000 overflow-hidden bg-[#282a2c] border-0`}>
        <CardHeader className="pb-2 flex justify-between items-start">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
            {PREDICTION_TITLES[type]}
          </CardTitle>
          <Sparkles className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
        </CardHeader>
        <CardContent className="h-56 relative">
          {data ? (
            <div className={`flip-container ${isExpertMode ? 'animate-flip-card' : ''}`}>
              <div className="flip-front">
                {renderLaptimeTable()}
              </div>
              <div className="flip-back">
                {renderLaptimeGraph()}
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
  }

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