"use client";
import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-20 px-12 "
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        {/* Left Side: Map */}
        <div className="w-full h-[500] rounded-xl overflow-hidden  border border-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3225.146034358264!2d139.668452!3d36.065542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018c9bf012815a3%3A0x6c9f05eae67ebc67!2z77yI5qCq77yJ56aP56WJ44Gu6KGXIOS5heWWnOWWtualreaJgA!5e0!3m2!1sen!2snp!4v1781242532240!5m2!1sen!2snp"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col  ">
         
          <h2 className="text-2xl md:text-4xl font-bold  text-blue-950 leading-tight">
            If You Have Any Query, Please Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed pt-3">
            We are here to assist you. If you have any questions or need
            detailed information about our services or facilities, please feel
            free to reach out. Fill out our contact form, and our dedicated team
            will respond promptly to address your concerns.{" "}
          </p>

          <form className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full mt-3 p-2 bg-gray-100 rounded-sm border border-gray-200 outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
            <button className="w-full mt-3 bg-green-600 text-white py-2 rounded-sm font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
