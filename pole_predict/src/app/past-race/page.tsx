/* eslint-disable */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Globe} from "lucide-react";
import { motion } from "framer-motion";

import GrandPrixCard from "../components/pastComponent/GrandPrixCard";
import DetailsCard from "../components/pastComponent/DetailsCard";
import InformationsCard from "../components/pastComponent/InformationsCard";
import ResultatsCard from "../components/pastComponent/ResultatsCard";
import LocalisationCard from "../components/pastComponent/LocalisationCard";
import ComparerPilotesCard from "../components/pastComponent/ComparerPilotesCard";
import ComparerEcuriesCard from "../components/pastComponent/ComparerEcuriesCard";
import ComparisonModal from "../components/pastComponent/ComparisonModal";
import Championship from "../components/analysisComponent/Championship";
import F1GapAnalysis from "../components/analysisComponent/F1GapAnalysis";
import F1LapAnalysis from "../components/analysisComponent/F1LapAnalysis";
import SpeedVisualizer from "../components/analysisComponent/SpeedVisualizer";
import StintVisualizer from "../components/analysisComponent/StintVisualizer";

import { useDataFetching } from "../components/pastComponent/dataFetching";
import { GP, Driver, Team } from "../components/pastComponent/types";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // Return false during SSR, actual value after mount
    return hasMounted ? isMobile : false;
};

interface MobileViewProps {
    mainGP: GP | null;
    allGPs: GP[];
    selectedYear: number;
    showDropdown: boolean;
    hoveredCard: number | null;
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    setHoveredCard: React.Dispatch<React.SetStateAction<number | null>>;
    handleGPSelect: (gp: GP) => void;
    handleYearChange: (year: string) => void;
    drivers: Driver[];
    teams: Team[];
    selectedMeeting: GP | null;
    driverData: any; // Replace 'any' with a more specific type if possible
    teamData: any;   // Replace 'any' with a more specific type if possible
    selectedDrivers: Driver[];
    selectedTeamsForComparison: Team[];
    setSelectedDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    setSelectedTeamsForComparison: React.Dispatch<React.SetStateAction<Team[]>>;
    coordinates: { lat: number | null; lon: number | null } | null;
    setIsMapVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isImageVisible: boolean;
    selectedImageUrl: string;
    setIsImageVisible: React.Dispatch<React.SetStateAction<boolean>>;
    formatDate: (date: string, offset: string) => string;
    getCircuitParticularites: (grandPrixName: string) => string;
    getCircuitImageUrl: (grandPrixName: string) => string;
    handleImageClick: (imageUrl: string) => void;
    handleDriverClick: (driverName: string) => void;
    handleTeamClick: (teamName: string) => void;
    showAllPodium: boolean;
    showAllQualif: boolean;
    setShowAllPodium: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAllQualif: React.Dispatch<React.SetStateAction<boolean>>;
    isMapVisible: boolean;
    setIsFlagAnimating: React.Dispatch<React.SetStateAction<boolean>>;
    gp: GP[];
    sessionKey: number | null; // Ajout de sessionKey aux props
}

const MobileView: React.FC<MobileViewProps> = ({
    mainGP,
    allGPs,
    selectedYear,
    showDropdown,
    hoveredCard,
    setShowDropdown,
    setHoveredCard,
    handleGPSelect,
    handleYearChange,
    drivers,
    teams,
    selectedMeeting,
    driverData,
    teamData,
    selectedDrivers,
    selectedTeamsForComparison,
    setSelectedDrivers,
    setSelectedTeamsForComparison,
    coordinates,
    setIsMapVisible,
    isImageVisible,
    selectedImageUrl,
    setIsImageVisible,
    formatDate,
    getCircuitParticularites,
    getCircuitImageUrl,
    handleImageClick,
    handleDriverClick,
    handleTeamClick,
    showAllPodium,
    showAllQualif,
    setShowAllPodium,
    setShowAllQualif,
    isMapVisible,
    setIsFlagAnimating,
    gp,
    sessionKey // sessionKey récupéré des props
}) => {
    const [activeTab, setActiveTab] = useState('info');
    const [isOpen, setIsOpen] = useState(false); // Etat pour la modale de comparaison Pilotes
    const [isTeamComparisonOpen, setIsTeamComparisonOpen] = useState(false); // Etat pour la modale de comparaison Teams
    const toggleTab = () => setIsOpen(!isOpen); // Fonction pour ouvrir/fermer la modale Pilotes
    const toggleTeamTab = () => setIsTeamComparisonOpen(!isTeamComparisonOpen); // Fonction pour ouvrir/fermer la modale Teams

    return (
        <div className="min-h-screen bg-[#1B1C1D]">
            <div className="container mx-auto px-4 py-16">
                {/* Header section - simplified for mobile */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 space-y-4"
                >
                    <div className="relative flex justify-center items-center gap-4">
                        <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
                            Past Seasons
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
                        Explore historical Formula 1 Grand Prix data, results, and
                        comparisons.
                    </p>
                </motion.div>

                {/* Grand Prix Selection - Full width on mobile */}
                <div className="mb-8">
                    <GrandPrixCard
                        mainGP={mainGP}
                        allGPs={allGPs}
                        selectedYear={selectedYear}
                        showDropdown={showDropdown}
                        hoveredCard={hoveredCard}
                        setShowDropdown={setShowDropdown}
                        setHoveredCard={setHoveredCard}
                        handleGPSelect={handleGPSelect}
                        handleYearChange={handleYearChange}
                    />
                </div>

                {/* Mobile Navigation Tabs */}
                <div className="flex mb-4 border-b border-gray-800">
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'info'
                            ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
                            : 'text-gray-400'
                            }`}
                        onClick={() => setActiveTab('info')}
                    >
                        Information
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'analysis'
                            ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
                            : 'text-gray-400'
                            }`}
                        onClick={() => setActiveTab('analysis')}
                    >
                        Analysis
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium ${activeTab === 'compare'
                            ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
                            : 'text-gray-400'
                            }`}
                        onClick={() => setActiveTab('compare')}
                    >
                        Compare
                    </button>
                </div>

                {/* Content based on active tab */}
                <div className="space-y-4">
                    {activeTab === 'info' && (
                        <>
                            <DetailsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                            />
                            <InformationsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                gp={gp}
                                setHoveredCard={setHoveredCard}
                                formatDate={formatDate}
                                getCircuitParticularites={getCircuitParticularites}
                                getCircuitImageUrl={getCircuitImageUrl}
                                handleImageClick={handleImageClick}
                            />
                            <ResultatsCard
                                mainGP={mainGP}
                                drivers={drivers}
                                hoveredCard={hoveredCard}
                                showAllPodium={showAllPodium}
                                showAllQualif={showAllQualif}
                                setHoveredCard={setHoveredCard}
                                setShowAllPodium={setShowAllPodium}
                                setShowAllQualif={setShowAllQualif}
                                handleDriverClick={handleDriverClick}
                                handleTeamClick={handleTeamClick}
                            />
                            <LocalisationCard
                                coordinates={coordinates}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                setIsMapVisible={setIsMapVisible}
                            />
                        </>
                    )}

                    {activeTab === 'analysis' && (
                        <>
                            <Championship meeting_name={mainGP.meeting_name} year={selectedYear.toString()} />
                            <F1GapAnalysis sessionKey={mainGP.sessionKey} lap={null} />
                            <F1LapAnalysis sessionKey={mainGP.sessionKey} lap={null} />
                            <SpeedVisualizer sessionKey={mainGP.sessionKey} lap={null} />
                            <StintVisualizer sessionKey={mainGP.sessionKey} lap={null} />
                        </>
                    )}

                    {activeTab === 'compare' && (
                        <>
                            <ComparerPilotesCard
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                toggleTab={toggleTab} // Passe la fonction pour ouvrir la modale Pilotes
                            />
                            <ComparerEcuriesCard
                                hoveredCard={hoveredCard}
                                selectedTeam={null}
                                setHoveredCard={setHoveredCard}
                                toggleTeamTab={toggleTeamTab} // Passe la fonction pour ouvrir la modale Teams
                            />
                        </>
                    )}
                </div>

                {isMapVisible && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 map-modal"
                        onClick={() => setIsMapVisible(false)}
                    >
                        <div
                            className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 map-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 6L6 18M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                <Globe className="mr-2 icon-widget" /> Localisation du Grand
                                Prix
                            </h2>
                            <div className="flex justify-center">
                                <img
                                    src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates?.lon},${coordinates?.lat}&z=1&l=map&size=600,400&pt=${coordinates?.lon},${coordinates?.lat},pm2rdm`}
                                    alt="Map of Circuit Location"
                                    className="w-full h-96 object-cover rounded-lg border-2 border-[#5382ec] map-popup-image icon-widget"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {isImageVisible && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 image-modal"
                        onClick={() => setIsImageVisible(false)}
                    >
                        <div
                            className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 image-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 6L6 18M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                Circuit of the Grand Prix
                            </h2>
                            <img
                                src={selectedImageUrl}
                                alt="Grand Prix Circuit"
                                className="w-full h-full object-cover rounded-lg circuit-popup-image icon-widget border-2 border-[#5382ec]"
                            />
                        </div>
                    </div>
                )}

                {/* Utilisation du composant ComparisonModal */}
                <ComparisonModal
                    isOpen={isOpen}
                    isTeamComparisonOpen={isTeamComparisonOpen}
                    toggleTab={toggleTab}
                    toggleTeamTab={toggleTeamTab}
                    drivers={drivers}
                    teams={teams}
                    selectedMeeting={selectedMeeting}
                    driverData={driverData}
                    teamData={teamData}
                    selectedDrivers={selectedDrivers}
                    selectedTeamsForComparison={selectedTeamsForComparison}
                    setSelectedDrivers={setSelectedDrivers}
                    setSelectedTeamsForComparison={setSelectedTeamsForComparison}
                />
            </div>
        </div>
    );
};

const GrandPrixCards = () => {
    const {
        allGPs,
        gp,
        mainGP,
        loading,
        error,
        drivers,
        teams,
        selectedYear,
        meetings,
        selectedMeeting,
        driverData,
        teamData,
        selectedDrivers,
        selectedTeamsForComparison,
        setMainGP,
        setSelectedMeeting,
        setSelectedYear,
        setSelectedDrivers,
        setSelectedTeamsForComparison,
        availableYears,
        setAvailableYears,
        setMeetings,
        setDrivers,
        coordinates,
        fetchCoordinates
    } = useDataFetching();

    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showAllPodium, setShowAllPodium] = useState(false);
    const [showAllQualif, setShowAllQualif] = useState(false);
    const [isFlagAnimating, setIsFlagAnimating] = useState(false);
    const [isImageVisible, setIsImageVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");

    const [isOpen, setIsOpen] = useState(false); // Etat pour la modale de comparaison Pilotes
    const [isTeamComparisonOpen, setIsTeamComparisonOpen] = useState(false); // Etat pour la modale de comparaison Teams
    const [comparisonType, setComparisonType] = useState("driver");
    const [isDropdownOpenMeeting, setIsDropdownOpenMeeting] = useState<boolean>(
        false
    );
    const [averageSector1, setAverageSector1] = useState<number | null>(null);
    const [sessionDuration, setSessionDuration] = useState<string | null>(null);
    const [selectedMeetingIndex, setSelectedMeetingIndex] = useState<number>(0);
    const [isDropdownOpenYear, setIsDropdownOpenYear] = useState<boolean>(false);
    const isMobile = useIsMobile();

    const formatDate = (date: string, offset: string) => {
        if (!date) return "Date à venir";
        const d = new Date(date);
        return d.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDriverClick = (driverName: string) => {
        const driver = drivers.find((d) => d.last_name === driverName);
        if (driver) {
            setSelectedDriver(driver);
        }
    };

    const handleTeamClick = (teamName: string) => {
        const team = teams.find((t) => t.name === teamName);
        if (team) {
            setSelectedTeam(team);
        }
    };

    const getCircuitParticularites = (grandPrixName: string) => {
        const grandPrix = gp.find((g) => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.particularites : "";
    };

    const getCircuitImageUrl = (grandPrixName: string) => {
        const grandPrix = gp.find((g) => g.grand_prix === grandPrixName);
        return grandPrix ? grandPrix.image_circuit : "";
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageVisible(true);
    };

    const toggleTab = () => setIsOpen(!isOpen); // Fonction pour ouvrir/fermer la modale Pilotes
    const toggleTeamTab = () => setIsTeamComparisonOpen(!isTeamComparisonOpen); // Fonction pour ouvrir/fermer la modale Teams

    const toggleDropdownMeeting = () => {
        setIsDropdownOpenMeeting(!isDropdownOpenMeeting);
    };
    const toggleDropdownYear = () => {
        setIsDropdownOpenYear(!isDropdownOpenYear);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(Number(year));
        setSelectedMeeting(null);
        toggleDropdownYear();
    };

    const handleGPSelect = async (gp: GP) => {
        setMainGP(gp);
        setSelectedMeeting(gp);
        setShowDropdown(false);
    };

    const getComparisonStyle = (
        value1: number,
        value2: number,
        isHigherBetter: boolean
    ) => {
        if (value1 === null || value2 === null) return {};

        if (isHigherBetter) {
            return value1 > value2 ? { color: "green" } : { color: "red" };
        } else {
            return value1 < value2 ? { color: "green" } : { color: "red" };
        }
    };

    const LoadingOverlay = () => {
        if (!loading) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#282a2c] p-6 rounded-lg shadow-xl">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-[#5382ec]" />
                        <p className="text-white">Chargement des données...</p>
                    </div>
                </div>
            </div>
        );
    };

    const ErrorDisplay = () => {
        if (!error) return null;

        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Alert className="mb-2 bg-red-900/90 text-white border-red-700">
                    <AlertTitle className="text-white">Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    };

    // Assuming sessionKey should be derived from selectedMeeting.meeting_key
    const sessionKey = selectedMeeting?.meeting_key || null;

    if (isMobile) {
        return (
            <MobileView
                mainGP={mainGP}
                allGPs={allGPs}
                selectedYear={selectedYear}
                showDropdown={showDropdown}
                hoveredCard={hoveredCard}
                setShowDropdown={setShowDropdown}
                setHoveredCard={setHoveredCard}
                handleGPSelect={handleGPSelect}
                handleYearChange={handleYearChange}
                drivers={drivers}
                teams={teams}
                selectedMeeting={selectedMeeting}
                driverData={driverData}
                teamData={teamData}
                selectedDrivers={selectedDrivers}
                selectedTeamsForComparison={selectedTeamsForComparison}
                setSelectedDrivers={setSelectedDrivers}
                setSelectedTeamsForComparison={setSelectedTeamsForComparison}
                coordinates={coordinates}
                setIsMapVisible={setIsMapVisible}
                isImageVisible={isImageVisible}
                selectedImageUrl={selectedImageUrl}
                setIsImageVisible={setIsImageVisible}
                isMapVisible={isMapVisible}
                formatDate={formatDate}
                getCircuitParticularites={getCircuitParticularites}
                getCircuitImageUrl={getCircuitImageUrl}
                handleImageClick={handleImageClick}
                handleDriverClick={handleDriverClick}
                handleTeamClick={handleTeamClick}
                showAllPodium={showAllPodium}
                showAllQualif={showAllQualif}
                setShowAllPodium={setShowAllPodium}
                setShowAllQualif={setShowAllQualif}
                setIsFlagAnimating={setIsFlagAnimating}
                gp={gp}
                sessionKey={sessionKey} // Passer sessionKey à MobileView
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#1B1C1D]">
            <LoadingOverlay />
            <ErrorDisplay />
            <div className={loading ? "hidden" : "content-wrapper"}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 container mx-auto px-4 py-16"
                >
                    <div className="relative flex justify-center items-center gap-4">
                        <h1 className="text-4xl h-20 md:text-6xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
                            Past Seasons
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto text-center">
                        Explore historical Formula 1 Grand Prix data, results, and
                        comparisons.
                    </p>
                </motion.div>

                {/* Section de sélection du Grand Prix */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center w-full"
                >
                    <GrandPrixCard
                        mainGP={mainGP}
                        allGPs={allGPs}
                        selectedYear={selectedYear}
                        showDropdown={showDropdown}
                        hoveredCard={hoveredCard}
                        setShowDropdown={setShowDropdown}
                        setHoveredCard={setHoveredCard}
                        handleGPSelect={handleGPSelect}
                        handleYearChange={handleYearChange}
                    />
                </motion.div>

                <div className="container mx-auto px-4 py-16">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <DetailsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <InformationsCard
                                mainGP={mainGP}
                                hoveredCard={hoveredCard}
                                gp={gp}
                                setHoveredCard={setHoveredCard}
                                formatDate={formatDate}
                                getCircuitParticularites={getCircuitParticularites}
                                getCircuitImageUrl={getCircuitImageUrl}
                                handleImageClick={handleImageClick}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <LocalisationCard
                                coordinates={coordinates}
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                setIsMapVisible={setIsMapVisible}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ResultatsCard
                                mainGP={mainGP}
                                drivers={drivers}
                                hoveredCard={hoveredCard}
                                showAllPodium={showAllPodium}
                                showAllQualif={showAllQualif}
                                setHoveredCard={setHoveredCard}
                                setShowAllPodium={setShowAllPodium}
                                setShowAllQualif={setShowAllQualif}
                                handleDriverClick={handleDriverClick}
                                handleTeamClick={handleTeamClick}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            {mainGP && <StintVisualizer sessionKey={mainGP.sessionKey} lap={null}/>}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ComparerPilotesCard
                                hoveredCard={hoveredCard}
                                setHoveredCard={setHoveredCard}
                                toggleTab={toggleTab} // Passe la fonction pour ouvrir la modale Pilotes
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            <ComparerEcuriesCard
                                hoveredCard={hoveredCard}
                                selectedTeam={selectedTeam}
                                setHoveredCard={setHoveredCard}
                                toggleTeamTab={toggleTeamTab}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            {mainGP && selectedYear && <Championship meeting_name={mainGP.meeting_name} year={selectedYear.toString()}/>}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            {mainGP && <F1GapAnalysis sessionKey={mainGP.sessionKey} lap={null} />}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            {mainGP && <F1LapAnalysis sessionKey={mainGP.sessionKey} lap={null} />}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="break-inside-avoid"
                        >
                            {mainGP && <SpeedVisualizer sessionKey={mainGP.sessionKey} lap={null} />}
                        </motion.div>
                    </div>

                    {isMapVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 map-modal"
                            onClick={() => setIsMapVisible(false)}
                        >
                            <div
                                className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 map-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
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
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M18 6L6 18M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                    <Globe className="mr-2 icon-widget" /> Localisation du Grand
                                    Prix
                                </h2>
                                <div className="flex justify-center">
                                    <img
                                        src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${coordinates?.lon},${coordinates?.lat}&z=1&l=map&size=600,400&pt=${coordinates?.lon},${coordinates?.lat},pm2rdm`}
                                        alt="Map of Circuit Location"
                                        className="w-full h-96 object-cover rounded-lg border-2 border-[#5382ec] map-popup-image icon-widget"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isImageVisible && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 image-modal"
                            onClick={() => setIsImageVisible(false)}
                        >
                            <div
                                className="relative max-w-5xl w-full bg-[#282a2c] border border-gray-800 rounded-lg overflow-hidden p-4 image-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors modal-close-button icon-widget"
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
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M18 6L6 18M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center modal-title">
                                    Circuit of the Grand Prix
                                </h2>
                                <img
                                    src={selectedImageUrl}
                                    alt="Grand Prix Circuit"
                                    className="w-full h-full object-cover rounded-lg circuit-popup-image icon-widget border-2 border-[#5382ec]"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* Utilisation du composant ComparisonModal */}
                <ComparisonModal
                    isOpen={isOpen}
                    isTeamComparisonOpen={isTeamComparisonOpen}
                    toggleTab={toggleTab}
                    toggleTeamTab={toggleTeamTab}
                    drivers={drivers}
                    teams={teams}
                    selectedMeeting={selectedMeeting}
                    driverData={driverData}
                    teamData={teamData}
                    selectedDrivers={selectedDrivers}
                    selectedTeamsForComparison={selectedTeamsForComparison}
                    setSelectedDrivers={setSelectedDrivers}
                    setSelectedTeamsForComparison={setSelectedTeamsForComparison}
                />
            </div>
        </div>
    );
};

export default GrandPrixCards;