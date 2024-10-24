"use client"; // Composant client

import React, { useContext } from "react";
import Typewriter from "typewriter-effect";
import UserContext from "../context/UserContext"; // Importer le UserContext

const Home: React.FC = () => {
  // Utilisation du contexte utilisateur
  const { user, loading } = useContext(UserContext);

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

        {/* Si l'utilisateur est encore en train de charger, on montre un message de chargement */}
        {loading ? (
          <p>Chargement...</p>
        ) : user ? (
          // Si l'utilisateur est connecté, afficher son username
          <div className="p-4 border border-green-500 rounded-lg text-center text-green-500">
            <h3 className="text-lg font-semibold">Bienvenue, {user.username} !</h3>
            <p>Vous êtes connecté.</p>
          </div>
        ) : (
          // Si l'utilisateur n'est pas connecté, afficher un bouton "Se connecter"
          <a
            href="/login"
            className="p-4 border border-red-500 rounded-lg text-center text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <h3 className="text-lg font-semibold">Se connecter &rarr;</h3>
            <p>Accédez à votre compte pour plus de fonctionnalités.</p>
          </a>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
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
            <p>Nous contacter pour plus d&apos;informations.</p> {/* Correction effectuée ici */}
          </a>
          <a
            href="/analyse"
            className="p-6 border border-red-500 rounded-lg text-center text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <h3 className="text-lg font-semibold">Analyse &rarr;</h3>
            <p>Regarder les dernières analyses.</p>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
