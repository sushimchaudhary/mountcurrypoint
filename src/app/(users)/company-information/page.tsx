import About from "@/components/CompanyInform";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";

export async function generateMetadata() {
  return {
    title: "About Us | Arya Tara - Our Strategy and Mission",
    description: "Discover Arya Tara's mission, management, and strategic goals. Learn about our commitment to excellence.",
  };
}

export default async function AboutPage() {
  // Server-side fetching for SEO
  let overview = null;
  try {
    const data = await CompanyOverviewServices.getDetails();
    overview = Array.isArray(data) ? data[0] : null;
  } catch (error) {
    console.error("Failed to fetch:", error);
  }

  return <About initialOverview={overview} />;
}