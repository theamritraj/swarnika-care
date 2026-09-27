import { redirect } from 'next/navigation';
import PublicLandingPage from '../page';

// Only Sasaram is currently active; other locations redirect to main as Coming Soon
const AVAILABLE_CITIES = ['sasaram'];

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export default async function CityLandingPage({ params }: CityPageProps) {
  const { city } = await params;
  const normalizedCity = decodeURIComponent(city || '').toLowerCase().trim();

  // If the city is not an available branch, redirect to main page:
  // "location se url le jaana agar jis city me available nhi hai wo redirect krega main pr"
  if (!AVAILABLE_CITIES.includes(normalizedCity)) {
    redirect(`/?unavailableCity=${encodeURIComponent(normalizedCity)}`);
  }

  // City is available: render tailored landing page
  return <PublicLandingPage city={normalizedCity} />;
}
