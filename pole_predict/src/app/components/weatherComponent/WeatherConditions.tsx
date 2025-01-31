import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { faThermometerHalf, faWind, faCloud, faTint, faArrowUp } from '@fortawesome/free-solid-svg-icons';

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

    const toggleVisibility = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="absolute bottom-4 left-4 bg-black p-3 rounded-lg shadow-lg z-[1000]">
            <div
                className="flex items-center cursor-pointer"
                onClick={toggleVisibility}
            >
                <span className="text-sm font-semibold mr-2 gradient-text">Weather Conditions</span>
                <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-white" />
            </div>
            {isExpanded && (
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="gradient-text">
                        <FontAwesomeIcon icon={faThermometerHalf} className="text-white mr-1" /> Temperature: {weatherData?.temp.toFixed(1)}°C
                    </div>
                    <div className="gradient-text">
                        <FontAwesomeIcon icon={faWind} className="text-white mr-1" /> Wind Speed: {weatherData?.windspeed.toFixed(1)} km/h
                    </div>
                    <div className="gradient-text">
                        <FontAwesomeIcon icon={faTint} className="text-white mr-1" /> Precipitation: {weatherData?.precip.toFixed(1)} mm
                    </div>
                    <div className="gradient-text">
                        <FontAwesomeIcon
                            icon={faArrowUp}
                            className="text-white mr-1"
                            style={{
                                transform: `rotate(${weatherData?.winddir || 0}deg)`,
                            }}
                        />
                        Wind Direction: {getWindDirection(weatherData?.winddir || 0)}
                    </div>
                    <div className="gradient-text">
                        <FontAwesomeIcon icon={faCloud} className="text-white mr-1" /> Cloud Cover: {weatherData?.cloudcover.toFixed(1)}%
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherConditions;
