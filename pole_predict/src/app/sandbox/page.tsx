'use client'
import React, { useState, useEffect } from 'react';
import HexagonChart from '../components/HexagonChart';

const sandbox = () => {
  const [stats, setStats] = useState([60, 70, 50, 80, 40, 60]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(stats.map(stat => Math.floor(Math.random() * 100)));
    }, 1000); // Update stats every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Character Stats</h2>
      <HexagonChart stats={stats} />
    </div>
  );
};

export default sandbox;
