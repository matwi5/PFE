import { db } from '../../../../firebaseConfig';
import axios from 'axios';
import { collection, doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://api.openf1.org/v1/meetings?meeting_key=latest';
    console.log("Tentative de récupération depuis l'URL :", url);

    const meetingResponse = await axios.get(url);
    const meetingArray = meetingResponse.data;

    // Vérifie que les données contiennent un meeting
    if (!Array.isArray(meetingArray) || meetingArray.length === 0) {
      throw new Error("Aucun meeting trouvé dans la réponse.");
    }

    const meeting = meetingArray[0]; // Récupère le premier meeting

    console.log("Données récupérées :", meeting);

    // Utilisation de `meeting_key` comme identifiant unique
    const meetingDocRef = doc(collection(db, "meetings"), String(meeting.meeting_key));
    await setDoc(meetingDocRef, meeting);

    console.log("Meeting et sessions stockés dans Firebase :", meetingDocRef.path);
    return NextResponse.json({ data: meeting });

  } catch (error) {
    if (error instanceof Error) {
      console.error("Erreur lors de la récupération ou du stockage :", error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch and store meeting' },
        { status: 500 }
      );
    } else {
      console.error("Erreur inconnue :", error);
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
