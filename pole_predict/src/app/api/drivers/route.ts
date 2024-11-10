import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const driversCollection = collection(db, 'drivers');
    const existingDriversSnapshot = await getDocs(driversCollection);

    if (!existingDriversSnapshot.empty) {
      const existingDrivers = existingDriversSnapshot.docs.map(doc => doc.data());

      // Tri par écurie en ordre alphabétique
      existingDrivers.sort((a, b) => a.team_name.localeCompare(b.team_name));

      return NextResponse.json({ data: existingDrivers });
    }

    const response = await axios.get('https://api.openf1.org/v1/drivers');
    const drivers = response.data;

    const uniqueDrivers = new Map();

    drivers.forEach((driver: any) => {
      if (!uniqueDrivers.has(driver.driver_number) && driver.headshot_url) {
        uniqueDrivers.set(driver.full_name, driver);
      }
    });

    const uniqueDriversArray = Array.from(uniqueDrivers.values());

    // Appliquer le tri ici
    uniqueDriversArray.sort((a, b) => a.team_name.localeCompare(b.team_name));
    
    console.log("Pilotes triés par écurie :", uniqueDriversArray);

    return NextResponse.json({ data: uniqueDriversArray });
  } catch (error) {
    console.error("Erreur lors de la récupération des pilotes :", error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}
