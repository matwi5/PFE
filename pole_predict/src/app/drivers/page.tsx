"use client";

import React, { useEffect, useState } from "react";
import { fetchDrivers } from "@/lib/openF1api";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"


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

const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => (
    <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800">
      <img src={driver.headshot_url} alt={`${driver.full_name} headshot`} className="w-32 h-32 rounded-full mb-4" />
      <h2 className="text-lg font-semibold">{driver.full_name}</h2>
      {/* <p className="text-gray-600">Équipe: {driver.team_name}</p>
      <p className="text-gray-600">Numéro: {driver.driver_number}</p>
      <p className="text-gray-600">Pays: {driver.country_code}</p> */}
    </div>
  )
  
  const DriverDetailCard: React.FC<{ driver: Driver }> = ({ driver }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <img src={driver.headshot_url} alt={`${driver.full_name} headshot`} className="w-48 h-48 rounded-full mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-center mb-4">{driver.full_name}</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="font-semibold">Équipe</p>
          <p>{driver.team_name}</p>
        </div>
        <div>
          <p className="font-semibold">Numéro</p>
          <p>{driver.driver_number}</p>
        </div>
        <div>
          <p className="font-semibold">Pays</p>
          <p>{driver.country_code}</p>
        </div>
        <div>
          <p className="font-semibold">Nom de diffusion</p>
          <p>{driver.broadcast_name}</p>
        </div>
      </div>
    </div>
  )

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const getDrivers = async () => {
      try {
        const data = await fetchDrivers();
        setDrivers(data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    getDrivers();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <main className="min-h-screen flex flex-col items-center mt-4 mb-4">
        <h1 className="text-5xl font-bold mb-4">Pilotes de F1</h1>
        <p className="text-xl mb-8">
          Découvrez les pilotes de Formule 1 les plus récents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drivers.map((driver) => (
            <Dialog key={driver.driver_number}>
              <DialogTrigger asChild>
                <button className="w-full text-left">
                  <DriverCard driver={driver} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DriverDetailCard driver={driver} />
                <Link href={`/drivers/${driver.driver_number}`} className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                  Voir plus de détails
                </Link>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DriversPage;
