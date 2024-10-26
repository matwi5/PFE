import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const teamMembers = [
  {
    name: "Miraj",
    role: "Architecte Cloud",
    image: "/images/Miraj.png",
    description: "Passionné de F1 depuis toujours, Miraj est notre expert en analyses de courses.",
    skills: ["AWS", "Stratégie cloud", "Developpement cloud"]
  },
  {
    name: "Mathis",
    role: "Développeur alogorithme IA",
    image: "/placeholder.svg?height=128&width=128",
    description: "Sophie est responsable du développement et de la maintenance de notre plateforme de prédictions.",
    skills: ["Machine Learning", "Fine-tunning", "Python" , "Histoire de la F1"]
  },
  {
    name: "Louis",
    role: "Expert cybersécurité",
    image: "/placeholder.svg?height=128&width=128",
    description: "Lucas utilise des modèles statistiques avancés pour affiner nos prédictions de course.",
    skills: ["OWASP", "Gestion des risques", "Visualisation de données"]
  },
  {
    name: "Clément",
    role: "Expert Big Data",
    image: "/placeholder.svg?height=128&width=128",
    description: "Lucas utilise des modèles statistiques avancés pour affiner nos prédictions de course.",
    skills: ["OWASP", "Gestion des risques", "Visualisation de données"]
  },
  {
    name: "Loïc",
    role: "Expert cybersécurité",
    image: "/placeholder.svg?height=128&width=128",
    description: "Lucas utilise des modèles statistiques avancés pour affiner nos prédictions de course.",
    skills: ["OWASP", "Gestion des risques", "Visualisation de données"]
  },
  {
    name: "Louis",
    role: "Expert cybersécurité",
    image: "/placeholder.svg?height=128&width=128",
    description: "Lucas utilise des modèles statistiques avancés pour affiner nos prédictions de course.",
    skills: ["OWASP", "Gestion des risques", "Visualisation de données"]
  },
  {
    name: "Robin",
    role: "Expert cybersécurité",
    image: "/placeholder.svg?height=128&width=128",
    description: "Lucas utilise des modèles statistiques avancés pour affiner nos prédictions de course.",
    skills: ["OWASP", "Gestion des risques", "Visualisation de données"]
  }
];

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">À propos de nous</h1>
      <p className="text-xl text-center mb-12 text-muted-foreground">
        Découvrez notre équipe passionnée et notre expertise en Formule 1.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Image
                src={member.image}
                alt={member.name}
                width={128} 
                height={128} 
                className="rounded-full mx-auto mb-4"
              />
              <CardTitle>{member.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{member.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {member.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default About;