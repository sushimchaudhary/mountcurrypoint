import MenuItemsPage from '@/components/menu/MenuItemsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Our Menu | The Mount Curry Point - Authentic Indian & Nepali Cuisine",
  description: "Explore our delicious menu at The Mount Curry Point. Featuring a wide range of authentic Indian and Nepali curries, appetizers, and traditional dishes. Order now or visit us!",
  
  openGraph: {
    title: "Delicious Menu | The Mount Curry Point",
    description: "Discover authentic Indian and Nepali flavors. View our full menu including vegetarian and non-vegetarian specialties.",
    url: 'https://mountcurrypoint.com/menu', 
    siteName: 'The Mount Curry Point',
    type: 'website',
  },
  
  keywords: [
    "Indian Nepali restaurant menu", 
    "curry point menu", 
    "authentic Indian food", 
    "Nepali traditional dishes", 
    "best curry near me"
  ],
  
  alternates: {
    canonical: 'https://mountcurrypoint.com/menu-items',
  }
};

export default function Page() {
  return <MenuItemsPage />;
}