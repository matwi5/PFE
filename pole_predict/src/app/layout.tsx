import React from 'react';
import Header from './components/Header'; // Importation du composant Header
import './globals.css'; // Importation des styles globaux

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="fr">
      <head>
        <title>Mon Site F1</title>
      </head>
      <body>
        <Header title="Bienvenue sur le site F1" /> {/* En-tête partagé */}
        <main>{children}</main> {/* Contenu dynamique des pages */}
        <footer>
          <p>&copy; 2024 Mon Site F1. Tous droits réservés.</p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;