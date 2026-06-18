"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Download, Eye, Inbox, ExternalLink } from "lucide-react";
import { LegalDocsServices } from "@/services/legaldocsServices";
import { Image as AntImage } from "antd";

interface LegalDoc {
  id: number;
  title: string;
  image: string;
  pdf: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function LegalDocSkeleton() {
  return (
    <div className="space-y-10">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Title bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-48 bg-gray-200 rounded-full" />
          </div>
          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="h-[480px] bg-gray-200" />
            <div className="h-[480px] bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Single document block ─────────────────────────────────────────────────────
function LegalDocBlock({ doc, index }: { doc: LegalDoc; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="  duration-300 overflow-hidden"
    >
      {/* ── Title row ── */}
      <div className="flex items-center justify-between px-6 py-4 ">
        <div className="flex items-center gap-3">
          {/* Document icon */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={17} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-blue-950 leading-snug">
              {doc.title}
            </h3>
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
              PDF Document
            </span>
          </div>
        </div>

       
      </div>

      {/* ── Left: image  |  Right: PDF iframe ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Left — cover / thumbnail image (antd Image with click-to-zoom preview) */}
        <div className="relative w-full h-[500px] overflow-hidden group">
          <AntImage
            src={doc.image}
            alt={doc.title}
            wrapperStyle={{ width: "100%", height: "100%" }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              borderRadius: "0.5rem",
              display: "block",
            }}
            preview={{
              mask: (
                <div className="flex flex-col items-center justify-center gap-1 text-white text-xs font-medium">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  View
                </div>
              ),
            }}
          />
        </div>

        {/* Right — embedded PDF viewer */}
        <div className="relative w-full h-[500] bg-gray-50 flex flex-col">
          <iframe
            src={`${doc.pdf}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full flex-1 border-0 rounded-lg"
            title={doc.title}
          />

          {/* Fallback bar shown if iframe doesn't render */}
          <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-3 bg-gray-50 px-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <FileText size={26} className="text-red-400" />
            </div>
            <p className="text-sm text-gray-400 text-center">
              PDF preview not available in this browser.
            </p>
            
             <Link href={doc.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-green-600 text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Eye size={14} /> Open PDF
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LegalDocsPage() {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    LegalDocsServices.getDetails()
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch((err) => setError(LegalDocsServices.parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
     

      <section className="md:px-12 px-4 py-14">
        {/* Eyebrow + count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
            Compliance & Transparency
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Legal Documents
          </h2>
          {!loading && docs.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              {docs.length} document{docs.length !== 1 ? "s" : ""} available
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && <LegalDocSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <FileText size={24} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && docs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No legal documents yet.</p>
          </div>
        )}

        {/* Document list — one block per document */}
        {!loading && !error && docs.length > 0 && (
          <div className="space-y-10">
            {docs.map((doc, index) => (
              <LegalDocBlock key={doc.id} doc={doc} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}