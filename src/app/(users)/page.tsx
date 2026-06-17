import AboutSection from "@/components/About";
import BoardOfDirectors from "@/components/BoardOfDirectors";
import ContactSection from "@/components/ContactSection";
import HeroBanner from "@/components/Hero";
import ProjectsPreview from "@/components/ProjectPreview";
import ScrollToTop from "@/components/ScrollTop";
import SliderCoverflow from "@/components/Slider";

export default function LandingPage() {
  return (
    <>
      <HeroBanner />
      <AboutSection />
      <BoardOfDirectors />
      <ProjectsPreview />
      <SliderCoverflow />
      <ContactSection />
      <ScrollToTop />
    </>
  );
}
