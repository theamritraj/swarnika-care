'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative w-full bg-[#fdf8f3] overflow-hidden">
      <div className="relative w-full aspect-[1402/514] max-h-[580px]">
        <Link href="/book" className="block w-full h-full relative cursor-pointer" aria-label="First Free Consultation">
          <Image
            src="/images/hero_banner.jpg"
            alt="First Free Consultation - Consult our expert doctors in a safe environment"
            fill
            priority
            className="object-cover object-center"
          />
        </Link>
      </div>
    </section>
  );
}
