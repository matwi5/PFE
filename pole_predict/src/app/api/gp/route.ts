import { NextResponse } from 'next/server';
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const gpCollection = collection(db, 'gp');
    const existingGpSnapshot = await getDocs(gpCollection);

    if (!existingGpSnapshot.empty) {
      const existingGp = existingGpSnapshot.docs.map(doc => doc.data());
      return NextResponse.json({ data: existingGp });
    }

    return NextResponse.json({ data: [] }); // Si aucune donnée n'existe
  } catch (error) {
    console.error("Erreur lors de la récupération des GP :", error);
    return NextResponse.json({ error: 'Failed to fetch GP' }, { status: 500 });
  }
}
