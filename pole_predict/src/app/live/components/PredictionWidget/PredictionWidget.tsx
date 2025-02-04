/* eslint-disable */
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { PredictionData } from '../../types';
import { PREDICTION_TITLES, PREDICTION_METRICS, LAPTIME_CONFIG } from '../../constants';
import { SimplePredictionDisplay } from './SimplePredictionDisplay';
import { BarChartPrediction } from './BarChartPrediction';
import { LaptimeTable } from './LaptimeTable';
import { LaptimeGraph } from './LaptimeGraph';
import { AnimatedBorderCard } from './AnimatedBorderCard';
import { cleanLaptimeData, predictFutureLaptimes } from '../../utils/laptimePredictions';

interface PredictionWidgetProps {
    type: string;
    isExpertMode: boolean;
    sessionId: string;
    driverId: string;
    lapNumber: string;
    viewMode: "chrono" | "lap" | "final";
    className?: string;
}

interface LapDataCache {
    [key: string]: PredictionData;
}

export const PredictionWidget = ({ 
    type, 
    isExpertMode, 
    sessionId, 
    driverId, 
    lapNumber,
    viewMode,
    className 
}: PredictionWidgetProps) => {
    const [dataCache, setDataCache] = useState<LapDataCache>({});
    const [loading, setLoading] = useState(true);
    const [prevLap, setPrevLap] = useState(lapNumber);

    const loadData = async () => {
        if (!sessionId || !driverId) {
            setDataCache({});
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const newCache: LapDataCache = {};

            if (type === 'laptime') {
                const response = await fetch(
                    `https://api.openf1.org/v1/laps?session_key=${sessionId}&driver_number=${driverId}`
                );
                
                if (!response.ok) throw new Error('OpenF1 fetch failed');
                const openF1Data = await response.json();
                
                const lapsData = openF1Data
                    .filter((lap: any) => lap.lap_duration !== null)
                    .map((lap: any) => ({
                        lap_number: lap.lap_number,
                        lap_duration: parseFloat(lap.lap_duration),
                        is_abnormal: false
                    }));

                const lapsCollectionRef = collection(
                    db, 
                    "predictions_ia", 
                    "version 1", 
                    "sessions", 
                    sessionId,
                    "drivers",
                    driverId,
                    "laps"
                );

                const lapsSnapshot = await getDocs(lapsCollectionRef);
                const lapDocs = lapsSnapshot.docs.filter(doc => doc.id !== "lap_keys");

                for (const lapDoc of lapDocs) {
                    const lapNumber = lapDoc.id;
                    const currentLapNumber = parseInt(lapNumber);
                    const maxLap = Math.max(...lapsData.map((l: any) => l.lap_number), 0);

                    if (currentLapNumber >= maxLap || lapsData.length === 0) {
                        newCache[lapNumber] = { 
                            predictions: { prediction: 0 }, 
                            lap_predictions: [] 
                        };
                        continue;
                    }

                    const historicalLaps = lapsData
                        .filter((l: any) => l.lap_number <= currentLapNumber)
                        .sort((a: any, b: any) => a.lap_number - b.lap_number);

                    const cleanedLaps = cleanLaptimeData(historicalLaps);
                    const validLaps = cleanedLaps.filter((lap: any) => !lap.is_abnormal);

                    if (validLaps.length > 0) {
                        const futureLaps = Math.min(
                            LAPTIME_CONFIG.FUTURE_LAPS,
                            10,
                            maxLap - currentLapNumber
                        );

                        const predictions = predictFutureLaptimes(
                            validLaps,
                            currentLapNumber,
                            { ...LAPTIME_CONFIG, FUTURE_LAPS: futureLaps }
                        );

                        predictions.lap_predictions = predictions.lap_predictions.map((pred: any) => ({
                            ...pred,
                            actual_time: lapsData.find((l: any) => l.lap_number === pred.lap_number)?.lap_duration
                        }));

                        newCache[lapNumber] = predictions;
                    } else {
                        newCache[lapNumber] = { 
                            predictions: { prediction: 0 }, 
                            lap_predictions: [] 
                        };
                    }
                }
            } else {
                const lapsCollectionRef = collection(
                    db, 
                    "predictions_ia", 
                    "version 1", 
                    "sessions", 
                    sessionId,
                    "drivers",
                    driverId,
                    "laps"
                );

                const lapsSnapshot = await getDocs(lapsCollectionRef);
                const lapDocs = lapsSnapshot.docs.filter(doc => doc.id !== "lap_keys");

                await Promise.all(
                    lapDocs.map(async (lapDoc) => {
                        const lapNumber = lapDoc.id;
                        const predictionRef = doc(
                            db, 
                            "predictions_ia", 
                            "version 1", 
                            "sessions", 
                            sessionId,
                            "drivers",
                            driverId,
                            "laps",
                            lapNumber,
                            "predictions",
                            type
                        );

                        const predDoc = await getDoc(predictionRef);
                        if (predDoc.exists()) {
                            newCache[lapNumber] = predDoc.data() as PredictionData;
                        }
                    })
                );
            }

            setDataCache(prev => ({ ...prev, ...newCache }));
        } catch (error) {
            console.error(`Error loading predictions for ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Chargement initial et rechargement quand les paramètres clés changent
        loadData();
        setPrevLap(lapNumber);
    }, [sessionId, driverId, type]); 

    useEffect(() => {
        // Load data when lap changes in chrono mode or any lap change in other modes
        if ((viewMode === 'chrono' ? lapNumber !== prevLap : true) && !dataCache[lapNumber]) {
            loadData();
            setPrevLap(lapNumber);
        }
    }, [lapNumber, viewMode]);
    
    const getFlipContainerClass = () => {
        if (!isExpertMode) return "flip-container";
        return "flip-container flipped";
    };

    const renderContent = () => {
        const flipClass = getFlipContainerClass();
        
        if (loading) {
            return (
                <div className={flipClass}>
                    <div className="flip-front">
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                    <div className="flip-back">
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                </div>
            );
        }

        const currentData = dataCache[lapNumber];
        if (!currentData) {
            return (
                <div className={flipClass}>
                    <div className="flip-front">
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Data not available
                        </div>
                    </div>
                    <div className="flip-back">
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Data not available
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'laptime') {
            return (
                <div className={flipClass}>
                    <div className="flip-front">
                        <LaptimeTable data={currentData} />
                    </div>
                    <div className="flip-back">
                        <LaptimeGraph data={currentData} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className={flipClass}>
                    <div className="flip-front">
                        <SimplePredictionDisplay type={type} data={currentData} />
                    </div>
                    <div className="flip-back">
                        <BarChartPrediction type={type} data={currentData} />
                    </div>
                </div>
            );
        }
    };

    return (
        <AnimatedBorderCard>
            <Card className={`${className} group perspective-1000 overflow-hidden bg-[#282a2c] border-0 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]`}>
                <CardHeader className="pb-2 flex justify-between items-start">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text text-transparent">
                        {PREDICTION_TITLES[type as keyof typeof PREDICTION_TITLES]}
                    </CardTitle>
                    <Sparkles className="w-5 h-5 text-transparent bg-gradient-to-r from-[#5382ec] to-[#d56676] bg-clip-text" />
                </CardHeader>
                <CardContent className="h-64 relative -mt-7 p-8">
                    {renderContent()}
                    <div className="absolute bottom-2 right-2 backdrop-blur-sm px-2 rounded-full">
                        <span className="text-xs text-gray-300">
                            {PREDICTION_METRICS[type as keyof typeof PREDICTION_METRICS].format}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </AnimatedBorderCard>
    );
};