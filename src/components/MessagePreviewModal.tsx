"use client";

import { X, Mail, Phone, Calendar, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/lib/context/ThemeContext";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  subject: string;
  message: string;
  created_at?: string;
}

interface Props {
  message: ContactMessage | null;
  onClose: () => void;
}

export default function MessagePreviewModal({ message, onClose }: Props) {

   const { primaryColor } = useTheme();

  if (!message) return null;

  return (
    <AnimatePresence>
      {message && (
        // Backdrop
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className=" px-6 py-4 flex items-start justify-between gap-4"
              style={{ backgroundColor: primaryColor }} >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider mb-0.5">
                  Message Preview
                </p>
                <h3 className="text-white font-bold text-base leading-snug truncate">
                  {message.subject}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors mt-0.5"
              >
                <X size={14} className="text-red-500" />
              </button>
            </div>

          <div className="px-6 py-3 flex flex-wrap gap-x-5 gap-y-1.5 border-b border-gray-100" style={{ backgroundColor: `${primaryColor}08` }}>
              <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: primaryColor }}>
                <User size={11} style={{ color: primaryColor }} />
                {message.name}
              </span>
              
              <Link href={`mailto:${message.email}`} className="flex items-center gap-1.5 text-[11px] font-medium hover:underline" style={{ color: primaryColor }}>
                <Mail size={11} style={{ color: primaryColor }} />
                {message.email}
              </Link>
              
              {message.phone_number && (
                <Link href={`tel:${message.phone_number}`} className="flex items-center gap-1.5 text-[11px] font-medium hover:underline" style={{ color: primaryColor }}>
                  <Phone size={11} style={{ color: primaryColor }} />
                  {message.phone_number}
                </Link>
              )}
            </div>

            {/* Message body */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
<MessageSquare size={13} style={{ color: primaryColor }} />                <p className="text-[11px] font-bold text-[#8094ae] uppercase tracking-wider">
                  Message
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-100 min-h-[100px] max-h-[260px] overflow-y-auto">
                <p className="text-[13px] text-[#526484] leading-relaxed whitespace-pre-wrap">
                  {message.message}
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-5 flex items-center justify-between gap-3">
              
             <Link 
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${message.email}&su=${encodeURIComponent(`Re: ${message.subject}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 text-white text-[12px] font-bold rounded transition-colors"
                style={{ backgroundColor: primaryColor }}
                >
                <Mail size={12} /> Reply via Mail
                </Link>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-100 border hover:text-black border-red-500 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}