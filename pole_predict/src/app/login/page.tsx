"use client";

import React, { useState } from "react";
import Link from "next/link";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Logique de connexion
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    console.log("Tentative de connexion avec", { email, password });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div
        className="p-8 rounded-lg shadow-lg w-full max-w-md"
        style={{ background: "#1c1c1e", color: "#e0e0e0" }}
      >
        <h1 className="text-3xl font-bold text-center mb-4">Se connecter</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre email"
              style={{ background: "#2b2b2d", color: "#ffffff" }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre mot de passe"
              style={{ background: "#2b2b2d", color: "#ffffff" }}
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded bg-gray-700 text-e0e0e0 hover:bg-red-600 hover:text-white transition-colors"
          >
            Connexion
          </button>
        </form>

        <p className="text-center mt-4">
          Vous n'avez pas de compte ?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
