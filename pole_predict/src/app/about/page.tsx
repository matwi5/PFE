"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileImageWithPopup from './ProfileImageWithPopup';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  skills: string[];
  linkedin: string;
  tasks: string[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  hover: { scale: 1.03, transition: { duration: 0.2 } },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(255, 165, 0, 0.8)",
    color: "black",
  },
  rest: {
    scale: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    transition: { duration: 0.3, type: "spring", stiffness: 100 }
  },
};

// Create a motion component from the Card component
const MotionCard = motion(Card);

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState('');
  const [showTasks, setShowTasks] = useState<{ [key: string]: boolean }>({});
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Début de la requête fetch");
        const usResponse = await fetch('/api/members');
        console.log("Réponse reçue:", usResponse.status);
        if (!usResponse.ok) throw new Error('Erreur lors de la récupération des pilotes');
        const usData = await usResponse.json();
        console.log("Données reçues:", usData);
        setTeamMembers(usData.data);
      } catch (error) {
        console.error("Erreur détaillée:", error);
        setError("Impossible de récupérer les données.");
      }
    };

    fetchData();
  }, []);

  const toggleTasks = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTasks((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-900 text-white p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.7 } }}
    >
      <motion.h1
        className="text-4xl font-bold text-center mb-6 text-orange-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }}
      >
        À propos de nous
      </motion.h1>
      <motion.p
        className="text-xl text-center mb-12 text-gray-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } }}
      >
        Découvrez notre équipe passionnée et notre expertise en Formule 1.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
          >
            {/* Use MotionCard here instead of Card */}
            <MotionCard
              className="bg-gray-800 hover:bg-gray-700 transition-colors duration-300 text-white"
              initial={{ boxShadow: 'none' }}
              whileHover={{
                boxShadow: '0 0 30px rgba(255, 165, 0, 0.8)',
                scale: 1.03,
                transition: {
                  boxShadow: { duration: 0.3, ease: "easeOut" },
                  scale: { duration: 0.2 }
                },
              }}
            >
              <CardHeader className="text-center">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <ProfileImageWithPopup
                    image={member.image}
                    name={member.name}
                    linkedin={member.linkedin}
                  />
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm text-gray-400">{member.role}</p>
                </a>
              </CardHeader>
              <CardContent>
                <p className="text-center mb-4 text-gray-300">{member.description}</p>
                {Array.isArray(member.skills) && member.skills.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {member.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-gray-700 border-none text-gray-200">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Aucune compétence disponible</p>
                )}
                <motion.button
                  onClick={(e) => toggleTasks(e, member.name)}
                  onMouseEnter={() => setHoveredButton(member.name)}
                  onMouseLeave={() => setHoveredButton(null)}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="mt-4 w-full py-2 px-4 rounded-md font-bold border border-white transition-all duration-300"
                  style={{ backgroundColor: hoveredButton === member.name ? "rgba(255, 165, 0, 0.8)" : "rgba(255, 255, 255, 0.1)", color: "white" }}
                >
                  {showTasks[member.name] ? "Masquer les tâches" : "Voir les tâches"}
                </motion.button>
                {showTasks[member.name] && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-orange-500">Tâches travaillées :</h3>
                    {Array.isArray(member.tasks) && member.tasks.length > 0 ? (
                      <ul className="list-disc pl-5 text-gray-300">
                        {member.tasks.map((task, index) => (
                          <li key={index}>{task}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Aucune tâche disponible</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </MotionCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}