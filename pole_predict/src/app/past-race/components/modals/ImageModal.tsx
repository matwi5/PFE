import React from "react";
import Image from 'next/image'

interface ImageModalProps {
  isImageVisible: boolean;
  selectedImageUrl: string;
  setIsImageVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isImageVisible,
  selectedImageUrl,
  setIsImageVisible,
}) => {
  if (!isImageVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 image-modal"
      onClick={() => setIsImageVisible(false)}
    >
      <div
        className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 image-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
          onClick={() => setIsImageVisible(false)}
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
          Circuit of the Grand Prix
        </h2>
        <Image
          src={selectedImageUrl}
          alt="Grand Prix Circuit"
          className="w-full h-full object-cover rounded-lg circuit-popup-image icon-widget border-2 border-[#5382ec]"
        />
      </div>
    </div>
  );
};

export default ImageModal;