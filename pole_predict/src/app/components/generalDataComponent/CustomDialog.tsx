"use client"

import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface CustomDialogProps {
  children: React.ReactNode;
  buttonStyle: React.CSSProperties;
  getHoverStyles: (
    e: React.MouseEvent<HTMLButtonElement>,
    isEntering: boolean,
    customColors?: string[]
  ) => void;
  triggerContent: React.ReactNode;
  customColors?: string[];
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  children,
  buttonStyle,
  getHoverStyles,
  triggerContent,
  customColors,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => getHoverStyles(e, true, customColors)}
          onMouseLeave={(e) => getHoverStyles(e, false, customColors)}
        >
          {triggerContent}
        </button>
      </DialogTrigger>
      <DialogContent
        className="group fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1d1f20] border-none p-6 overflow-hidden rounded-lg
        transition-all duration-300
        shadow-[0_0_15px_rgba(83,130,236,0.3)]
        hover:shadow-[0_0_25px_rgba(83,130,236,0.5)]"
      >
        <div className="relative w-full max-w-3xl h-[90vh]">
          {/* Effet de flou en haut */}
          <div className="absolute inset-x-0 h-12 top-0 bg-gradient-to-b from-[#1d1f20] to-transparent z-10" />

          {/* Bouton de fermeture amélioré */}
          <button
            className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full 
            bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]
            flex items-center justify-center
            transition-transform duration-200 hover:scale-110"
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape" })
              )
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-white"
            >
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Contenu avec scroll caché mais fonctionnel */}
          <div
            className="h-full overflow-y-auto scrollbar-none"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {children}
          </div>

          {/* Effet de flou en bas */}
          <div className="absolute inset-x-0 h-12 bottom-0 bg-gradient-to-t from-[#1d1f20] to-transparent z-10" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;