"use client";

import React, { useContext, useState, useEffect } from "react"; // Ajout de useRef et useEffect
import Typewriter from "typewriter-effect";
import UserContext from "../context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, Info, BarChart, Medal } from "lucide-react";
import { Car3d } from "./components/Car3d";
import HexagonChart from "./components/HexagonChart";
import { AnimatedRadarChart } from "@/app/components/Hexagon"; // Assurez-vous que le chemin est correct

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const Home: React.FC = () => {
  const { user, loading } = useContext(UserContext);
  const [stats, setStats] = useState([60, 70, 50, 80, 40, 60]);
  const [stats2, setStats2] = useState([40, 70, 80, 50, 100, 60]);

  /* eslint-disable */
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(stats.map((stat) => Math.floor(Math.random() * 100)));
      setStats2(stats2.map((stat) => Math.floor(Math.random() * 100)));
    }, 1000); // Update stats every 2 seconds

    return () => clearInterval(interval);
  }, []);
  /* eslint-enable */
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center space-x-6 mb-5 -mt-32">
        <div className="hidden lg:block flex-shrink-0 w-75 h-75 mt-32">
          <HexagonChart stats={stats} />
        </div>
        <div className="w-[400px] h-[400px]">
          <Canvas>
            <Environment preset="studio" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
            <perspectiveCamera />
            <Car3d />
          </Canvas>
        </div>
        <div className="hidden lg:block flex-shrink-0 w-75 h-75 mt-32">
          <HexagonChart stats={stats2} /> {/*peut être changer par un autre diagramme si on developpe le comosant*/}
        </div>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <Typewriter
            options={{
              strings: [
                "Le site de prédiction F1",
                "Anticipez les résultats",
                "Analysez les performances",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Découvrez les analyses et les prédictions en temps réel pour les
          courses de Formule 1.
        </p>

        {loading ? (
          <div className="animate-pulse bg-muted h-12 w-48 mx-auto rounded"></div>
        ) : user ? (
          <Card className="max-w-sm mx-auto bg-green-500 text-white">
            <CardHeader>
              <CardTitle>Bienvenue, {user.username} !</CardTitle>
              <CardDescription className="text-white">
                Vous êtes connecté.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Button asChild size="lg">
            <a href="/login">
              Se connecter <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2" /> À propos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>En savoir plus sur notre projet et notre équipe.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/about">
                En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Medal className="mr-2" /> Prédiction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nos prédictions en temps réel.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/prediction">
                Voir les prédictions <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2" /> Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Regarder les dernières analyses.</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/analyse">
                Voir les analyses <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
