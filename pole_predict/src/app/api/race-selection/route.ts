//SRC/app/api/race-selection/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get('session_key');

  if (!sessionKey) {
    return NextResponse.json(
      { error: 'Session key is required' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://api.openf1.org/v1/race_control?session_key=${sessionKey}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching race control events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch race control events' },
      { status: 500 }
    );
  }
}