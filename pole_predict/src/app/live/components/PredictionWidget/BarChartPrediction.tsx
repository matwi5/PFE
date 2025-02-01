// components/PredictionWidget/BarChartPrediction.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FormattedPredictionData, PredictionData } from '../../types';
import { PREDICTION_CLASS_ORDER } from '../../constants';

interface BarChartPredictionProps {
    type: string;
    data: PredictionData | undefined;
}

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

export const BarChartPrediction: React.FC<BarChartPredictionProps> = ({ type, data }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                if (className === 'True') displayName = 'Pass';
                if (className === 'False') displayName = 'Stay';
            }

            return {
                name: type === 'position' ? className.replace('.0', '') : displayName,
                probability: (predictions[key] as number) || 0
            };
        });
    };

    const chartData = formatPredictionData();
    const getBarColor = (index: number) => {
        const totalBars = chartData.length - 1;
        if (totalBars === 0) return "#5382ec";

        const startColor = [83, 130, 236];
        const endColor = [213, 102, 118];

        const r = startColor[0] + (endColor[0] - startColor[0]) * (index / totalBars);
        const g = startColor[1] + (endColor[1] - startColor[1]) * (index / totalBars);
        const b = startColor[2] + (endColor[2] - startColor[2]) * (index / totalBars);

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    if (isMobile) {
        return (
            <div className="h-32 flex items-center justify-center px-2">
                <ResponsiveContainer width="100%" height="160%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 24, right: 0, left: 0, bottom: -20 }}
                        barCategoryGap={15}
                    >
                        <CartesianGrid
                            strokeDasharray="2 2"
                            strokeOpacity={0.5}
                            stroke="#7e8385"
                        />
                        <XAxis
                            dataKey="name"
                            angle={-30}
                            textAnchor="end"
                            height={50}
                            interval={0}
                            tick={{ fontSize: 10, fill: "#7e8385" }}
                            stroke="#7e8385"
                        />
                        <YAxis
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                            domain={[0, 1]}
                            tick={{ fontSize: 10, fill: "#7e8385" }}
                            width={32}
                            stroke="#7e8385"
                        />
                        <Tooltip
                            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                            contentStyle={{
                                backgroundColor: '#282a2c',
                                borderRadius: '6px',
                                padding: '4px',
                                fontSize: '12px',
                            }}
                            labelStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                            dataKey="probability"
                            animationDuration={300}
                            barSize={30}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(index)}
                                    strokeWidth={1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // Version desktop originale
    return (
        <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="90%" height="170%">
                <BarChart
                    data={chartData}
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
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getBarColor(index)}
                                onMouseOver={(props) => {
                                    const currentColor = getBarColor(index);
                                    if (props.target) {
                                        props.target.style.fill = lightenColor(currentColor, 0.2);
                                    }
                                }}
                                onMouseOut={(props) => {
                                    if (props.target) {
                                        props.target.style.fill = getBarColor(index);
                                    }
                                }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};