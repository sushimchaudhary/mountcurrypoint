import { NextResponse } from 'next/server';

export async function GET() {
  const PLACE_ID = 'mountcurry'; // यहाँ सहि ID राख्नुहोस्
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
const reviews = data.result?.reviews || []; // यहाँ सधैं एरे सुनिश्चित गर्नुहोस्

    if (data.status !== 'OK') {
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.status }, { status: 500 });
    }

    // reviews नभएको खण्डमा खाली array पठाउनुहोस्
    return NextResponse.json(data.result?.reviews || []);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}