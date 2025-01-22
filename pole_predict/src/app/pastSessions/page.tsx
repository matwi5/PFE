"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Map, MapPin, Info, Calendar, Medal, Globe, Trophy, Flag, Car } from "lucide-react";
import { FaUsers, FaBuilding, FaStar } from "react-icons/fa"; // Nouvelles icônes
import './style.css'; // Assurez-vous d'importer le fichier CSS

interface GP {
    circuit_key: number;
    circuit_short_name: string;
    country_code: string;
    country_key: number;
    country_name: string;
    date_start: string;
    dist_course: string;
    gmt_offset: string;
    location: string;
    long_circuit: string;
    meeting_code: string;
    meeting_key: number;
    meeting_name: string;
    nb_tours: number;
    podium: string[];
    qualif: string[];
    year: number;
    grand_prix: string;
}

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

const TeamDetailCard: React.FC<{ team: Team }> = ({ team }) => (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-300 hover:border-orange-500 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-12 gap-4">
            {/* Logo et nom de l'équipe */}
            <div className="col-span-12 flex flex-col items-center">
                <div className="flex items-center justify-center gap-4">
                    <img
                        src={team.logo_url}
                        alt={`${team.name} logo`}
                        className="w-20 h-20 object-contain"
                    />
                    <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                        {team.name}
                    </h2>
                </div>
            </div>

            {/* Informations principales */}
            <div className="col-span-12 grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
                    <p className="font-semibold mb-2" style={{ color: team.color }}>Base</p>
                    <div className="flex items-center gap-2">
                        <img
                            src={team.country_flag}
                            alt={`${team.country} flag`}
                            className="w-5 h-5"
                        />
                        <p className="text-white">{team.base}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700">
                    <p className="font-semibold mb-2" style={{ color: team.color }}>Team Principal</p>
                    <p className="text-white">{team.team_principal}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 col-span-2">
                    <p className="font-semibold mb-2" style={{ color: team.color }}>Power Unit</p>
                    <p className="text-white">{team.power_unit}</p>
                </div>
            </div>

            {/* Image de la voiture */}
            <div className="col-span-12">
                <div className="bg-gray-800 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700 text-center">
                    <p className="font-semibold mb-4" style={{ color: team.color }}>Car</p>
                    <img
                        src={team.car_image}
                        alt={`${team.name} car`}
                        className="w-80 mx-auto rounded-lg transition-transform duration-300 hover:scale-105"
                    />
                </div>
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
                        className="w-16 h-16"
                    />
                ))}
            </div>
        )}
    </div>
);

const GrandPrixCards = () => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allGPs, setAllGPs] = useState<GP[]>([]);
    const [mainGP, setMainGP] = useState<GP | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showAllPodium, setShowAllPodium] = useState(false);
    const [showAllQualif, setShowAllQualif] = useState(false);
    const [gp, setGP] = useState<GrandPrix[]>([]);
    const [isFlagAnimating, setIsFlagAnimating] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2023); // État pour l'année sélectionnée
    const [isImageVisible, setIsImageVisible] = useState(false); // État pour l'affichage de l'image en grand
    const [selectedImageUrl, setSelectedImageUrl] = useState(""); // URL de l'image sélectionnée

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gpsResponse, driversResponse, teamsResponse, gpResponse] = await Promise.all([
                    fetch('/api/pastseasons'),
                    fetch('/api/drivers'),
                    fetch('/api/teams'),
                    fetch('/api/gp')
                ]);

                if (!gpsResponse.ok) throw new Error('Erreur lors de la récupération des grands prix');
                if (!driversResponse.ok) throw new Error('Erreur lors de la récupération des pilotes');
                if (!teamsResponse.ok) throw new Error('Erreur lors de la récupération des équipes');
                if (!gpResponse.ok) throw new Error('Erreur lors de la récupération des infos des GP');

                const [gpsData, driversData, teamsData, GrandPData] = await Promise.all([
                    gpsResponse.json(),
                    driversResponse.json(),
                    teamsResponse.json(),
                    gpResponse.json(),
                ]);

                setAllGPs(gpsData.data);
                setDrivers(driversData.data);
                setTeams(teamsData.data);
                setGP(GrandPData.data);

                if (gpsData.data.length > 0) {
                    setMainGP(gpsData.data[0]);
                    await fetchCoordinates(gpsData.data[0].location + ", " + gpsData.data[0].country_name);
                }
            } catch (error) {
                setError("Impossible de récupérer les données.");
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchCoordinates = async (location: string) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
            const data = await response.json();
            if (data && data[0]) {
                setCoordinates({
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                });
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des coordonnées:", error);
        }
    };

    const formatDate = (date: string, offset: string) => {
        if (!date) return 'Date à venir';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleGPSelect = async (gp: GP) => {
        setMainGP(gp);
        setShowDropdown(false);
        await fetchCoordinates(gp.location + ", " + gp.country_name);
    };

    const handleDriverClick = (driverName: string) => {
        const driver = drivers.find(d => d.last_name === driverName);
        if (driver) {
            setSelectedDriver(driver);
        }
    };

    const handleTeamClick = (teamName: string) => {
        const team = teams.find(t => t.name === teamName);
        if (team) {
            setSelectedTeam(team);
        }
    };

    const getCircuitParticularites = (grandPrixName: string) => {
        const grandPrix = gp.find(g => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.particularites : '';
    };

    const getCircuitImageUrl = (grandPrixName: string) => {
        const grandPrix = gp.find(g => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.image_circuit : '';
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageVisible(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-black">
                <p className="text-white">Chargement des données...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64 bg-black">
                <p className="text-red-500">Erreur: {error}</p>
            </div>
        );
    }

    if (!mainGP) {
        return (
            <div className="flex justify-center items-center h-64 bg-black">
                <p className="text-white">Aucun Grand Prix disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen flex flex-col p-6">
            <h1 className="text-4xl font-bold text-white mb-4">{mainGP.meeting_name} ({mainGP.year})</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Première colonne: GRAND PRIX et DETAILS */}
                <div className="space-y-6">
                    <Card
                        className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 ${hoveredCard === 0 ? 'scale-105' : ''}`}
                        onMouseEnter={() => setHoveredCard(0)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Map className="mr-2" /> GRAND PRIX
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <div className="space-y-2">
                                <p className="text-xl font-bold">{mainGP.meeting_name} ({mainGP.year})</p>
                                <p className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {mainGP.location}, {mainGP.country_name}
                                </p>
                                <p className="text-sm text-orange-500">{mainGP.meeting_code}</p>
                            </div>
                            <div className="relative">
                                <select
                                    className="mt-4 border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 p-2 rounded"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                >
                                    <option value={2023}>2023</option>
                                    <option value={2024}>2024</option>
                                </select>
                                <Button
                                    variant="outline"
                                    className="mt-4 border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    Autre <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                {showDropdown && (
                                    <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-800 rounded shadow-lg">
                                        {allGPs
                                            .filter(gp => gp.year === selectedYear) // Filtrer par année sélectionnée
                                            .map((gp, index) => (
                                                <button
                                                    key={index}
                                                    className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors"
                                                    onClick={() => handleGPSelect(gp)}
                                                >
                                                    {gp.meeting_name} ({gp.year})
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 ${hoveredCard === 1 ? 'scale-105' : ''
                            }`}
                        onMouseEnter={() => setHoveredCard(1)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <Info className="mr-2" /> DETAILS
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-300">
                            <div className="space-y-2">
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-orange-500">Nombre de tours</p>
                                    <p className="text-lg">{mainGP.nb_tours}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-orange-500">Longueur du circuit</p>
                                    <p className="text-lg">{mainGP.long_circuit}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-orange-500">Distance de course</p>
                                    <p className="text-lg">{mainGP.dist_course}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Deuxième colonne: INFORMATIONS */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 2 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => setHoveredCard(2)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <Calendar className="mr-2" /> INFORMATIONS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        <div className="space-y-4">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-sm text-orange-500">Date et heure</p>
                                <p className="text-xl">{formatDate(mainGP.date_start, mainGP.gmt_offset)}</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-sm text-orange-500">Circuit</p>
                                <p className="text-xl">{mainGP.circuit_short_name}</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-sm text-orange-500">Particularités du circuit</p>
                                <p className="text-base leading-relaxed">
                                    {getCircuitParticularites(mainGP.grand_prix)}
                                </p>
                            </div>
                            <img
                                src={getCircuitImageUrl(mainGP.grand_prix)}
                                alt={`Circuit ${mainGP.circuit_short_name}`}
                                className="w-full h-56 object-cover rounded-lg border-2 border-orange-500 cursor-pointer"
                                onClick={() => handleImageClick(getCircuitImageUrl(mainGP.grand_prix))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Troisième colonne: RESULTATS */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 3 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => setHoveredCard(3)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <Medal className="mr-2" /> RESULTATS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-orange-500 mb-4">Podium</h3>
                                <Button
                                    variant="outline"
                                    className="border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                    onClick={() => setShowAllPodium(!showAllPodium)}
                                >
                                    {showAllPodium ? "Masquer le résultat" : "Afficher le résultat"}
                                </Button>
                            </div>
                            {mainGP?.podium ? (
                                <div className="space-y-2">
                                    {(showAllPodium ? mainGP.podium : mainGP.podium.slice(0, 3)).map((driverName, index) => {
                                        const driver = drivers.find(d => d.last_name === driverName);
                                        return (
                                            <button
                                                key={index}
                                                className="w-full bg-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-gray-700"
                                                onClick={() => handleDriverClick(driverName)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <img
                                                        src={driver?.headshot_url}
                                                        alt={`${driverName} headshot`}
                                                        className="w-10 h-10 rounded-full mr-2"
                                                    />
                                                    <span>
                                                        {index + 1}{index === 0 ? 'er' : 'ème'} : {driverName}
                                                    </span>
                                                    <span
                                                        className="text-sm italic text-orange-500 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTeamClick(driver?.team_name || '');
                                                        }}
                                                    >
                                                        {driver?.team_name}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500">Podium non disponible</p>
                            )}

                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-orange-500 mb-4">Qualification</h3>
                                <Button
                                    variant="outline"
                                    className="border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                    onClick={() => setShowAllQualif(!showAllQualif)}
                                >
                                    {showAllQualif ? "Masquer les qualifications" : "Afficher les qualifications"}
                                </Button>
                            </div>
                            {mainGP?.qualif ? (
                                <div className="space-y-2">
                                    {(showAllQualif ? mainGP.qualif : mainGP.qualif.slice(0, 3)).map((driverName, index) => {
                                        const driver = drivers.find(d => d.last_name === driverName);
                                        return (
                                            <button
                                                key={index}
                                                className="w-full bg-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-gray-700"
                                                onClick={() => handleDriverClick(driverName)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <img
                                                        src={driver?.headshot_url}
                                                        alt={`${driverName} headshot`}
                                                        className="w-10 h-10 rounded-full mr-2"
                                                    />
                                                    <span>
                                                        {index + 1}{index === 0 ? 'er' : 'ème'} : {driverName}
                                                    </span>
                                                    <span
                                                        className="text-sm italic text-orange-500 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTeamClick(driver?.team_name || '');
                                                        }}
                                                    >
                                                        {driver?.team_name}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500">Qualifications non disponibles</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Carte pour la localisation */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-[500px] ${hoveredCard === 4 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => setHoveredCard(4)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <Globe className="mr-2" /> LOCALISATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        {coordinates ? (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsMapVisible(true)}
                                    className="w-full transition-transform duration-300 hover:scale-105 focus:outline-none"
                                >
                                    <img
                                        src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates.lon},${coordinates.lat}&z=12&l=map&size=600,400&pt=${coordinates.lon},${coordinates.lat},pm2rdm`}
                                        alt="Circuit Location Map"
                                        className="w-full h-96 object-cover rounded-lg border-2 border-orange-500"
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-64">
                                <p>Chargement de la carte...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Nouvelle carte avec icône Users */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 5 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => setHoveredCard(5)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <FaUsers className="mr-2" /> COMPARER PILOTES
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                onClick={() => {
                                    // Logique pour comparer les pilotes
                                    alert("Comparer les pilotes");
                                }}
                            >
                                Comparer les pilotes
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Nouvelle carte avec icône Building */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 6 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => setHoveredCard(6)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <FaBuilding className="mr-2" /> COMPARER ECURIES
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                onClick={() => {
                                    // Logique pour comparer les écuries
                                    alert("Comparer les écuries");
                                }}
                            >
                                Comparer les écuries
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Nouvelle carte avec icône Star */}
                <Card
                    className={`transition-all duration-300 bg-gray-900 border border-gray-800 hover:border-orange-500 h-fit ${hoveredCard === 7 ? 'scale-105' : ''
                        }`}
                    onMouseEnter={() => {
                        setHoveredCard(7);
                        setIsFlagAnimating(true);
                    }}
                    onMouseLeave={() => {
                        setHoveredCard(null);
                        setIsFlagAnimating(false);
                    }}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center text-white">
                            <FaStar className="mr-2" /> MODE PRO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-300">
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="border border-white text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                                onClick={() => {
                                    // Logique pour le mode pro
                                    alert("Mode Pro activé");
                                }}
                            >
                                Activer le mode Pro
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {isMapVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
                    onClick={() => setIsMapVisible(false)}
                >
                    <div
                        className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
                            onClick={() => setIsMapVisible(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <Globe className="mr-2" /> Localisation du Grand Prix
                        </h2>
                        <div className="flex justify-center">
                            <img
                                src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates?.lon},${coordinates?.lat}&z=1&l=map&size=600,400&pt=${coordinates?.lon},${coordinates?.lat},pm2rdm`}
                                alt="Map of Circuit Location"
                                className="w-full h-96 object-cover rounded-lg border-2 border-orange-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {selectedDriver && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
                    onClick={() => setSelectedDriver(null)}
                >
                    <div
                        className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
                            onClick={() => setSelectedDriver(null)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <DriverDetailCard driver={selectedDriver} />
                    </div>
                </div>
            )}

            {selectedTeam && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
                    onClick={() => setSelectedTeam(null)}
                >
                    <div
                        className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
                            onClick={() => setSelectedTeam(null)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <TeamDetailCard team={selectedTeam} />
                    </div>
                </div>
            )}

            {isImageVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
                    onClick={() => setIsImageVisible(false)}
                >
                    <div
                        className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
                            onClick={() => setIsImageVisible(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImageUrl}
                            alt="Grand Prix Circuit"
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrandPrixCards;
