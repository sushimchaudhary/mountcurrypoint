"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Loader2,
  Inbox,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  Send,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { JobServices, JobApplicationServices } from "@/services/jobServices";
import { useForm } from "react-hook-form";

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
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
// ── Skeleton ──────────────────────────────────────────────────────────────────
function JobSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-lg p-6 border border-gray-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-gray-200 rounded-full" />
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded-full" />
            <div className="h-3 w-4/5 bg-gray-200 rounded-full" />
            <div className="h-3 w-3/5 bg-gray-200 rounded-full" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({
  job,
  index,
  onApply,
}: {
  job: Job;
  index: number;
  onApply: (job: Job) => void;
}) {
  return (
<motion.div
      // यहाँ ProjectCard सँग मिल्दो एनिमेसन सेट गरिएको छ
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-400" />
      <div className="p-3 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <Briefcase size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-blue-950 leading-snug group-hover:text-green-700 transition-colors">
                {job.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={11} className="text-gray-300" />
                <span className="text-[11px] text-gray-400">
                  {format(new Date(job.created_at), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
            {job.status}
          </span>
        </div>

        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 flex-1">
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
        </p>

        <div className="border-t border-gray-50" />

        {/* ── Two-button row ── */}
        <div className="flex gap-2">
          <Link
            href={`/career/${job.slug}`}
            className="flex-1 border border-green-600 text-green-700 hover:bg-green-50 py-1.5 rounded text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={14} />
            View Details
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onApply(job)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm font-bold transition-colors shadow-sm shadow-green-200 flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Apply Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Application Modal ─────────────────────────────────────────────────────────
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

  // ── CV handled via ref — NOT register() ──
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
    // Validate CV manually
    if (!cvFile) {
      setCvError("Please upload your CV.");
      return;
    }
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
      fd.append("cv", cvFile); // ← real File object, guaranteed non-null

      await JobApplicationServices.submitApplication(fd);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission Error:", err);

      const data = err?.response?.data;

      if (data) {
        if (typeof data === "object" && !Array.isArray(data)) {
          const messages = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          setError(messages);
        } else if (typeof data === "string") {
          setError(data);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Connection error. Please check your internet.");
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

            {/* Success screen */}
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
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    Application Submitted!
                  </h4>
                  <p className="text-sm text-gray-500">
                    Thank you for applying for <strong>{job.name}</strong>.
                    We'll be in touch soon.
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
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="px-6 py-4 space-y-3"
                >
                  {/* Name */}
                  <div>
                    <label className={labelClass}>
                      <User size={11} /> Full Name *
                    </label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                    {errors.name && (
                      <p className={errClass}>{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email + Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <Mail size={11} /> Email *
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                        placeholder="your@email.com"
                        className={inputClass}
                      />
                      {errors.email && (
                        <p className={errClass}>{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Phone size={11} /> Contact *
                      </label>
                      <input
                        type="text"
                        {...register("contact", {
                          required: "Contact is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Contact must be exactly 10 digits",
                          },
                          onChange: (e) => {
                            e.target.value = e.target.value
                              .replace(/[^0-9]/g, "")
                              .slice(0, 10);
                          },
                        })}
                        placeholder="98XXXXXXXX"
                        className={inputClass}
                      />
                      {errors.contact && (
                        <p className={errClass}>{errors.contact.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className={labelClass}>
                      <MapPin size={11} /> Address *
                    </label>
                    <input
                      {...register("address", {
                        required: "Address is required",
                      })}
                      placeholder="Your current address"
                      className={inputClass}
                    />
                    {errors.address && (
                      <p className={errClass}>{errors.address.message}</p>
                    )}
                  </div>

                  {/* CV Upload — ref-based, NOT register() */}
                  <div>
                    <label className={labelClass}>
                      <Upload size={11} /> Upload CV *
                    </label>
                    <label
                      className={`flex items-center gap-3 w-full bg-gray-50 border-2 border-dashed rounded px-4 py-3 cursor-pointer transition-colors group ${
                        cvError
                          ? "border-red-300 hover:border-red-400"
                          : cvFile
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 hover:border-green-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          cvFile
                            ? "bg-green-100"
                            : "bg-green-50 group-hover:bg-green-100"
                        }`}
                      >
                        {cvFile ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : (
                          <FileText size={16} className="text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[12px] font-semibold truncate ${
                            cvFile ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {cvFile ? cvFile.name : "Click to upload your CV"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {cvFile
                            ? `${(cvFile.size / 1024).toFixed(1)} KB`
                            : "PDF, DOC, DOCX — max 5MB"}
                        </p>
                      </div>
                      {/* Hidden native input — controlled via ref */}
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleCvChange}
                      />
                    </label>
                    {cvError && <p className={errClass}>{cvError}</p>}
                  </div>

                  {/* Cover letter */}
                  <div>
                    <label className={labelClass}>
                      <FileText size={11} /> Cover Letter / Introduction *
                    </label>
                    <textarea
                      {...register("short_description", {
                        required: "Please write a brief introduction",
                        minLength: {
                          value: 20,
                          message: "At least 20 characters required",
                        },
                      })}
                      rows={4}
                      placeholder="Tell us about yourself and why you're a great fit..."
                      className={`${inputClass} resize-none`}
                    />
                    {errors.short_description && (
                      <p className={errClass}>
                        {errors.short_description.message}
                      </p>
                    )}
                  </div>

                  {/* API error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                      <p className="text-[12px] text-red-600 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-1 pb-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded text-sm font-bold transition-colors shadow-md shadow-green-200 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Submit Application
                        </>
                      )}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CareerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    JobServices.getDetails()
      .then((data) => {
        const list: Job[] = Array.isArray(data) ? data : [];
        setJobs(list.filter((j) => j.status === "HIRING"));
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="md:px-12 px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
            Join Our Team
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Open Positions
          </h2>
          <div className="mt-3 w-14 h-1 bg-green-500 rounded-full" />
          {!loading && (
            <p className="mt-2 text-sm text-gray-400">
              {jobs.length} position{jobs.length !== 1 ? "s" : ""} currently
              open
            </p>
          )}
        </motion.div>

        {loading && <JobSkeleton />}

        {!loading && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">
              No open positions at the moment.
            </p>
            <p className="text-gray-300 text-sm">
              Check back later for new opportunities.
            </p>
          </motion.div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onApply={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        )}
      </section>

      <ApplicationModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
