// // app/api/reviews/route.ts
// import { NextResponse } from 'next/server';

// export async function GET() {
//   // तपाईंले फेला पार्नुभएको सही Place ID यहाँ राख्नुहोस्
//   const PLACE_ID = 'ChIJDZLsTVLJGGARYy9tsXXyGgg'; 
//   const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
//   const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${API_KEY}`;
  
//   try {
//     const res = await fetch(url);
//     const data = await res.json();
    
//     if (data.status === 'OK') {
//       return NextResponse.json(data.result.reviews || []);
//     } else {
//       console.error("Google API Error:", data);
//       return NextResponse.json({ error: data.status }, { status: 400 });
//     }
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
//   }
// }

// src/app/api/google-reviews/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const place_id = searchParams.get('place_id');

  if (!place_id) {
    return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || data.status }, { status: 400 });
    }

    return NextResponse.json(data.result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}