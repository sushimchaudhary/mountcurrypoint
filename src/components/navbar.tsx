"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { OrganizationServices } from "@/services/organizationServices";

const LANGUAGES = [
  { code: "ne", label: "नेपाली" },
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
];

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "About",   href: "/about-us" },
  { label: "Menu",    href: "/menu-items" },
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
  const [orgDetails,     setOrgDetails]     = useState<any>(null);
  const [langOpen,       setLangOpen]       = useState(false);
  const [selectedLang,   setSelectedLang]   = useState(LANGUAGES[1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    OrganizationServices.getDetails().then((data) => {
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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  function handleLangChange(lang: (typeof LANGUAGES)[0]) {
    setSelectedLang(lang);
    setLangOpen(false);
    triggerGoogleTranslate(lang.code);
  }

  // Desktop: transparent at top, frosted on scroll
  // Mobile: always frosted (never transparent — prevents content bleed on scroll)
  const isDesktopTop = !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isDesktopTop
          ? "bg-white/80 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none lg:border-transparent shadow-sm lg:shadow-none"
          : "bg-white/20 backdrop-blur-xl shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-20 lg:h-20 gap-4">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="shrink-0 flex items-center gap-2 md:gap-3 mr-auto lg:mr-0">
  {/* यहाँ rounded-full र overflow-hidden थपिएको छ */}
  <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full overflow-hidden border border-gray-200">
    {orgDetails?.logo ? (
      <Image 
        src={orgDetails.logo} 
        alt={orgDetails.title || "Logo"} 
        fill 
        unoptimized 
        className="object-cover" // object-contain को सट्टा object-cover प्रयोग गर्दा गोलो आकारमा राम्रो देखिन्छ
      />
    ) : (
      <Image 
        src="/logo.png" 
        alt="Logo" 
        fill 
        className="object-cover" 
      />
    )}
  </div>
  <div className="hidden md:flex flex-col leading-tight">
    <span className="text-base lg:text-lg font-extrabold tracking-tight text-[#E87F0E]">
      {orgDetails?.title || "The Mount Curry Point"}
    </span>
  </div>
</Link>

          {/* ── Desktop Nav ──────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 rounded-lg group ${
                    isActive
                      ? "text-[#E87F0E]"
                      : isDesktopTop
                        ? "text-white/85 hover:text-[#E87F0E]"
                        : "text-[#241712] hover:text-[#E87F0E]"
                  }`}
                >
                  {link.label}

                  {/* Animated active bar */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#E87F0E]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover underline */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-[#E87F0E]/50 group-hover:w-4 transition-all duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Language selector ────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                className={`flex items-center gap-1.5 border rounded px-2.5 py-1 text-xs font-medium hover:text-[#E87F0E] transition-all duration-300 ${
                  isDesktopTop
                    ? "border-white/25 text-white/75 hover:border-[#E87F0E]/50 lg:border-white/25 lg:text-white/75 border-[#241712]/30 text-[#241712]"
                    : "border-[#241712]/30 text-[#241712] hover:border-[#E87F0E]/50"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{selectedLang.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{   opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 bg-gray-50 border border-gray-200 rounded-xl shadow-xl shadow-black/10 min-w-[140px] z-50 overflow-hidden"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-100 ${
                          selectedLang.code === lang.code
                            ? "text-[#E87F0E] font-semibold bg-orange-50"
                            : "text-[#241712] hover:text-[#E87F0E]"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Mobile toggle ────────────────────────────────── */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#241712]/80 hover:text-[#E87F0E] hover:bg-white/10 transition-all duration-200"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: 90,  opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-200"
          >
            <nav className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1,  x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
                        isActive
                          ? "text-[#E87F0E] bg-orange-50"
                          : "text-[#241712]/70 hover:text-[#E87F0E] hover:bg-gray-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-[#E87F0E]" : "bg-[#241712]/20"}`} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}