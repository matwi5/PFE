"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Info, BarChart, Medal } from "lucide-react";
import Typewriter from "typewriter-effect";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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

const GPDetailCard: React.FC<{ gp: GrandPrix }> = ({ gp }) => (
  <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 transition-all duration-300 hover:border-orange-500">
    <div className="flex flex-col items-center mb-6">
      <img
        src={gp.pays_flag}
        alt={`Drapeau ${gp.grand_prix}`}
        className="w-32 h-20 object-cover rounded-lg mb-4 border-2 border-orange-500"
      />
      <h2 className="text-3xl font-bold text-center text-white bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
        {gp.grand_prix}
      </h2>
      <p className="text-xl text-orange-400 mt-2">{gp.ville}</p>
    </div>

    <div className="my-6">
      <img
        src={gp.image_circuit}
        alt={`Circuit ${gp.grand_prix}`}
        className="w-full h-56 object-cover rounded-lg border-2 border-orange-500"
      />
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Nombre de tours</p>
        <p className="text-white text-2xl font-bold text-center">{gp.nombre_de_tours}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Record du circuit</p>
        <p className="text-white text-xl font-mono text-center">{gp.record_de_circuit}</p>
        <p className="text-sm text-gray-400 text-center mt-1">par {gp.recordman_circuit}</p>
      </div>

      <div className="col-span-2 bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Particularités</p>
        <p className="text-white">{gp.particularites}</p>
      </div>
    </div>
  </div>
);

const DriverDetailCard: React.FC<{ driver: Driver }> = ({ driver }) => (
  <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 transition-all duration-300 hover:border-orange-500">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-full"></div>
      <img
        src={driver.headshot_url}
        alt={`${driver.name} headshot`}
        className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-orange-500 transition-transform duration-300 hover:scale-105"
      />
    </div>
    <h2 className="text-3xl font-bold text-center mb-6 text-white bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
      {driver.name}
    </h2>
    <div className="grid grid-cols-2 gap-6 text-center">
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Équipe</p>
        <p className="text-white">{driver.team_name}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Numéro</p>
        <p className="text-white text-2xl font-bold">{driver.driver_number}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Nationalité</p>
        <div className="flex items-center justify-center gap-2">
          <img
            src={driver.flag_url}
            alt={`${driver.country_code} flag`}
            className="w-6 h-4"
          />
          <p className="text-white">{driver.country_code}</p>
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Code</p>
        <p className="text-white text-xl font-mono">{driver.broadcast_name}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Nombre de Victoires</p>
        <p className="text-white text-2xl font-bold">{driver.NumberOfVictories}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
        <p className="font-semibold text-orange-400 mb-2">Nombre de Podiums</p>
        <p className="text-white text-2xl font-bold">{driver.NumberOfPodiums}</p>
      </div>
    </div>
    {driver.WorldChampionships > 0 && (
      <div className="mt-4 flex justify-center flex-wrap gap-2">
        {Array.from({ length: driver.WorldChampionships }).map((_, index) => (
          <img
            key={index}
            src="/images/coupe.webp"
            alt={`Championship Trophy ${index + 1}`}
            className="w-20 h-20"
          />
        ))}
      </div>
    )}
  </div>
);

const TeamDetailCard: React.FC<{ team: Team }> = ({ team }) => (
  <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-300 hover:border-orange-500 w-full max-w-6xl mx-auto">
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 rounded-lg"></div>
          <img
            src={team.logo_url}
            alt={`${team.name} logo`}
          />
        </div>
        <h2
          className="text-xl font-bold text-center mt-4"
          style={{ color: team.color }}
        >
          {team.name}
        </h2>
      </div>

      <div className="col-span-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
            <p className="font-semibold mb-2" style={{ color: team.color }}>Base</p>
            <div className="flex items-center gap-2">
              <img src={team.country_flag} alt={`${team.country} flag`} className="w-6 h-6" />
              <p className="text-white">{team.base}</p>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
            <p className="font-semibold mb-2" style={{ color: team.color }}>Team Principal</p>
            <p className="text-white">{team.team_principal}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
          <p className="font-semibold mb-2" style={{ color: team.color }}>Power Unit</p>
          <p className="text-white">{team.power_unit}</p>
        </div>
      </div>

      <div className="col-span-12">
        <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
          <p className="font-semibold mb-4 text-center" style={{ color: team.color }}>Car</p>
          <img
            src={team.car_image}
            alt={`${team.name} car`}
            className="w-full rounded-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </div>
  </div>
);

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
  const [selectedYear, setSelectedYear] = useState<number>(2024); // État pour l'année sélectionnée
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);

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
      target.style.background =
        isEntering
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
    target.style.transform = isEntering ? "scale(1.05)" : "scale(1)";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <main className="flex flex-col items-center justify-center h-full">
        <div>
          <img
            src="/images/f1car.png"
            alt="F1 Car"
            className="w-96 mb-8"
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-8">
          <Typewriter
            options={{
              strings: [
                "Ready to be an expert in Formula 1?",
                "Anticipate Results",
                "Analyse performances",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </h1>

        <div className="flex gap-4">
          {[
            { text: "PAST", link: "/pastSessions" },
            { text: "UPCOMING", link: "/upcomingSessions" },
            { text: "LIVE", link: "/liveSessions" },
            { text: "ABOUT US", link: "/about" }
          ].map(({ text, link }, index) => (
            <Button key={index} asChild size="lg" className="mt-8 px-6 py-2 border border-white rounded-lg transition-all duration-300 hover:bg-orange-500 hover:text-black hover:scale-110">
              <a href={link}>
                → {text}
              </a>
            </Button>
          ))}
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
        {[
          {
            icon: <Info className="mr-2" />,
            title: "Grand Prix",
            content: "Know more about Grand Prix",
            onClick: () => setShowGPs(!showGPs),
            linkText: "See GPs",
          },
          {
            icon: <Medal className="mr-2" />,
            title: "Teams",
            content: "Infos about the teams on the grid",
            onClick: () => setShowTeams(!showTeams),
            linkText: "See Teams",
          },
          {
            icon: <BarChart className="mr-2" />,
            title: "Pilotes",
            content: "Have a look on the pilotes",
            onClick: () => setShowDrivers(!showDrivers),
            linkText: "See Pilotes",
          },
        ].map((card, index) => (
          <div key={index}>
            <Card
              className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 ${hoveredCard === index ? 'scale-105' : ''}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-white">
                  {card.icon} {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{card.content}</p>
                <div className="flex items-center mt-4">
                  {index === 2 && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="p-2 bg-gray-800 text-white border border-white rounded mr-2"
                    >
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                    </select>
                  )}
                  <Button
                    variant="outline"
                    onClick={card.onClick}
                    onMouseEnter={() => setHoveredButton(index)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={{
                      background: hoveredButton === index ? 'orange' : 'transparent',
                      color: 'white',
                      border: '1px solid white',
                      transition: 'background 0.3s, color 0.3s',
                      ...(hoveredButton === index && { color: 'black' }),
                    }}
                  >
                    {card.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {index === 0 && showGPs && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {gp.length > 0 ? (
                  gp.map((gp, gpIndex) => (
                    <Dialog key={gpIndex}>
                      <DialogTrigger asChild>
                        <button
                          style={{
                            ...buttonStyle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            minWidth: '150px'
                          }}
                          onMouseEnter={(e) => getHoverStyles(e, true)}
                          onMouseLeave={(e) => getHoverStyles(e, false)}
                        >
                          <img
                            src={gp.pays_flag}
                            alt={gp.grand_prix}
                            className="w-5 h-5 mr-2"
                          />
                          {gp.grand_prix}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-transparent border-none">
                        <GPDetailCard gp={gp} />
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p>Loading grands prix...</p>
                )}
              </div>
            )}

            {index === 1 && showTeams && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                {teams.length > 0 ? (
                  teams.map((team, teamIndex) => (
                    <Dialog key={teamIndex}>
                      <DialogTrigger asChild>
                        <button
                          style={buttonStyle}
                          onMouseEnter={(e) => getHoverStyles(e, true, [team.color])}
                          onMouseLeave={(e) => getHoverStyles(e, false)}
                        >
                          <img
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            className="w-5 h-5 mr-2"
                          />
                          {team.name}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-transparent border-none">
                        <TeamDetailCard team={team} />
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p>Loading teams...</p>
                )}
              </div>
            )}

            {index === 2 && showDrivers && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver, driverIndex) => (
                    <Dialog key={driverIndex}>
                      <DialogTrigger asChild>
                        <button
                          style={{
                            ...buttonStyle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.5rem',
                            minWidth: '150px'
                          }}
                          onMouseEnter={(e) => getHoverStyles(e, true, driver.flagColors)}
                          onMouseLeave={(e) => getHoverStyles(e, false)}
                        >
                          <img
                            src={driver.headshot_url}
                            alt={`${driver.name} headshot`}
                            className="w-5 h-5 mr-2 rounded-full"
                          />
                          {driver.name}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-transparent border-none">
                        <DriverDetailCard driver={driver} />
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <p>Loading drivers...</p>
                )}
              </div>
            )}

          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
