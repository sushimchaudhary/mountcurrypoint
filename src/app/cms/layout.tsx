"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "@/lib/context/ThemeContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import useAuth from "@/lib/hooks/useAuth";
import SettingsDrawer, {
  type PrimarySkin,
  type SkinMode,
  type SidebarStyle,
  type NavStyle,
  type UiStyle,
  type Direction,
  type TopbarColor,
  type MenuColor,
  type SidebarSize,
} from "@/components/ui/setting";
import TopNavbar from "@/components/dashboard/Topnavbar";
import SidebarNav from "@/components/dashboard/Sidebarnav";


// ── Split components ──────────────────────────────────────────────────────────


// ── Default values ─────────────────────────────────────────────────────────────
const DEFAULTS = {
  skinMode:    "light"   as SkinMode,
  sidebarStyle:"light"   as SidebarStyle,
  navStyle:    "default" as NavStyle,
  primarySkin: "default" as PrimarySkin,
  uiStyle:     "default" as UiStyle,
  direction:   "ltr"     as Direction,
  layoutMode:  "fluid"   as "fluid" | "boxed" | "detached",
  topbarColor: "light"   as TopbarColor,
  menuColor:   "light"   as MenuColor,
  sidebarSize: "default" as SidebarSize,
  customColor: "#10b981",
};

const LS_KEY = "pharmacy_settings";

function loadSettings() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
function saveSettings(s: typeof DEFAULTS) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}
function clearSettings() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// ── Preset color map ──────────────────────────────────────────────────────────
const PRESET_COLORS: Record<string, string> = {
  default:  "#10b981",
  bluelight:"#60a5fa",
  egyptian: "#0f4c3a",
  purple:   "#8b5cf6",
  blue:     "#3b82f6",
  red:      "#ef4444",
  orange:   "#f97316",
  pink:     "#ec4899",
  cyan:     "#06b6d4",
  yellow:   "#eab308",
};

// ── Inner component ───────────────────────────────────────────────────────────
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { setThemeConfig } = useTheme();
  const { user } = useAuth();

  const [mounted, setMounted]           = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const saved = loadSettings();
  const [skinMode,     setSkinMode]     = useState(saved.skinMode);
  const [sidebarStyle, setSidebarStyle] = useState(saved.sidebarStyle);
  const [navStyle,     setNavStyle]     = useState(saved.navStyle);
  const [primarySkin,  setPrimarySkin]  = useState(saved.primarySkin);
  const [uiStyle,      setUiStyle]      = useState(saved.uiStyle);
  const [direction,    setDirection]    = useState(saved.direction);
  const [layoutMode,   setLayoutMode]   = useState(saved.layoutMode);
  const [topbarColor,  setTopbarColor]  = useState(saved.topbarColor);
  const [menuColor,    setMenuColor]    = useState(saved.menuColor);
  const [sidebarSize,  setSidebarSize]  = useState(saved.sidebarSize);
  const [customColor,  setCustomColor]  = useState(saved.customColor);

  useEffect(() => { setMounted(true); }, []);

  // ── Active color ──────────────────────────────────────────────────────────
  const activeColor =
    primarySkin === "custom"
      ? customColor
      : (PRESET_COLORS[primarySkin] ?? "#10b981");

  useEffect(() => {
    setThemeConfig({ primaryColor: activeColor });
  }, [activeColor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mounted) {
      saveSettings({
        skinMode, sidebarStyle, navStyle, primarySkin, uiStyle,
        direction, layoutMode, topbarColor, menuColor, sidebarSize, customColor,
      });
    }
  }, [skinMode, sidebarStyle, navStyle, primarySkin, uiStyle, direction,
      layoutMode, topbarColor, menuColor, sidebarSize, customColor, mounted]);

  const handleReset = () => {
    clearSettings();
    setSkinMode(DEFAULTS.skinMode);
    setSidebarStyle(DEFAULTS.sidebarStyle);
    setNavStyle(DEFAULTS.navStyle);
    setPrimarySkin(DEFAULTS.primarySkin);
    setUiStyle(DEFAULTS.uiStyle);
    setDirection(DEFAULTS.direction);
    setLayoutMode(DEFAULTS.layoutMode);
    setTopbarColor(DEFAULTS.topbarColor);
    setMenuColor(DEFAULTS.menuColor);
    setSidebarSize(DEFAULTS.sidebarSize);
    setCustomColor(DEFAULTS.customColor);
  };

  const getLayoutWrapperClass = () => {
    if (layoutMode === "boxed")    return "max-w-[1280px] mx-auto shadow-2xl";
    if (layoutMode === "detached") return "max-w-[1400px] mx-auto px-4 pt-3";
    return "";
  };

  return (
    <div
      dir={direction}
      className={`flex h-screen font-sans overflow-hidden ${
        skinMode === "dark" ? "bg-slate-950 text-white" : "bg-[#f0f2f5] text-slate-700"
      }`}
    >
      <div className={`flex flex-1 h-full min-w-0 ${getLayoutWrapperClass()}`}>

        {/* ── PAGE 1: SIDEBAR NAV ── */}
        <SidebarNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarStyle={sidebarStyle}
          menuColor={menuColor}
          sidebarSize={sidebarSize}
          setSidebarSize={setSidebarSize}
          activeColor={activeColor}
          layoutMode={layoutMode}
        />

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* ── PAGE 2: TOP NAVBAR ── */}
          <TopNavbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            topbarColor={topbarColor}
            navStyle={navStyle}
            activeColor={activeColor}
            layoutMode={layoutMode}
            onSettingsOpen={() => setSettingsOpen(true)}
          />

          {/* CONTENT */}
          <main className="bg-white/80 flex-1 overflow-y-auto p-3">
            {children}
          </main>

          {/* SETTINGS DRAWER */}
          <SettingsDrawer
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onReset={handleReset}
            activeColor={activeColor}
            skinMode={skinMode}
            setSkinMode={setSkinMode}
            topbarColor={topbarColor}
            setTopbarColor={setTopbarColor}
            menuColor={menuColor}
            setMenuColor={setMenuColor}
            sidebarSize={sidebarSize}
            setSidebarSize={setSidebarSize}
            direction={direction}
            setDirection={setDirection}
            uiStyle={uiStyle}
            setUiStyle={setUiStyle}
            sidebarStyle={sidebarStyle}
            setSidebarStyle={setSidebarStyle}
            navStyle={navStyle}
            setNavStyle={setNavStyle}
            primarySkin={primarySkin}
            setPrimarySkin={setPrimarySkin}
            customColor={customColor}
            setCustomColor={setCustomColor}
          />

          {/* Backdrop */}
          {settingsOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Outer shell ───────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
      
          <DashboardInner>{children}</DashboardInner>
      
      </AuthProvider>
    </ThemeProvider>
  );
}


