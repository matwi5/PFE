// src/app/about/page.tsx

import React from 'react';
import Image from 'next/image';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">À propos de nous</h1>
      <p className="text-lg text-center mb-8">
        Découvrez notre équipe et notre passion pour la Formule 1.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out transform flex flex-col items-center">
          <Image
            src="/images/Miraj.png"
            alt="Miraj"
            width={128} 
            height={128} 
            className="rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">Miraj</h2>
          <p className="text-center">
            Passionné de F1 depuis toujours, Miraj est notre expert en analyses de courses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
