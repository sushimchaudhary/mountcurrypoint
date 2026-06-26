"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";          // ✅ fix 1: was "motion/react"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Image, Modal, Tag } from "antd";
import {
  PlayCircleOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { GalleryServices } from "@/services/galleryServices";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: number;
  title: string;
  image: string;
  video_url: string | null;
  created_at: string;
}

type FilterType = "all" | "photo" | "video";

const ITEMS_PER_PAGE = 16;
const COLS_DESKTOP = 4;
const COLS_MOBILE = 2;

// ── AspectRatio (inline — no shadcn dep) ─────────────────────────────────────
// ✅ fix 2: replaces @/components/ui/aspect-ratio
function AspectRatio({
  ratio,
  className,
  children,
  divRef,
}: {
  ratio: number;
  className?: string;
  children?: React.ReactNode;
  divRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={divRef} className={cn("relative w-full", className)} style={{ paddingBottom: `${(1 / ratio) * 100}%` }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// ── LazyImage ─────────────────────────────────────────────────────────────────
type LazyImageProps = {
  alt: string;
  src: string;
  className?: string;
  containerClassName?: string;
  fallback?: string;
  ratio: number;
  inView?: boolean;
};

function LazyImage({
  alt,
  src,
  ratio,
  fallback,
  inView = false,
  className,
  containerClassName,
}: LazyImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isInView = useInView(ref, { once: true });

  const [imgSrc, setImgSrc] = useState<string | undefined>(inView ? undefined : src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (fallback) setImgSrc(fallback);
    setIsLoading(false);
  };

  const handleLoad = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    if (inView && isInView && !imgSrc) setImgSrc(src);
  }, [inView, isInView, src, imgSrc]);

  useEffect(() => {
    if (imgRef.current?.complete) handleLoad();
  }, [handleLoad]);

  return (
    <AspectRatio
      ratio={ratio}
      className={cn("overflow-hidden bg-accent/30", containerClassName)}
      divRef={ref}
    >
      {imgSrc && (
        <img
          ref={imgRef}
          alt={alt}
          src={imgSrc}
          role="presentation"
          decoding="async"
          fetchPriority={inView ? "high" : "low"}
          loading="lazy"
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "size-full object-cover transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
      )}
    </AspectRatio>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function splitIntoColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

function getRatio(id: number, colIdx: number): number {
  return (id + colIdx) % 3 === 0 ? 9 / 16 : 16 / 9;
}

// ── Filter Button ─────────────────────────────────────────────────────────────
function FilterBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Video Modal ───────────────────────────────────────────────────────────────
// ✅ fix 3: antd v6 Modal has no styles.content — use style + classNames instead
function VideoModal({
  item,
  open,
  onClose,
}: {
  item: GalleryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      destroyOnClose
      styles={{
        body: { padding: 0, overflow: "hidden", background: "#000" },
        mask: { backdropFilter: "blur(6px)" },
        wrapper: { borderRadius: 16, overflow: "hidden" },
      }}
      closeIcon={
        <span className="text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-base transition">
          ✕
        </span>
      }
    >
      {item && (
        <>
          <video
            ref={videoRef}
            src={item.video_url!}
            poster={item.image}
            controls
            autoPlay
            className="w-full max-h-[72vh] object-contain bg-black block"
          />
          <div className="px-5 py-3 bg-gray-900 flex items-center gap-2">
            <VideoCameraOutlined className="text-green-400" />
            <span className="text-white text-sm font-medium truncate">{item.title}</span>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
function GalleryCard({
  item,
  colIdx,
  delay,
  onVideoClick,
}: {
  item: GalleryItem;
  colIdx: number;
  delay: number;
  onVideoClick: (item: GalleryItem) => void;
}) {
  const isVideo = !!item.video_url;
  const ratio = getRatio(item.id, colIdx);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden rounded-lg cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {isVideo ? (
        <div className="relative" onClick={() => onVideoClick(item)}>
          <LazyImage
            alt={item.title}
            src={item.image}
            ratio={ratio}
            fallback="https://placehold.co/800x600/"
            inView
            containerClassName="rounded-lg"
            className="group-hover:scale-[1.05] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <PlayCircleOutlined style={{ fontSize: 30, color: "#dc2626" }} />
            </div>
          </div>
          <div className="absolute top-2.5 right-2.5">
            <Tag
              icon={<VideoCameraOutlined />}
              color="volcano"
              style={{ margin: 0, fontSize: 10, borderRadius: 20, fontWeight: 600 }}
            >
              VIDEO
            </Tag>
          </div>
        </div>
      ) : (
        // ✅ fix 4: no `items` prop on PreviewGroup — each Image auto-registers in group
        <AspectRatio ratio={ratio} className="rounded-lg overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              transition: "transform 0.5s ease",
            }}
            wrapperStyle={{ width: "100%", height: "100%" }}
            className="group-hover:scale-[1.05]"
            loading="lazy"
            preview={{
              mask: (
                <div className="flex flex-col items-center gap-1.5 text-white text-xs font-semibold">
                  <PictureOutlined style={{ fontSize: 22 }} />
                  View
                </div>
              ),
            }}
          />
        </AspectRatio>
      )}

      {/* Title slide-up */}
      <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 bg-linear-to-t from-black/95 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none rounded-b-2xl">
        <p className="text-white text-[14px] font-medium truncate">{item.title}</p>
      </div>

      {/* Green accent line */}
      <div className="absolute bottom-0 left-0 w-0 h-0.75 bg-green-500 group-hover:w-full transition-all duration-500 rounded-b-2xl pointer-events-none" />
    </motion.div>
  );
}

// ── Masonry Grid ──────────────────────────────────────────────────────────────
function MasonryGrid({
  items,
  cols,
  onVideoClick,
}: {
  items: GalleryItem[];
  cols: number;
  onVideoClick: (item: GalleryItem) => void;
}) {
  const columns = splitIntoColumns(items, cols);
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="grid gap-4">
          {col.map((item, rowIdx) => {
            const flatIdx = columns.slice(0, colIdx).reduce((acc, c) => acc + c.length, 0) + rowIdx;
            return (
              <GalleryCard
                key={item.id}
                item={item}
                colIdx={colIdx}
                delay={flatIdx * 0.04}
                onVideoClick={onVideoClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function GallerySkeleton({ cols }: { cols: number }) {
  const ratios = [9 / 16, 16 / 9, 9 / 16, 16 / 9, 16 / 9, 9 / 16, 16 / 9, 9 / 16];
  const columns = splitIntoColumns(ratios, cols);
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {columns.map((col, ci) => (
        <div key={ci} className="grid gap-4">
          {col.map((ratio, ri) => (
            <AspectRatio key={ri} ratio={ratio} className="rounded-lg overflow-hidden">
              <div className="w-full h-full bg-linear-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
            </AspectRatio>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [videoItem, setVideoItem] = useState<GalleryItem | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    GalleryServices.getDetails()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(GalleryServices.parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? items
      : filter === "video"
      ? items.filter((i) => i.video_url)
      : items.filter((i) => !i.video_url);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeFilter(f: FilterType) {
    setFilter(f);
    setCurrentPage(1);
  }

  function openVideo(item: GalleryItem) {
    setVideoItem(item);
    setVideoOpen(true);
  }

  return (
    <div className="max-w-7xl mx-auto">


      <section className="px-4 md:px-12 py-14">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[#c47c30] font-semibold text-xs uppercase tracking-widest mb-1">
            Our Moments
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 leading-tight">
            All Photos & Videos
          </h2>
          <div className="mt-3 w-14 h-1 bg-[#c47c30] rounded-full" />
          {loading ? (
            <div className="mt-3 w-40 h-3.5 bg-gray-200 animate-pulse rounded-full" />
          ) : (
            !error && (
              <p className="mt-3 text-sm text-gray-400">
                {filtered.length} {filter === "all" ? "items" : filter + "s"} in our collection
              </p>
            )
          )}
        </motion.div>

        {/* Filter bar */}
        {!loading && !error && items.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            <FilterBtn
              active={filter === "all"}
              onClick={() => changeFilter("all")}
              icon={<AppstoreOutlined />}
              label={`All (${items.length})`}
            />
            <FilterBtn
              active={filter === "photo"}
              onClick={() => changeFilter("photo")}
              icon={<PictureOutlined />}
              label={`Photos (${items.filter((i) => !i.video_url).length})`}
            />
            <FilterBtn
              active={filter === "video"}
              onClick={() => changeFilter("video")}
              icon={<VideoCameraOutlined />}
              label={`Videos (${items.filter((i) => i.video_url).length})`}
            />
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <>
            <div className="hidden md:block"><GallerySkeleton cols={COLS_DESKTOP} /></div>
            <div className="block md:hidden"><GallerySkeleton cols={COLS_MOBILE} /></div>
          </>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <PictureOutlined style={{ fontSize: 36, color: "#f87171" }} />
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-3 text-center">
            <PictureOutlined style={{ fontSize: 36, color: "#9ca3af" }} />
            <p className="text-gray-400 text-sm">
              No {filter === "all" ? "items" : filter + "s"} found.
            </p>
          </div>
        )}

        {/* Grid — PreviewGroup with NO `items` prop (antd v6 auto-collects children) */}
        {!loading && !error && paginated.length > 0 && (
          <Image.PreviewGroup>
            <div className="hidden md:block">
              <MasonryGrid items={paginated} cols={COLS_DESKTOP} onVideoClick={openVideo} />
            </div>
            <div className="block md:hidden">
              <MasonryGrid items={paginated} cols={COLS_MOBILE} onVideoClick={openVideo} />
            </div>
          </Image.PreviewGroup>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={cn(
                  "w-9 h-9 rounded-full text-sm font-semibold transition-all",
                  currentPage === p
                    ? "bg-green-600 text-white shadow-md shadow-green-200"
                    : "border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} items
          </p>
        )}
      </section>

      {/* Video Modal */}
      <VideoModal item={videoItem} open={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}