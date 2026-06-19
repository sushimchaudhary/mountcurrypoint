
import CareerClientPage from '@/components/career/CareerClientPage';
import { Metadata } from 'next';

export const metadata = {
  title: "Career Opportunities | aryatara",
    description: "Join our team! Explore open job positions and apply for the latest vacancies at aryatara",
  
  openGraph: {
    title: "Career Opportunities at  aryatara",
    description: "Build your career with us.",
  }
};
export default function Page() {
  return <CareerClientPage />
}