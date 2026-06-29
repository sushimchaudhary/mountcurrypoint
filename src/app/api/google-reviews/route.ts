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



// ============================================================
// PATH: pages/api/google-reviews.ts   (Pages Router)
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { place_id } = req.query;

  if (!place_id || typeof place_id !== "string") {
    return res.status(400).json({ error: "place_id is required" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GOOGLE_MAPS_API_KEY not set in .env.local" });
  }

  const fields = "name,rating,user_ratings_total,reviews,formatted_address,opening_hours,website";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&reviews_sort=most_relevant&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status !== "OK") {
      return res.status(400).json({ error: json.error_message ?? json.status });
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(json.result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}