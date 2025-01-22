// components/PredictionWidget/SimplePredictionDisplay.tsx
import React from 'react';
import { FormattedPredictionData, PredictionData } from '../../types';

interface SimplePredictionDisplayProps {
    type: string;
    data: PredictionData | undefined;
}

export const SimplePredictionDisplay: React.FC<SimplePredictionDisplayProps> = ({ type, data }) => {
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

    return (
        <div className="flex items-center justify-center h-36">
            <h3 className={`font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center
        ${type === 'position' ? 'text-9xl  mt-6' : 'text-5xl'}`}>
                {getPredictionDisplay()}
            </h3>
        </div>
    );
};