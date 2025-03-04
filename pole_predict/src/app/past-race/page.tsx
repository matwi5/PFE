"use client";
import React, { useState } from "react";
import { useDataFetching } from "../components/pastComponent/dataFetching";
import { useIsMobile } from "./hooks/useIsMobile";
import DesktopView from "./components/DesktopView";
import MobileView from "./components/MobileView";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import ErrorDisplay from "./components/ui/ErrorDisplay";
import MapModal from "./components/modals/MapModal";
import ImageModal from "./components/modals/ImageModal";
import ComparisonModal from "../components/pastComponent/ComparisonModal";
import { Driver, Team, GP } from "../components/pastComponent/types";

// Interface pour adapter Meeting à GP
interface ExtendedGP extends GP {
  sessionKey?: string;
}

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
    coordinates
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
  const [isOpen, setIsOpen] = useState(false);
  const [isTeamComparisonOpen, setIsTeamComparisonOpen] = useState(false);

  console.log(selectedDriver)
  console.log(selectedTeam)
  console.log(isFlagAnimating)

  const formatDate = (date: string, offset: string) => {
    console.log(offset)
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

  const toggleTab = () => setIsOpen(!isOpen);
  const toggleTeamTab = () => setIsTeamComparisonOpen(!isTeamComparisonOpen);

  // Adapter le type de GP et Meeting
  const handleGPSelect = async (gp: ExtendedGP) => {
    setMainGP(gp);
    
    // Convertir GP en Meeting ou créer un Meeting à partir des données de GP
    // @ts-expect-error - Gérer l'incompatibilité de type ici
    setSelectedMeeting(gp);
    
    setShowDropdown(false);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
    setSelectedMeeting(null);
  };

  const isMobile = useIsMobile();
  
  // Convertir selectedMeeting en GP pour la compatibilité avec les composants
  const adaptedSelectedMeeting = selectedMeeting as unknown as ExtendedGP | null;
  
  // Extraire la clé de session en tenant compte des différences de structure entre Meeting et GP
  // Utiliser une assertion de type ou une approche indirecte pour éviter l'erreur TypeScript
  const sessionKey = selectedMeeting 
    ? ((selectedMeeting as any).session_key || (selectedMeeting as any).meeting_key)?.toString() || null
    : null;
  
  // Adapter les données pour les tableaux
  const driverDataArray = Object.values(driverData || {});
  const teamDataArray = Object.values(teamData || {});
  
  // Wrapper pour les fonctions de mise à jour des pilotes/équipes sélectionnés
  const handleSetSelectedDrivers = (drivers: { [key: number]: Driver | null }) => {
    // @ts-expect-error - Adapter la signature pour la compatibilité
    setSelectedDrivers(drivers);
  };
  
  const handleSetSelectedTeamsForComparison = (teams: { [key: number]: Team | null }) => {
    // @ts-expect-error - Adapter la signature pour la compatibilité
    setSelectedTeamsForComparison(teams);
  };

  const commonProps = {
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
    selectedMeeting: adaptedSelectedMeeting, // Utiliser la version adaptée
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
    isMapVisible,
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
    setIsFlagAnimating,
    gp,
    sessionKey,
    toggleTab,
    toggleTeamTab,
    isOpen,
    isTeamComparisonOpen
  };

  return (
    <div className="min-h-screen bg-[#1B1C1D]">
      <LoadingOverlay loading={loading} />
      <ErrorDisplay error={error} />
      
      <div className={loading ? "hidden" : "content-wrapper"}>
        {isMobile ? 
          <MobileView {...commonProps as any} /> : 
          <DesktopView {...commonProps as any} />
        }
        
        <MapModal 
          isMapVisible={isMapVisible} 
          coordinates={coordinates} 
          setIsMapVisible={setIsMapVisible} 
        />
        
        <ImageModal 
          isImageVisible={isImageVisible} 
          selectedImageUrl={selectedImageUrl} 
          setIsImageVisible={setIsImageVisible} 
        />
        
        <ComparisonModal
          isOpen={isOpen}
          isTeamComparisonOpen={isTeamComparisonOpen}
          toggleTab={toggleTab}
          toggleTeamTab={toggleTeamTab}
          drivers={drivers}
          teams={teams}
          selectedMeeting={adaptedSelectedMeeting}
          driverData={driverDataArray}
          teamData={teamDataArray}
          selectedDrivers={selectedDrivers}
          selectedTeamsForComparison={selectedTeamsForComparison}
          setSelectedDrivers={handleSetSelectedDrivers}
          setSelectedTeamsForComparison={handleSetSelectedTeamsForComparison}
        />
      </div>
    </div>
  );
};

export default GrandPrixCards;