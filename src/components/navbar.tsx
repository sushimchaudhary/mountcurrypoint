"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { OrganizationServices } from "@/services/organizationServices";

const LANGUAGES = [
  { code: "ne", label: "नेपाली" },
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Menu", href: "/menu" },
  { label: "Gallery", href: "/galleries" },
  { label: "Contact", href: "/contact" },
];

function triggerGoogleTranslate(langCode: string) {
  const selectEl = document.querySelector<HTMLSelectElement>(
    "#google_translate_element select"
  );
  if (!selectEl) return;
  selectEl.value = langCode;
  selectEl.dispatchEvent(new Event("change"));
}

export default function Navbar() {
  const pathname = usePathname();
  const [orgDetails, setOrgDetails] = useState<any>(null); // New state
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    OrganizationServices.getDetails().then((data) => {
      // Access the first item in the list if the API returns an array
      setOrgDetails(Array.isArray(data) ? data[0] : data);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLangChange(lang: (typeof LANGUAGES)[0]) {
    setSelectedLang(lang);
    setLangOpen(false);
    triggerGoogleTranslate(lang.code);
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-16 sm:h-18 lg:h-20 gap-4">

          <Link href="/" className="shrink-0 flex items-center gap-2 md:gap-3 mr-auto lg:mr-0">
            <div className="relative w-14 h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 shrink-0">
              {orgDetails?.logo ? (
                <Image
                  src={orgDetails.logo}
                  alt={orgDetails.title || "Logo"}
                  fill
                  unoptimized // Crucial for local dev media
                  className="object-contain"
                />
              ) : (
                <Image src="/logo.png" alt="Fallback logo" fill className="object-contain" />
              )}
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-base lg:text-lg font-extrabold text-amber-600 tracking-tight">
                {orgDetails?.title || "The Mount Curry Point"}
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors rounded-lg ${
                    isActive
                      ? "text-[#E3591E] bg-orange-50"
                      : "text-[#5b351e] hover:text-[#E3591E] hover:bg-green-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#E3591E]" />
                  )}
                </Link>
              );
            })}
          </nav>

         

          
          <div className="flex items-center gap-3">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 border border-gray-400 rounded px-2.5 py-1 text-xs font-medium text-[#5b351e] hover:bg-blue-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-[#5b351e]" />
                <span>{selectedLang.label}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[130px] z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang)}
                      className="w-full text-left px-3 py-2 text-sm text-[#5b351e] hover:bg-blue-50"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            
          </div>

          {/* ── Mobile menu toggle ── */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#5b351e] hover:bg-amber-50 transition-colors"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu drawer ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "bg-green-50 text-[#E3591E]"
                    : "text-[#5b351e] hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                )}
                {link.label}
              </Link>
            );
          })}

         
        </div>
      </div>
    </header>
  );
}