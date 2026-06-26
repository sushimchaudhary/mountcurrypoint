import AboutSection from "@/components/About";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";

export async function generateMetadata() {
  return {
    title: "About Us | Arya Tara - Our Strategy and Mission",
    description: "Discover Arya Tara's mission, management, and strategic goals. Learn about our commitment to excellence.",
  };
}

export default async function AboutPage() {


  return <AboutSection />;
}