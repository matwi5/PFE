import { NextResponse } from 'next/server';
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const driversCollection = collection(db, 'drivers');
    const existingDriversSnapshot = await getDocs(driversCollection);

    if (!existingDriversSnapshot.empty) {
      const existingDrivers = existingDriversSnapshot.docs.map(doc => {
        return doc.data();
      });
      return NextResponse.json({ data: existingDrivers });
    }

    console.log("Snapshot is empty. Returning empty array.");
    return NextResponse.json({ data: [] }); // Si aucune donnée n'existe
  } catch (error) {
    console.error("Erreur lors de la récupération des pilotes :", error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}
