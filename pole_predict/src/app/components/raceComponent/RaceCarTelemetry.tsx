import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

interface RaceCarTelemetryProps {
  throttle: number;
  brake: number;
  rpm: number;
  speed: number;
  gear: string;
  drsStatus: string;
}

const RaceCarTelemetry: React.FC<RaceCarTelemetryProps> = ({
  throttle,
  brake,
  rpm,
  speed,
  gear,
  drsStatus,
}) => {
  const circumference = 2 * Math.PI * 180;
  const speedDashOffset = circumference * (1 - speed / 360);
  const speedMarkers = [0, 60, 120, 180, 240, 300, 0];
  const center = 200;

  return (
    <Card className="group perspective-1000 overflow-hidden bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Live Telemetry
          </CardTitle>
          <Gauge className="h-5 w-5 text-[#5382ec]" />
        </div>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-4rem)] p-2 sm:p-4 md:p-6 flex items-center justify-center">
        {/* Speed Gauge */}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5382ec" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>

          {/* Background Circle */}
          <circle
            cx={center}
            cy={center}
            r="180"
            className="stroke-gray-700"
            strokeWidth="25"
            fill="none"
          />

          {/* Active Speed Gauge */}
          <circle
            cx={center}
            cy={center}
            r="180"
            className="stroke-[url(#speedGradient)]"
            strokeWidth="25"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={speedDashOffset}
            transform={`rotate(90 ${center} ${center})`}
          />

          {/* Dynamic Speed Markers */}
          {speedMarkers.map((marker) => {
            const angle = ((marker / 360) * 360 + 90) * (Math.PI / 180);
            const x = center + 190 * Math.cos(angle);
            const y = center + 190 * Math.sin(angle);

            return (
              <text
                key={marker}
                x={x}
                y={y}
                className="fill-orange-600 font-bold text-sm sm:text-base md:text-lg lg:text-xl"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {marker}
              </text>
            );
          })}
        </svg>

        {/* Throttle/Brake Gauges */}
        <svg viewBox="0 0 400 400" className="absolute w-full h-full">
          <defs>
            <linearGradient id="throttleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7DE787" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
            <linearGradient id="brakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7B72" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Throttle */}
          <g transform="scale(0.8) translate(50, 175)">
            <circle
              cx="100"
              cy="100"
              r="50"
              className="stroke-gray-700"
              strokeWidth="15"
              fill="none"
            />

            <circle
              cx="100"
              cy="100"
              r="50"
              className="stroke-[url(#throttleGradient)]"
              strokeWidth="15"
              fill="none"
              strokeDasharray={circumference / 6}
              strokeDashoffset={circumference / 6 * (1 - throttle / 100)}
              transform="rotate(90 100 100)"
            />

            <text x="100" y="100" className="fill-[#2dd4bf] text-[8px] sm:text-[10px] md:text-xs" textAnchor="middle" dominantBaseline="middle">
              THROTTLE
            </text>
          </g>

          {/* Brake */}
          <g transform="scale(0.8) translate(250, 175)">
            <circle
              cx="100"
              cy="100"
              r="50"
              className="stroke-gray-700"
              strokeWidth="15"
              fill="none"
            />

            <circle
              cx="100"
              cy="100"
              r="50"
              className="stroke-[url(#brakeGradient)]"
              strokeWidth="15"
              fill="none"
              strokeDasharray={circumference / 6}
              strokeDashoffset={circumference / 6 * (1 - brake / 100)}
              transform="rotate(90 100 100)"
            />

            <text x="100" y="100" className="fill-[#2dd4bf] text-[8px] sm:text-[10px] md:text-xs" textAnchor="middle" dominantBaseline="middle">
              BRAKE
            </text>
          </g>
        </svg>

        {/* Central Data */}
        <div className="absolute flex flex-col items-center text-center space-y-1 sm:space-y-2 md:space-y-3">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            {speed}
          </div>
          <div className="text-gray-400 text-xs sm:text-sm md:text-base">KM/H</div>

          <div className="text-center">
            <div className="text-[#5382ec] text-[10px] sm:text-xs md:text-sm">RPM</div>
            <div className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              {(rpm / 1000).toFixed(1)}k
            </div>
          </div>

          <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full ${drsStatus === 'ACTIF'
              ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]'
              : 'bg-gray-700'
            }`}>
            <div className="text-white text-[10px] sm:text-xs md:text-sm">{drsStatus}</div>
          </div>

          <div className="text-center">
            <div className="text-[#2dd4bf] text-[10px] sm:text-xs md:text-sm">GEAR</div>
            <div className="text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] bg-clip-text text-transparent">
              {gear}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceCarTelemetry;