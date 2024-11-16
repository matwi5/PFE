import { db } from '../../../../firebaseConfig';
import axios from 'axios';
import { collection, doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://api.openf1.org/v1/sessions?meeting_key=latest';
    console.log("Tentative de récupération depuis l'URL :", url);

    const sessionResponse = await axios.get(url);
    const sessionArray = sessionResponse.data;

    // Vérifie que les données contiennent un session
    if (!Array.isArray(sessionArray) || sessionArray.length === 0) {
      throw new Error("Aucun session trouvé dans la réponse.");
    }

    const session = sessionArray[0]; // Récupère le premier session

    console.log("Données récupérées :", session);

    // Utilisation de `session_key` comme identifiant unique
    const sessionDocRef = doc(collection(db, "sessions"), String(session.session_key));
    await setDoc(sessionDocRef, session);

    console.log("session et sessions stockés dans Firebase :", sessionDocRef.path);
    return NextResponse.json({ data: session });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Erreur lors de la récupération ou du stockage :", error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch and store session' },
        { status: 500 }
      );
    } else {
      console.error("Erreur inconnue :", error);
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
