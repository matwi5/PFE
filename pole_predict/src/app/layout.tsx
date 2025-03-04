import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { UserProvider } from '../context/UserContext';
import './globals.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>PolePredict</title>
      </head>
      <body className="min-h-screen flex flex-col bg-[#1B1C1D] text-white">
        <UserProvider>
          <Header title="PolePredict"/>
          <main className="flex-grow">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
};

export default Layout;