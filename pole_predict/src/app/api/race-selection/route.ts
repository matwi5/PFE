// app/api/race-selection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_key = searchParams.get('session_key');
    const meeting_key = searchParams.get('meeting_key');

    if (!session_key) {
      return NextResponse.json({ error: 'Session key is required' }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.openf1.org/v1/race_control?session_key=${session_key}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}