import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface HexagonChartProps {
  stats: number[]; // Specify the type of stats here
}

const HexagonChart: React.FC<HexagonChartProps> = ({ stats }) => {
  const [data, setData] = useState({
    labels: ['Max speed', 'Drag', 'Speed', 'Health', 'Magic', 'Stamina'],
    datasets: [
      {
        label: 'Character Stats',
        data: stats,
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 123, 255, 1)',
      },
    ],
  });

  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: stats,
        },
      ],
    }));
  }, [stats]);

  const options = {
    responsive: true,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20 },
      },
    },
    animation: {
      duration: 800,
    },
  };

  return <Radar data={data} options={options} />;
};

export default HexagonChart;
