// src/app/about/page.tsx
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <main className="min-h-screen flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4 mt-4">À propos de nous</h1>
        <p className="text-xl mb-8">
          Bienvenue sur PolePredict notre site dédié à la prédiction et l'analyse dans le mode de la F1 !
        </p>
        <p className="text-lg text-center">
          Ici, vous trouverez des analyses approfondies et des prédictions en temps réel concernant les courses de Formule 1. 
          Notre équipe est passionnée par le sport automobile et s'efforce de vous fournir les meilleures informations et insights.
        </p>
      </main> 
    </div>
  );
};

export default About;
