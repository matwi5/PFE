/* eslint-disable */
import axios from 'axios';
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";

interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  headshot_url?: string;
  team_name?: string;
  team_color?: string;
  session_key?: number;
}

// Cache pour éviter des appels API répétés
const cache = {
  drivers: new Map<number, Driver>(),
  lastFetch: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

export const fetchDrivers = async () => {
  try {
    // Vérifier le cache
    if (Date.now() - cache.lastFetch < cache.CACHE_DURATION && cache.drivers.size > 0) {
      return Array.from(cache.drivers.values());
    }

    const response = await axios.get('https://api.openf1.org/v1/drivers');
    const drivers = response.data;

    // Map pour stocker les pilotes uniques
    const uniqueDriversMap = new Map<number, Driver>();

    for (const driver of drivers) {
      if (!driver.headshot_url) continue;
      
      const existing = uniqueDriversMap.get(driver.driver_number);
      if (!existing || (driver.session_key && (!existing.session_key || driver.session_key > existing.session_key))) {
        uniqueDriversMap.set(driver.driver_number, driver);
      }
    }

    // Convertir en tableau et trier
    const uniqueDrivers = Array.from(uniqueDriversMap.values())
      .sort((a, b) => a.driver_number - b.driver_number);

    // Mettre à jour le cache
    cache.drivers = uniqueDriversMap;
    cache.lastFetch = Date.now();

    // Sauvegarder dans Firebase de manière optimisée
    try {
      const driversCollection = collection(db, "drivers");
      const existingDrivers = await getDocs(driversCollection);
      const existingDriversMap = new Map();
      
      existingDrivers.forEach(doc => {
        const data = doc.data();
        existingDriversMap.set(data.driver_number, doc.id);
      });

      // Batch update pour Firebase
      const batch = [];
      for (const driver of uniqueDrivers) {
        if (!existingDriversMap.has(driver.driver_number)) {
          batch.push(addDoc(driversCollection, {
            ...driver,
            last_updated: Timestamp.now()
          }));
        }
      }

      if (batch.length > 0) {
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('Firebase storage error:', error);
      // Continue même si Firebase échoue
    }

    return uniqueDrivers;

  } catch (error) {
    console.error('Failed to fetch drivers:', error);
    // Retourner les données en cache si disponibles
    if (cache.drivers.size > 0) {
      return Array.from(cache.drivers.values());
    }
    throw error;
  }
};

export const fetchRaceControlEvents = async (sessionKey: string, meetingKey: string) => {
  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/race_control?session_key=${sessionKey}&meeting_key=${meetingKey}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch race control events:', error);
    throw error;
  }
};

export const fetchMeetings = async () => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/meetings');
    return response.data.sort((a: any, b: any) => 
      new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    throw error;
  }
};

export const fetchSessions = async (meetingKey: string) => {
  try {
    const response = await axios.get(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    throw error;
  }
};