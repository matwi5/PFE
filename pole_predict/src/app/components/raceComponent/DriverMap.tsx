import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MapIcon, Loader2Icon } from 'lucide-react';

interface Position {
  x: number;
  y: number;
  date: string;
  driverNumber: string;
}

interface DriverInfo {
  driver_number: number;
  team_colour: string;
  team_name: string;
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
  <Card className="bg-[#282a2c] border border-gray-800 h-48">
    <CardContent className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2Icon className="h-8 w-8 animate-spin text-[#5382ec]" />
      <div className="text-white flex flex-col items-center gap-2">
        <div>Loading map data...</div>
      </div>
    </CardContent>
  </Card>
);

const ErrorCard: React.FC<{ error: string }> = ({ error }) => (
  <Card className="bg-[#282a2c] border border-gray-800 h-48">
    <CardContent className="flex items-center justify-center h-full">
      <div className="text-red-500">{error}</div>
    </CardContent>
  </Card>
);

const UnavailableCard: React.FC = () => (
  <Card className="bg-[#282a2c] border border-gray-800 h-[200px]">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
          Driver Map
        </CardTitle>
        <MapIcon className="h-5 w-5 text-[#5382ec]" />
      </div>
    </CardHeader>
    <CardContent className="h-[150px] flex items-center justify-center">
      <div className="text-gray-400 text-center">
        Driver Map is only available in chrono mode
      </div>
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
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const circleSize = 12;

  const safeSessionKey = sessionKey?.toString() || '';
  const safeMeetingKey = meetingKey?.toString() || '';

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

  useEffect(() => {
    if (!safeMeetingKey) return;

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

        const currentMeeting = meetings.find((m: Meeting) =>
          m.meeting_key?.toString() === safeMeetingKey
        );

        if (currentMeeting) {
          setMeetingData(currentMeeting);
          const gpResponse = await fetch('/api/gp');
          if (gpResponse.ok) {
            const { data: gpData } = await gpResponse.json();
            const gpInfo = gpData.find((gp: any) => gp.grand_prix === currentMeeting.grand_prix);
            if (gpInfo?.image_circuit) {
              setCircuitImage(gpInfo.image_circuit);
            }
          }
        }

        setDbDrivers(drivers);
        setLoading(false);
        setHasLoadedData(true);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load meeting data');
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [safeMeetingKey]);

  useEffect(() => {
    if (!safeSessionKey || !currentTime) return;

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
        if (!hasLoadedData) {
          setHasLoadedData(true);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load position data');
        if (!hasLoadedData) {
          setPositions([]);
        }
      }
    };

    fetchPositions();
  }, [safeSessionKey, currentTime, hasLoadedData]);

  if (viewMode !== 'chrono') {
    return <UnavailableCard />;
  }

  if (loading && !hasLoadedData) return <LoadingCard />;
  if (error && !hasLoadedData) return <ErrorCard error={error} />;

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300 h-[450px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Driver Map
          </CardTitle>
          <MapIcon className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="relative h-[400px]">
        <motion.div
          className="relative w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            ease: "easeInOut"
          }}
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

                const circleX = (transformedPos.x + 140) * 4;
                const circleY = (60 - transformedPos.y) * 4;

                return (
                  <motion.g
                    key={pos.driverNumber}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      x: circleX,
                      y: circleY
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      mass: 1
                    }}
                  >
                    <motion.circle
                      r={circleSize}
                      fill={driverInfo.team_colour}
                      className="drop-shadow-lg"
                    />
                    <motion.text
                      fontSize={12}
                      fill="#FFFFFF"
                      textAnchor="middle"
                      dy=".3em"
                      className="font-bold"
                    >
                      {pos.driverNumber}
                    </motion.text>
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