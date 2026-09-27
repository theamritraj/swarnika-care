'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const specialtiesData = [
  {
    id: 'cardiac',
    tabName: 'CARDIAC SCIENCES',
    title: 'Cardiac Sciences',
    description: "Swarnika's Cardiac Sciences department is at the forefront of cardiac care in India and beyond, offering a comprehensive range of services from advanced diagnostics and minimall... Read More",
    procedures: ['HEART TRANSPLANT'],
    imageUrl: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'oncology',
    tabName: 'ONCOLOGY',
    title: 'Oncology',
    description: "Swarnika's Cancer Care department provides comprehensive and compassionate care for patients battling cancer. Our multidisciplinary team of oncologists, surgeons, radiation ther... Read More",
    procedures: ['RADIATION THERAPY', 'CHEMOTHERAPY'],
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'neurosciences',
    tabName: 'NEUROSCIENCES',
    title: 'Neurosciences',
    description: "Swarnika's Neurosciences department offers comprehensive care for conditions affecting the brain, spinal cord, and nerves. Our team of expert neurologists, neurosurgeons, and ne... Read More",
    procedures: ['BRAIN TUMOR SURGERY'],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'gastro',
    tabName: 'GASTROENTEROLOGY',
    title: 'Gastroenterology',
    description: "Swarnika Institute of Gastroenterology is a pioneer in digestive and hepatobiliary care in India, setting benchmarks in trust, innovation, and excellence. As the nation's leadin... Read More",
    procedures: ['LIVER TRANSPLANT', 'ENDOSCOPY'],
    imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'ortho',
    tabName: 'ORTHOPAEDICS',
    title: 'Orthopaedics',
    description: "Swarnika's Orthopedics department provides state-of-the-art care for a wide range of musculoskeletal conditions, from sports injuries and joint replacements to spinal disorders ... Read More",
    procedures: ['JOINT REPLACEMENT', 'SPINE SURGERY'],
    imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=1000&auto=format&fit=crop'
  }
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
    <section className="py-16 bg-[#eff5f7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Text */}
        <h2 className="text-[32px] font-medium text-[#1a3b42] mb-6 leading-tight">
          Clinical Excellence At Swarnika Hospital &ndash; Your Premier Multispeciality Healthcare Destination
        </h2>
        <p className="text-[#1a3b42] mb-6 leading-relaxed text-[15px]">
          At Swarnika Hospital, we deliver world-class healthcare by combining advanced medical technology with the expertise of highly experienced specialists across key clinical disciplines. As a premier, state-of-the-art facility, our comprehensive, specialty-driven centres of excellence are designed to address diverse healthcare needs under one roof, consistently delivering outstanding outcomes and seamless care experiences.
        </p>
        <p className="text-[#1a3b42] mb-8 leading-relaxed text-[15px]">
          From preventive health check-ups and routine consultations to complex and advanced treatments, Swarnika Hospital is trusted for personalised, compassionate, and high-quality care at every stage of the patient journey. Supported by an integrated care ecosystem spanning outpatient services, inpatient care, advanced surgery, emergency medicine, and rehabilitation, we continue to set benchmarks in clinical excellence and patient safety.
        </p>

        {/* Tabs Row */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {specialtiesData.map((spec, idx) => (
            <button
              key={spec.id}
              onClick={() => setActiveIndex(idx)}
              className={`whitespace-nowrap px-5 py-1.5 rounded-full text-[11px] font-bold tracking-wider border transition-colors ${
                activeIndex === idx 
                  ? 'bg-[#1a3b42] text-white border-[#1a3b42]' 
                  : 'bg-transparent text-[#007b92] border-[#007b92] hover:bg-[#007b92]/10'
              }`}
            >
              {spec.tabName}
            </button>
          ))}
          <button className="flex-shrink-0 w-7 h-7 rounded-full border border-[#007b92] flex items-center justify-center text-[#007b92] hover:bg-[#007b92]/10 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full flex items-center">
          
          {/* Prev Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 -ml-4 lg:-ml-6 z-20 w-12 h-12 rounded-full bg-[#007b92] flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Main Card */}
          <div className="w-full bg-white rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row gap-12 relative z-10 mx-6 lg:mx-0">
            
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#1a3b42] mb-6">{activeData.title}</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed mb-8">
                  {activeData.description.split('Read More')[0]}
                  <span className="text-[#1a3b42] font-semibold underline cursor-pointer">Read More</span>
                </p>
                
                <div className="w-full h-[1px] bg-slate-200 mb-6"></div>
                
                <h4 className="font-bold text-[#1a3b42] text-[13px] mb-4">Top Specialties & Procedures</h4>
                <div className="flex flex-wrap gap-3 mb-10">
                  {activeData.procedures.map((proc) => (
                    <span key={proc} className="px-4 py-1.5 rounded-full border border-teal-200 text-[#007b92] text-[11px] font-bold tracking-wider">
                      {proc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="px-6 py-2.5 rounded-full border border-[#1a3b42] text-[#1a3b42] font-bold text-[13px] flex items-center gap-2 hover:bg-slate-50 transition-colors">
                  FIND DOCTOR <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-6 py-2.5 rounded-full border border-[#1a3b42] text-[#1a3b42] font-bold text-[13px] flex items-center gap-2 hover:bg-slate-50 transition-colors">
                  EXPLORE MORE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
              <Image 
                src={activeData.imageUrl}
                alt={activeData.title}
                fill
                className="object-cover"
              />
            </div>
            
          </div>

          {/* Next Button */}
          <button 
            onClick={handleNext}
            className="absolute right-0 -mr-4 lg:-mr-6 z-20 w-12 h-12 rounded-full border-[1.5px] border-[#007b92] bg-white flex items-center justify-center text-[#007b92] shadow-lg hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

        </div>
      </div>
    </section>
  );
}
