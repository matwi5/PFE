import React from 'react';
import Header from './components/Header'; // Importation du composant Header
import Footer from './components/Footer';
import './globals.css'; // Importation des styles globaux

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Mon Site F1</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <Header title="PolePredict" /> {/* En-tête partagé */}
        <main className="flex-grow">{children}</main> {/* Contenu dynamique des pages */}
        <Footer /> {/* Pied de page partagé */}
      </body>
    </html>
  );
};

export default Layout;
