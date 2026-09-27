import React, { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { SpecialtiesOrbit } from "@/components/home/SpecialtiesOrbit";
import { OurExperts } from "@/components/home/OurExperts";
import { PregnancyCalculatorSection } from "@/components/home/PregnancyCalculatorSection";
import { PatientsSpeak } from "@/components/home/PatientsSpeak";
import { OurBlogs } from "@/components/home/OurBlogs";
import { FAQ } from "@/components/home/FAQ";
import { CityNoticeBanner } from "@/components/home/CityNoticeBanner";

export default function PublicLandingPage({ city }: { city?: string } = {}) {
  return (
    <div className="w-full flex flex-col relative pt-[74px]">
      <Suspense fallback={null}>
        <CityNoticeBanner />
      </Suspense>

      <HeroSection />

      <SpecialtiesOrbit />

      <OurExperts city={city} />
      
      <PregnancyCalculatorSection city={city} />

      <PatientsSpeak />

      <OurBlogs />

      <FAQ />
    </div>
  );
}
