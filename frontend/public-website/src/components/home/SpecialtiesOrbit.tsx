'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { specialtiesSymbolsSvg } from './specialtiesSymbols';

const servicesData = [
  {
    id: 'maternity',
    name: 'Maternity & Birthing',
    icon: 'maternity',
    bubbleX: 80,
    bubbleY: 175,
    pointerX: 153,
    pointerY: 175,
    description: 'Maternity or pregnancy is the natural phenomenon during which one or more babies develop in the womb ...',
    link: '/specialities',
  },
  {
    id: 'fetal',
    name: 'Fetal Medicine',
    icon: 'fatal',
    bubbleX: 113,
    bubbleY: 298,
    pointerX: 176,
    pointerY: 261,
    description: 'Over the years Fetal Medicine has emerged as a special entity which is separate from Obstetrics and Gynecology...',
    link: '/specialities',
  },
  {
    id: 'gynecology',
    name: 'Gynecology',
    icon: 'gynac',
    bubbleX: 203,
    bubbleY: 387,
    pointerX: 239,
    pointerY: 324,
    description: "Every stage in a woman's life comes with its own set of new developments, sometimes bewildering changes...",
    link: '/specialities',
  },
  {
    id: 'laparoscopy',
    name: 'Laparoscopy Surgeries',
    icon: 'laparo',
    bubbleX: 325,
    bubbleY: 420,
    pointerX: 325,
    pointerY: 347,
    description: 'Laparoscopic surgery is a procedure that is performed just by making small incisions rather than large...',
    link: '/specialities',
  },
  {
    id: 'newborn',
    name: 'Newborn Care',
    icon: 'newborn',
    bubbleX: 448,
    bubbleY: 387,
    pointerX: 411,
    pointerY: 324,
    description: 'Swarnika Hospitals aims to provide superior quality newborn and neonatal care...',
    link: '/specialities',
  },
  {
    id: 'picu',
    name: 'PICU',
    icon: 'picu',
    bubbleX: 537,
    bubbleY: 298,
    pointerX: 474,
    pointerY: 261,
    description: 'In the PICU premises, almost all the patients will be connected to tubing and other advanced medical devices...',
    link: '/specialities',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: 'pediat',
    bubbleX: 570,
    bubbleY: 175,
    pointerX: 497,
    pointerY: 175,
    description: 'A Pediatrician is a medical doctor who specialises in the physical, behavioural and mental health of children from birth...',
    link: '/specialities',
  },
];

export function SpecialtiesOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = servicesData[activeIndex];

  return (
    <section
      id="why-us"
      className="relative w-full overflow-hidden py-12 md:py-16"
      style={{
        backgroundImage: 'url("https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712517/swarnikacare/website/bg-servicesection-01.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* Hidden container holding original SVG symbols */}
      <div
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: specialtiesSymbolsSvg }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-6">
          <h2 className="text-center text-white text-[28px] md:text-[34px] font-bold tracking-tight">
            Our Specialties
          </h2>
          <div className="flex justify-center mt-2">
            <Image
              src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712529/swarnikacare/website/hedimgiconwhite.png"
              alt="Our Specialties"
              width={130}
              height={42}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Orbit SVG container */}
        <div className="w-full max-w-[650px] mx-auto">
          <svg
            id="circle-nav-services"
            viewBox="0 0 650 530"
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <filter id="service-shadow" height="2" width="2" y="-0.5" x="-0.5">
                <feOffset result="offOut" in="SourceGraphic" dx="0" dy="5" />
                <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
                <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
              </filter>
            </defs>

            {/* Glowing cyan arc tracking the pointer orbit */}
            <svg x="150" y="0" width="350" height="350" viewBox="0 0 500 500">
              <linearGradient
                id="orbit-cyan-grad"
                gradientUnits="userSpaceOnUse"
                x1="250.2542"
                y1="496.283"
                x2="250.2542"
                y2="-0.2102"
              >
                <stop offset="0" stopColor="#027d9b" />
                <stop offset="1" stopColor="#3DDEED" stopOpacity="0" />
              </linearGradient>
              <path
                fill="url(#orbit-cyan-grad)"
                d="M250.3 0c137 0 248.1 111.1 248.1 248.1S387.3 496.2 250.3 496.2 2.2 385.1 2.2 248.1 113.2 0 250.3 0C112.5 0 .8 111.7.8 249.5S112.5 499 250.3 499s249.5-111.7 249.5-249.5S388 0 250.3 0z"
              />
            </svg>

            {/* Central pastel pink circle */}
            <circle cx="325" cy="170" r="140" fill="#f8e0eb" />

            {/* Center Circle Content */}
            <foreignObject x="195" y="45" width="260" height="250">
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
                <h3 className="text-[18px] md:text-[20px] font-bold text-[#501b4b] leading-tight mb-2 transition-all">
                  {activeService.name}
                </h3>
                <p className="text-[12px] md:text-[13px] text-[#4a154b]/85 leading-relaxed mb-4 line-clamp-3">
                  {activeService.description}
                </p>
                <Link
                  href="/specialities"
                  className="px-5 py-1.5 border border-[#622060] text-[#622060] text-[13px] font-semibold rounded hover:bg-[#622060] hover:text-white transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </foreignObject>

            {/* Active pointer dot */}
            <circle
              cx={activeService.pointerX}
              cy={activeService.pointerY}
              r="12"
              fill="#ffffff"
              stroke="#672367"
              strokeWidth="2.5"
              style={{
                transition: 'cx 0.35s ease-out, cy 0.35s ease-out',
              }}
            />

            {/* Specialty bubble icons */}
            {servicesData.map((serv, index) => {
              const isActive = index === activeIndex;

              return (
                <g
                  key={serv.id}
                  className="cursor-pointer group"
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <g
                    style={{
                      transformOrigin: `${serv.bubbleX}px ${serv.bubbleY}px`,
                      transform: isActive
                        ? 'scale(1.15) translateY(-5px)'
                        : 'scale(1)',
                      transition: 'transform 0.25s ease-out',
                    }}
                  >
                    {/* Circle Background with shadow */}
                    <circle
                      cx={serv.bubbleX}
                      cy={serv.bubbleY}
                      r="38"
                      fill="#ffffff"
                      style={{
                        filter: isActive
                          ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))'
                          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
                      }}
                    />

                    {/* Vector Illustrated Icon */}
                    <use
                      href={`#${serv.icon}`}
                      x={serv.bubbleX - 36}
                      y={serv.bubbleY - 36}
                      width="72"
                      height="72"
                    />
                  </g>

                  {/* Specialty Label */}
                  <text
                    x={serv.bubbleX}
                    y={serv.bubbleY + 54}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight={isActive ? '700' : '600'}
                    style={{
                      textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {serv.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
