"use client";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // स्क्रोल गर्दा बटन देखाउने वा नदेखाउने लजिक
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // माथि जाने फंक्शन
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] p-3 bg-[#c47c30] text-green-800 rounded-full shadow-lg hover:bg-[#c47c30] transition-all duration-300 "
          aria-label="Scroll to top"
        >
          <ArrowUp size={22}/>
        </button>
      )}
    </>
  );
}