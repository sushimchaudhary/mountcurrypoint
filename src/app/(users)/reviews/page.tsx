"use client";

// ============================================================
// App Router:   app/reviews/page.tsx
// Pages Router: pages/reviews.tsx
// ============================================================

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ── CONFIG ───────────────────────────────────────────────────
const PLACE_ID = "ChIJDZLsTVLJGGARYy9tsXXyGgg";
// ─────────────────────────────────────────────────────────────

interface GoogleReview {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  formatted_address?: string;
  website?: string;
  opening_hours?: { open_now: boolean; weekday_text?: string[] };
}

// ── HELPERS ───────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: "#fde8d0", fg: "#8b4e15" },
  { bg: "#d0eafd", fg: "#154a8b" },
  { bg: "#d0fde8", fg: "#0f6045" },
  { bg: "#fdd0ea", fg: "#8b1569" },
  { bg: "#ede0fd", fg: "#4b158b" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1, color: "#f5a623" }}>
      {"★".repeat(n)}
      <span style={{ color: "#d1d5db" }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-2 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-2 bg-gray-50 rounded w-full" />
        <div className="h-2 bg-gray-50 rounded w-5/6" />
        <div className="h-2 bg-gray-50 rounded w-4/6" />
      </div>
    </div>
  );
}

// ── FILTER BAR ────────────────────────────────────────────────
type Filter = "all" | 5 | 4 | 3 | 2 | 1;
const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "5 ★", value: 5 },
  { label: "4 ★", value: 4 },
  { label: "3 ★", value: 3 },
  { label: "2 ★", value: 2 },
  { label: "1 ★", value: 1 },
];

// ── REVIEW CARD ───────────────────────────────────────────────
function ReviewCard({
  review,
  index,
}: {
  review: GoogleReview;
  index: number;
}) {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const color = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const isLong = review.text.length > 220;
  const displayText =
    isLong && !expanded ? review.text.slice(0, 220) + "…" : review.text;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#c47c30]/30 hover:shadow-sm transition-all duration-200">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        {review.profile_photo_url ? (
          <Image
            src={review.profile_photo_url}
            alt={review.author_name}
            width={44}
            height={44}
            className="rounded-full object-cover shrink-0 ring-2 ring-orange-50"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: color.bg, color: color.fg }}
          >
            {initials(review.author_name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <a
            href={review.author_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#1b2a2f] hover:text-[#c47c30] transition-colors truncate block"
          >
            {review.author_name}
          </a>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {review.relative_time_description}
          </p>
        </div>
        {/* Google G badge */}
        <div className="shrink-0 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="13" height="13">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-2.5">
        <Stars n={review.rating} size={13} />
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {displayText}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-[#c47c30] font-medium text-xs hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">Helpful?</span>
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: liked ? "#c47c30" : "#9ca3af" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={liked ? "#c47c30" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Yes
        </button>
        <a
          href={`https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[11px] text-gray-400 hover:text-[#c47c30] transition-colors"
        >
          View on Google →
        </a>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function ReviewsPage() {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [hoursOpen, setHoursOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/google-reviews?place_id=${PLACE_ID}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setPlace)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const reviews = place?.reviews ?? [];
  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => Math.round(r.rating) === filter);

  const ratingBars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxBar = Math.max(...ratingBars.map((b) => b.count), 1);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-[#1b2a2f] tracking-tight">
            ← Back
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c47c30]">
            Reviews
          </span>
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-[#c47c30] transition-colors"
          >
            Open in Maps
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── HERO PLACE CARD ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Map strip */}
          <div
            className="h-36 bg-cover bg-center relative"
            style={{
              backgroundImage: `url("https://maps.googleapis.com/maps/api/staticmap?center=place_id:${PLACE_ID}&zoom=15&size=700x180&markers=color:0xc47c30%7Cplace_id:${PLACE_ID}&style=feature:poi|visibility:off&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}")`,
              backgroundColor: "#e8e0d8",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#1b2a2f]">
                  {place?.name ?? "The Mount Curry Point"}
                </h1>
                {place?.formatted_address && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {place.formatted_address}
                  </p>
                )}
              </div>

              {place?.opening_hours && (
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    place.opening_hours.open_now
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {place.opening_hours.open_now ? "Open now" : "Closed"}
                </span>
              )}
            </div>

            {/* Hours toggle */}
            {place?.opening_hours?.weekday_text && (
              <div className="mt-3">
                <button
                  onClick={() => setHoursOpen(!hoursOpen)}
                  className="text-xs text-[#c47c30] font-medium hover:underline flex items-center gap-1"
                >
                  {hoursOpen ? "Hide hours ▲" : "Show hours ▼"}
                </button>
                {hoursOpen && (
                  <ul className="mt-2 space-y-0.5">
                    {place.opening_hours.weekday_text.map((line, i) => (
                      <li key={i} className="text-xs text-gray-500">{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#c47c30] text-white rounded-lg hover:bg-[#a8661f] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Get directions
              </a>
              {place?.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 text-[#1b2a2f] rounded-lg hover:border-[#c47c30] hover:text-[#c47c30] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Website
                </a>
              )}
              <a
                href={`https://search.google.com/local/writereview?placeid=${PLACE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 text-[#1b2a2f] rounded-lg hover:border-[#c47c30] hover:text-[#c47c30] transition-colors"
              >
                ✍️ Write a review
              </a>
            </div>
          </div>
        </div>

        {/* ── RATING SUMMARY ── */}
        {place && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-6">
              {/* Big number */}
              <div className="text-center shrink-0">
                <div className="text-5xl font-bold text-[#1b2a2f] leading-none">
                  {place.rating?.toFixed(1)}
                </div>
                <Stars n={Math.round(place.rating)} size={16} />
                <div className="text-[11px] text-gray-400 mt-1">
                  {place.user_ratings_total?.toLocaleString()} reviews
                </div>
              </div>

              <div className="w-px h-20 bg-gray-100 shrink-0" />

              {/* Bar chart */}
              <div className="flex-1 flex flex-col gap-1.5">
                {ratingBars.map(({ star, count }) => (
                  <button
                    key={star}
                    onClick={() => setFilter(filter === star ? "all" : (star as Filter))}
                    className={`flex items-center gap-2 text-xs group transition-opacity ${
                      filter !== "all" && filter !== star ? "opacity-40" : ""
                    }`}
                  >
                    <span className="w-3 text-right text-gray-400">{star}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / maxBar) * 100}%`,
                          background: filter === star ? "#c47c30" : "#f5a623",
                        }}
                      />
                    </div>
                    <span className="w-4 text-gray-400">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FILTER PILLS ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                filter === value
                  ? "bg-[#c47c30] text-white border-[#c47c30]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#c47c30] hover:text-[#c47c30]"
              }`}
            >
              {label}
            </button>
          ))}
          {filter !== "all" && (
            <span className="text-xs text-gray-400 ml-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <strong>Could not load reviews:</strong> {error}
            <br />
            <span className="text-xs text-red-400 mt-1 block">
              Check that GOOGLE_MAPS_API_KEY is set in .env.local and restart your dev server.
            </span>
          </div>
        )}

        {/* ── SKELETON ── */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── REVIEW CARDS ── */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No {filter}-star reviews yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((review, i) => (
                  <ReviewCard key={review.time} review={review} index={i} />
                ))}
              </div>
            )}

            {/* ── CTA FOOTER ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[#1b2a2f]">
                  Enjoyed your visit?
                </p>
                <p className="text-xs text-gray-400">
                  Share your experience on Google Maps
                </p>
              </div>
              <a
                href={`https://search.google.com/local/writereview?placeid=${PLACE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#c47c30] text-white rounded-lg hover:bg-[#a8661f] transition-colors"
              >
                Write a Review
              </a>
            </div>

            {/* Google attribution */}
            <p className="text-center text-[11px] text-gray-300 pb-4">
              Reviews powered by{" "}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
              >
                Google Maps
              </a>
            </p>
          </>
        )}
      </main>
    </div>
  );
}