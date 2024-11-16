import React from 'react';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-500">PolePredict</h3>
            <p className="text-sm">
              Votre source ultime pour les prédictions et analyses de Formule 1. Restez à jour avec les dernières statistiques, analyses de courses et prévisions pour chaque Grand Prix.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-red-500 transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors" aria-label="Twitter">
                <Twitter size={24} />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="https://github.com/Selfousse/PFE" className="hover:text-red-500 transition-colors" aria-label="Github">
                <Github size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm">
          <p>&copy; {currentYear} PolePredict. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;