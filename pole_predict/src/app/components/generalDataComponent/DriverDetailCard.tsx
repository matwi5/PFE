import React from "react";
import { motion } from "framer-motion";
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

const StatCard: React.FC<{ title: string; value: React.ReactNode; delay?: number }> = ({ title, value, delay = 0 }) => (
  <motion.div 
    className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c] shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p className="font-semibold text-[#5382ec] mb-2 text-sm sm:text-base">{title}</p>
    <div className="flex items-center justify-center">
      {value}
    </div>
  </motion.div>
);

const DriverDetailCard: React.FC<{ driver: Driver }> = ({ driver }) => {
  return (
    <DetailCard>
      {/* Driver Image & Name Section */}
      <div className="relative z-10 mb-6">
        <motion.div 
          className="relative w-36 h-36 sm:w-48 sm:h-48 mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-full"></div>
          <img
            src={driver.headshot_url}
            alt={`${driver.name} headshot`}
            className="w-full h-full rounded-full object-cover border-4 border-[#5382ec] transition-transform duration-300 hover:scale-105 shadow-xl"
          />
        </motion.div>
        
        <motion.h2 
          className="relative z-10 text-2xl sm:text-3xl font-bold text-center mt-6 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {driver.name}
        </motion.h2>
      </div>

      {/* Stats Grid - Primary Info */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <StatCard 
          title="Team" 
          value={<p className="text-white text-lg">{driver.team_name}</p>}
          delay={0.3}
        />
        <StatCard 
          title="Number" 
          value={<p className="text-white text-2xl font-bold" style={{ color: driver.team_colour }}>{driver.driver_number}</p>}
          delay={0.4}
        />
      </div>

      {/* Stats Grid - Secondary Info */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 gap-4 mb-4">
        <StatCard 
          title="Nationality" 
          value={
            <div className="flex items-center justify-center gap-2">
              <img
                src={driver.flag_url}
                alt={`${driver.country_code} flag`}
                className="w-6 h-4 shadow-sm"
              />
              <p className="text-white">{driver.country_code}</p>
            </div>
          }
          delay={0.5}
        />
        <StatCard 
          title="Code" 
          value={<p className="text-white text-xl font-mono">{driver.broadcast_name}</p>}
          delay={0.6}
        />
      </div>

      {/* Stats Grid - Performance Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
        <StatCard 
          title="Victories" 
          value={<p className="text-white text-2xl font-bold">{driver.NumberOfVictories}</p>}
          delay={0.7}
        />
        <StatCard 
          title="Podiums" 
          value={<p className="text-white text-2xl font-bold">{driver.NumberOfPodiums}</p>}
          delay={0.8}
        />
      </div>

      {/* Championships Section */}
      {driver.WorldChampionships > 0 && (
        <motion.div 
          className="relative z-10 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <p className="text-center text-[#5382ec] font-semibold mb-4">World Championships</p>
          <div className="flex justify-center flex-wrap gap-4">
            {Array.from({ length: driver.WorldChampionships }).map((_, index) => (
              <motion.img
                key={index}
                src="/images/coupe.webp"
                alt={`Championship Trophy ${index + 1}`}
                className="w-16 h-16 sm:w-20 sm:h-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1 + (index * 0.1),
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </DetailCard>
  );
};

export default DriverDetailCard;