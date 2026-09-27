'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin, Activity, Stethoscope, HeartPulse, Brain, Baby, Bone, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { API, type PublicHospital, type PublicSpeciality } from '@/lib/api';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  
  const [hospitals, setHospitals] = useState<PublicHospital[]>([]);
  const [specialities, setSpecialities] = useState<PublicSpeciality[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingSpecialities, setLoadingSpecialities] = useState(false);
  const [error, setError] = useState(false);

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const res = await fetch(API.PUBLIC_HOSPITALS);
        if (!res.ok) throw new Error("Failed to fetch hospitals");
        const json = await res.json();
        const hospitalList = json.data || [];
        setHospitals(hospitalList);
        // Auto-select first hospital
        if (hospitalList.length > 0) {
          setSelectedHospital(String(hospitalList[0].id));
        }
      } catch {
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch specialities when hospital changes
  useEffect(() => {
    if (!selectedHospital) {
      setSpecialities([]);
      return;
    }

    const fetchSpecialities = async () => {
      setLoadingSpecialities(true);
      setError(false);
      try {
        const url = new URL(API.PUBLIC_SPECIALITIES);
        url.searchParams.set('hospitalId', selectedHospital);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch specialities");
        const json = await res.json();
        setSpecialities(json.data || []);
      } catch {
        setError(true);
      } finally {
        setLoadingSpecialities(false);
      }
    };
    
    fetchSpecialities();
    setSelectedSpecialty("");
  }, [selectedHospital]);

  const handleGoClick = () => {
    if (selectedHospital && selectedSpecialty) {
      router.push(`/doctors?hospital=${selectedHospital}&specialty=${selectedSpecialty}`);
    }
  };

  // Get the selected hospital object for location-aware content
  const currentHospital = hospitals.find(h => String(h.id) === selectedHospital);
  const hospitalDisplayName = currentHospital 
    ? `${currentHospital.name}${currentHospital.city ? `, ${currentHospital.city}` : ''}` 
    : 'Swarnika Hospitals';

  // Icon mapping for presentation only
  const getIconForSlug = (slug: string) => {
    const iconClass = "w-10 h-10 text-[#2b5c92]";
    if (slug.includes('cardio')) return <HeartPulse className={iconClass} />;
    if (slug.includes('onco')) return <Activity className={iconClass} />;
    if (slug.includes('neuro')) return <Brain className={iconClass} />;
    if (slug.includes('gastro') || slug.includes('surg')) return <Stethoscope className={iconClass} />;
    if (slug.includes('ortho')) return <Bone className={iconClass} />;
    if (slug.includes('gynae') || slug.includes('paed') || slug.includes('obste')) return <Baby className={iconClass} />;
    return <Activity className={iconClass} />;
  };

  return (
    <div className="w-full bg-[#f4f7f9] flex flex-col pt-[88px]">
      
      {/* Hero Section */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop" 
            alt="Booking Appointment" 
            fill
            className="object-cover"
          />
          {/* Dark blue overlay */}
          <div className="absolute inset-0 bg-[#1e4066]/80 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-md">Book an Appointment</h1>
          
          {/* Search/Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            
            {/* Hospital Dropdown — now API-driven */}
            <div className="relative w-full md:w-1/3 bg-[#336699] rounded-full overflow-hidden border border-[#4a7fb8]">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-80 pointer-events-none" />
              <select 
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full bg-transparent text-white py-3 pl-10 pr-6 focus:outline-none text-sm font-medium appearance-none cursor-pointer"
              >
                {loadingHospitals ? (
                  <option value="" className="text-black">Loading hospitals...</option>
                ) : hospitals.length === 0 ? (
                  <option value="" className="text-black">No hospitals available</option>
                ) : (
                  hospitals.map((h) => (
                    <option key={h.id} value={h.id} className="text-black">
                      {h.name}{h.city ? `, ${h.city}` : ''}
                    </option>
                  ))
                )}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-80 rotate-90 pointer-events-none" />
            </div>

            {/* Speciality Dropdown */}
            <div className="relative w-full md:w-1/2 bg-white rounded-full overflow-hidden shadow-sm">
              <select 
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-transparent text-[#2b5c92] appearance-none py-3 px-6 pr-10 focus:outline-none text-sm font-bold cursor-pointer"
              >
                <option value="">
                  {loadingSpecialities ? "Loading specialities..." : error ? "Unable to load specialities. Please try again." : specialities.length === 0 ? "No specialities available at this hospital." : "Select Speciality"}
                </option>
                {!loadingSpecialities && !error && specialities.map((spec) => (
                  <option key={spec.slug} value={spec.slug}>{spec.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2b5c92] rotate-90 pointer-events-none" />
            </div>

            {/* Go Button */}
            <button 
              onClick={handleGoClick}
              disabled={!selectedHospital || !selectedSpecialty}
              className={`w-full md:w-auto font-bold py-3 px-8 rounded-full transition-colors text-sm ${
                selectedHospital && selectedSpecialty 
                  ? "bg-[#2b5c92] hover:bg-[#1e4066] text-white shadow-md cursor-pointer"
                  : "bg-[#c5d0d8] text-[#2b5c92] cursor-not-allowed opacity-70"
              }`}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white w-full border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#2b5c92] transition-colors">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-bold">Book an Appointment</span>
        </div>
      </div>

      {/* Specialities Grid Section — location-aware heading */}
      <div className="w-full max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-[32px] font-bold text-slate-800 text-center mb-12">
          Specialities at {hospitalDisplayName}
        </h2>
        
        {loadingSpecialities ? (
          <div className="flex justify-center items-center gap-2 text-[#2b5c92] text-lg">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading specialities...
          </div>
        ) : error ? (
          <div className="flex justify-center text-red-500 text-lg">Failed to load specialities.</div>
        ) : specialities.length === 0 ? (
          <div className="flex justify-center text-slate-500 text-lg">No specialities available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {specialities.map((spec, index) => (
              <Link href={`/doctors?hospital=${selectedHospital}&specialty=${spec.slug}`} key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {getIconForSlug(spec.slug)}
                </div>
                <h3 className="text-slate-800 font-bold text-[15px]">{spec.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SEO Text Section — location-aware */}
      <div className="w-full bg-white py-16 border-t border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6">
          
          <h2 className="text-[22px] font-bold text-slate-800 mb-4">Book Appointment Online with Specialist Doctors at {hospitalDisplayName}</h2>
          <p className="text-slate-600 text-[14px] leading-relaxed mb-8">
            Healthcare should be simple, quick, and stress-free. That&apos;s why {hospitalDisplayName} brings you an easy way to book doctor appointment online. With just a few clicks, you can consult the right specialist, save time, and get quality care without waiting in long queues.
          </p>

          <h3 className="text-[20px] font-bold text-slate-800 mb-4">Why Online Doctor Appointment Booking?</h3>
          <p className="text-slate-600 text-[14px] mb-4">Patients today prefer convenience. Our online hospital appointment booking system ensures:</p>
          <ul className="list-disc pl-5 text-slate-600 text-[14px] mb-8 space-y-2">
            <li>Easy scheduling of doctor consultations online</li>
            <li>Flexible date and time selection</li>
            <li>Instant confirmation with reminders</li>
            <li>Access to trusted specialists across multiple departments</li>
          </ul>

          <h3 className="text-[20px] font-bold text-slate-800 mb-4">How to Book a Doctor Consultation Online?</h3>
          <p className="text-slate-600 text-[14px] mb-4">Booking is simple:</p>
          <ul className="list-disc pl-5 text-slate-600 text-[14px] mb-8 space-y-2">
            <li>Go to the hospital online appointment system on our website.</li>
            <li>Choose your department or doctor.</li>
            <li>Select a date and time slot.</li>
            <li>Confirm your online appointment with doctor instantly.</li>
          </ul>

          <p className="text-slate-600 text-[14px] font-medium border-t border-slate-200 pt-8">
            <strong>Location:</strong> {currentHospital?.address || 'Swarnika Hospital'}{currentHospital?.city ? `, ${currentHospital.city}` : ''}{currentHospital?.state ? `, ${currentHospital.state}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
