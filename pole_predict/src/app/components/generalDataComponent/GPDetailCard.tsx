import React from "react";
import { motion } from "framer-motion";
import DetailCard from "./DetailCard";

interface GrandPrix {
  grand_prix: string;
  pays_flag: string;
  ville: string;
  nombre_de_tours: number;
  particularites: string;
  record_de_circuit: string;
  recordman_circuit: string;
  image_circuit: string;
  pays: string;
  type: string;
  pace: string;
  requirement: string;
  elevation: string;
}

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  delay?: number;
  fullWidth?: boolean;
}> = ({ title, value, delay = 0, fullWidth = false }) => (
  <motion.div
    className={`bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c] shadow-lg ${fullWidth ? "sm:col-span-2" : ""}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p className="font-semibold text-[#5382ec] mb-2">{title}</p>
    <div className="flex items-center justify-center">{value}</div>
  </motion.div>
);

const GPDetailCard: React.FC<{ gp: GrandPrix }> = ({ gp }) => {
  return (
    <DetailCard>
      <div className="relative z-10 flex flex-col items-center mb-6">
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={gp.pays_flag}
            alt={`Drapeau ${gp.grand_prix}`}
            className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg border-2 border-[#5382ec] shadow-lg"
          />
        </motion.div>
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mt-4 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {gp.grand_prix}
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-[#2dd4bf] mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {gp.ville}
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 my-4 sm:my-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <img
          src={gp.image_circuit}
          alt={`Circuit ${gp.grand_prix}`}
          className="w-full h-48 sm:h-56 object-cover rounded-lg border-2 border-[#5382ec] shadow-lg"
        />
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Number of laps"
          value={<p className="text-white text-2xl font-bold">{gp.nombre_de_tours}</p>}
          delay={0.5}
        />

        <StatCard
          title="Circuit record"
          value={
            <div className="flex flex-col items-center">
              <p className="text-white text-lg sm:text-xl font-mono">{gp.record_de_circuit}</p>
              <p className="text-sm text-gray-400 mt-1">par {gp.recordman_circuit}</p>
            </div>
          }
          delay={0.6}
        />

        <StatCard
          title="Particularities"
          value={<p className="text-white text-sm sm:text-base leading-relaxed">{gp.particularites}</p>}
          delay={0.7}
          fullWidth
        />

        <StatCard title="Country" value={<p className="text-white text-lg font-bold">{gp.pays}</p>} delay={0.8} />
        <StatCard title="Circuit type" value={<p className="text-white text-lg font-bold">{gp.type}</p>} delay={0.9} />
        <StatCard title="Pace" value={<p className="text-white text-lg font-bold">{gp.pace}</p>} delay={1.0} />
        <StatCard title="Main requirement" value={<p className="text-white text-lg font-bold">{gp.requirement}</p>} delay={1.1} />
        <StatCard title="Altitude" value={<p className="text-white text-lg font-bold">{gp.elevation}</p>} delay={1.2} />


      </div>
    </DetailCard>
  );
};

export default GPDetailCard;