import React from "react";
import { motion } from "framer-motion";
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

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  delay?: number;
  color: string;
}> = ({ title, value, delay = 0, color }) => (
  <motion.div
    className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c] shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p
      className="font-semibold mb-2"
      style={{ color: color }} // Always use the team color
    >
      {title}
    </p>
    <div className="flex items-center">{value}</div>
  </motion.div>
);

const TeamDetailCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <DetailCard>
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header with Logo and Name */}
        <div className="w-full flex flex-col items-center sm:flex-row sm:justify-start sm:gap-6 p-4">
          <motion.div
            className="relative w-48 sm:w-1/3 max-w-[200px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-lg"></div>
            <img
              src={team.logo_url}
              alt={`${team.name} logo`}
              className="w-full object-contain"
            />
          </motion.div>
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center sm:text-left mt-4 sm:mt-0"
            style={{ color: team.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {team.name}
          </motion.h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Base */}
          <StatCard
            title="Base"
            value={
              <div className="flex items-center gap-2">
                <img
                  src={team.country_flag}
                  alt={`${team.country} flag`}
                  className="w-6 h-6 rounded-sm"
                />
                <p className="text-white">{team.base}</p>
              </div>
            }
            delay={0.3}
            color={team.color}
          />

          {/* Team Principal */}
          <StatCard
            title="Team Principal"
            value={<p className="text-white">{team.team_principal}</p>}
            delay={0.4}
            color={team.color}
          />

          {/* Power Unit - Full width */}
          <div className="sm:col-span-2">
            <StatCard
              title="Power Unit"
              value={<p className="text-white">{team.power_unit}</p>}
              delay={0.5}
              color={team.color}
            />
          </div>
        </div>

        {/* Car Section */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c] shadow-lg">
            <p
              className="font-semibold mb-4 text-center"
              style={{ color: team.color }}
            >
              Car
            </p>
            <div className="relative overflow-hidden rounded-lg">
              <motion.img
                src={team.car_image}
                alt={`${team.name} car`}
                className="w-full rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Drivers Section */}
        {(team.pilote1_url || team.pilote2_url) && (
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {team.pilote1_url && (
              <motion.div
                className="bg-[#282a2c] p-4 rounded-lg shadow-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <img
                  src={team.pilote1_url}
                  alt="Driver 1"
                  className="w-full h-auto rounded"
                />
              </motion.div>
            )}
            {team.pilote2_url && (
              <motion.div
                className="bg-[#282a2c] p-4 rounded-lg shadow-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <img
                  src={team.pilote2_url}
                  alt="Driver 2"
                  className="w-full h-auto rounded"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </DetailCard>
  );
};

export default TeamDetailCard;