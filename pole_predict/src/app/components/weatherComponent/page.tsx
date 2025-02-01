"use client";

import React from 'react';
import WeatherMap from "./WeatherMap";
import WeatherPrevision from "./WeatherPrevision";

const App: React.FC = () => {
    const dates = [
        '2024-11-02T11:00',
        '2024-11-02T12:00',
        '2024-11-02T13:00',
        '2024-11-02T14:00',
        '2024-11-02T15:00',
        '2024-11-03T16:00',
        '2024-11-04T17:00',
        '2024-11-04T18:00',
        '2024-11-04T19:00',
        '2024-11-04T20:00',
        '2024-11-04T21:00',
        '2024-11-04T22:00',
    ];

    return (
        <div>
            <WeatherMap circuitName={'Yas Marina Circuit'} date={'2025-01-12'} time={'16'}/>
            <WeatherPrevision circuitName={"São Paulo Grand Prix"} dates={dates} />
        </div>

    );
};

export default App;