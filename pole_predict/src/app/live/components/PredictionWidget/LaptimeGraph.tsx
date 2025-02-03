// components/PredictionWidget/LaptimeGraph.tsx
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TIME_FORMAT, LAPTIME_COLORS, DEBUG_LAP_TIME } from '../../constants';
import { PredictionData } from '../../types';
import { useMediaQuery } from 'react-responsive';

interface LaptimeGraphProps {
    data: PredictionData | undefined;
}

export const LaptimeGraph: React.FC<LaptimeGraphProps> = ({ data }) => {
    if (!data?.lap_predictions) return null;

    // Préparation des données du graphique
    const chartData = data.lap_predictions.map(pred => ({
        lap: pred.lap_number,
        predicted: pred.predicted_time,
        actual: pred.actual_time
    }));

    const predictedTimes = chartData.map(d => d.predicted);
    const centerTime =
        predictedTimes.reduce((sum, time) => sum + time, 0) / predictedTimes.length;
    const yDomain = [centerTime - 0.7, centerTime + 0.7];

    // Détection de la vue mobile (largeur d'écran inférieure ou égale à 767px)
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    if (isMobile) {
        return (
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
                    >
                        <defs>
                            <linearGradient
                                id="predictionGradientMobile"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                            >
                                <stop offset="0%" stopColor="#5382ec" />
                                <stop offset="100%" stopColor="#d56676" />
                            </linearGradient>
                        </defs>

                        {/*
                          Pour la vue mobile, nous omettons la grille (CartesianGrid)
                          pour alléger le visuel et utilisons des polices et marges réduites.
                        */}
                        <XAxis
                            dataKey="lap"
                            stroke="#7e8385"
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#7e8385"
                            domain={yDomain}
                            tickFormatter={(value) => TIME_FORMAT.format(value)}
                            scale="linear"
                            allowDataOverflow={true}
                            tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#282a2c',
                                border: '1px solid #7e8385',
                                borderRadius: '4px',
                                fontSize: '10px'
                            }}
                            labelStyle={{ color: '#fff', fontSize: '10px' }}
                            formatter={(value: number) => [TIME_FORMAT.format(value), 'Time']}
                        />

                        {DEBUG_LAP_TIME && (
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke={LAPTIME_COLORS.NORMAL}
                                strokeWidth={2}
                                dot={false}
                                name="Actual Time"
                                isAnimationActive={false}
                            />
                        )}

                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="url(#predictionGradientMobile)"
                            strokeWidth={2}
                            dot={false}
                            name="Predicted Time"
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Vue Desktop inchangée
    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                    <defs>
                        <linearGradient id="predictionGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#5382ec" />
                            <stop offset="100%" stopColor="#d56676" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        strokeOpacity={0.5}
                        stroke="#7e8385"
                    />
                    <XAxis dataKey="lap" stroke="#7e8385" />
                    <YAxis
                        stroke="#7e8385"
                        domain={yDomain}
                        tickFormatter={(value) => TIME_FORMAT.format(value)}
                        scale="linear"
                        allowDataOverflow={true}
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

                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="url(#predictionGradient)"
                        strokeWidth={2.5}
                        dot={{
                            stroke: "#5382ec",
                            strokeWidth: 2,
                            r: 4,
                            fill: "#282a2c"
                        }}
                        name="Predicted Time"
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
