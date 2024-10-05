// src/app/about/page.tsx

import React from 'react';


const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">À propos de nous</h1>
      <p className="text-lg text-center mb-8">
        Découvrez notre équipe et notre passion pour la Formule 1.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
          <img
            src="/images/Miraj.png" 
            alt="Miraj"
            className="w-32 h-32 rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">Miraj</h2>
          <p className="text-center text-gray-300">
            Passionné de F1 depuis toujours, Miraj est notre expert en analyses de courses.
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
          <img
            src="/images/photo2.jpg" // Remplace par le chemin de ta photo
            alt="Membre 2"
            className="w-32 h-32 rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">Membre 2</h2>
          <p className="text-center text-gray-300">
            Membre 2 est un fervent supporter des courses et se spécialise dans la stratégie.
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
          <img
            src="/images/photo3.jpg" // Remplace par le chemin de ta photo
            alt="Membre 3"
            className="w-32 h-32 rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">Membre 2</h2>
          <p className="text-center text-gray-300">
            Membre 2 est un fervent supporter des courses et se spécialise dans la stratégie.
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
          <img
            src="/images/photo7.jpg" // Remplace par le chemin de ta photo
            alt="Membre 7"
            className="w-32 h-32 rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">Membre 3</h2>
          <p className="text-center text-gray-300">
            Avec une grande expérience dans le secteur, Membre 3 apporte son expertise technique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
