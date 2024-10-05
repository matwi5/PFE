// src/app/page.tsx
"use client"; // Ajout pour marquer ce composant comme Client Component

import React, { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <main className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-4 flex items-center">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString("Le site de prédiction F1")
                .callFunction(() => {
                  console.log("String typed out!");
                })
                .start();
            }}
          />
        </h1>
        <p className="text-xl mb-8">
          Découvrez les analyses et les prédictions en temps réel pour les
          courses de Formule 1.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/about"
            className="p-6 border border-red-500 rounded-lg text-center text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <h3 className="text-lg font-semibold">À propos &rarr;</h3>
            <p>En savoir plus sur notre projet et notre équipe.</p>
          </a>
          <a
            href="/contact"
            className="p-6 border border-red-500 rounded-lg text-center text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <h3 className="text-lg font-semibold">Contact &rarr;</h3>
            <p>Nous contacter pour plus d'informations.</p>
          </a>
          <a
            href="/blog"
            className="p-6 border border-red-500 rounded-lg text-center text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <h3 className="text-lg font-semibold">Blog &rarr;</h3>
            <p>Regarder les dernière prédiction.</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
