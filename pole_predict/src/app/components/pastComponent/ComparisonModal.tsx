"use client";
/* eslint-disable */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ClockArrowUp, DatabaseZap, History, Hourglass, ClockArrowDown } from "lucide-react";
import { Driver, Team, GP } from "./types";

interface ComparisonModalProps {
  isOpen: boolean;
  isTeamComparisonOpen: boolean;
  toggleTab: () => void;
  toggleTeamTab: () => void;
  drivers: Driver[];
  teams: Team[];
  selectedMeeting: GP | null;
  driverData: any[];
  teamData: any[];
  selectedDrivers: { [key: number]: Driver | null };
  selectedTeamsForComparison: { [key: number]: Team | null };
  setSelectedDrivers: (drivers: { [key: number]: Driver | null }) => void;
  setSelectedTeamsForComparison: (teams: { [key: number]: Team | null }) => void;
}

const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "N/A";
  
  // Si le temps contient déjà "h", "min", "s", on le retourne tel quel
  if (timeStr.includes("h") || timeStr.includes("min") || timeStr.includes("s")) {
    return timeStr;
  }

  // Conversion des temps en secondes
  let totalSeconds = 0;
  
  // Pour les temps en format MM:SS.sss
  if (timeStr.includes(":")) {
    const [minutes, seconds] = timeStr.split(":");
    totalSeconds = parseInt(minutes) * 60 + parseFloat(seconds);
  } else {
    // Pour les temps en secondes uniquement
    totalSeconds = parseFloat(timeStr);
  }

  // Si c'est plus d'une heure
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((totalSeconds % 1) * 100);
    return `${hours}h ${minutes}min ${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
  }
  // Si c'est plus d'une minute
  else if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((totalSeconds % 1) * 100);
    return `${minutes}min ${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
  }
  // Moins d'une minute
  else {
    const seconds = Math.floor(totalSeconds);
    const centiseconds = Math.floor((totalSeconds % 1) * 100);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
  }
};

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  isTeamComparisonOpen,
  toggleTab,
  toggleTeamTab,
  drivers,
  teams,
  selectedMeeting,
  driverData,
  teamData,
  selectedDrivers,
  selectedTeamsForComparison,
  setSelectedDrivers,
  setSelectedTeamsForComparison,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<{[key: number]: boolean}>({});
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState<{[key: number]: boolean}>({});

  const toggleDropdown = (index: number) => {
    setIsDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleTeamDropdown = (index: number) => {
    setIsTeamDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDriverChange = (index: number, driver: Driver) => {
    const updatedDrivers = { ...selectedDrivers, [index]: driver };
    setSelectedDrivers(updatedDrivers); // Appeler avec un objet, pas une fonction
    toggleDropdown(index);
  };

  const handleTeamChange = (index: number, team: Team) => {
    const updatedTeams = { ...selectedTeamsForComparison, [index]: team };
    setSelectedTeamsForComparison(updatedTeams); // Appeler avec un objet, pas une fonction
    toggleTeamDropdown(index);
  };

  interface MetricBarProps {
    value: number;
    maxValue: number;
    color?: string;
  }

  const MetricBar: React.FC<MetricBarProps> = ({ value, maxValue, color = "from-[#5382ec] to-[#2dd4bf]" }) => (
    <div className="bg-[#1d1f20] h-2 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-r ${color} h-full`}
      />
    </div>
  );

  interface StatCardProps {
    icon: React.ReactElement;
    title: string;
    children: React.ReactNode;
  }

  const StatCard: React.FC<StatCardProps> = ({ icon, title, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#282a2c] rounded-lg p-4 hover:bg-[#2f3133] transition-colors duration-300"
    >
      <h4 className="font-bold text-lg text-[#5382ec] mb-3 flex items-center">
        {React.cloneElement(icon, { className: "mr-2 w-5 h-5" })}
        {title}
      </h4>
      {children}
    </motion.div>
  );

  const renderModal = (isTeamView = false) => (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto"
      onClick={isTeamView ? toggleTeamTab : toggleTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-[#1d1f20] text-white p-4 md:p-8 rounded-xl shadow-lg w-full md:w-3/4 max-w-5xl z-50
                   overflow-hidden transition-all duration-300 my-4 md:my-0
                   shadow-[0_0_15px_rgba(83,130,236,0.3)]
                   hover:shadow-[0_0_25px_rgba(83,130,236,0.5)]"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isTeamView ? "Team Comparison" : "Driver Comparison"}
            </motion.h2>
            {selectedMeeting && (
              <motion.p 
                className="text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Comparing at: {selectedMeeting.meeting_name} ({selectedMeeting.year})
              </motion.p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={isTeamView ? toggleTeamTab : toggleTab}
              className="flex items-center justify-center px-3 py-1.5 rounded-lg
                       bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]
                       transition-transform duration-200 hover:scale-105
                       text-sm text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Fermer
            </button>
          </div>
        </div>

        {/* Effet de flou en haut */}
        <div className="absolute inset-x-0 h-12 top-0 bg-gradient-to-b from-[#1d1f20] to-transparent z-10" />

        {/* Content */}
        <div className="max-h-[calc(100vh-2rem)] md:max-h-[calc(90vh-100px)] overflow-y-auto scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
            {[0, 1].map((index) => (
              <motion.div
                key={index}
                className="bg-[#282a2c] rounded-xl p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                {isTeamView ? (
                  // Team Content
                  selectedTeamsForComparison[index] ? (
                    <div className="space-y-4">
                      {/* Team Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                          {selectedTeamsForComparison[index].name}
                        </h3>
                        <Button
                          onClick={() => toggleTeamDropdown(index)}
                          className="mt-2 bg-[#282a2c] hover:bg-[#2f3133] text-white border border-[#5382ec]"
                        >
                          Change Team
                        </Button>
                      </div>

                      {/* Team Dropdown */}
                      <AnimatePresence>
                        {isTeamDropdownOpen[index] && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bg-[#282a2c] border border-[#5382ec] rounded-md shadow-lg z-20"
                          >
                            <ul className="max-h-56 overflow-y-auto py-1">
                              {teams.map((team) => (
                                <li
                                  key={team.name}
                                  className="px-4 py-2 hover:bg-[#2f3133] cursor-pointer"
                                  onClick={() => handleTeamChange(index, team)}
                                >
                                  {team.name}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Team Metrics */}
                      <StatCard icon={<DatabaseZap />} title="Performance">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span>Average Lap Time</span>
                              <span>{teamData[index]?.averageLapTime || "N/A"}</span>
                            </div>
                            <MetricBar 
                              value={teamData[index]?.averageLapTime ? 
                                parseFloat(teamData[index].averageLapTime.replace(" s", "")) : 0} 
                              maxValue={200}
                            />
                          </div>
                        </div>
                      </StatCard>

                      <StatCard icon={<History />} title="Sector Times">
                        {['averageSector1', 'averageSector2', 'averageSector3'].map((sector, idx) => (
                          <div key={sector} className="mb-4">
                            <div className="flex justify-between mb-2">
                              <span>Sector {idx + 1}</span>
                              <span>{teamData[index]?.[sector] || "N/A"}</span>
                            </div>
                            <MetricBar 
                              value={teamData[index]?.[sector] ? 
                                parseFloat(teamData[index][sector].replace(" s", "")) : 0}
                              maxValue={80}
                            />
                          </div>
                        ))}
                      </StatCard>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400">Select a team to compare...</p>
                  )
                ) : (
                  // Driver Content
                  selectedDrivers[index] ? (
                    <div className="space-y-4">
                      {/* Driver Header */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <motion.img
                          src={selectedDrivers[index].headshot_url}
                          alt={selectedDrivers[index].name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#5382ec]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        />
                        <div className="text-center sm:text-left">
                          <h3 className="font-bold text-xl bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                            {selectedDrivers[index].name}
                          </h3>
                          <p className="text-gray-400">{selectedDrivers[index].team_name}</p>
                          <Button
                            onClick={() => toggleDropdown(index)}
                            className="mt-2 bg-[#282a2c] hover:bg-[#2f3133] text-white border border-[#5382ec] w-full sm:w-auto"
                          >
                            Change Driver
                          </Button>
                        </div>
                      </div>

                      {/* Driver Dropdown */}
                      <AnimatePresence>
                        {isDropdownOpen[index] && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute bg-[#282a2c] border border-[#5382ec] rounded-md shadow-lg z-20"
                          >
                            <ul className="max-h-56 overflow-y-auto py-1">
                              {drivers.map((driver) => (
                                <li
                                  key={driver.id} // Assurez-vous que `id` est défini dans l'interface `Driver`
                                  className="px-4 py-2 hover:bg-[#2f3133] cursor-pointer flex items-center gap-2"
                                  onClick={() => handleDriverChange(index, driver)}
                                >
                                  <img
                                    src={driver.headshot_url}
                                    alt={driver.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span>{driver.name}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Driver Metrics */}
                      <StatCard icon={<ClockArrowUp />} title="Race Time">
                        <p className="text-center text-lg sm:text-xl font-mono break-words">
                          {formatTime(driverData[index]?.raceDuration)}
                        </p>
                      </StatCard>

                      <StatCard icon={<DatabaseZap />} title="Performance">
                        <div className="space-y-4">
                          <div>
                            <div className="flex flex-wrap justify-between mb-2 gap-2">
                              <span className="text-sm sm:text-base">Max Speed</span>
                              <span className="text-sm sm:text-base">
                                {driverData[index]?.maxSpeed || "N/A"} km/h
                              </span>
                            </div>
                            <MetricBar 
                              value={driverData[index]?.maxSpeed || 0}
                              maxValue={400}
                            />
                          </div>
                          <div>
                            <div className="flex flex-wrap justify-between mb-2 gap-2">
                              <span className="text-sm sm:text-base">Average Lap Time</span>
                              <span className="text-sm sm:text-base">
                                {formatTime(driverData[index]?.averageLapTime)}
                              </span>
                            </div>
                            <MetricBar 
                              value={driverData[index]?.averageLapTime ? 
                                parseFloat(driverData[index].averageLapTime.replace(" s", "")) : 0}
                              maxValue={200}
                            />
                          </div>
                        </div>
                      </StatCard>

                      <StatCard icon={<History />} title="Sector Times">
                        {['averageSector1', 'averageSector2', 'averageSector3'].map((sector, idx) => (
                          <div key={sector} className="mb-4">
                            <div className="flex flex-wrap justify-between mb-2 gap-2">
                              <span className="text-sm sm:text-base">Sector {idx + 1}</span>
                              <span className="text-sm sm:text-base">
                                {formatTime(driverData[index]?.[sector])}
                              </span>
                            </div>
                            <MetricBar 
                              value={driverData[index]?.[sector] ? 
                                parseFloat(driverData[index][sector].replace(" s", "")) : 0}
                              maxValue={idx === 2 ? 40 : 80}
                            />
                          </div>
                        ))}
                      </StatCard>

                      <StatCard icon={<Hourglass />} title="Pit Times">
                        <div className="space-y-2">
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-sm sm:text-base">Best</span>
                            <span className="font-mono text-sm sm:text-base">
                              {formatTime(driverData[index]?.bestPitDuration)}
                            </span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-sm sm:text-base">Average</span>
                            <span className="font-mono text-sm sm:text-base">
                              {formatTime(driverData[index]?.averagePitDuration)}
                            </span>
                          </div>
                        </div>
                      </StatCard>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400">Select a driver to compare...</p>
                  )
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Effet de flou en bas */}
        <div className="absolute inset-x-0 h-12 bottom-0 bg-gradient-to-t from-[#1d1f20] to-transparent z-10" />
      </motion.div>
    </motion.div>
  );

  if (!isOpen && !isTeamComparisonOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && renderModal(false)}
      {isTeamComparisonOpen && renderModal(true)}
    </AnimatePresence>
  );
};

export default ComparisonModal;