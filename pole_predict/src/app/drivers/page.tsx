'use client'

import React, { useEffect, useState } from 'react';
import { fetchDrivers } from '@/lib/openF1api';

interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  team_name: string;
  team_colour: string;
}

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const getDrivers = async () => {
      try {
        const data = await fetchDrivers();
        setDrivers(data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    getDrivers();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <main className="min-h-screen flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4">Pilotes de F1</h1>
        <p className="text-xl mb-8">
          Découvrez les pilotes de Formule 1 les plus récents.
        </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {drivers.map((driver) => (
              <div key={driver.driver_number} className="border border-gray-300 rounded-lg p-4 flex flex-col items-center">
                <img src={driver.headshot_url} alt={`${driver.full_name} headshot`} className="w-32 h-32 rounded-full mb-4" />
                <h2 className="text-lg font-semibold">{driver.full_name}</h2>
                <p className="text-white-600">Équipe: {driver.team_name}</p>
                <p className="text-white-600">Numéro: {driver.driver_number}</p>
                <p className="text-white-600">Pays: {driver.country_code}</p>
              </div>
            ))}
          </div>
      </main>
    </div>
  );
};

export default DriversPage;
