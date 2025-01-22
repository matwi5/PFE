"use client"

import React, { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
  date: string;
  driverNumber: string;
}

interface Driver {
  number: string;
  color: string;
  name: string;
}

export default function Home() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const baseTimestampRef = useRef(new Date("2023-09-16T13:03:35.292000+00:00"));

  const drivers: Driver[] = [
    { number: "1", color: "#3671C6", name: "Max Verstappen" },
    { number: "11", color: "#2293D1", name: "Sergio Perez" },
    { number: "16", color: "#F91536", name: "Charles Leclerc" },
    { number: "55", color: "#F91536", name: "Carlos Sainz" },
    { number: "44", color: "#6CD3BF", name: "Lewis Hamilton" },
    { number: "63", color: "#6CD3BF", name: "George Russell" },
    { number: "81", color: "#FF8700", name: "Oscar Piastri" },
    { number: "4", color: "#FF8700", name: "Lando Norris" },
    { number: "14", color: "#2D826D", name: "Fernando Alonso" },
    { number: "18", color: "#2D826D", name: "Lance Stroll" },
    { number: "10", color: "#37BEDD", name: "Pierre Gasly" },
    { number: "31", color: "#37BEDD", name: "Esteban Ocon" },
    { number: "23", color: "#C92D4B", name: "Alexander Albon" },
    { number: "2", color: "#C92D4B", name: "Logan Sargeant" },
    { number: "77", color: "#52E252", name: "Valtteri Bottas" },
    { number: "24", color: "#52E252", name: "Zhou Guanyu" },
    { number: "22", color: "#F1AF19", name: "Yuki Tsunoda" },
    { number: "3", color: "#F1AF19", name: "Daniel Ricciardo" },
    { number: "20", color: "#B6BABD", name: "Kevin Magnussen" },
    { number: "27", color: "#B6BABD", name: "Nico Hulkenberg" }
  ];

  const [scale, setScale] = useState(1.18);
  const [offsetX, setOffsetX] = useState(33);
  const [offsetY, setOffsetY] = useState(3);
  const [circleSize, setCircleSize] = useState(8);
  const [visibleDrivers, setVisibleDrivers] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(drivers.map(d => [d.number, true]))
  );

  // Même logique de useEffect pour fetchPositions()
  useEffect(() => {
    async function fetchPositions() {
      try {
        const currentTime = new Date(baseTimestampRef.current);
        const beforeTime = new Date(currentTime.getTime() + 500);
        const afterTime = new Date(currentTime.getTime() - 500);

        const response = await fetch(
          `https://api.openf1.org/v1/location?session_key=9161&date>${afterTime.toISOString()}&date<${beforeTime.toISOString()}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const latestPositions = new Map<string, Position>();

        data
          .filter((item: any) => item && item.x !== undefined)
          .forEach((item: any) => {
            const driverNumber = item.driver_number.toString();
            const currentDate = new Date(item.date);

            const existingPosition = latestPositions.get(driverNumber);
            if (!existingPosition || new Date(existingPosition.date) < currentDate) {
              const rawX = item.x;
              const rawY = item.y;
              const scaledX = ((rawX - -10000) / 20000) * 200 - 100;
              const scaledY = ((rawY - -10000) / 20000) * 200 - 100;

              latestPositions.set(driverNumber, {
                x: scaledX,
                y: scaledY,
                date: item.date,
                driverNumber: driverNumber
              });
            }
          });

        setPositions(Array.from(latestPositions.values()));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    }

    const interval = setInterval(() => {
      fetchPositions();
      baseTimestampRef.current.setMilliseconds(
        baseTimestampRef.current.getMilliseconds() + 500
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const adjustedPositions = positions.map(pos => ({
    ...pos,
    x: pos.x * scale + offsetX,
    y: pos.y * scale + offsetY
  }));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {error && (
          <div className="bg-red-600 border border-red-700 text-white px-4 py-3 rounded">
            {error}
          </div>
        )}
        <h1 className="text-4xl font-bold text-center mb-6">Trace des Pilotes en Temps Réel</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-gray-800 rounded">
          {drivers.map(driver => (
            <div key={driver.number} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`driver-${driver.number}`}
                checked={visibleDrivers[driver.number]}
                onChange={e => setVisibleDrivers(prev => ({
                  ...prev,
                  [driver.number]: e.target.checked
                }))}
                className="accent-orange-500"
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: driver.color }}
              ></div>
              <label htmlFor={`driver-${driver.number}`} className="text-sm">
                {driver.name} (#{driver.number})
              </label>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-400">
          Pilotes actuellement suivis : {positions.length}
        </div>

        <div className="relative bg-gray-800 rounded-lg shadow p-4">
          <div className="relative">
            <img
              src="/images/singapour.png"
              alt="Circuit de Singapour"
              className="w-full h-auto"
            />
            <svg
              viewBox="0 0 800 500"
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              {adjustedPositions
                .filter(pos => visibleDrivers[pos.driverNumber])
                .map(pos => {
                  const driver = drivers.find(d => d.number === pos.driverNumber);
                  return (
                    <g key={pos.driverNumber}>
                      <circle
                        cx={(pos.x + 140) * 4}
                        cy={(60 - pos.y) * 4}
                        r={circleSize}
                        fill={driver?.color || "#FFFFFF"}
                      />
                      <text
                        x={(pos.x + 140) * 4}
                        y={(60 - pos.y) * 4}
                        fontSize={12}
                        fill="#000000" // Changer la couleur du texte en noir
                        textAnchor="middle"
                        dy=".3em"
                      >
                        {pos.driverNumber}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        </div>

        <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label htmlFor="scale" className="block text-sm font-medium text-gray-300">
              Grossissement ({scale.toFixed(2)})
            </label>
            <input
              id="scale"
              type="range"
              min="0.1"
              max="5"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <label htmlFor="offsetX" className="block text-sm font-medium text-gray-300">
              Décalage X ({offsetX})
            </label>
            <input
              id="offsetX"
              type="range"
              min="-200"
              max="200"
              step="1"
              value={offsetX}
              onChange={(e) => setOffsetX(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <label htmlFor="offsetY" className="block text-sm font-medium text-gray-300">
              Décalage Y ({offsetY})
            </label>
            <input
              id="offsetY"
              type="range"
              min="-200"
              max="200"
              step="1"
              value={offsetY}
              onChange={(e) => setOffsetY(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <label htmlFor="circleSize" className="block text-sm font-medium text-gray-300">
              Taille des points ({circleSize})
            </label>
            <input
              id="circleSize"
              type="range"
              min="1"
              max="20"
              step="1"
              value={circleSize}
              onChange={(e) => setCircleSize(parseInt(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
