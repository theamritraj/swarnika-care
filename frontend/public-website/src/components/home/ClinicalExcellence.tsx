'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const specialtiesData = [
  {
    id: 'gynaecology',
    tabName: 'GYNAECOLOGY',
    title: 'Gynaecology & Obstetrics',
    description: "Swarnika's Gynaecology & Obstetrics department offers comprehensive women's healthcare — from routine check-ups to high-risk pregnancies and advanced laparoscopic surgeries. Our experienced team ensures safe, compassionate care for every woman at every stage of life.",
    procedures: ['NORMAL DELIVERY', 'C-SECTION', 'LAPAROSCOPY'],
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=1000&auto=format&fit=crop',
    icon: '🤰',
    gradient: 'from-pink-50 to-rose-50',
    iconBg: 'bg-pink-100',
    accentColor: '#8B1A4A',
  },
  {
    id: 'paediatrics',
    tabName: 'PAEDIATRICS',
    title: 'Paediatrics & Neonatology',
    description: "Swarnika's Paediatrics department provides expert care for newborns, infants, and children. Our NICU is equipped with state-of-the-art incubators and ventilators, and our paediatricians are trained to handle the most complex neonatal and childhood conditions.",
    procedures: ['NICU CARE', 'VACCINATION', 'CHILD WELLNESS'],
    imageUrl: 'https://images.unsplash.com/photo-1555009306-30cb1e02b848?q=80&w=1000&auto=format&fit=crop',
    icon: '👶',
    gradient: 'from-blue-50 to-sky-50',
    iconBg: 'bg-blue-100',
    accentColor: '#1a5276',
  },
  {
    id: 'cardiac',
    tabName: 'CARDIAC SCIENCES',
    title: 'Cardiac Sciences',
    description: "Swarnika's Cardiac Sciences department is at the forefront of cardiac care, offering comprehensive services from advanced diagnostics to minimally invasive cardiac surgeries. Our cardiology team brings decades of combined experience in treating complex heart conditions.",
    procedures: ['HEART TRANSPLANT', 'ANGIOPLASTY'],
    imageUrl: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=1000&auto=format&fit=crop',
    icon: '❤️',
    gradient: 'from-red-50 to-orange-50',
    iconBg: 'bg-red-100',
    accentColor: '#c62828',
  },
  {
    id: 'ortho',
    tabName: 'ORTHOPAEDICS',
    title: 'Orthopaedics',
    description: "Swarnika's Orthopedics department provides state-of-the-art care for musculoskeletal conditions, from sports injuries and joint replacements to spinal disorders. Our surgeons employ the latest minimally invasive techniques for faster recovery.",
    procedures: ['JOINT REPLACEMENT', 'SPINE SURGERY', 'ARTHROSCOPY'],
    imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=1000&auto=format&fit=crop',
    icon: '🦴',
    gradient: 'from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100',
    accentColor: '#b8860b',
  },
  {
    id: 'fertility',
    tabName: 'FERTILITY',
    title: 'Fertility & IVF',
    description: "Swarnika's Fertility Centre offers hope and advanced reproductive solutions including IVF, IUI, and egg freezing. Our fertility specialists work with couples through every step of their journey to parenthood with empathy and cutting-edge science.",
    procedures: ['IVF', 'IUI', 'EGG FREEZING'],
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1000&auto=format&fit=crop',
    icon: '🌸',
    gradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-100',
    accentColor: '#6a1b9a',
  },
];

export function ClinicalExcellence() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeData = specialtiesData[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % specialtiesData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? specialtiesData.length - 1 : prev - 1));
  };

  return (
    <section className="relative bg-gradient-to-b from-[#f9f5f0] to-[#f3eff0] overflow-hidden">
      
      {/* Top connector from Hero */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1A4A] via-[#c0506b] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-[36px] md:text-[42px] font-bold text-[#1a3b42] mb-4 leading-tight">
            Our Specialties
          </h2>
          <p className="text-slate-600 text-[16px] leading-relaxed max-w-3xl">
            At Swarnika Hospitals, we deliver world-class healthcare across multiple specialties — from maternity and childcare to cardiac sciences, orthopaedics, and fertility services.
          </p>
        </div>

        {/* Specialty Tabs */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {specialtiesData.map((spec, idx) => (
            <button
              key={spec.id}
              onClick={() => setActiveIndex(idx)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[12px] font-bold tracking-wider border-2 transition-all duration-300 ${
                activeIndex === idx 
                  ? 'text-white shadow-lg scale-105' 
                  : 'bg-white text-[#8B1A4A] border-[#8B1A4A]/30 hover:border-[#8B1A4A] hover:bg-[#fdf5f8]'
              }`}
              style={activeIndex === idx ? { 
                backgroundColor: spec.accentColor, 
                borderColor: spec.accentColor 
              } : {}}
            >
              <span className="mr-2">{spec.icon}</span>
              {spec.tabName}
            </button>
          ))}
          <Link href="/specialities" className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#8B1A4A]/30 flex items-center justify-center text-[#8B1A4A] hover:bg-[#8B1A4A] hover:text-white hover:border-[#8B1A4A] transition-all">
            <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* Specialty Card Carousel */}
        <div className="relative w-full flex items-center">
          
          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 -ml-4 lg:-ml-6 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
            style={{ backgroundColor: activeData.accentColor }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main Card */}
          <div className={`w-full bg-gradient-to-br ${activeData.gradient} rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row gap-10 relative z-10 mx-6 lg:mx-0 border border-white/60 transition-all duration-500`}>
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-xl ${activeData.iconBg} flex items-center justify-center text-2xl shadow-sm`}>
                    {activeData.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a3b42]">{activeData.title}</h3>
                </div>
                <p className="text-[15px] text-slate-600 leading-relaxed mb-8">
                  {activeData.description}
                </p>
                
                <div className="w-full h-[1px] bg-slate-300/50 mb-6" />
                
                <h4 className="font-bold text-[#1a3b42] text-[13px] mb-4 tracking-wide">Top Procedures</h4>
                <div className="flex flex-wrap gap-3 mb-10">
                  {activeData.procedures.map((proc) => (
                    <span 
                      key={proc} 
                      className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider border-2 shadow-sm bg-white"
                      style={{ 
                        borderColor: activeData.accentColor + '40',
                        color: activeData.accentColor
                      }}
                    >
                      {proc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link 
                  href="/book" 
                  className="px-6 py-2.5 rounded-full font-bold text-[13px] flex items-center gap-2 text-white transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: activeData.accentColor }}
                >
                  FIND DOCTOR <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/specialities"
                  className="px-6 py-2.5 rounded-full border-2 font-bold text-[13px] flex items-center gap-2 hover:bg-white transition-colors"
                  style={{ 
                    borderColor: activeData.accentColor,
                    color: activeData.accentColor
                  }}
                >
                  EXPLORE MORE <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative h-[300px] lg:h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src={activeData.imageUrl}
                alt={activeData.title}
                fill
                className="object-cover transition-all duration-700"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="absolute right-0 -mr-4 lg:-mr-6 z-20 w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
            style={{ 
              borderColor: activeData.accentColor,
              color: activeData.accentColor
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      </div>
    </section>
  );
}
