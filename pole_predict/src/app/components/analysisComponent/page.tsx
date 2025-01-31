"use client";

import React from 'react';
import F1GapAnalysis from "./F1GapAnalysis";
import F1LapAnalysis from "./F1LapAnalysis";
import SpeedVisualizer from "./SpeedVisualizer";
import StintVisualizer from "./StintVisualizer";
import ChampionshipWidget from "./Championship";

const App: React.FC = () => {
    const sessionKey = 9165; // Replace with appropriate value
    const lap = 47; // Replace with actual lap value or null if optional

    return (
        <div>
            <F1GapAnalysis sessionKey={sessionKey} lap={lap}/>
            <ChampionshipWidget/>
        </div>
    );
};

export default App;


/**
              <ChampionshipWidget year="2023" meeting_name="Bahrain Grand Prix"/>
              <F1GapAnalysis sessionKey={9165} driverNumber={1} date={null} expert={false}/>
              <F1LapAnalysis sessionKey={9165} driverNumber={1} date={null} expert={false} />
              <SpeedVisualizer sessionKey={9165} date={null}/>
              <StintVisualizer sessionKey={9165}/>
 */