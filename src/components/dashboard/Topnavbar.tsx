"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Settings,
  Globe,
  Clock,
  ChevronDown,
} from "lucide-react";

import { useTheme } from "@/lib/context/ThemeContext";
import { useOrganization } from "@/lib/hooks/useOrganization";

const LANGUAGES = [
   { code: "ne", label: "नेपाली" },
  { code: "en", label: "English" },
  { code: "ja", label: "Japanese" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
];

export type NavStyle = "default" | "dark";
export type TopbarColor = "light" | "dark" | "theme";

interface TopNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  topbarColor: TopbarColor;
  navStyle: NavStyle;
  activeColor: string;
  layoutMode: "fluid" | "boxed" | "detached";
  onSettingsOpen: () => void;
}

function triggerGoogleTranslate(langCode: string) {
  const selectEl = document.querySelector<HTMLSelectElement>(
    "#google_translate_element select"
  );
  if (!selectEl) return;
  selectEl.value = langCode;
  selectEl.dispatchEvent(new Event("change"));
}

export default function TopNavbar({
  sidebarOpen,
  setSidebarOpen,
  topbarColor,
  navStyle,
  activeColor,
  layoutMode,
  onSettingsOpen,
}: TopNavbarProps) {
  const { primaryColor } = useTheme();
  const { organization } = useOrganization();

  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]);
  const [formattedDates, setFormattedDates] = useState({ eng: "", nep: "" });

  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const today = new Date();
    const engDateStr = today.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    let nepDateStr = "";
    try {
      nepDateStr = today.toLocaleDateString("ne-NP");
    } catch {
      nepDateStr = today.toLocaleDateString("ne-NP");
    }
    setFormattedDates({ eng: engDateStr, nep: nepDateStr });
  }, []);

  const isDarkNav =
    topbarColor === "dark" ||
    topbarColor === "theme" ||
    (topbarColor === "light" && navStyle === "dark");

  const getNavClass = () => {
    if (topbarColor === "dark")
      return "bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm";
    if (topbarColor === "theme") return "text-white shadow-sm";
    if (navStyle === "dark")
      return "bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-sm";
    return "bg-white/95 backdrop-blur-md border-b border-gray-100 text-slate-700 shadow-sm";
  };

  const getNavInlineStyle = () =>
    topbarColor === "theme" ? { backgroundColor: activeColor } : {};

  function handleLangChange(lang: (typeof LANGUAGES)[0]) {
    setSelectedLang(lang);
    setLangOpen(false);
    triggerGoogleTranslate(lang.code);
  }

  return (
    <header
      className={`h-16 flex items-center justify-between px-1 sticky top-0 z-40 transition-all ${getNavClass()} ${
        layoutMode === "detached" ? "rounded-2xl mt-2 mx-4" : ""
      }`}
      style={getNavInlineStyle()}
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkNav
              ? "text-slate-300 hover:text-white hover:bg-white/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Menu size={22} />
        </button>

        {/* ── Organization title ── */}
        {organization?.title && (
          <span
            className={`hidden md:block text-lg font-bold tracking-wide truncate max-w-[250px] ${
              isDarkNav ? "text-white" : "text-slate-800"
            }`}
          >
            {organization.title}
          </span>
        )}

        
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-4 overflow-visible relative">
        {/* ── Live date ── */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium pl-1">
          <Clock
            size={14}
            className={`opacity-60 ${isDarkNav ? "text-slate-300" : "text-slate-500"}`}
          />
          <div className="flex items-center gap-1.5">
            <span className={isDarkNav ? "text-slate-200" : "text-slate-700"}>
              {formattedDates.eng}
            </span>
           
           
          </div>
        </div>
        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1.5 cursor-pointer rounded px-2.5 py-1 text-xs font-medium transition-colors hover:bg-gray-50 border"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            <Globe className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{selectedLang.label}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langOpen && (
            <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[130px] overflow-hidden z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${
                    selectedLang.code === lang.code ? "font-bold" : "text-gray-600"
                  }`}
                  style={{
                    color: selectedLang.code === lang.code ? primaryColor : "",
                  }}
                >
                  {lang.label}
                  {selectedLang.code === lang.code && (
                    <span className="ml-2">▸</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onSettingsOpen}
          className={`p-2 rounded-lg transition-colors ${
            isDarkNav
              ? "text-slate-300 hover:text-white hover:bg-white/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}