"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Briefcase, Clock, ArrowLeft, Send, CheckCircle2,
  Loader2, X, User, Mail, Phone, MapPin,
  FileText, Upload, AlertCircle, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { JobServices, JobApplicationServices } from "@/services/jobServices";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Job {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ApplicationForm {
  name: string;
  email: string;
  contact: string;
  address: string;
  short_description: string;
}


// ── Strip HTML tags → plain text for table preview ────────────────────────────
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Application Modal (same as careers page) ──────────────────────────────────
function ApplicationModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationForm>();

  useEffect(() => {
    reset();
    setCvFile(null);
    setCvError(null);
    setSubmitted(false);
    setError(null);
  }, [job, reset]);

  function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCvFile(file);
    if (file) setCvError(null);
  }

  async function onSubmit(values: ApplicationForm) {
    if (!cvFile) { setCvError("Please upload your CV."); return; }
    if (!job) return;

    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("job", String(job.id));
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("contact", values.contact);
      fd.append("address", values.address);
      fd.append("short_description", values.short_description);
      fd.append("cv", cvFile);

      await JobApplicationServices.submitApplication(fd);
      setSubmitted(true);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setError(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", "));
      } else if (typeof data === "string") {
        setError(data);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    reset();
    setCvFile(null);
    setCvError(null);
    setSubmitted(false);
    setError(null);
    onClose();
  }

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all";
  const labelClass =
    "flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";
  const errClass = "text-[11px] text-red-500 mt-1";

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-4 flex items-start justify-between gap-4 shrink-0">
              <div>
                <p className="text-[11px] font-semibold text-green-100 uppercase tracking-widest mb-0.5">
                  Job Application
                </p>
                <h3 className="text-white font-bold text-base leading-snug">
                  {job.name}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0 mt-0.5"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Success */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-600" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Application Submitted!</h4>
                  <p className="text-sm text-gray-500">
                    Thank you for applying for <strong>{job.name}</strong>. We'll be in touch soon.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-2 px-6 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <div className="overflow-y-auto flex-1 scrollbar-hide">
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-3">

                  {/* Name */}
                  <div>
                    <label className={labelClass}><User size={11} /> Full Name *</label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                    {errors.name && <p className={errClass}>{errors.name.message}</p>}
                  </div>

                  {/* Email + Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Mail size={11} /> Email *</label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                        })}
                        placeholder="your@email.com"
                        className={inputClass}
                      />
                      {errors.email && <p className={errClass}>{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}><Phone size={11} /> Contact *</label>
                      <input
                        type="text"
                        {...register("contact", {
                          required: "Contact is required",
                          pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" },
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                          },
                        })}
                        placeholder="98XXXXXXXX"
                        className={inputClass}
                      />
                      {errors.contact && <p className={errClass}>{errors.contact.message}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className={labelClass}><MapPin size={11} /> Address *</label>
                    <input
                      {...register("address", { required: "Address is required" })}
                      placeholder="Your current address"
                      className={inputClass}
                    />
                    {errors.address && <p className={errClass}>{errors.address.message}</p>}
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className={labelClass}><Upload size={11} /> Upload CV *</label>
                    <label
                      className={`flex items-center gap-3 w-full bg-gray-50 border-2 border-dashed rounded px-4 py-3 cursor-pointer transition-colors group ${
                        cvError
                          ? "border-red-300 hover:border-red-400"
                          : cvFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-green-400"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${cvFile ? "bg-green-100" : "bg-green-50 group-hover:bg-green-100"}`}>
                        {cvFile
                          ? <CheckCircle2 size={16} className="text-green-600" />
                          : <FileText size={16} className="text-green-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-semibold truncate ${cvFile ? "text-green-700" : "text-gray-500"}`}>
                          {cvFile ? cvFile.name : "Click to upload your CV"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {cvFile ? `${(cvFile.size / 1024).toFixed(1)} KB` : "PDF, DOC, DOCX — max 5MB"}
                        </p>
                      </div>
                      <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
                    </label>
                    {cvError && <p className={errClass}>{cvError}</p>}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className={labelClass}><FileText size={11} /> Cover Letter / Introduction *</label>
                    <textarea
                      {...register("short_description", {
                        required: "Please write a brief introduction",
                        minLength: { value: 20, message: "At least 20 characters required" },
                      })}
                      rows={4}
                      placeholder="Tell us about yourself and why you're a great fit..."
                      className={`${inputClass} resize-none`}
                    />
                    {errors.short_description && <p className={errClass}>{errors.short_description.message}</p>}
                  </div>

                  {/* API error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                      <p className="text-[12px] text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-1 pb-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded text-sm font-bold transition-colors shadow-md shadow-green-200 flex items-center justify-center gap-2"
                    >
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                        : <><Send size={15} /> Submit Application</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6">
      <div className="h-4 w-24 bg-gray-200 rounded-full" />
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2 w-full bg-gray-200" />
        <div className="p-8 space-y-4">
          <div className="h-7 w-2/3 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full bg-gray-200 rounded-full" />
            <div className="h-3 w-5/6 bg-gray-200 rounded-full" />
            <div className="h-3 w-4/6 bg-gray-200 rounded-full" />
            <div className="h-3 w-full bg-gray-200 rounded-full" />
            <div className="h-3 w-3/6 bg-gray-200 rounded-full" />
          </div>
          <div className="pt-4 h-12 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!slug) return;
    JobServices.getDetails()
      .then((data: Job[]) => {
        const list: Job[] = Array.isArray(data) ? data : [];
        const found = list.find((j) => j.slug === slug);
        if (found) setJob(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Not found ──
  if (!loading && notFound) {
    return (
      <div className="max-w-7xl mx-auto md:px-12 px-4 py-20">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-blue-950">Position Not Found</h2>
          <p className="text-sm text-gray-400">This job listing may have been removed or is no longer available.</p>
          <Link
            href="/careers"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto max-w-7xl md:px-12 px-4 py-10">

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link
          href="/career"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to all positions
        </Link>
      </motion.div>

      {loading && <DetailSkeleton />}

      {!loading && job && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className=" "
        >
          {/* ── Main card ── */}
          <div className="bg-white w-full rounded-lg border border-gray-100 shadow-sm overflow-hidden mb-6">
            {/* Green accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-400" />

            <div className="p-8">
              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <Briefcase size={22} className="text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-blue-950 leading-tight">
                      {job.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                        {job.status}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={11} />
                        <span className="text-[11px]">
                          Posted {format(new Date(job.created_at), "dd MMM yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 mb-6" />

              {/* Description */}
              <div className="mb-8">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  About This Role
                </p>
                <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">
                  <div
  className="
    prose prose-sm max-w-none text-justify
    [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-[15px] [&_p]:text-gray-600
    [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1
    [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1
    [&_li]:text-gray-600 [&_li]:text-[15px]
    [&_h4]:font-bold [&_h4]:text-blue-900 [&_h4]:mb-2 [&_h4]:mt-4
    [&_b]:text-gray-800 [&_strong]:text-gray-800
    [&_i]:italic [&_em]:italic
  "
  dangerouslySetInnerHTML={{ __html: job.description ?? "" }}
/>
                </div>
              </div>

              {/* Apply CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setApplyJob(job)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-bold transition-colors shadow-md shadow-green-200"
              >
                <Send size={15} />
                Apply for This Position
              </motion.button>
            </div>
          </div>

          {/* ── Info strip ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-green-50 border border-green-100 rounded-lg px-6 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-green-600" />
            </div>
            <p className="text-[13px] text-green-800">
              <span className="font-semibold">Last updated</span>{" "}
              {format(new Date(job.updated_at), "dd MMM yyyy 'at' hh:mm a")}
              {" · "}Applications are reviewed on a rolling basis.
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Application Modal */}
      <ApplicationModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  );
}