"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AnimatedRadarChart() {
  const [chartData, setChartData] = useState([
    { statName: "Max speed", driverStat: 186 },
    { statName: "Acceleration", driverStat: 305 },
    { statName: "Drag", driverStat: 237 },
    { statName: "Brake", driverStat: 273 },
    { statName: "Weight feel", driverStat: 209 },
    { statName: "Test", driverStat: 214 },
  ]);

  // Simulate random updates to the data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) =>
        prevData.map((item) => ({
          ...item,
          driverStat: Math.floor(Math.random() * 400) + 100, // Random value between 100 and 500
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="statName" />
            <PolarGrid />
            <Radar
              dataKey="driverStat"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
              isAnimationActive={true} // Enables animation
              animationBegin={300} // Delay before animation starts
              animationDuration={750} // Duration of the animation
              animationEasing="ease-in-out" // Easing function
            />
          </RadarChart>
        </ChartContainer>
  );
}
