import React from "react";

interface DetailCardProps {
  children: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ children }) => {
  return (
    <div className="relative bg-[#1d1f20] backdrop-blur-md p-2 rounded-xl border border-transparent transition-all duration-300 overflow-hidden">
      {children}
    </div>
  );
};

export default DetailCard;