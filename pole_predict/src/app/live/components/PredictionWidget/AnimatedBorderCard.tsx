import React from 'react';

export const AnimatedBorderCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative group">
      {/* Glow effect wrapper */}
       <style>{`
        .glow-effect {
          filter: blur(11px);
          transition: all 300ms ease-in-out;
        }
        .group:hover .glow-effect {
          filter: blur(15px);
        }
      `}</style>
      
      <div className="absolute inset-0 rounded-xl bg-[#9474b1] opacity-60 group-hover:opacity-80 transition-opacity duration-300 glow-effect" />
            
      {/* Original card with animated border */}
      <div className="relative group overflow-hidden rounded-xl p-[5px] transition-all duration-300">
        {/* Border animée */}
        <div className="absolute inset-0 overflow-hidden after:absolute after:inset-[-100%] after:animate-[rotate_4s_cubic-bezier(0.4,0,0.2,1)_infinite] after:bg-[conic-gradient(#5382ec_0deg,#d56676_180deg,#5382ec_360deg)]" />
        
        {/* Contenu */}
        <div className="relative rounded-[10px] bg-[#282a2c] z-10">
          {children}
        </div>
      </div>
    </div>
  );
};