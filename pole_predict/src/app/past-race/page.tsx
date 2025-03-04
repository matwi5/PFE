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
  const [isOpen, setIsOpen] = useState(false);
  const [isTeamComparisonOpen, setIsTeamComparisonOpen] = useState(false);

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

  const toggleTab = () => setIsOpen(!isOpen);
  const toggleTeamTab = () => setIsTeamComparisonOpen(!isTeamComparisonOpen);

  const handleGPSelect = async (gp: GP) => {
    setMainGP(gp);
    setSelectedMeeting(gp);
    setShowDropdown(false);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
    setSelectedMeeting(null);
  };

  const isMobile = useIsMobile();
  const sessionKey = selectedMeeting?.meeting_key || null;

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
        {isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />}
        
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