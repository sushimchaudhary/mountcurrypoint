import AboutPage from "@/components/AboutPage";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";

export async function generateMetadata() {
  return {
    title: "About Us | Arya Tara - Our Strategy and Mission",
    description: "Discover Arya Tara's mission, management, and strategic goals. Learn about our commitment to excellence.",
  };
}

export default async function Page() {


  return <AboutPage />;
}