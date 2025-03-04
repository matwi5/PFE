import React, { useEffect, useState } from 'react';
import L from 'leaflet';

interface WeatherData {
    temp: number;
    precip: number;
    windspeed: number;
    cloudcover: number;
    humidity: number;
    datetime: string;
    winddir: number;
}

interface CloudLayerProps {
    map: L.Map;
    weatherData: WeatherData;
    coordinates: [number, number];
}

// Custom hook to create and manage cloud markers
const useCloudMarkers = (map: L.Map, weatherData: WeatherData, coordinates: [number, number]) => {
    const [markerPositions, setMarkerPositions] = useState<[number, number][]>([]);
    const [initialPositions, setInitialPositions] = useState<[number, number][]>([]);
    const [shiftCount, setShiftCount] = useState(0);

    useEffect(() => {
        if (!weatherData) return;

        const createClouds = () => {
            const numClouds = Math.min(10, Math.round(weatherData.cloudcover / 10));
            const backwardPositions: [number, number][] = [];

            for (let i = 0; i < numClouds; i++) {
                const latOffset = (Math.random() - 0.5) * 0.01;
                const lonOffset = (Math.random() - 0.5) * 0.01;

                const originalLat = coordinates[0] + latOffset;
                const originalLon = coordinates[1] + lonOffset;

                const backwardLat = originalLat - 2 * (weatherData.windspeed / 2000) * Math.cos((weatherData.winddir * Math.PI) / 180);
                const backwardLon = originalLon - 2 * (weatherData.windspeed / 2000) * Math.sin((weatherData.winddir * Math.PI) / 180);

                backwardPositions.push([backwardLat, backwardLon]);
            }

            setMarkerPositions(backwardPositions);
            setInitialPositions(backwardPositions);
        };

        createClouds();
    }, [weatherData, coordinates]);

    useEffect(() => {
        if (!weatherData || markerPositions.length === 0) return;

        const interval = setInterval(() => {
            setMarkerPositions((prevPositions) => {
                if (shiftCount > 6) {
                    setShiftCount(0);
                    return initialPositions;
                }

                const updatedPositions = prevPositions.map<[number, number]>(([lat, lng]) => {
                    const newLat = lat + (weatherData.windspeed / 2000) * Math.cos((weatherData.winddir * Math.PI) / 180);
                    const newLng = lng + (weatherData.windspeed / 2000) * Math.sin((weatherData.winddir * Math.PI) / 180);
                    return [newLat, newLng];
                });

                setShiftCount((prev) => prev + 1);
                return updatedPositions;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [markerPositions, weatherData, initialPositions, shiftCount]);

    useEffect(() => {
        // Create new cloud markers directly and add them to the map
        const cloudMarkers = markerPositions.map(([lat, lng]) =>
            L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: weatherData?.precip > 0 ? '/images/weather/cloud_rain.png' : '/images/weather/cloud.png',
                    iconSize: [50, 50],
                    iconAnchor: [25, 25],
                    className: 'leaflet-cloud-icon'
                }),
            }).addTo(map)
        );

        // Cleanup when the component unmounts or dependencies change
        return () => {
            cloudMarkers.forEach(marker => map.removeLayer(marker));
        };
    }, [markerPositions, map, weatherData]);
};

const CloudLayer: React.FC<CloudLayerProps> = ({ map, weatherData, coordinates }) => {
    useCloudMarkers(map, weatherData, coordinates);

    return null;
};

export default CloudLayer;