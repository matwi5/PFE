"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProfileImageWithPopup from './ProfileImageWithPopup';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Typewriter from "typewriter-effect";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  skills: string[];
  linkedin: string;
  tasks: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringCardIndex, setIsHoveringCardIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/members');
        if (!response.ok) throw new Error('Erreur lors de la récupération des membres');
        const data = await response.json();
        setTeamMembers(data.data);
      } catch (error) {
        setError("Impossible de récupérer les données.");
      }
    };

    fetchData();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const cardRect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setIsHoveringCardIndex(index);
  };

  const handleMouseLeave = () => {
    setIsHoveringCardIndex(null);
  };

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-24 px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main 
        className="flex flex-col items-center justify-center h-full"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Users 
            className="w-24 h-24 mb-8 text-[#5382ec]"
          />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "Meet Our Team",
                "Formula 1 Enthusiasts",
                "Web Development Experts",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>
      </motion.main>

      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto"
        variants={containerVariants}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            variants={itemVariants}
          >
            <Card
              className="relative transition-all duration-300 bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] overflow-hidden"
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              style={{
                background: isHoveringCardIndex === index
                  ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.3), rgba(45, 212, 191, 0) 50%), #282a2c`
                  : '#282a2c',
              }}
            >
              <CardHeader className="text-center">
                <Dialog>
                  <DialogTrigger>
                    <ProfileImageWithPopup
                      image={member.image}
                      name={member.name}
                      linkedin={member.linkedin}
                    />
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                      {member.name}
                    </CardTitle>
                    <p className="text-gray-400">{member.role}</p>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1d1f20] border-none p-6 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(83,130,236,0.3)] hover:shadow-[0_0_25px_rgba(83,130,236,0.5)]">
                    <div className="relative h-[90vh] overflow-y-auto">
                      <div className="absolute inset-x-0 h-12 top-0 bg-gradient-to-b from-[#1d1f20] to-transparent z-10" />
                      
                      <div className="p-4">
                        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                          {member.name}
                        </h2>
                        <p className="text-gray-300 mb-6">{member.description}</p>
                        
                        <div className="bg-[#282a2c] p-4 rounded-lg mb-6">
                          <h3 className="font-semibold text-[#5382ec] mb-4">Compétences</h3>
                          <div className="flex flex-wrap gap-2">
                            {member.skills?.map((skill) => (
                              <Badge key={skill} className="bg-[#383a3c] text-white hover:bg-[#484a4c]">
                                {skill}
                              </Badge>
                            )) || <p className="text-gray-400">Aucune compétence renseignée</p>}
                          </div>
                        </div>

                        <div className="bg-[#282a2c] p-4 rounded-lg">
                          <h3 className="font-semibold text-[#5382ec] mb-4">Tâches réalisées</h3>
                          <ul className="space-y-2">
                            {member.tasks?.map((task, taskIndex) => (
                              <li key={taskIndex} className="text-gray-300">{task}</li>
                            )) || <p className="text-gray-400">Aucune tâche renseignée</p>}
                          </ul>
                        </div>
                      </div>

                      <div className="absolute inset-x-0 h-12 bottom-0 bg-gradient-to-t from-[#1d1f20] to-transparent z-10" />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 text-center">{member.description}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {member.skills?.map((skill) => (
                    <Badge 
                      key={skill} 
                      className="bg-[#383a3c] text-white hover:bg-[#484a4c]"
                    >
                      {skill}
                    </Badge>
                  )) || <p className="text-gray-400">Aucune compétence renseignée</p>}
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => window.open(member.linkedin, '_blank')}
                    className="relative z-10"
                    style={{
                      background: hoveredButton === member.name ? 'linear-gradient(to right, #5382ec, #2dd4bf)' : 'transparent',
                      color: 'white',
                      border: '1px solid #5382ec',
                    }}
                    onMouseEnter={() => setHoveredButton(member.name)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    Voir profil <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>
    </motion.div>
  );
}