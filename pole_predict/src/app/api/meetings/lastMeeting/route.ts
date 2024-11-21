import logger from '@/utils/logger';
import { db } from '../../../../firebaseConfig';
import axios from 'axios';
import { collection, doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.openf1.org/v1/meetings?meeting_key=latest';

  try {
    logger.info(`Tentative de récupération depuis l'URL : ${url}`);

    const meetingResponse = await axios.get(url);
    const meetingArray = meetingResponse.data;

    // Vérifie que les données contiennent un meeting
    if (!Array.isArray(meetingArray) || meetingArray.length === 0) {
      logger.warn('Aucun meeting trouvé dans la réponse.');
      throw new Error('Aucun meeting trouvé dans la réponse.');
    }

    const meeting = meetingArray[0]; // Récupère le premier meeting
    logger.info(`Données récupérées : ${JSON.stringify(meeting)}`);

    // Utilisation de `meeting_key` comme identifiant unique
    const meetingDocRef = doc(collection(db, 'meetings'), String(meeting.meeting_key));
    await setDoc(meetingDocRef, meeting);

    logger.info(`Meeting et sessions stockés dans Firebase : ${meetingDocRef.path}`);
    return NextResponse.json({ data: meeting });

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Erreur lors de la récupération ou du stockage : ${error.message}`);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch and store meeting' },
        { status: 500 }
      );
    } else {
      logger.error(`Erreur inconnue : ${JSON.stringify(error)}`);
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
