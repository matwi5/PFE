'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MapIcon, Loader2Icon, InfoIcon } from 'lucide-react';

interface Position {
  x: number;
  y: number;
  date: string;
  driverNumber: string;
}

interface DriverInfo {
  NumberOfPodiums: number;
  NumberOfVictories: number;
  WorldChampionships: number;
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  flagColors: string[];
  flag_url: string;
  headshot_url: string;
  last_name: string;
  name: string;
  team_colour: string;
  team_name: string;
  year: number[];
}

interface Meeting {
  circuit_key: number;
  meeting_key: number;
  grand_prix: string;
  DecalageX: number;
  DecalageY: number;
  Rotation: number;
  Zoom: number;
}

interface DriverMapProps {
  sessionKey: number | string;
  meetingKey: number | string;
  currentTime: string;
  viewMode: 'chrono' | 'lap' | 'final';
}

const LoadingCard: React.FC = () => (
  <Card className="bg-[#282a2c] border border-gray-800 h-[70vh]">
    <CardContent className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-[#5382ec]" />
      <div className="text-white flex flex-col items-center gap-2">
        <div>Loading map data...</div>
      </div>
    </CardContent>
  </Card>
);

const ErrorCard: React.FC<{ error: string }> = ({ error }) => (
  <Card className="bg-[#282a2c] border border-gray-800 h-[70vh]">
    <CardContent className="flex items-center justify-center h-full">
      <div className="text-red-500">Error: {error}</div>
    </CardContent>
  </Card>
);

function DriverMap({
  sessionKey,
  meetingKey,
  currentTime,
  viewMode
}: DriverMapProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbDrivers, setDbDrivers] = useState<DriverInfo[]>([]);
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [circuitImage, setCircuitImage] = useState<string>("/images/circuit-singapour.png");
  const circleSize = 9;

  // Convertir et vérifier les clés uniquement si elles sont définies et non vides
  const safeSessionKey = sessionKey !== null && sessionKey !== undefined && sessionKey !== ''
    ? sessionKey.toString()
    : '';
  const safeMeetingKey = meetingKey !== null && meetingKey !== undefined && meetingKey !== ''
    ? meetingKey.toString()
    : '';

  console.log('Props received:', { sessionKey, meetingKey, currentTime, viewMode });
  console.log('Converted keys:', { safeSessionKey, safeMeetingKey });

  const transformPosition = (pos: Position) => {
    if (!meetingData) return pos;

    const angleRad = (meetingData.Rotation || 0) * Math.PI / 180;
    const scale = meetingData.Zoom || 1.18;
    const offsetX = meetingData.DecalageX || 33;
    const offsetY = meetingData.DecalageY || 3;

    const rotatedX = pos.x * Math.cos(angleRad) - pos.y * Math.sin(angleRad);
    const rotatedY = pos.x * Math.sin(angleRad) + pos.y * Math.cos(angleRad);

    return {
      ...pos,
      x: rotatedX * scale + offsetX,
      y: rotatedY * scale + offsetY
    };
  };

  // Effet pour récupérer les données du meeting et des drivers
  useEffect(() => {
    // On ne lance le fetch que si la clé meeting est disponible
    if (!safeMeetingKey) {
      // On peut éventuellement réinitialiser certains états ou attendre le prochain rendu
      return;
    }

    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        const [meetingResponse, driversResponse] = await Promise.all([
          fetch('/api/meetingslastseasons'),
          fetch('/api/drivers')
        ]);

        if (!meetingResponse.ok || !driversResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [{ data: meetings }, { data: drivers }] = await Promise.all([
          meetingResponse.json(),
          driversResponse.json()
        ]);

        // Ajout d'une vérification pour s'assurer que meeting_key est défini avant d'appeler toString()
        const currentMeeting = meetings.find((m: Meeting) =>
          m.meeting_key !== undefined && m.meeting_key.toString() === safeMeetingKey
        );

        if (currentMeeting) {
          setMeetingData(currentMeeting);
          // Récupération de l'image du circuit depuis l'API gp
          const gpResponse = await fetch('/api/gp');
          if (gpResponse.ok) {
            const { data: gpData } = await gpResponse.json();
            const gpInfo = gpData.find((gp: any) => gp.grand_prix === currentMeeting.grand_prix);
            if (gpInfo?.image_circuit) {
              setCircuitImage(gpInfo.image_circuit);
            }
          }
        } else {
          // Vous pouvez adapter ce comportement si aucun meeting n'est trouvé
          setError('Meeting not found');
        }

        setDbDrivers(drivers);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load meeting data');
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [safeMeetingKey]);

  // Effet pour récupérer les positions
  useEffect(() => {
    // On ne lance le fetch que si la sessionKey et le currentTime sont disponibles
    if (!safeSessionKey || !currentTime) {
      return;
    }

    const fetchPositions = async () => {
      try {
        const currentTimeDate = new Date(currentTime);
        const beforeTime = new Date(currentTimeDate.getTime() + 500);
        const afterTime = new Date(currentTimeDate.getTime() - 500);

        const response = await fetch(
          `https://api.openf1.org/v1/location?session_key=${safeSessionKey}&date>${afterTime.toISOString()}&date<${beforeTime.toISOString()}`
        );

        if (!response.ok) throw new Error('Failed to fetch positions');

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
        setError(err instanceof Error ? err.message : 'Failed to load position data');
      }
    };

    fetchPositions();
  }, [safeSessionKey, currentTime]);

  if (loading) return <LoadingCard />;
  if (error) return <ErrorCard error={error} />;

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 h-[70vh]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Driver Map
          </CardTitle>
          <MapIcon className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)]">
        <motion.div 
          className="mb-4 p-3 bg-black/20 rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4 text-[#5382ec]" />
            <span className="text-sm text-gray-400">Parameters:</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">Session Key:</div>
            <div className="text-[#2dd4bf]">{safeSessionKey || 'N/A'}</div>
            <div className="text-gray-500">Meeting Key:</div>
            <div className="text-[#2dd4bf]">{safeMeetingKey || 'N/A'}</div>
            <div className="text-gray-500">Time:</div>
            <div className="text-[#2dd4bf]">{new Date(currentTime).toLocaleTimeString()}</div>
            <div className="text-gray-500">View Mode:</div>
            <div className="text-[#2dd4bf]">{viewMode}</div>
          </div>
        </motion.div>
        <motion.div 
          className="relative w-full h-[calc(100%-6rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={circuitImage}
            className="rounded-lg w-full h-full object-contain"
            alt="Circuit"
          />
          <svg
            viewBox="0 0 800 500"
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <AnimatePresence>
              {positions.map(pos => {
                const transformedPos = transformPosition(pos);
                const driverInfo = dbDrivers.find(d => 
                  d.driver_number === parseInt(pos.driverNumber)
                );

                if (!driverInfo?.team_colour) return null;

                return (
                  <motion.g
                    key={pos.driverNumber}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <circle
                      cx={(transformedPos.x + 140) * 4}
                      cy={(60 - transformedPos.y) * 4}
                      r={circleSize}
                      fill={`#${driverInfo.team_colour}`}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={(transformedPos.x + 140) * 4}
                      y={(60 - transformedPos.y) * 4}
                      fontSize={12}
                      fill="#FFFFFF"
                      textAnchor="middle"
                      dy=".3em"
                      className="font-bold"
                    >
                      {pos.driverNumber}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
        </motion.div>
      </CardContent>
    </Card>
  );
}

export default DriverMap;