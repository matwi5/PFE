"use client";

import React, { useState, useEffect } from "react";
import { Info, BarChart, Medal } from "lucide-react";
import Typewriter from "typewriter-effect";
import { motion, AnimatePresence } from "framer-motion";
import CustomDialog from "./components/generalDataComponent/CustomDialog";
import GeneralDataCard from "./components/generalDataComponent/GeneralDataCard";
import GPDetailCard from "./components/generalDataComponent/GPDetailCard";
import DriverDetailCard from "./components/generalDataComponent/DriverDetailCard";
import TeamDetailCard from "./components/generalDataComponent/TeamDetailCard";
import { motion as m } from "framer-motion";

interface Driver {
  flagColors: string[];
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  headshot_url: string;
  last_name: string;
  team_name: string;
  team_colour: string;
  name: string;
  flag_url: string;
  year: number[];
  NumberOfPodiums: number;
  NumberOfVictories: number;
  WorldChampionships: number;
}

interface Team {
  name: string;
  color: string;
  logo_url: string;
  base: string;
  team_principal: string;
  championships: number;
  power_unit: string;
  country: string;
  country_flag: string;
  pilote1_url: string;
  pilote2_url: string;
  car_image: string;
}

interface GrandPrix {
  grand_prix: string;
  pays_flag: string;
  ville: string;
  nombre_de_tours: number;
  particularites: string;
  record_de_circuit: string;
  recordman_circuit: string;
  image_circuit: string;
}

const HomePage: React.FC = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showTeams, setShowTeams] = useState(false);
  const [showGPs, setShowGPs] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gp, setGP] = useState<GrandPrix[]>([]);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringCardIndex, setIsHoveringCardIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driversResponse = await fetch('/api/drivers');
        if (!driversResponse.ok) throw new Error('Erreur lors de la récupération des pilotes');
        const driversData = await driversResponse.json();
        setDrivers(driversData.data);

        const teamsResponse = await fetch('/api/teams');
        if (!teamsResponse.ok) throw new Error('Erreur lors de la récupération des équipes');
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.data);

        const gpsResponse = await fetch('/api/gp');
        if (!gpsResponse.ok) throw new Error('Erreur lors de la récupération des grands prix');
        const gpsData = await gpsResponse.json();
        setGP(gpsData.data);

      } catch (error) {
        setError("Impossible de récupérer les données.");
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      Array.isArray(driver.year) && driver.year.includes(selectedYear)
    );
    setFilteredDrivers(filtered);
  }, [drivers, selectedYear]);

  const buttonStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid white",
    color: "white",
    padding: "0.5rem 1rem",
    margin: "0.25rem",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s, color 0.3s, transform 0.3s",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getHoverStyles = (
    e: React.MouseEvent<HTMLButtonElement>,
    isEntering: boolean,
    customColors?: string[]
  ) => {
    const target = e.currentTarget;
    if (customColors && customColors.length > 1) {
      target.style.background = isEntering
        ? `linear-gradient(to right, ${customColors.join(", ")})`
        : "none";
      target.style.color = "white";
    } else if (customColors && customColors.length === 1) {
      target.style.background = isEntering ? customColors[0] : "none";
      target.style.color = customColors[0] === "#FFFFFF" ? "black" : "white";
    } else {
      target.style.background = isEntering ? "orange" : "none";
      target.style.color = isEntering ? "black" : "white";
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
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

  const cardData = [
    {
      icon: <Info className="mr-2" />,
      title: "GRAND PRIX",
      content: "Know more about Grand Prix",
      onClick: () => setShowGPs(!showGPs),
      linkText: "See GPs",
      showList: showGPs,
      data: gp,
      DetailComponent: GPDetailCard,
      customColors: [],
    },
    {
      icon: <Medal className="mr-2" />,
      title: "TEAMS",
      content: "Infos about the teams on the grid",
      onClick: () => setShowTeams(!showTeams),
      linkText: "See Teams",
      showList: showTeams,
      data: teams,
      DetailComponent: TeamDetailCard,
      customColors: [],
    },
    {
      icon: <BarChart className="mr-2" />,
      title: "DRIVERS",
      content: "Have a look on the drivers",
      onClick: () => setShowDrivers(!showDrivers),
      linkText: "See Drivers",
      showList: showDrivers,
      data: filteredDrivers,
      DetailComponent: DriverDetailCard,
      customColors: [],
    },
  ];

  // Variantes d'animation modifiées
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const mobileCardListVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-16 px-4 sm:py-24 sm:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main
        className="flex flex-col items-center justify-center h-full"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="w-full max-w-[90vw] sm:max-w-[40rem] mx-auto"
        >
          <img
            src="/images/f1car.png"
            alt="F1 Car"
            className="w-full mb-12 sm:mb-20 transition-transform duration-500 hover:scale-110"
          />
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "Ready to be an expert in F1?", 
                "Anticipate Results",
                "Analyse performances",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>
      </motion.main>

      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 max-w-6xl mx-auto"
        variants={containerVariants}
      >
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col"
          >
            <GeneralDataCard
              icon={card.icon}
              title={card.title}
              content={card.content}
              linkText={card.linkText}
              onClick={card.onClick}
              index={index}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              isHoveringCardIndex={isHoveringCardIndex}
              setIsHoveringCardIndex={setIsHoveringCardIndex}
              handleMouseMove={handleMouseMove}
              mousePos={mousePos}
            />

            <AnimatePresence>
              {card.showList && (
                <motion.div
                  variants={mobileCardListVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-hidden w-full"
                >
                  {card.data.length > 0 ? (
                    card.data.map((item, itemIndex) => (
                      <CustomDialog
                        key={itemIndex}
                        buttonStyle={{
                          ...buttonStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.75rem",
                          width: "100%",
                          height: "auto",
                          minHeight: "3rem",
                          margin: "0 auto",
                        }}
                        getHoverStyles={getHoverStyles}
                        triggerContent={
                          <div className="w-full flex flex-col items-center gap-2 text-sm sm:text-base px-2">
                            <img
                              src={index === 0 ? item.pays_flag :
                                index === 1 ? item.logo_url :
                                  item.headshot_url}
                              alt={index === 0 ? item.grand_prix :
                                index === 1 ? `${item.name} logo` :
                                  `${item.name} headshot`}
                              className={`w-5 h-5 ${index === 2 ? 'rounded-full' : ''} mb-1`}
                            />
                            <span className="text-center break-words">
                              {index === 0 ? item.grand_prix :
                                index === 1 ? item.name :
                                  item.name}
                            </span>
                          </div>
                        }
                        customColors={
                          index === 1 ? [item.color] :
                            index === 2 ? item.flagColors :
                              undefined
                        }
                      >
                        <card.DetailComponent
                          {...{ [index === 0 ? "gp" : index === 1 ? "team" : "driver"]: item }}
                        />
                      </CustomDialog>
                    ))
                  ) : (
                    <motion.p
                      variants={itemVariants}
                      className="col-span-full text-center py-4"
                    >
                      Loading {card.title.toLowerCase()}...
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.section>
    </motion.div>
  );
};

export default HomePage;