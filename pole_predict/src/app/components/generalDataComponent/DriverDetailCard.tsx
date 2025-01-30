import React from "react";
import DetailCard from "./DetailCard";

interface Driver {
  flagColors: string[];
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  headshot_url: string;
  last_name: string;
  team_name: string;
  team_colour: string;
  name: string;
  flag_url: string;
  year: number[];
  NumberOfPodiums: number;
  NumberOfVictories: number;
  WorldChampionships: number;
}

const DriverDetailCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <DetailCard>
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-full"></div>
        <img
          src={driver.headshot_url}
          alt={`${driver.name} headshot`}
          className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-[#5382ec] transition-transform duration-300 hover:scale-105"
        />
      </div>
      <h2 className="relative z-10 text-3xl font-bold text-center mb-6 text-white bg-clip-text bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]">
        {driver.name}
      </h2>
      <div className="relative z-10 grid grid-cols-2 gap-6 text-center">
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Équipe</p>
          <p className="text-white">{driver.team_name}</p>
        </div>
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Numéro</p>
          <p className="text-white text-2xl font-bold">{driver.driver_number}</p>
        </div>
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Nationalité</p>
          <div className="flex items-center justify-center gap-2">
            <img
              src={driver.flag_url}
              alt={`${driver.country_code} flag`}
              className="w-6 h-4"
            />
            <p className="text-white">{driver.country_code}</p>
          </div>
        </div>
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Code</p>
          <p className="text-white text-xl font-mono">{driver.broadcast_name}</p>
        </div>
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Nombre de Victoires</p>
          <p className="text-white text-2xl font-bold">{driver.NumberOfVictories}</p>
        </div>
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Nombre de Podiums</p>
          <p className="text-white text-2xl font-bold">{driver.NumberOfPodiums}</p>
        </div>
      </div>
      <div className="relative z-10 mt-4 flex justify-center flex-wrap gap-2">
        {driver.WorldChampionships > 0 && (
          Array.from({ length: driver.WorldChampionships }).map((_, index) => (
            <img
              key={index}
              src="/images/coupe.webp"
              alt={`Championship Trophy ${index + 1}`}
              className="w-20 h-20"
            />
          ))
        )}
      </div>
    </DetailCard>
  );
};

export default DriverDetailCard;