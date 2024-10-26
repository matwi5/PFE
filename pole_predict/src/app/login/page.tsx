"use client";

import { useState } from "react";
import { auth } from "../../firebaseConfig"; // Ton fichier de configuration Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Utilisation de useRouter pour redirection

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Utilisation de useRouter pour la redirection

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    try {
      // Connexion de l'utilisateur avec Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Utilisateur connecté :", userCredential.user);

      // Redirection vers la page d'accueil après une connexion réussie
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Adresse email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md" style={{ background: '#1c1c1e', color: '#e0e0e0' }}>
        <h1 className="text-3xl font-bold text-center mb-4">Se connecter</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* Affichage des erreurs */}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre email"
              style={{ background: '#2b2b2d', color: '#ffffff' }}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre mot de passe"
              style={{ background: '#2b2b2d', color: '#ffffff' }}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 rounded bg-gray-700 text-e0e0e0 hover:bg-red-600 hover:text-white transition-colors"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center mt-4">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-blue-400 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;


