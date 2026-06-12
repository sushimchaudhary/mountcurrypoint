import AboutSection from "@/components/About";
import BoardOfDirectors from "@/components/BoardOfDirectors";
import ContactSection from "@/components/ContactSection";
import HeroBanner from "@/components/Hero";

export default function LandingPage() {
    return (
        <>
          <HeroBanner/>
          <AboutSection/>
          <BoardOfDirectors/>
          <ContactSection/>
        </>
    )
}