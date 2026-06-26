"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ContactServices } from "@/services/contactServices";
import { useOrganization } from "@/lib/hooks/useOrganization";

interface FormState {
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone_number: "",
  subject: "",
  message: "",
};

export default function ContactSection() {
  const { organization } = useOrganization();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await ContactServices.create(form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err: any) {
      setError(ContactServices.parseError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-8 md:px-12 px-4"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">

        {/* Left Side: Map — uses location_url from API */}
        <div className="w-full h-[500] rounded-xl overflow-hidden border border-gray-100">
          <iframe
            src={
              organization?.location_url || "google map"
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-950 leading-tight">
            If You Have Any Query, Please Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed pt-3">
            We are here to assist you. If you have any questions or need
            detailed information about our services or facilities, please feel
            free to reach out. Fill out our contact form, and our dedicated team
            will respond promptly to address your concerns.
          </p>

          <form className="pt-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-1 focus:ring-[#c47c30] transition-all"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-1 focus:ring-[#c47c30] transition-all"
              />
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-1 focus:ring-[#c47c30] transition-all"
              />
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-1 focus:ring-[#c47c30] transition-all"
              />
            </div>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              rows={4}
              required
              className="w-full mt-3 p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-1 focus:ring-[#c47c30] transition-all"
            />

            {/* Success / Error feedback — same layout, no extra UI */}
            {success && (
              <p className="mt-2 text-sm text-[#c47c30] font-medium">
                ✓ Message sent successfully!
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 bg-[#c47c30] text-white py-2 rounded-sm font-bold text-lg  transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}