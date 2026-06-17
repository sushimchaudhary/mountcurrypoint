"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Building2,
  BriefcaseBusiness,
  FolderKanban,
  Users,
  Image as ImageIcon,
  MessageSquareText,
  FileText,
  SlidersHorizontal,
  UserCog,
  Circle,
} from "lucide-react";
import { useOrganization } from "@/lib/hooks/useOrganization";

export type SidebarStyle = "light" | "dark" | "white" | "theme";
export type MenuColor = "light" | "dark" | "brand";
export type SidebarSize =
  | "default"
  | "condensed"
  | "hover"
  | "compact"
  | "full"
  | "fullscreen";

interface SidebarNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarStyle: SidebarStyle;
  menuColor: MenuColor;
  sidebarSize: SidebarSize;
  setSidebarSize: React.Dispatch<React.SetStateAction<SidebarSize>>;  activeColor: string;
  layoutMode: "fluid" | "boxed" | "detached";
}

type SubMenuItem = {
  labelKey: string;
  href: string;
  icon?: React.ElementType;
};

type MenuItem = {
  icon: React.ElementType;
  labelKey: string;
  href?: string;
  children?: SubMenuItem[];
};

type MenuGroup = {
  groupKey: string;
  label?: string;
  items: MenuItem[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    groupKey: "dashboard",
    items: [
      { icon: LayoutDashboard, labelKey: "Dashboard", href: "/cms/dashboard" },
    ],
  },
  {
    groupKey: "content_management",
    label: "Content Management",
    items: [
      {
        icon: Building2,
        labelKey: "Company",
        children: [
          { labelKey: "Chairman Message", href: "/cms/chairman-message" },
          { labelKey: "Overview", href: "/cms/company-overview" },
          { labelKey: "Strategy", href: "/cms/company-strategy" },
        ],
      },
      { icon: ImageIcon, labelKey: "Galleries", href: "/cms/galleries" },
      { icon: FolderKanban, labelKey: "Projects", href: "/cms/project-manage" },
      { icon: SlidersHorizontal, labelKey: "Slider Images", href: "/cms/slider-images" },
    ],
  },
  {
    groupKey: "hr_and_recruitment",
    label: "HR & Recruitment",
    items: [
      {
        icon: BriefcaseBusiness,
        labelKey: "Jobs",
        children: [
          { labelKey: "Manage Jobs", href: "/cms/jobs-details" },
          { labelKey: "Applications", href: "/cms/job-applications" },
        ],
      },
      { icon: Users, labelKey: "Team Members", href: "/cms/team-members" },
    ],
  },
  {
    groupKey: "system_management",
    label: "System Settings",
    items: [
      { icon: Building2, labelKey: "Organizations", href: "/cms/organizations" },
      { icon: MessageSquareText, labelKey: "Contact List", href: "/cms/contacts" },
      { icon: FileText, labelKey: "Legal Docs", href: "/cms/legal-docs" },
      { icon: UserCog, labelKey: "User Management", href: "/cms/users" },
    ],
  },
];

const GROUP_LABELS: Record<string, string> = {
  dashboard: "Main",
  content_management: "Content Management",
  hr_and_recruitment: "HR & Recruitment",
  system_management: "System Settings",
};

export default function SidebarNav({
  sidebarOpen,
  sidebarStyle,
  menuColor,
  sidebarSize,
  setSidebarSize,
  
  activeColor,
  layoutMode,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const { organization, loading } = useOrganization();

  useEffect(() => {
    MENU_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
          );
          if (hasActiveChild) {
            setOpenSubmenus((prev) => ({ ...prev, [item.labelKey]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleSubmenu = (labelKey: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [labelKey]: !prev[labelKey] }));
  };

  const isDarkSidebar = menuColor !== "light" || sidebarStyle !== "white";

  const getSidebarClass = () => {
    if (menuColor === "dark") return "bg-[#1e293b] text-slate-300";
    if (menuColor === "brand") return "text-white";
    if (sidebarStyle === "white") return "bg-white text-slate-700 border-r border-gray-200";
    if (sidebarStyle === "light") return "bg-[#192a3e] text-slate-300";
    if (sidebarStyle === "dark") return "bg-slate-950 text-slate-300";
    return "text-white";
  };

  const getSidebarInlineStyle = (): React.CSSProperties => {
    if (menuColor === "brand") return { backgroundColor: activeColor };
    if (menuColor !== "light") return {};
    return sidebarStyle === "theme" ? { backgroundColor: activeColor } : {};
  };

  const getSidebarWidth = () => {
    if (!sidebarOpen || sidebarSize === "condensed") return "w-[58px]";
    if (sidebarSize === "hover") return "w-[58px]";
    if (sidebarSize === "compact") return "w-[160px]";
    if (sidebarSize === "full") return "w-[280px]";
    if (sidebarSize === "fullscreen") return "w-screen";
    return "w-[220px]";
  };

  const showLabels =
    sidebarOpen &&
    sidebarSize !== "condensed" &&
    sidebarSize !== "hover";

  const scrollbarStyle: React.CSSProperties = {
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.15) transparent",
  };

  // ── Logo component using real API data ──
  const LogoDisplay = ({ hoverMode = false }: { hoverMode?: boolean }) => {
    const isCollapsed = !showLabels && !hoverMode;
    const sizeClass = isCollapsed ? "w-9 h-9" : "w-16 h-16";

    if (loading) {
      return (
        <div
          className={`${sizeClass} rounded-full bg-white/20 animate-pulse shrink-0`}
        />
      );
    }

    if (organization?.logo) {
      return (
        <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 bg-white/10`}>
          <Image
            src={organization.logo}
            alt={organization.title ?? "Logo"}
            width={40}
            height={40}
            className="w-full h-full object-center"
            unoptimized // remove if you add the API domain to next.config
          />
        </div>
      );
    }

    // Fallback grid logo
    return (
      <div
        className={`${sizeClass} grid grid-cols-2 gap-0.5 shrink-0 rounded-full overflow-hidden bg-white/20 p-1`}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 rounded-sm" />
        ))}
      </div>
    );
  };

  const renderItem = (item: MenuItem, hoverMode = false) => {
    const label = item.labelKey;
    const isActive = item.href
      ? item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(item.href + "/")
      : false;
    const hasChildren = !!item.children?.length;
    const isSubOpen = openSubmenus[item.labelKey] ?? false;
    const labelsOn = hoverMode ? true : showLabels;

    if (hasChildren) {
      return (
        <div key={item.labelKey}>
          <div
            onClick={() => toggleSubmenu(item.labelKey)}
            className={`flex items-center justify-between px-2 py-1.5 cursor-pointer transition-colors mx-3 rounded my-0.5 ${
              isActive
                ? "bg-white/20 text-white font-semibold"
                : isDarkSidebar
                ? "text-slate-200 hover:text-white hover:bg-white/10"
                : "text-slate-400 hover:text-slate-800 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <item.icon
                size={16}
                className={`shrink-0 ${isActive ? "text-white" : "text-slate-300"}`}
              />
              {labelsOn && (
                <span className={`text-sm truncate ${isActive ? "font-semibold text-white" : ""}`}>
                  {label}
                </span>
              )}
            </div>
            {labelsOn && (
              <span className="shrink-0">
                {isSubOpen
                  ? <ChevronDown size={13} className="text-slate-400" />
                  : <ChevronRight size={13} className="text-slate-400" />}
              </span>
            )}
          </div>

          {isSubOpen && labelsOn && (
            <div className="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5">
              {item.children!.map((sub) => {
                const subLabel = sub.labelKey;
                const isSubActive =
                  pathname === sub.href || pathname.startsWith(sub.href + "/");
                const SubIcon = sub.icon ?? Circle;
                return (
                  <Link href={sub.href} key={sub.labelKey}>
                    <div
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors mx-1 ${
                        isSubActive
                          ? "bg-white/20 text-white font-semibold"
                          : isDarkSidebar
                          ? "text-slate-300 hover:text-white hover:bg-white/10"
                          : "text-slate-500 hover:text-slate-800 hover:bg-gray-100"
                      }`}
                    >
                      <SubIcon
                        size={13}
                        className={`shrink-0 ${isSubActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span className="truncate">{subLabel}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href={item.href || "#"} key={item.labelKey}>
        <div
          className={`flex items-center gap-3 px-2 py-1.5 cursor-pointer transition-colors mx-3 rounded my-0.5 ${
            isActive
              ? "bg-white/20 text-white font-semibold"
              : isDarkSidebar
              ? "text-slate-50 hover:text-white hover:bg-white/10"
              : "text-slate-600 hover:text-slate-800 hover:bg-gray-100"
          }`}
        >
          <item.icon
            size={16}
            className={`shrink-0 ${isActive ? "text-white" : "text-slate-300"}`}
          />
          {labelsOn && (
            <span className={`text-sm truncate ${isActive ? "font-semibold text-white" : ""}`}>
              {label}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const renderGroupedNav = () =>
    MENU_GROUPS.map((group, gi) => (
      <div key={group.groupKey}>
        <div className={`${gi === 0 ? "mt-1" : "mt-3"} mb-1`}>
          {showLabels ? (
            <p className="px-5 text-[10px] font-bold uppercase tracking-widest select-none text-black">
              {GROUP_LABELS[group.groupKey] ?? group.label ?? group.groupKey}
            </p>
          ) : (
            gi > 0 && <div className="mx-4 border-t border-white/10" />
          )}
        </div>
        {group.items.map((item) => renderItem(item))}
      </div>
    ));

  return (
    <aside
      className={[
        "h-screen overflow-hidden",
        getSidebarWidth(),
        "shrink-0 flex flex-col",
        "transition-all duration-300",
        "z-40",
        getSidebarClass(),
        layoutMode === "detached" ? "rounded-xl mt-15 mb-2 ml-0" : "",
        sidebarSize === "hover" ? "group relative" : "",
        sidebarSize === "fullscreen" ? "absolute inset-0 z-50" : "",
      ].filter(Boolean).join(" ")}
      style={getSidebarInlineStyle()}
    >
      {/* ── Hover-expand overlay ── */}
      {sidebarSize === "hover" && (
        <div
          className={`absolute left-full top-0 h-full w-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 flex flex-col ${getSidebarClass()} shadow-xl`}
          style={getSidebarInlineStyle()}
        >
          <div
            className={`shrink-0 h-14 flex items-center px-4 gap-3 border-b ${
              isDarkSidebar ? "border-white/10" : "border-gray-100"
            }`}
          >
            <LogoDisplay hoverMode />
            <span className="text-sm font-bold text-white tracking-wide truncate">
              {organization?.title ?? "Dashboard"}
            </span>
          </div>
          <nav
            className="flex-1 min-h-0 py-3 overflow-y-auto overflow-x-hidden"
            style={scrollbarStyle}
          >
            {MENU_GROUPS.map((group, gi) => (
              <div key={group.groupKey}>
                <div className={`${gi === 0 ? "mt-1" : "mt-3"} mb-1`}>
                  <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none">
                    {GROUP_LABELS[group.groupKey] ?? group.label ?? group.groupKey}
                  </p>
                </div>
                {group.items.map((item) => renderItem(item, true))}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* ── Logo area ── */}
      <div
        className={`shrink-0 p-2 flex flex-col items-center justify-center gap-2 border-b ${
          isDarkSidebar ? "border-white/10" : "border-gray-100"
        }`}
      >
        <div className="flex justify-center items-center w-full min-h-10">
          <LogoDisplay />
        </div>

        {sidebarSize === "fullscreen" && (
          <button
            onClick={() => setSidebarSize("default")}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Grouped nav ── */}
      <nav
        className="flex-1 min-h-0 pb-4 overflow-y-auto overflow-x-hidden"
        style={scrollbarStyle}
      >
        {renderGroupedNav()}
      </nav>
    </aside>
  );
}