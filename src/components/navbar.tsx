"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useOrganization } from "@/lib/hooks/useOrganization";

const LANGUAGES = [
  { code: "ne", label: "नेपाली" },
  { code: "en", label: "English" },
  { code: "ja", label: "जापानी" },
  { code: "hi", label: "हिन्दी" },
  { code: "ko", label: "कोरियन" },
];

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  {
    label: "ABOUT",
    href: "#",
    children: [{ label: "Company Introduction", href: "/company-information" }],
  },
  { label: "CHAIRMAN'S MESSAGE", href: "/chairman" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CAREER", href: "/career" },
  { label: "CONTACT", href: "/contact" },
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
  const { organization } = useOrganization();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node))
        setAboutOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLangChange(lang: (typeof LANGUAGES)[0]) {
    setSelectedLang(lang);
    setLangOpen(false);
    triggerGoogleTranslate(lang.code);
  }

  // Logo section: show API logo if available, else fall back to local file
  const LogoContent = () => {
    if (organization?.logo) {
      return (
        <Image
          src={organization.logo}
          alt={organization.title ?? "Logo"}
          width={120}
          height={70}
          className="object-contain border-r border-gray-200"
          unoptimized // remove once you add the API hostname to next.config.js
        />
      );
    }
    return (
      <Image
        src="/image/arya.png"
        alt="Arya Tara Logo"
        width={120}
        height={70}
        className="object-contain border-r border-gray-200"
      />
    );
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      <nav className="sticky top-0 z-50 border-b border-gray-200">
        <div className="px-4 md:px-10 py-3 flex justify-between items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0 select-none">
            <LogoContent />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-4 font-bold text-green-800 text-md">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li key={link.label} className="relative group" ref={aboutRef}>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded cursor-pointer hover:text-green-600 transition-all ${
                      link.children.some((child) => child.href === pathname)
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : ""
                    }`}
                  >
                    {link.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div
                    className="absolute left-0 mt-0 bg-white border border-gray-100 rounded-sm shadow-md min-w-[200px] z-50
                      opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-300 ease-out origin-top"
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all border-b border-gray-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`block px-3 py-2 rounded hover:text-green-600 transition-all ${
                      pathname === link.href
                        ? "text-yellow-500 border-b-2 border-yellow-500"
                        : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 cursor-pointer border border-yellow-400 rounded px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-blue-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-green-700" />
                <span>{selectedLang.label}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform text-green-700 ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[130px] overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang)}
                      className={`w-full text-left px-2 py-1.5 text-sm transition-colors hover:bg-blue-50 ${
                        selectedLang.code === lang.code
                          ? "font-bold text-yellow-500"
                          : "text-green-700"
                      }`}
                    >
                      {selectedLang.code === lang.code
                        ? `▸ ${lang.label}`
                        : lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-800">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-800">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden bg-white overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col py-2 border-t">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li key={link.label}>
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full text-left px-6 py-3 font-bold text-green-800"
                  >
                    {link.label}
                  </button>
                  <div
                    className={`bg-green-50 overflow-hidden transition-all duration-300 ${
                      mobileAboutOpen ? "max-h-32" : "max-h-0"
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-10 py-2.5 text-sm text-green-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block px-6 py-3 font-bold text-green-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}