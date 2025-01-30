"use client"

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface GeneralDataCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  linkText: string;
  onClick: () => void;
  index: number;
  selectedYear?: number;
  setSelectedYear?: (year: number) => void;
  hoveredCard: number | null;
  setHoveredCard: (index: number | null) => void;
  isHoveringCardIndex: number | null;
  setIsHoveringCardIndex: (index: number | null) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>, index: number) => void;
  mousePos: { x: number; y: number };
}

const GeneralDataCard: React.FC<GeneralDataCardProps> = ({
  icon,
  title,
  content,
  linkText,
  onClick,
  index,
  selectedYear,
  setSelectedYear,
  hoveredCard,
  setHoveredCard,
  isHoveringCardIndex,
  setIsHoveringCardIndex,
  handleMouseMove,
  mousePos,
}) => {
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  return (
    <motion.div>
      <Card
        className={`relative transition-all duration-300 bg-[#282a2c] 
                   border border-gray-800 hover:border-[#5382ec] overflow-hidden
                   ${hoveredCard === index ? 'scale-105' : ''}`}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => {
          setHoveredCard(null);
          setIsHoveringCardIndex(null);
        }}
        onMouseMove={(e) => handleMouseMove(e, index)}
        style={{
          background: isHoveringCardIndex === index
            ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.3), rgba(45, 212, 191, 0) 50%) , ${'#282a2c'}`
            : '#282a2c',
        }}
      >
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-center text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent inline-flex items-center">
              {React.cloneElement(icon, {
                className: "mr-2",
                style: { color: '#5382ec' }
              })}
              {title}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-gray-300">{content}</p>
          <div className="flex items-center mt-4">
            {index === 2 && setSelectedYear && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 bg-[#282a2c] text-white border border-[#5382ec] rounded mr-2 relative z-10"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            )}
            <Button
              variant="outline"
              onClick={onClick}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative z-10"
              style={{
                background: hoveredButton === index ? 'linear-gradient(to right, #5382ec, #2dd4bf)' : 'transparent',
                color: 'white',
                border: '1px solid #5382ec',
                transition: 'background 0.3s, color 0.3s',
                ...(hoveredButton === index && { color: 'white' }),
              }}
            >
              {linkText} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeneralDataCard;