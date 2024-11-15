"use client"

import Link from 'next/link';
import { useContext } from 'react';
import { signOut } from 'firebase/auth';
import UserContext from '../../context/UserContext';
import { auth } from '../../firebaseConfig';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, loading } = useContext(UserContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie !");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <header className="bg-red-600 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="hover:text-red-200 transition-colors">
          <h1 className="text-2xl font-bold">{title}</h1>
        </Link>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/about" className="hover:text-blue-200 transition-colors">À propos</Link>
            </li>
            <li>
              <Link href="/prediction" className="hover:text-blue-200 transition-colors">Prediction</Link>
            </li>
            <li>
              <Link href="/drivers" className="hover:text-blue-200 transition-colors">Pilotes</Link>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <span className="animate-pulse">Chargement...</span>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
                  <User className="mr-2 h-4 w-4" /> {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                <DropdownMenuItem>
                  <User className="text-center" /> Profile  
                </DropdownMenuItem>
                </Link>
                <Link href="/profile/predictions">
                <DropdownMenuItem>
                  <User className="text-center" /> Mes prédictions  
                </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
              <Link href="/login">Se connecter</Link>
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/about">À propos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contact">Contact</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/drivers">Pilotes</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;