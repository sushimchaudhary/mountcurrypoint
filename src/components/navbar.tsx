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
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Menu", href: "/menu-items" },
  { label: "Gallery", href: "/galleries" },
  { label: "Contact", href: "/contact-us" },
];

function triggerGoogleTranslate(langCode: string) {
  const selectEl = document.querySelector<HTMLSelectElement>(
    "#google_translate_element select",
  );
  if (!selectEl) return;
  selectEl.value = langCode;
  selectEl.dispatchEvent(new Event("change"));
}

export default function Navbar() {
  const pathname = usePathname();
  const [orgDetails, setOrgDetails] = useState<any>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLangChange(lang: (typeof LANGUAGES)[0]) {
    setSelectedLang(lang);
    setLangOpen(false);
    triggerGoogleTranslate(lang.code);
  }

  const isDesktopTop = !scrolled && !mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 rounded-b-2xl ${
        isDesktopTop
          ? "bg-white/10 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none border-b border-[#c47c30]/20 lg:border-b lg:border-[#c47c30]/30 shadow-sm lg:shadow-none"
          : "bg-white/90 backdrop-blur-xl shadow-md border-b border-[#c47c30]/30"
      }`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c47c30] to-transparent rounded-t-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-20 gap-4">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 md:gap-3 mr-auto lg:mr-0"
          >
            <div className="relative w-16 h-16 md:w-18 md:h-18 shrink-0 rounded-full overflow-hidden  ">
              {orgDetails?.logo ? (
                <Image
                  src={orgDetails.logo}
                  alt={orgDetails.title || "Logo"}
                  fill
                  unoptimized
                  className="object-cover"
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
              <span className="text-base lg:text-lg font-extrabold tracking-tight text-[#c47c30]">
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
                      ? "text-[#c47c30]"
                      : isDesktopTop
                        ? "text-[#c47c30] hover:text-[#c47c30]"
                        : "text-[#241712] hover:text-[#c47c30]"
                  }`}
                >
                  {link.label}

                  {/* Animated active bar */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#c47c30]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover underline */}
                  {!isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-[#c47c30]/50 group-hover:w-4 transition-all duration-200" />
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
                className={`flex items-center gap-1.5 border-2 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-300 ${
                  isDesktopTop
                    ? "border-[#c47c30]/30 text-[#c47c30] hover:border-[#c47c30] hover:bg-[#c47c30]/5 lg:border-[#c47c30]/40"
                    : "border-[#c47c30]/30 text-[#241712] hover:border-[#c47c30] hover:text-[#c47c30] hover:bg-[#c47c30]/5"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{selectedLang.label}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 bg-white border-2 border-[#c47c30]/20 rounded-xl shadow-xl shadow-black/10 min-w-[140px] z-50 overflow-hidden"
                  >
                    {/* Dropdown top accent */}
                    <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c47c30] to-transparent" />
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-50 ${
                          selectedLang.code === lang.code
                            ? "text-[#c47c30] font-semibold bg-orange-50"
                            : "text-[#241712] hover:text-[#c47c30]"
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
            className="lg:hidden p-2   text-[#c47c30] hover:border-[#c47c30] hover:bg-[#c47c30]/5 transition-all duration-200"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
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
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t-2 border-[#c47c30]/20"
          >
            {/* Mobile drawer top accent */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c47c30]/40 to-transparent" />
            <nav className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors border ${
                        isActive
                          ? "text-[#c47c30] bg-orange-50 border-[#c47c30]/20"
                          : "text-[#241712]/70 hover:text-[#c47c30] hover:bg-gray-50 border-transparent hover:border-[#c47c30]/10"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-[#c47c30]" : "bg-[#241712]/20"}`}
                      />
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