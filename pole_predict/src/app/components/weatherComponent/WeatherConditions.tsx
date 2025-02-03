import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Thermometer, Wind, Droplets, ArrowUp, ChevronUp, ChevronDown } from 'lucide-react';

interface WeatherData {
    temp: number;
    precip: number;
    windspeed: number;
    cloudcover: number;
    humidity: number;
    datetime: string;
    winddir: number;
}

const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

const WeatherConditions: React.FC<{ weatherData: WeatherData | null }> = ({ weatherData }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                mass: 0.8
            }
        }
    };

    return (
        <Card className="absolute bottom-4 left-4 z-[1000] group overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-all duration-300">
            <CardHeader className="py-2 px-3">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <CardTitle className="text-base font-medium bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                        Weather Conditions
                    </CardTitle>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#5382ec]" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-[#5382ec]" />
                    )}
                </div>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && weatherData && (
                    <CardContent className="py-0 px-3 pb-3">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="p-2 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-black/30"
                            >
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Column 1 */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <Thermometer className="h-3 w-3 text-[#5382ec]" />
                                            <span>{weatherData.temp.toFixed(1)}°C</span>
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <Wind className="h-3 w-3 text-[#5382ec]" />
                                            <span>{weatherData.windspeed.toFixed(1)} km/h</span>
                                        </p>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <Droplets className="h-3 w-3 text-[#5382ec]" />
                                            <span>{weatherData.precip.toFixed(1)} mm</span>
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <ArrowUp
                                                className="h-3 w-3 text-[#5382ec] transform transition-transform duration-200"
                                                style={{
                                                    transform: `rotate(${weatherData.winddir}deg)`
                                                }}
                                            />
                                            <span>{getWindDirection(weatherData.winddir)}</span>
                                        </p>
                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <Cloud className="h-3 w-3 text-[#5382ec]" />
                                            <span>{weatherData.cloudcover.toFixed(1)}%</span>
                                        </p>
                                        <p className="text-xs text-gray-300 flex items-center gap-1.5">
                                            <Droplets className="h-3 w-3 text-[#5382ec]" />
                                            <span>{weatherData.humidity}% Humidity</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </CardContent>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default WeatherConditions;