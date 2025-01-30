"use client"

import React, { useContext, type FC } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { motion } from "framer-motion";
import UserContext from '../../context/UserContext';
import { auth } from '../../firebaseConfig';
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Menu, User, LogOut, TrendingUpDown } from 'lucide-react';

interface HeaderProps {
  title: string;
}

interface NavigationArrowProps {
  text: string;
  href: string;
  gradientFrom: string;
  gradientTo: string;
  delay: number;
}

const NavigationArrow: FC<NavigationArrowProps> = ({ text, href, gradientFrom, gradientTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative"
  >
    <Link href={href}>
      <motion.div
        className="relative h-12 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Arrow shape with gradient */}
        <div className={`h-full w-48 relative flex items-center justify-center
                      before:content-[''] before:absolute before:inset-0 
                      before:bg-gradient-to-r ${gradientFrom} ${gradientTo}
                      before:skew-x-[20deg] before:rounded-sm
                      after:content-[''] after:absolute after:inset-0 
                      after:bg-white after:opacity-0 after:skew-x-[20deg] after:rounded-sm
                      after:transition-opacity after:duration-300
                      group-hover:after:opacity-20`}>
          <span className="relative z-10 text-white font-medium">
            {text}
          </span>
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

const Header: FC<HeaderProps> = ({ title }) => {
  const { user, loading } = useContext(UserContext);

  React.useEffect(() => {
    document.body.style.paddingTop = '90px'; // Adjust this value based on your header height
    return () => {
      document.body.style.paddingTop = '0px';
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie !");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1d1f20]/30 backdrop-blur-md text-white py-4 shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
            >
              {title}
            </motion.div>
          </Link>

          {/* Timeline Navigation */}
          <div className="flex-1 flex justify-center items-center gap-2">
            <NavigationArrow
              text="Past"
              href="/past-race"
              gradientFrom="from-[#2e3ecc]"
              gradientTo="to-[#2e87cc]"
              delay={0.1}
            />
            <NavigationArrow
              text="Live"
              href="/live-race"
              gradientFrom="from-[#2e87cc]"
              gradientTo="to-[#2ebecc]"
              delay={0.2}
            />
            <NavigationArrow
              text="Upcoming"
              href="/upcoming"
              gradientFrom="from-[#2ebecc]"
              gradientTo="to-[#2dd4bf]"
              delay={0.3}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu */}
            {loading ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-gray-400"
              >
                Loading...
              </motion.div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost"
                    className="bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20">
                    <User className="mr-2 h-4 w-4" /> {user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#282a2c] border-none">
                  <DropdownMenuItem className="text-gray-300 hover:bg-[#5382ec]/20">
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-[#5382ec]/20">
                    <Link href="/profile/predictions" className="flex items-center w-full">
                      <TrendingUpDown className="mr-2 h-4 w-4" /> My predictions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-gray-300 hover:bg-[#5382ec]/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-[#282a2c] text-gray-300 hover:bg-[#5382ec]/20"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#282a2c] border-none">
                <DropdownMenuItem className="text-gray-300 hover:bg-[#5382ec]/20">
                  <Link href="/prediction" className="w-full">Predictions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:bg-[#5382ec]/20">
                  <Link href="/about" className="w-full">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:bg-[#5382ec]/20">
                  <Link href="/contact" className="w-full">Contact</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;