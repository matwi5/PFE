import React, { ReactNode } from 'react';
import { Card } from "@/components/ui/card";

interface GlowingBorderCardProps {
  children: ReactNode;
  className?: string;
}

const GlowingBorderCard = ({ children, className = "" }: GlowingBorderCardProps) => {
  return (
    <div className="relative group">
      <Card className={`
        relative 
        bg-[#282a2c]
        border-0 
        ${className}
        before:absolute 
        before:inset-[5px]
        before:bg-[#282a2c] 
        before:z-10
        before:rounded-[calc(var(--radius)-2px)]
        
        after:absolute 
        after:-left-[100%]
        after:-top-[100%]
        after:w-[300%]
        after:h-[300%]
        after:bg-[conic-gradient(from_0deg,#3B82F6_0%,#EC4899_50%,#3B82F6_100%)]
        after:animate-rotate
        after:animate-[rotate_4s_cubic-bezier(0.4,0,0.2,1)_infinite]
        after:origin-center
        after:blur-sm
        after:opacity-100
        
        [&:before]:content-['']
        [&:after]:content-['']
        
        shadow-[0_0_20px_rgba(59,130,246,0.5),0_0_20px_rgba(236,72,153,0.5)]
        transition-shadow
        duration-500
        
        overflow-hidden
        group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7),0_0_30px_rgba(236,72,153,0.7)]
      `}>
        {/* Contenu principal */}
        <div className="relative z-20">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default GlowingBorderCard;