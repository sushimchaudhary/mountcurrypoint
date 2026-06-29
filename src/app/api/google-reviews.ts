

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