import AboutSection from "@/components/About";
import BoardOfDirectors from "@/components/BoardOfDirectors";
import ContactSection from "@/components/ContactSection";
import HeroBanner from "@/components/Hero";
import ProjectsPreview from "@/components/ProjectPreview";
import ScrollToTop from "@/components/ScrollTop";
import SliderCoverflow from "@/components/Slider";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* 1. First Impression: Clear and Bold */}
      <HeroBanner />

      {/* 2. Story: About Us (Light Background) */}
      <section className="bg-white">
        <AboutSection />
      </section>

      {/* 3. Proof: Showcase your work (Subtle Grey Background) */}
      <section className="bg-gray-50 py-4">
        <ProjectsPreview />
      </section>

      {/* 4. Experience: Slider (Visual delight) */}
      <section className="bg-white py-4">
        <SliderCoverflow />
      </section>

      {/* 5. Authority: Trust & People (Soft Green tint to reflect growth) */}
      <section className="bg-green-50/50 py-4">
        <BoardOfDirectors />
      </section>

      {/* 6. Action: Contact (Final punchline) */}
      <section className="bg-white py-4">
        <ContactSection />
      </section>

      <ScrollToTop />
    </main>
  );
}
