'use client';

import React, { useCallback, useEffect, useState } from 'react';
import L from 'leaflet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Feature, FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import CloudLayer from "./WeatherLayer";
import WeatherConditions from "@/app/components/weatherComponent/WeatherConditions";

const firestore = db;

interface Feature {
    type: 'Feature';
    geometry: {
        coordinates: string | number[][]; // Change the type here
        type: 'LineString' | 'Polygon' | 'MultiPolygon' | 'Point' | 'MultiPoint' | 'MultiLineString' | 'GeometryCollection'; // Add this if it's not already present in your interface
    };
    properties: {
        Location?: string;
        Name?: string;
        altitude?: number;
        firstgp?: number;
        id?: string;
        length?: number;
        opened?: number;
        [key: string]: unknown;
    };
}

interface WeatherData {
    temp: number;
    precip: number;
    windspeed: number;
    cloudcover: number;
    humidity: number;
    datetime: string;
    winddir: number;
}

// eslint-disable-next-line @next/next/no-async-client-component
const WeatherMap: React.FC<{ circuitName: string; date: string; time: string }> = ({
                                                                                       circuitName,
                                                                                       date,
                                                                                       time,
                                                                                   }) => {
    const [files, setFiles] = useState<Feature[]>([]);
    const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [selectedCircuitCoords, setSelectedCircuitCoords] = useState<[number, number]>();
    const [map, setMap] = useState<L.Map | null>(null);
    const [isMapContainerReady, setIsMapContainerReady] = useState(false);

    const loadGeoJson = useCallback(() => {
        setGeoJsonData(null);
        setSelectedCircuitCoords(undefined);
        setWeatherData(null);

        if (!circuitName || files.length === 0) {
            return;
        }

        const selectedCircuit = files.find((file) => file.properties.Name === circuitName);

        if (selectedCircuit) {
            let validCoordinates: number[][] = [];

            if (selectedCircuit.geometry.type === 'LineString') {
                if (typeof selectedCircuit.geometry.coordinates === 'string') {
                    try {
                        const parsedCoordinates = JSON.parse(selectedCircuit.geometry.coordinates);

                        if (Array.isArray(parsedCoordinates)) {
                            validCoordinates = parsedCoordinates.filter(
                                (coord) =>
                                    Array.isArray(coord) &&
                                    coord.length === 2 &&
                                    typeof coord[0] === 'number' &&
                                    typeof coord[1] === 'number',
                            );
                        }
                    } catch (error) {
                        console.error('Error parsing coordinates string:', error);
                    }
                }
            } else {
                console.warn(`Unhandled geometry type: ${selectedCircuit.geometry.type}`);
            }

            // Check if valid coordinates exist
            if (validCoordinates.length > 0) {
                const geoJson: FeatureCollection = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString', // Keep type as LineString for display
                                coordinates: validCoordinates,
                            },
                            properties: selectedCircuit.properties,
                        },
                    ],
                };

                setGeoJsonData(geoJson);

                const geoJsonLayer = L.geoJSON(geoJson);
                const bounds = geoJsonLayer.getBounds();
                setSelectedCircuitCoords([bounds.getCenter().lat, bounds.getCenter().lng]);
            } else {
                console.warn(
                    `No valid coordinates found for circuit: ${circuitName}, geometry type: ${selectedCircuit.geometry.type}`,
                );
            }
        }
    }, [circuitName, files]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchWeatherData = async (
        coordinates: [number, number] | undefined,
        date: string,
        time: string,
    ) => {
        if (!coordinates || !date || !time) return;

        const [lat, lon] = coordinates;
        const baseDateTime = new Date(`${date}T${time}:00`).toISOString();

        try {
            const responses = await Promise.all([
                fetch(
                    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${baseDateTime}?key=${process.env.NEXT_PUBLIC_VISUALCROSSING_API_KEY}&include=current&unitGroup=metric`,
                ),
            ]);

            const [data] = await Promise.all(responses.map((res) => res.json()));

            const currentConditions = data['days']?.[0];

            if (currentConditions) {
                return currentConditions;
            } else {
                console.error('currentConditions not found in API response or days array is empty');
                return null;
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeatherData(null);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const geoJsonStyle = {
        color: '#ff7800',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.35,
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'geojson_files'));
                return querySnapshot.docs.map((doc) => doc.data() as Feature);
            } catch (error) {
                console.error('Error fetching data from Firestore:', error);
            }
        };
        fetchData().then(setFiles);
    }, []);

    useEffect(() => {
        loadGeoJson();
    }, [circuitName, files, loadGeoJson]); // Depend on circuitName and files

    useEffect(() => {
        if (!weatherData) fetchWeatherData(selectedCircuitCoords, date, time).then(setWeatherData);
    }, [selectedCircuitCoords, date, time, fetchWeatherData, weatherData]);

    useEffect(() => {
        setIsMapContainerReady(true);

        return () => setIsMapContainerReady(false);
    }, []);

    useEffect(() => {
        // Create the map only once when the component mounts
        if (isMapContainerReady && !map) {
            const newMap = L.map('map-container').setView([0, 0], 4); // Default view, will update later
            setMap(newMap);

            // Add OpenStreetMap tile layer here
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(newMap);
        }
    }, [isMapContainerReady, map]); // Only run when isMapContainerReady changes

    useEffect(() => {
        // Update map view when selectedCircuitCoords changes
        if (map && selectedCircuitCoords) {
            map.setView(selectedCircuitCoords, 5);
        }
    }, [map, selectedCircuitCoords]); // Only run when map or selectedCircuitCoords changes

    useEffect(() => {
        if (map && geoJsonData) {
            const dynamicGeoJSON = L.geoJSON(geoJsonData, { style: geoJsonStyle });

            dynamicGeoJSON.addTo(map);
            map.fitBounds(dynamicGeoJSON.getBounds(), { padding: [150, 150] });

            return () => {
                if (map.hasLayer(dynamicGeoJSON)) {
                    map.removeLayer(dynamicGeoJSON);
                }
            };
        }
    }, [map, geoJsonData, geoJsonStyle]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="h-[500px] rounded-lg overflow-hidden border border-gray-300 shadow-md relative">
                <div id="map-container" className="h-full w-full" />

                {/* Pass the map instance to CloudLayer */}
                {isMapContainerReady && map && weatherData && selectedCircuitCoords && (
                    <CloudLayer
                        map={map}
                        weatherData={weatherData}
                        coordinates={selectedCircuitCoords}
                    />
                )}
                {weatherData && <WeatherConditions weatherData={weatherData} />}
            </div>
        </div>
    );
};

export default WeatherMap;