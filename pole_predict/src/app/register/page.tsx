"use client";

import { useState } from "react";
import { auth, db } from "../../firebaseConfig"; // Ton fichier de configuration Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Importation de getDoc
import Link from "next/link";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); // État pour les messages d'erreur

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Réinitialiser les messages d'erreur

    try {
      // Vérifier si l'utilisateur existe déjà dans Firestore
      const userDocRef = doc(db, "users", email); // On utilise l'email comme identifiant
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setError("Cet utilisateur existe déjà.");
        return;
      }

      // Création de l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ajout de l'utilisateur à la base de données Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        phone: phone,
        createdAt: new Date(),
      });

      console.log("Utilisateur enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setError("Erreur lors de l'inscription, veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md" style={{ background: '#1c1c1e', color: '#e0e0e0' }}>
        <h1 className="text-3xl font-bold text-center mb-4">S'inscrire</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* Affichage des erreurs */}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre nom d'utilisateur"
              style={{ background: '#2b2b2d', color: '#ffffff' }}
              required
            />
          </div>

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
            <label htmlFor="phone" className="block mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre numéro de téléphone"
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
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-4">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
