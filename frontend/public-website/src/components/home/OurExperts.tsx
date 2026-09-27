'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API, type PublicDoctor } from '@/lib/api';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop';

interface OurExpertsProps {
  city?: string;
  hospitalId?: string | number;
}

export function OurExperts({ city, hospitalId }: OurExpertsProps = {}) {
  const [isClient, setIsClient] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [experts, setExperts] = useState<PublicDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchExperts = async () => {
      setLoading(true);
      setError(false);
      try {
        let targetHospitalId = hospitalId ? String(hospitalId) : undefined;

        if (!targetHospitalId && city) {
          try {
            const hRes = await fetch(API.PUBLIC_HOSPITALS);
            if (hRes.ok) {
              const hJson = await hRes.json();
              const hospitals = hJson.data || [];
              const matched = hospitals.find((h: { city?: string; name?: string; id: number }) => 
                (h.city && h.city.toLowerCase() === city.toLowerCase()) ||
                (h.name && h.name.toLowerCase().includes(city.toLowerCase()))
              );
              if (matched) {
                targetHospitalId = String(matched.id);
              }
            }
          } catch {
            // fallback if hospital lookup fails
          }
        }

        const url = new URL(API.PUBLIC_DOCTORS);
        if (targetHospitalId) {
          url.searchParams.set('hospitalId', targetHospitalId);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setExperts(json.data.slice(0, 4));
        } else {
          setExperts([]);
        }
      } catch {
        setError(true);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [city, hospitalId]);

  const handlePrev = () => {
    setMobileIndex((prev) => (prev === 0 ? experts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setMobileIndex((prev) => (prev === experts.length - 1 ? 0 : prev + 1));
  };

  if (!isClient) return null;

  const getDoctorName = (doc: PublicDoctor) => `Dr. ${doc.firstName} ${doc.lastName}`;
  const getDoctorImage = (doc: PublicDoctor) => doc.profilePictureUrl || FALLBACK_AVATAR;
  const getDoctorSpecialty = (doc: PublicDoctor) => doc.specializations || 'General Medicine';
  const getDoctorExperience = (doc: PublicDoctor) => doc.experienceYears ? `${doc.experienceYears}+ Years Exp.` : '';

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-[26px] md:text-[34px] font-bold text-[#333333] tracking-tight">
              Our Experts
            </h2>
            <div className="flex justify-center items-center mt-2 max-w-[340px] sm:max-w-md mx-auto">
              <Image
                src="/images/hedimgicon.png"
                alt="Our Experts Divider"
                width={130}
                height={42}
                className="object-contain"
              />
            </div>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#622060]" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 md:py-16 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-[26px] md:text-[34px] font-bold text-[#333333] tracking-tight">
              Our Experts
            </h2>
          </div>
          <div className="flex flex-col items-center py-12 text-gray-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-[14px]">Unable to load doctors at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (experts.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-[26px] md:text-[34px] font-bold text-[#333333] tracking-tight">
              Our Experts
            </h2>
          </div>
          <div className="text-center py-12 text-gray-400">
            <p className="text-[14px]">No doctors available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentMobileExpert = experts[mobileIndex % experts.length];

  return (
    <section className="py-12 md:py-16 bg-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 relative">
          <h2 className="text-[26px] md:text-[34px] font-bold text-[#333333] tracking-tight">
            Our Experts
          </h2>
          <div className="flex justify-center items-center mt-2 relative max-w-[340px] sm:max-w-md mx-auto">
            <Image
              src="/images/hedimgicon.png"
              alt="Our Experts Divider"
              width={130}
              height={42}
              className="object-contain"
            />
            {/* Mobile Carousel Navigation Arrows */}
            <div className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button 
                onClick={handlePrev}
                className="text-[#99d5dd] hover:text-[#0081a0] transition-colors p-1"
                aria-label="Previous Doctor"
              >
                <span className="text-[20px] font-light">‹</span>
              </button>
              <button 
                onClick={handleNext}
                className="text-[#99d5dd] hover:text-[#0081a0] transition-colors p-1"
                aria-label="Next Doctor"
              >
                <span className="text-[20px] font-light">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Single Centered Doctor Card */}
        {currentMobileExpert && (
          <div className="sm:hidden max-w-[340px] mx-auto">
            <div className="bg-white rounded-[20px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.08),0_8px_20px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col items-center">
              {/* Image */}
              <div className="pt-8 pb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden p-1 bg-[#e1f5f8] mx-auto shadow-xs">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={getDoctorImage(currentMobileExpert)}
                      alt={getDoctorName(currentMobileExpert)}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-5 pb-6 text-center flex-grow w-full flex flex-col items-center">
                <h3 className="text-[17px] font-bold text-[#9b2c86] mb-0.5">{getDoctorName(currentMobileExpert)}</h3>
                <p className="text-[12px] text-gray-500 mb-3">{currentMobileExpert.qualifications || ''}</p>
                
                {/* Specialty Pill */}
                <div className="bg-[#fdf2f8] text-[#d81b60] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-3 max-w-full truncate">
                  {getDoctorSpecialty(currentMobileExpert)}
                </div>

                <div className="space-y-1.5 text-[13px] font-semibold text-gray-700 w-full flex flex-col items-center mb-1">
                  {getDoctorExperience(currentMobileExpert) && (
                    <p>{getDoctorExperience(currentMobileExpert)}</p>
                  )}
                </div>
              </div>

              {/* Book Button */}
              <Link 
                href={`/book?doctorId=${currentMobileExpert.doctorId || currentMobileExpert.id}`}
                className="w-full bg-[#5a1a4a] hover:bg-[#4a153d] text-white flex items-center justify-center gap-2 py-3.5 transition-colors text-[13.5px] font-semibold"
              >
                <Calendar className="w-4 h-4" />
                Book an Appointment
              </Link>
            </div>
          </div>
        )}

        {/* Desktop View: Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <div 
              key={expert.doctorId || expert.id} 
              className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300"
            >
              {/* Image */}
              <div className="pt-8 pb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden p-1 bg-[#e1f5f8] shadow-sm mx-auto">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={getDoctorImage(expert)}
                      alt={getDoctorName(expert)}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-4 pb-6 text-center flex-grow w-full flex flex-col items-center">
                <h3 className="text-lg font-bold text-[#9b2c86] mb-1">{getDoctorName(expert)}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-1 h-4">{expert.qualifications || ''}</p>
                
                {/* Specialty Pill */}
                <div className="bg-[#fdf2f8] text-[#d81b60] text-xs font-semibold px-4 py-1.5 rounded-full mb-4 max-w-full truncate w-fit">
                  {getDoctorSpecialty(expert)}
                </div>

                <div className="mt-auto space-y-2 text-sm font-semibold text-gray-700 w-full flex flex-col items-center">
                  {getDoctorExperience(expert) && (
                    <p>{getDoctorExperience(expert)}</p>
                  )}
                </div>
              </div>

              {/* Book Button */}
              <Link 
                href={`/book?doctorId=${expert.doctorId || expert.id}`}
                className="w-full bg-[#5a1a4a] hover:bg-[#4a153d] text-white flex items-center justify-center gap-2 py-3.5 transition-colors text-sm font-semibold"
              >
                <Calendar className="w-4 h-4" />
                Book an Appointment
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
