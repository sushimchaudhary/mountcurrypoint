"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Target,  Trophy, Star } from "lucide-react";

export default function CompanyStrategy() {
  const [activeTab, setActiveTab] = useState("Mission");

  const tabs = [
    { name: "Mission", icon: <Eye size={18} /> },
    { name: "Goals", icon: <Target size={18} /> },
    { name: "Management", icon: <Star size={18} /> },
    { name: "Objective", icon: <Trophy size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Mission":
        return (
          <>
            <h3 className="text-2xl font-bold text-blue-950 mb-4">Mission</h3>
            <p className="font-bold text-gray-700 italic mb-4">
              “To deliver diverse, high-quality services across multiple sectors
              with integrity, innovation, and a customer-first approach—building
              a trusted brand that enhances lives and connects communities
              through excellence.”
            </p>
            <p className="text-gray-600">
              Aryatara's mission is to create a meaningful and lasting impact
              through every service offered, be it through a warm plate of food
              at <em>Mount Curry Point</em>, a cutting-edge solution from{" "}
              <em>Webkha</em>, or a reliable ride through its automotive
              ventures.
            </p>
          </>
        );
        case "Goals":
        return (
            <>
            <h3 className="text-2xl font-bold text-blue-950 mb-4">Goals</h3>
            <ul className="space-y-6">
                {/* Short-Term Goals */}
                <li>
                <h4 className="font-bold text-blue-900 mb-2">Short-Term Goals (1–2 years):</h4>
                <ul className="list-disc ml-5 space-y-1 text-gray-600">
                    <li>Launch and solidify operations of Mount Curry Point (restaurant services) and Webkha (IT solutions).</li>
                    <li>Establish a brand identity that reflects Aryatara's multi-service capabilities.</li>
                    <li>Build partnerships and client networks within Japan.</li>
                </ul>
                </li>

                {/* Mid-Term Goals */}
                <li>
                <h4 className="font-bold text-blue-900 mb-2">Mid-Term Goals (3–5 years):</h4>
                <ul className="list-disc ml-5 space-y-1 text-gray-600">
                    <li>Expand the Mount Curry Point brand to multiple locations.</li>
                    <li>Position Webkha as a competitive IT firm in the Asia-Pacific region.</li>
                    <li>Introduce Aryatara’s automobile-related services (car rental, repair, or sales).</li>
                    <li>Develop an integrated service model combining hospitality, IT, and logistics.</li>
                </ul>
                </li>

                {/* Long-Term Goals */}
                <li>
                <h4 className="font-bold text-blue-900 mb-2">Long-Term Goals (5+ years):</h4>
                <ul className="list-disc ml-5 space-y-1 text-gray-600">
                    <li>Become a recognized regional conglomerate in Asia offering diverse, reliable, and tech-enhanced services.</li>
                    <li>Diversify further into sectors such as travel, education, and digital commerce.</li>
                    <li>Achieve sustainable growth and be known for innovation, ethics, and community value.</li>
                </ul>
                </li>
            </ul>
            </>
        );

        case "Management":
        return (
            <>
            <h3 className="text-2xl font-bold text-blue-950 mb-4">Management</h3>
            <p className="text-gray-600 mb-4">
                Aryatara Private Limited is led by a passionate and visionary management team committed 
                to driving innovation, operational excellence, and long-term impact. The leadership 
                brings together professionals with diverse expertise across business development, IT, 
                hospitality, finance, and strategy. The company follows a <b> decentralized management structure, </b>
                empowering each subsidiary brand —like <i> Mount Curry Point </i> and <i> Webkha </i> —to operate independently 
                while aligning with Aryatara’s core mission and values.
            </p>
            
            <h4 className="font-bold text-blue-900 mb-2">Key management principles include:</h4>
            <ul className="list-disc ml-5 text-gray-600">
                <li>Transparent and ethical governance</li>
                <li>Empowerment of individual teams and local leadership</li>
                <li>Data-driven decision-making</li>
                <li>Customer satisfaction as a core performance metric</li>
                <li>Sustainable and inclusive growth</li>
            </ul>
            </>
        );
      
        case "Objective":
        return (
          <>
            <h3 className="text-2xl font-bold text-blue-950 mb-4">Objective</h3>
            <ul className="list-disc ml-5 space-y-2 text-gray-600">
              <li>
                <b>To establish a strong multi-sector presence </b> under the Aryatara
                brand by providing high-quality, reliable services in the fields
                of hospitality, information technology, automobile services, and
                beyond.
              </li>
              <li>
                <b>To nurture and grow subsidiary brands </b> such as <i>Mount Curry Point</i>
                and Webkha into leading names in their respective industries.
              </li>
              <li>
                <b>To expand service reach both locally and internationally, </b>
                starting from Japan and growing into other Asian and global
                markets.
              </li>
              <li>
                <b>To foster innovation and technology-driven solutions </b> in every
                sector we serve, ensuring efficiency and modernity in service
                delivery.
              </li>
              <li>
                <b>To create employment opportunities </b> and support local economies
                by investing in talent development, infrastructure, and ethical
                business practices.
              </li>
            </ul>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-12 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left side: Tabs and Content */}
      <div className="min-h-[450]">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          Company Strategy
        </h2>
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.name
                  ? "bg-[#007a3e] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right side: Image */}
      <div className="flex justify-center items-start mt-10">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src="/image/A_1.png"
            alt="Company Logo"
            fill
            className="object-contain rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
