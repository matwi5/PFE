"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileImageWithPopup from './ProfileImageWithPopup';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
  skills: string[];
  linkedin: string;
  tasks: string[];
}

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

  const getButtonStyles = (isHovered: boolean) => {
    return {
      background: isHovered ? "orange" : "none",
      color: isHovered ? "black" : "white",
      border: "1px solid white",
      padding: "0.5rem 1rem",
      width: "100%",
      fontSize: "0.9rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background 0.3s, color 0.3s, transform 0.3s",
      borderRadius: "4px",
      transform: isHovered ? "scale(1.05)" : "scale(1)",
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6">À propos de nous</h1>
      <p className="text-xl text-center mb-12 text-muted-foreground">
        Découvrez notre équipe passionnée et notre expertise en Formule 1.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="hover:shadow-lg transition-shadow duration-300 bg-gray-800 text-white">
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
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </a>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{member.description}</p>
              {Array.isArray(member.skills) && member.skills.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {member.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Aucune compétence disponible</p>
              )}
              <button
                onClick={(e) => toggleTasks(e, member.name)}
                onMouseEnter={() => setHoveredButton(member.name)}
                onMouseLeave={() => setHoveredButton(null)}
                style={getButtonStyles(hoveredButton === member.name)}
                className="mt-4"
              >
                {showTasks[member.name] ? "Masquer les tâches" : "Voir les tâches"}
              </button>
              {showTasks[member.name] && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Tâches travaillées :</h3>
                  {Array.isArray(member.tasks) && member.tasks.length > 0 ? (
                    <ul>
                      {member.tasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucune tâche disponible</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}