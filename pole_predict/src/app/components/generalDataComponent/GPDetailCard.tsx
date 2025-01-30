import React from "react";
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
}

const GPDetailCard: React.FC<{ gp: GrandPrix }> = ({ gp }) => {
  return (
    <DetailCard>
      <div className="relative z-10 flex flex-col items-center mb-6">
        <img
          src={gp.pays_flag}
          alt={`Drapeau ${gp.grand_prix}`}
          className="w-32 h-20 object-cover rounded-lg mb-4 border-2 border-[#5382ec]"
        />
        <h2 className="text-3xl font-bold text-center text-white bg-clip-text bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]">
          {gp.grand_prix}
        </h2>
        <p className="text-xl text-[#2dd4bf] mt-2">{gp.ville}</p>
      </div>

      <div className="relative z-10 my-6">
        <img
          src={gp.image_circuit}
          alt={`Circuit ${gp.grand_prix}`}
          className="w-full h-56 object-cover rounded-lg border-2 border-[#5382ec]"
        />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-6">
        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Nombre de tours</p>
          <p className="text-white text-2xl font-bold text-center">{gp.nombre_de_tours}</p>
        </div>

        <div className="bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Record du circuit</p>
          <p className="text-white text-xl font-mono text-center">{gp.record_de_circuit}</p>
          <p className="text-sm text-gray-400 text-center mt-1">par {gp.recordman_circuit}</p>
        </div>

        <div className="col-span-2 bg-[#282a2c] p-4 rounded-lg transition-all duration-300 hover:bg-[#383a3c]">
          <p className="font-semibold text-[#5382ec] mb-2">Particularités</p>
          <p className="text-white">{gp.particularites}</p>
        </div>
      </div>
    </DetailCard>
  );
};

export default GPDetailCard;