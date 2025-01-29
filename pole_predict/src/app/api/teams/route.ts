import { NextResponse } from 'next/server';
import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const teamCollection = collection(db, 'teams');  // Accès à la collection teams
    const teamsSnapshot = await getDocs(teamCollection);  // Récupération des documents de l'équipe

    if (!teamsSnapshot.empty) {
      const teamsData = teamsSnapshot.docs.map(doc => doc.data());  // Extraction des données des équipes

      return NextResponse.json({ data: teamsData });  // Retourner les données au client
    }

    return NextResponse.json({ data: [] });  // Si aucune donnée n'est trouvée
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes :", error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}