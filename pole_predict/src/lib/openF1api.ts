// src/lib/openF1api.ts

import axios from 'axios';
import { db } from "../firebaseConfig"; // Ton fichier de configuration Firebase
import { collection, addDoc } from "firebase/firestore";

export const fetchDrivers = async () => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/drivers');
    const drivers = response.data;

    // Créer un Map pour stocker les pilotes uniques
    const uniqueDriversMap = new Map();

    drivers.forEach((driver: any) => {
      // Vérifier si le pilote a une photo
      if (driver.headshot_url) {
        // Vérifier si le pilote est déjà dans le Map
        if (!uniqueDriversMap.has(driver.driver_number)) {
          // Ajouter le pilote s'il n'existe pas encore
          uniqueDriversMap.set(driver.full_name, driver);
        } else {
          // Si le pilote existe déjà, comparer et garder l'information la plus récente
          const existingDriver = uniqueDriversMap.get(driver.full_name);
          if (driver.session_key > existingDriver.session_key) {
            uniqueDriversMap.set(driver.full_name, driver);
          }
        }
      }
    });

    // Convertir le Map en tableau pour retourner
    const uniqueDrivers = Array.from(uniqueDriversMap.values());

    // Trier les pilotes par driver_number en ordre croissant
    uniqueDrivers.sort((a, b) => a.driver_number - b.driver_number);

    // Enregistrer chaque pilote dans Firebase
    const driversCollection = collection(db, "drivers");
    uniqueDrivers.forEach(async (driver) => {
      await addDoc(driversCollection, driver); // Sauvegarder les données du pilote dans Firebase
    });

    console.log("Données des pilotes sauvegardées dans Firebase");
    return uniqueDrivers;

  } catch (error) {
    throw new Error(`Failed to fetch drivers: ${error}`);
  }
};

// Accéder aux dates et heures des GP
export const fetchRaceControlEvents = async (date: string) => {
  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const response = await axios.get(
      `https://api.openf1.org/v1/race_control?date>=${startDate.toISOString().split('T')[0]}&date<${endDate.toISOString().split('T')[0]}`
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch race control events: ${error}`);
  }
};

export const fetchMeetings = async () => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/meetings');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des meetings:', error);
    throw error;
  }
};


// Accéder aux dates et heures des sessions
export const fetchSessions = async (meetingKey: string) => {
  try {
    const response = await axios.get(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    throw error;
  }
};
