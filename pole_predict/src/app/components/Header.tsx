"use client"

import Link from 'next/link';
import { useContext } from 'react';
import { signOut } from 'firebase/auth';
import UserContext from '../../context/UserContext'; // Importer le contexte utilisateur
import { auth } from '../../firebaseConfig'; // Importer l'authentification Firebase

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, loading } = useContext(UserContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Déconnexion de Firebase
      console.log("Déconnexion réussie !");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <header className="bg-red-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/" className="hover:text-blue-300">Accueil</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-300">À propos</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-blue-300">Contact</Link>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <span>Chargement...</span> // Afficher le message pendant le chargement
          ) : user ? (
            <div className="flex items-center space-x-2">
              <span>{user.username}</span> {/* Afficher le nom d'utilisateur */}
              <button
                onClick={handleSignOut}
                className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-100 transition"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-300">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
