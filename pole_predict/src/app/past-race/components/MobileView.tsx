import React, { useState } from "react";
import { motion } from "framer-motion";
import GrandPrixCard from "../../components/pastComponent/GrandPrixCard";
import DetailsCard from "../../components/pastComponent/DetailsCard";
import InformationsCard from "../../components/pastComponent/InformationsCard";
import ResultatsCard from "../../components/pastComponent/ResultatsCard";
import LocalisationCard from "../../components/pastComponent/LocalisationCard";
import ComparerPilotesCard from "../../components/pastComponent/ComparerPilotesCard";
import ComparerEcuriesCard from "../../components/pastComponent/ComparerEcuriesCard";
import Championship from "../../components/analysisComponent/Championship";
import F1GapAnalysis from "../../components/analysisComponent/F1GapAnalysis";
import F1LapAnalysis from "../../components/analysisComponent/F1LapAnalysis";
import SpeedVisualizer from "../../components/analysisComponent/SpeedVisualizer";
import StintVisualizer from "../../components/analysisComponent/StintVisualizer";
import { GP as ImportedGP, Driver, Team, GrandPrix } from "../../components/pastComponent/types";

// Interface étendue pour supporter l'API réelle utilisée dans le code
interface GP extends ImportedGP {
  sessionKey?: string;
}

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
  driverData: any;
  teamData: any;
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
  sessionKey: number | null;
  toggleTab: () => void;
  toggleTeamTab: () => void;
  isOpen: boolean;
  isTeamComparisonOpen: boolean;
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
  sessionKey,
  toggleTab,
  toggleTeamTab,
  isOpen,
  isTeamComparisonOpen
}) => {
  const [activeTab, setActiveTab] = useState('info');

  // Adapter coordinates pour le type attendu par LocalisationCard
  const adaptedCoordinates = coordinates 
    ? { 
        lat: coordinates.lat || 0, 
        lon: coordinates.lon || 0 
      } 
    : null;

  // Fonction pour obtenir la bonne sessionKey
  const getSessionKey = (gp: GP | null): number => {
    if (!gp) return 0;
    
    // Privilégier la propriété sessionKey qui est utilisée par les widgets
    if ('sessionKey' in gp && gp.sessionKey) {
      return parseInt(gp.sessionKey, 10);
    }
    
    // Fallback vers session_key si sessionKey n'existe pas
    if (gp.session_key) {
      return gp.session_key;
    }
    
    return 0;
  };
  
  // Intercepter handleGPSelect pour s'assurer que sessionKey est toujours présent
  const wrappedHandleGPSelect = async (gp: GP): Promise<void> => {
    // S'assurer que le GP a toujours une sessionKey
    if (gp.session_key && !gp.sessionKey) {
      // @ts-ignore - Ajouter dynamiquement sessionKey pour compatibilité
      gp.sessionKey = gp.session_key.toString();
    }
    
    handleGPSelect(gp);
  };

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
            mainGP={mainGP as any}
            allGPs={allGPs as any}
            selectedYear={selectedYear}
            showDropdown={showDropdown}
            hoveredCard={hoveredCard}
            setShowDropdown={setShowDropdown}
            setHoveredCard={setHoveredCard}
            handleGPSelect={wrappedHandleGPSelect as any}
            handleYearChange={handleYearChange}
          />
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex mb-4 border-b border-gray-800">
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'info'
                ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Information
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'analysis'
                ? 'text-[#5382ec] border-b-2 border-[#5382ec]'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'compare'
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
                gp={gp as any}
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
                coordinates={adaptedCoordinates}
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
                setIsMapVisible={setIsMapVisible}
              />
            </>
          )}

          {activeTab === 'analysis' && (
            <>
              {mainGP && (
                <>
                  <Championship meeting_name={mainGP.meeting_name} year={selectedYear.toString()} />
                  <F1GapAnalysis sessionKey={getSessionKey(mainGP)} lap={null as any} />
                  <F1LapAnalysis sessionKey={getSessionKey(mainGP)} lap={null as any} />
                  <SpeedVisualizer sessionKey={getSessionKey(mainGP)} lap={null as any} />
                  <StintVisualizer sessionKey={getSessionKey(mainGP)} lap={null as any} />
                </>
              )}
            </>
          )}

          {activeTab === 'compare' && (
            <>
              <ComparerPilotesCard
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
                toggleTab={toggleTab}
              />
              <ComparerEcuriesCard
                hoveredCard={hoveredCard}
                selectedTeam={null}
                setHoveredCard={setHoveredCard}
                toggleTeamTab={toggleTeamTab}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileView;