"use client";

import { useRef, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Testimonial {
  name: string;
  title: string;
  date: string;
  img: string;
  text: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  isActive: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: "Viktoria Freeman",
    title: "I'm delighted!",
    date: "02.02.21",
    img: "/avatar1.jpg",
    text: "The ambiance was stunning and the food exceeded every expectation. I left with a full heart and an even fuller stomach.",
  },
  {
    name: "Paul Trueman",
    title: "I will visit again.",
    date: "02.02.21",
    img: "/avatar2.jpg",
    text: "Every dish was crafted with care. The staff made us feel right at home — we'll definitely be back for more.",
  },
  {
    name: "Oscar Oldman",
    title: "The best restaurant!",
    date: "02.02.21",
    img: "/avatar3.jpg",
    text: "An unforgettable dining experience from start to finish. The flavors were bold and the service was impeccable.",
  },
  {
    name: "Jane Doe",
    title: "Amazing food!",
    date: "03.02.21",
    img: "/avatar1.jpg",
    text: "I rarely leave reviews, but this place deserves it. The seasonal menu is inspired and every bite tells a story.",
  },
  {
    name: "Mark Wilson",
    title: "Truly exceptional!",
    date: "04.02.21",
    img: "/avatar2.jpg",
    text: "World-class cuisine in a warm and welcoming atmosphere. This is the kind of place you take someone to impress.",
  },
];

export default function TestimonialsSection() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateState = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    // Read the actual current slidesPerView from Swiper's params
    const perView =
      typeof swiper.params.slidesPerView === "number"
        ? swiper.params.slidesPerView
        : 1;
    setSlidesPerView(perView);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  /**
   * Compute the center slide index based on how many slides are visible.
   *   1 visible  → highlight index 0 (the only one)
   *   2 visible  → highlight index 0 (first)
   *   3 visible  → highlight activeIndex + 1 (true center)
   */
  const getCenterIndex = (): number => {
    if (slidesPerView === 3) return activeIndex + 1;
    return activeIndex; // sm / md: highlight first visible
  };

  const centerIndex = getCenterIndex();

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D4C37]">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl  text-[#1b2a2f] font-bold mt-4">
            What Our Visitors Say
          </h2>
        </div>

        {/* Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
              updateState(swiper);
            }}
            onSlideChange={(swiper: SwiperType) => updateState(swiper)}
            onBreakpoint={(swiper: SwiperType) => updateState(swiper)}
            onReachBeginning={() => setIsBeginning(true)}
            onReachEnd={() => setIsEnd(true)}
            onFromEdge={() => {
              setIsBeginning(false);
              setIsEnd(false);
            }}
            slidesPerView={1}
            spaceBetween={16}
            centeredSlides={false}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
            }}
            navigation={{
              nextEl: ".tsm-next",
              prevEl: ".tsm-prev",
              disabledClass: "tsm-nav-disabled",
            }}
            pagination={{
              el: ".tsm-pagination",
              clickable: true,
              bulletClass: "tsm-bullet",
              bulletActiveClass: "tsm-bullet-active",
            }}
            loop={false}
            className="overflow-visible! pb-4"
            a11y={{
              prevSlideMessage: "Previous testimonial",
              nextSlideMessage: "Next testimonial",
            }}
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i} className="h-auto py-6">
                {/* Use our own centerIndex — NOT Swiper's isActive prop */}
                <TestimonialCard
                  testimonial={t}
                  isActive={i === centerIndex}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Footer Controls */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/about-us"
            className="hidden md:inline-flex bg-[#6D4C37] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-[#e0961f] transition-colors"
          >
            More About Us
          </Link>

          <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-end">
            <div className="tsm-pagination flex gap-2 items-center" />

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest hidden md:block text-[#1b2a2f]">
                Slider Navigation
              </span>

              <button
                aria-label="Previous slide"
                className={`tsm-prev p-3 transition-colors ${
                  isBeginning
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-[#6D4C37] hover:text-white text-[#1b2a2f]"
                }`}
              >
                <FaArrowLeft />
              </button>

              <button
                aria-label="Next slide"
                className={`tsm-next p-3 transition-colors ${
                  isEnd
                    ? "bg-gray-200 text-gray-300 cursor-not-allowed"
                    : "bg-[#6D4C37] text-white hover:bg-[#6D4C37]"
                }`}
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .tsm-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tsm-bullet-active {
          background: #6D4C37;
          width: 24px;
        }
        .tsm-card {
          transition: transform 0.35s ease, box-shadow 0.35s ease,
            border-color 0.35s ease;
        }
        .tsm-card.tsm-card--active {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.14);
          border-color: transparent !important;
        }
        .tsm-card.tsm-card--active .tsm-quote {
          opacity: 1;
        }
        .tsm-nav-disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }
        .swiper {
          overflow: visible !important;
        }
        .swiper-wrapper {
          overflow: visible;
        }
      `}</style>
    </section>
  );
}

function TestimonialCard({ testimonial: t, isActive }: TestimonialCardProps) {
  return (
    <div
      className={`tsm-card relative bg-white border border-dashed border-gray-300 p-8 h-full w-full max-w-90 mx-auto flex flex-col justify-between ${
        isActive ? "tsm-card--active" : ""
      }`}
    >
      <span
  aria-hidden="true"
  className="tsm-quote absolute -top-12 right-8 text-[#6D4C37] text-[150px] leading-none opacity-0 transition-all duration-500 select-none pointer-events-none transform rotate-[30deg]"
>
  "
</span>

      <div>
        <h3 className="text-xl  font-bold text-[#1b2a2f] mb-4">
          {t.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">{t.text}</p>
      </div>

      <div className="border-t border-dashed border-gray-200 pt-5 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden shrink-0">
            <Image
              src={t.img}
              alt={t.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="font-bold text-sm text-[#1b2a2f]">{t.name}</span>
        </div>
        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 shrink-0">
          {t.date}
        </span>
      </div>
    </div>
  );
}