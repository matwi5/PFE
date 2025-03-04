import React from "react";
import { Globe } from "lucide-react";
import Image from 'next/image'

interface MapModalProps {
  isMapVisible: boolean;
  coordinates: { lat: number | null; lon: number | null } | null;
  setIsMapVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapModal: React.FC<MapModalProps> = ({
  isMapVisible,
  coordinates,
  setIsMapVisible,
}) => {
  if (!isMapVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 map-modal"
      onClick={() => setIsMapVisible(false)}
    >
      <div
        className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 map-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
          onClick={() => setIsMapVisible(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
          <Globe className="mr-2 icon-widget" /> Localisation du Grand Prix
        </h2>
        <div className="flex justify-center">
          <Image
            src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates?.lon},${coordinates?.lat}&z=1&l=map&size=600,400&pt=${coordinates?.lon},${coordinates?.lat},pm2rdm`}
            alt="Map of Circuit Location"
            className="w-full h-96 object-cover rounded-lg border-2 border-[#5382ec] map-popup-image icon-widget"
          />
        </div>
      </div>
    </div>
  );
};

export default MapModal;