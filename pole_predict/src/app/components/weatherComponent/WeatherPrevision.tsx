import React, { useCallback, useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { FeatureCollection } from "geojson";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, CloudSun } from "lucide-react";
import L from "leaflet";
import {db} from "@/firebaseConfig";

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
    date: string;
    temperature: number;
    condition: string;
}

interface WeatherWidgetProps {
    circuitName: string;
    dates: string[];
}

const WeatherIcon = ({ condition, className = "w-8 h-8" }) => {
    switch (condition) {
        case 'cloud_rain':
            return <CloudRain className={className} />;
        case 'cloud_sun':
            return <CloudSun className={className} />;
        case 'sun':
            return <Sun className={className} />;
        case 'cloud':
        default:
            return <Cloud className={className} />;
    }
};

interface WeatherAPIResponse {
    days: WeatherDay[];
}

interface WeatherDay {
    datetime: string;
    hours: WeatherHour[];
}

interface WeatherHour {
    datetime: string;
    temp: number;
    icon: string;
}

const WeatherPrevision: React.FC<WeatherWidgetProps> = ({ circuitName, dates }) => {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [selectedCircuitCoords, setSelectedCircuitCoords] = useState<[number, number]>();


    // fetchWeatherData function (kept the same)
    const fetchWeatherData = useCallback(async () => {
        if(!selectedCircuitCoords) return;
        const [lat, lon] = selectedCircuitCoords;
        const parsedDates = dates.map(date => new Date(date));
        const minDate = new Date(Math.min(...parsedDates.map(date => date.getTime())));
        const maxDate = new Date(Math.max(...parsedDates.map(date => date.getTime())));
        const formattedMinDate = minDate.toISOString().split('T')[0];
        const formattedMaxDate = maxDate.toISOString().split('T')[0];

        const data: WeatherData[] = [];

        try {
            const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${formattedMinDate}/${formattedMaxDate}?unitGroup=metric&key=${process.env.NEXT_PUBLIC_VISUALCROSSING_API_KEY}`
            const response = await fetch(
                url
            );

            if (!response.ok) {
                console.error(`Error fetching weather data for range ${formattedMinDate} to ${formattedMaxDate}`);
                return [];
            }

            const json: WeatherAPIResponse = await response.json(); // Type the response

            for (const date of dates) {
                const parsedDate = new Date(date);
                const hour = parsedDate.getHours();

                const matchingDay = json.days.find(
                    (day: WeatherDay) => // Use the interface
                        new Date(day.datetime).toISOString().split("T")[0] ===
                        date.split("T")[0]
                );

                if (matchingDay) {
                    const hourlyData = matchingDay.hours.find(
                        (hourData: WeatherHour) => {
                            // Extract the hour from the hourlyData.datetime string
                            const hourDate = parseInt(hourData.datetime.split(":")[0], 10);

                            // Compare the extracted hour with the target hour
                            return hourDate === hour;
                        }
                    );

                    if (hourlyData) {
                        // Determine the weather condition based on the 'icon' property
                        let condition = "cloud";
                        if (hourlyData.icon.includes("rain")) {
                            condition = "cloud_rain";
                        } else if (hourlyData.icon.includes("partly-cloudy")) {
                            condition = "cloud_sun";
                        } else if (hourlyData.icon.includes("clear-day")) {
                            condition = "sun";
                        }

                        // Add the weather data to the 'data' array
                        data.push({
                            date,
                            temperature: hourlyData.temp,
                            condition,
                        });
                    }
                }
            }

            // Sort the data by date
            data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return data;
        } catch (error) {
            console.error(`Error processing date range ${formattedMinDate} to ${formattedMaxDate}:`, error);
        }
    }, [selectedCircuitCoords, dates]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'geojson_files'));
                const data = querySnapshot.docs.map((doc) => doc.data() as Feature);
                const selectedCircuit = data.find((file) => file.properties.Name === circuitName);

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

                        const geoJsonLayer = L.geoJSON(geoJson);
                        const bounds = geoJsonLayer.getBounds();
                        //setSelectedCircuitCoords([bounds.getCenter().lat, bounds.getCenter().lng]);
                        return [bounds.getCenter().lat, bounds.getCenter().lng]
                    } else {
                        console.warn(
                            `No valid coordinates found for circuit: ${circuitName}, geometry type: ${selectedCircuit.geometry.type}`,
                        );
                    }
                }
            } catch (error) {
                console.error('Error fetching data from Firestore:', error);
            }
        };
        fetchData().then(setSelectedCircuitCoords);
    }, [circuitName]);

    useEffect(() => {
        fetchWeatherData().then(data => {
            if (data) {
                setWeatherData(data);
            }
        });
    }, [fetchWeatherData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        return { day, month };
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-black shadow-lg">
            <CardContent className="p-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">{circuitName}</h2>
                </div>

                {weatherData && weatherData.length > 0 ? (
                    <div
                        className="space-y-4 overflow-y-auto max-h-52 pr-2 custom-scrollbar"
                        style={{
                            scrollbarWidth: 'thin',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {weatherData
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((data, index) => {
                                const { day, month } = formatDate(data.date);
                                const hour = new Date(data.date).getHours();

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-950 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="text-gray-400">
                                                <WeatherIcon condition={data.condition} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {`${day} ${month}`}
                                                </p>
                                                <p className="text-xs text-white">
                                                    {`${hour}:00`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xl font-semibold text-white">
                                            {`${Math.round(data.temperature)}°`}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-white">
                        No weather data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WeatherPrevision;