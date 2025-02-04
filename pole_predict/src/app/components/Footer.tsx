/* eslint-disable */
"use client"

import React from 'react';
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Github, ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Github, href: 'https://github.com/Selfousse/PFE', label: 'Github' },
];

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const SocialIcon: React.FC<{
  icon: React.ElementType;
  href: string;
  label: string;
}> = ({ icon: Icon, href, label }) => (
  <motion.a
    href={href}
    className="group relative flex items-center justify-center w-10 h-10"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    aria-label={label}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    <Icon className="w-5 h-5 text-gray-300 group-hover:text-white relative z-10 transition-colors" />
  </motion.a>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1d1f20] text-gray-300 py-12 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#161718] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              PolePredict
            </h3>
            <p className="text-sm leading-relaxed">
              Your ultimate source for Formula 1 predictions and analysis. Stay up-to-date with the latest statistics, race analysis, and forecasts for every Grand Prix.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link 
                    href={link.href}
                    className="text-sm hover:text-[#2dd4bf] transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href="mailto:contact@polepredict.com"
                className="text-sm hover:text-[#2dd4bf] transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                contact@polepredict.com
              </a>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <SocialIcon key={social.label} {...social} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar with Gradient Border */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 pt-6 relative"
        >
          {/* Gradient Border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5382ec] to-transparent opacity-30" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} PolePredict. All rights reserved.
            </p>
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Made with passion for Formula 1 fans
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;