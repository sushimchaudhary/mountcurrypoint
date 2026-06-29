"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
}

const PLACE_ID = "ChIJDZLsTVLJGGARYy9tsXXyGgg"; // e.g. ChIJN1t_tDeuEmsRUsoyG83frY4
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, color: "#f5a623", letterSpacing: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

const AVATAR_COLORS = [
  { bg: "#fde8d0", fg: "#8b4e15" },
  { bg: "#d0eafd", fg: "#154a8b" },
  { bg: "#d0fde8", fg: "#15698b" },
  { bg: "#fdd0ea", fg: "#8b1569" },
  { bg: "#ede0fd", fg: "#4b158b" },
];

export default function TestimonialsSection() {
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `/api/google-reviews?place_id=${PLACE_ID}`
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setPlace(data);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: place?.reviews?.filter((r) => Math.round(r.rating) === star).length ?? 0,
  }));

  const maxCount = Math.max(...ratingCounts.map((r) => r.count), 1);

  const toggleLike = (index: number) => {
    setLikedMap((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="py-10 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#c47c30]">
            Reviews
          </span>
          <h2 className="text-4xl font-bold text-[#1b2a2f] mt-2">
            What Our Visitors Say
          </h2>
        </div>

        {/* Place badge */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-lg shrink-0">
            📍
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1b2a2f] truncate">
              {place?.name ?? "The Mount Curry Point"}
            </p>
            <p className="text-xs text-gray-400">
              Restaurant · Google Maps Reviews
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#c47c30] flex items-center gap-1 shrink-0 hover:underline"
          >
            View on map →
          </a>
        </div>

        {/* Rating summary */}
        {place && (
          <div className="flex items-center gap-5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
            <div className="text-center min-w-[72px]">
              <div className="text-4xl font-bold text-[#1b2a2f] leading-none">
                {place.rating?.toFixed(1)}
              </div>
              <StarRow rating={Math.round(place.rating)} size={15} />
              <div className="text-[11px] text-gray-400 mt-1">
                {place.user_ratings_total} reviews
              </div>
            </div>
            <div className="w-px h-16 bg-gray-200 shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 text-right text-gray-400">{star}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f5a623] rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded w-full" />
                  <div className="h-2 bg-gray-100 rounded w-4/5" />
                  <div className="h-2 bg-gray-100 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            Could not load reviews: {error}
          </div>
        )}

        {/* Review cards */}
        {!loading && !error && place && (
          <div className="flex flex-col gap-3">
            {place.reviews.map((review, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const isLiked = likedMap[i] ?? false;
              return (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4"
                >
                  {/* Top row */}
                  <div className="flex items-center gap-3 mb-3">
                    {review.profile_photo_url ? (
                      <Image
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        width={38}
                        height={38}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {getInitials(review.author_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={review.author_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#1b2a2f] hover:underline truncate block"
                      >
                        {review.author_name}
                      </a>
                      <p className="text-xs text-gray-400">
                        Local Guide · 1 review
                      </p>
                    </div>
                  </div>

                  {/* Stars + date */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRow rating={review.rating} size={13} />
                    <span className="text-xs text-gray-400">
                      {review.relative_time_description}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {review.text}
                  </p>

                  {/* Helpful row */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dashed border-gray-100">
                    <span className="text-xs text-gray-400">Helpful?</span>
                    <button
                      onClick={() => toggleLike(i)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={isLiked ? "#c47c30" : "none"}
                        stroke={isLiked ? "#c47c30" : "currentColor"}
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
                      className="ml-auto text-xs text-[#c47c30] hover:underline"
                    >
                      View on Google →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* See all on Google */}
        {!loading && !error && place && (
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 border border-[#c47c30] text-[#c47c30] text-sm font-semibold py-3 rounded-lg hover:bg-orange-50 transition-colors"
          >
            See all reviews on Google Maps →
          </a>
        )}
      </div>
    </section>
  );
}


// "use client";

// import { useRef, useState, useCallback, useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, A11y } from "swiper/modules";
// import type { Swiper as SwiperType } from "swiper";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// import Image from "next/image";
// import Link from "next/link";
// import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";

// interface Testimonial {
//   name: string;
//   title: string;
//   date: string;
//   img: string;
//   text: string;
//   rating?: number;
// }

// interface TestimonialCardProps {
//   testimonial: Testimonial;
//   isActive: boolean;
// }

// interface GoogleReview {
//   author_name: string;
//   text: string;
//   profile_photo_url: string;
//   rating?: number;
//   relative_time_description?: string;
// }

// export default function TestimonialsSection() {
//   const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const swiperRef = useRef<SwiperType | null>(null);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [slidesPerView, setSlidesPerView] = useState(1);
//   const [isBeginning, setIsBeginning] = useState(true);
//   const [isEnd, setIsEnd] = useState(false);

//   const updateState = useCallback((swiper: SwiperType) => {
//     setActiveIndex(swiper.activeIndex);
//     const perView =
//       typeof swiper.params.slidesPerView === "number"
//         ? swiper.params.slidesPerView
//         : 1;
//     setSlidesPerView(perView);
//     setIsBeginning(swiper.isBeginning);
//     setIsEnd(swiper.isEnd);
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     fetch("/api/reviews")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch reviews");
//         return res.json();
//       })
//       .then((data) => {
//         if (Array.isArray(data)) {
//           setGoogleReviews(data);
//         } else {
//           setError("No reviews found");
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Fetch error:", err);
//         setError("Could not load reviews");
//         setLoading(false);
//       });
//   }, []);

//   const getCenterIndex = (): number => {
//     if (slidesPerView === 3) return activeIndex + 1;
//     return activeIndex;
//   };

//   const centerIndex = getCenterIndex();

//   // Map Google reviews → Testimonial shape
//   const testimonials: Testimonial[] = googleReviews.map((r) => ({
//     name: r.author_name || "Anonymous",
//     text: r.text || "",
//     img: r.profile_photo_url || "/placeholder.jpg",
//     date: r.relative_time_description || "Google Review",
//     title: "Verified Review",
//     rating: r.rating,
//   }));

//   return (
//     <section className="py-16 bg-white overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6">

//         {/* ── Header ── */}
//         <div className="text-center mb-16">
//           <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#c47c30]">
//             Testimonials
//           </span>
//           <h2 className="text-4xl sm:text-5xl text-[#1b2a2f] font-bold mt-4">
//             What Our Visitors Say
//           </h2>
//         </div>

//         {/* ── Loading State ── */}
//         {loading && (
//           <div className="flex justify-center items-center py-20">
//             <div className="flex gap-2">
//               {[0, 1, 2].map((i) => (
//                 <span
//                   key={i}
//                   className="w-2.5 h-2.5 rounded-full bg-[#c47c30] animate-bounce"
//                   style={{ animationDelay: `${i * 0.15}s` }}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── Error State ── */}
//         {!loading && error && (
//           <div className="text-center py-20 text-gray-400">
//             <p className="text-sm">{error}</p>
//           </div>
//         )}

//         {/* ── Slider ── */}
//         {!loading && !error && testimonials.length > 0 && (
//           <div className="relative px-2">
//             <Swiper
//               modules={[Navigation, Pagination, A11y]}
//               spaceBetween={24}
//               slidesPerView={1}
//               breakpoints={{
//                 640:  { slidesPerView: 2, spaceBetween: 20 },
//                 1024: { slidesPerView: 3, spaceBetween: 24 },
//               }}
//               navigation={{
//                 prevEl: ".tsm-prev",
//                 nextEl: ".tsm-next",
//               }}
//               pagination={{
//                 el: ".tsm-pagination",
//                 bulletClass: "tsm-bullet",
//                 bulletActiveClass: "tsm-bullet-active",
//                 clickable: true,
//               }}
//               onSwiper={(swiper) => {
//                 swiperRef.current = swiper;
//                 updateState(swiper);
//               }}
//               onSlideChange={updateState}
//               onBreakpoint={updateState}
//               className="!overflow-visible"
//             >
//               {testimonials.map((t, i) => (
//                 <SwiperSlide key={i} className="!h-auto">
//                   <TestimonialCard
//                     testimonial={t}
//                     isActive={i === centerIndex}
//                   />
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           </div>
//         )}

//         {/* ── Empty State ── */}
//         {!loading && !error && testimonials.length === 0 && (
//           <p className="text-center text-gray-400 py-20 text-sm">
//             No reviews available yet.
//           </p>
//         )}

//         {/* ── Footer Controls ── */}
//         {!loading && testimonials.length > 0 && (
//           <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
//             <Link
//               href="/about-us"
//               className="hidden md:inline-flex bg-[#c47c30] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-[#e0961f] transition-colors"
//             >
//               More About Us
//             </Link>

//             <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-end">
//               {/* Pagination dots */}
//               <div className="tsm-pagination flex gap-2 items-center" />

//               <div className="flex items-center gap-3">
//                 <span className="text-xs font-bold uppercase tracking-widest hidden md:block text-[#1b2a2f]">
//                   Slider Navigation
//                 </span>

//                 <button
//                   aria-label="Previous slide"
//                   onClick={() => swiperRef.current?.slidePrev()}
//                   className={`tsm-prev p-3 transition-colors ${
//                     isBeginning
//                       ? "bg-gray-100 text-gray-300 cursor-not-allowed"
//                       : "bg-gray-100 hover:bg-[#c47c30] hover:text-white text-[#1b2a2f]"
//                   }`}
//                 >
//                   <FaArrowLeft />
//                 </button>

//                 <button
//                   aria-label="Next slide"
//                   onClick={() => swiperRef.current?.slideNext()}
//                   className={`tsm-next p-3 transition-colors ${
//                     isEnd
//                       ? "bg-gray-200 text-gray-300 cursor-not-allowed"
//                       : "bg-[#c47c30] text-white hover:bg-[#e0961f]"
//                   }`}
//                 >
//                   <FaArrowRight />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Global Styles ── */}
//       <style jsx global>{`
//         .tsm-bullet {
//           display: inline-block;
//           width: 8px;
//           height: 8px;
//           border-radius: 9999px;
//           background: #d1d5db;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }
//         .tsm-bullet-active {
//           background: #c47c30;
//           width: 24px;
//         }
//         .tsm-card {
//           transition: transform 0.35s ease, box-shadow 0.35s ease,
//             border-color 0.35s ease;
//         }
//         .tsm-card.tsm-card--active {
//           transform: translateY(-6px);
//           box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.14);
//           border-color: transparent !important;
//         }
//         .tsm-card.tsm-card--active .tsm-quote {
//           opacity: 1;
//         }
//         .swiper {
//           overflow: visible !important;
//         }
//         .swiper-wrapper {
//           overflow: visible;
//         }
//       `}</style>
//     </section>
//   );
// }

// function TestimonialCard({ testimonial: t, isActive }: TestimonialCardProps) {
//   return (
//     <div
//       className={`tsm-card relative bg-white border border-dashed border-gray-300 p-8 h-full flex flex-col justify-between ${
//         isActive ? "tsm-card--active" : ""
//       }`}
//     >
//       {/* Decorative quote mark */}
//       <span
//         aria-hidden="true"
//         className="tsm-quote absolute -top-10 right-6 text-[#c47c30] text-[120px] leading-none opacity-0 transition-all duration-500 select-none pointer-events-none"
//       >
//         &ldquo;
//       </span>

//       <div className="flex-1">
//         {/* Star rating */}
//         {t.rating && (
//           <div className="flex gap-0.5 mb-4">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <FaStar
//                 key={i}
//                 className={`text-xs ${
//                   i < t.rating! ? "text-[#c47c30]" : "text-gray-200"
//                 }`}
//               />
//             ))}
//           </div>
//         )}

//         <h3 className="text-xl font-bold text-[#1b2a2f] mb-4">{t.title}</h3>

//         {/* Clamp long reviews to 4 lines */}
//         <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
//           {t.text}
//         </p>
//       </div>

//       {/* Footer */}
//       <div className="border-t border-dashed border-gray-200 pt-5 mt-6 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden shrink-0 relative">
//             <Image
//               src={t.img}
//               alt={t.name}
//               fill
//               unoptimized
//               className="object-cover"
//             />
//           </div>
//           <span className="font-bold text-sm text-[#1b2a2f]">{t.name}</span>
//         </div>
//         <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 shrink-0">
//           {t.date}
//         </span>
//       </div>
//     </div>
//   );
// }