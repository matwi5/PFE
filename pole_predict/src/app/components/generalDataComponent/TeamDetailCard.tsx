import React from "react";
import DetailCard from "./DetailCard";

interface Team {
  name: string;
  color: string;
  logo_url: string;
  base: string;
  team_principal: string;
  championships: number;
  power_unit: string;
  country: string;
  country_flag: string;
  pilote1_url: string;
  pilote2_url: string;
  car_image: string;
}

const TeamDetailCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <DetailCard>
      <div className="relative z-10 grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-lg"></div>
            <img
              src={team.logo_url}
              alt={`${team.name} logo`}
            />
          </div>
          <h2
            className="text-xl font-bold text-center mt-4"
            style={{ color: team.color }}
          >
            {team.name}
          </h2>
        </div>

        <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
              <p className="font-semibold mb-2" style={{ color: team.color }}>Base</p>
              <div className="flex items-center gap-2">
                <img src={team.country_flag} alt={`${team.country} flag`} className="w-6 h-6" />
                <p className="text-white">{team.base}</p>
              </div>
            </div>
            <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
              <p className="font-semibold mb-2" style={{ color: team.color }}>Team Principal</p>
              <p className="text-white">{team.team_principal}</p>
            </div>
          </div>

          <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
            <p className="font-semibold mb-2" style={{ color: team.color }}>Power Unit</p>
            <p className="text-white">{team.power_unit}</p>
          </div>
        </div>

        <div className="col-span-12">
          <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
            <p className="font-semibold mb-4 text-center" style={{ color: team.color }}>Car</p>
            <img
              src={team.car_image}
              alt={`${team.name} car`}
              className="w-full rounded-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </DetailCard>
  );
};

export default TeamDetailCard;