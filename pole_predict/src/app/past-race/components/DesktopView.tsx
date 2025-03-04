import React from "react";
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
import { GP, Driver, Team } from "../../components/pastComponent/types";

interface DesktopViewProps {
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

const DesktopView: React.FC<DesktopViewProps> = ({
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
  return (
    <>
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
            {mainGP && <StintVisualizer sessionKey={mainGP.sessionKey} lap={null} />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="break-inside-avoid"
          >
            <ComparerPilotesCard
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              toggleTab={toggleTab}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="break-inside-avoid"
          >
            <ComparerEcuriesCard
              hoveredCard={hoveredCard}
              selectedTeam={null}
              setHoveredCard={setHoveredCard}
              toggleTeamTab={toggleTeamTab}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="break-inside-avoid"
          >
            {mainGP && selectedYear && (
              <Championship meeting_name={mainGP.meeting_name} year={selectedYear.toString()} />
            )}
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
      </div>
    </>
  );
};

export default DesktopView;