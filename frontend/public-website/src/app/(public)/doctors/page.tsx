'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, X, CheckCircle2, Calendar, Clock, MapPin, Loader2, AlertCircle, Search } from 'lucide-react';
import { API, type PublicDoctor, type PublicHospital, type PublicSpeciality } from '@/lib/api';

// Fallback avatars for doctors without a profile picture
const FALLBACK_AVATARS = [
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712521/swarnikacare/website/dr_priya_sharma.jpg",
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712518/swarnikacare/website/dr_ananya_patel.jpg",
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712524/swarnikacare/website/dr_uttpal_kant.jpg",
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712525/swarnikacare/website/dr_vibha_singh.jpg",
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712520/swarnikacare/website/dr_deepak_sharma.jpg",
  "https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712523/swarnikacare/website/dr_ruchi_verma.jpg",
];

export default function DoctorsPage() {
  // Data state
  const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
  const [hospitals, setHospitals] = useState<PublicHospital[]>([]);
  const [specialities, setSpecialities] = useState<PublicSpeciality[]>([]);

  // Filter state
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading/error state
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingSpecialities, setLoadingSpecialities] = useState(true);
  const [errorDoctors, setErrorDoctors] = useState(false);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<{
    id?: number;
    appointmentId?: number;
    appointmentNumber?: string;
    doctorName?: string;
    hospitalName?: string;
    slot?: string;
  } | null>(null);

  // Read URL params on mount for pre-filtering
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hospital = params.get('hospital');
    const specialty = params.get('specialty');
    if (hospital) setSelectedHospitalId(hospital);
    if (specialty) setSelectedSpecialty(specialty);
  }, []);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const res = await fetch(API.PUBLIC_HOSPITALS);
        if (res.ok) {
          const json = await res.json();
          if (json.success) setHospitals(json.data || []);
        }
      } catch {
        // hospitals loading is non-critical
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch specialities (re-fetch when hospital changes)
  useEffect(() => {
    const fetchSpecialities = async () => {
      setLoadingSpecialities(true);
      try {
        const url = new URL(API.PUBLIC_SPECIALITIES);
        if (selectedHospitalId) url.searchParams.set('hospitalId', selectedHospitalId);
        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (json.success) setSpecialities(json.data || []);
        }
      } catch {
        // specialities loading is non-critical
      } finally {
        setLoadingSpecialities(false);
      }
    };
    fetchSpecialities();
  }, [selectedHospitalId]);

  // Fetch doctors (re-fetch when hospital or specialty changes)
  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setErrorDoctors(false);
    try {
      const url = new URL(API.PUBLIC_DOCTORS);
      if (selectedHospitalId) url.searchParams.set('hospitalId', selectedHospitalId);
      if (selectedSpecialty) url.searchParams.set('specialization', selectedSpecialty);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        setDoctors(json.data || []);
      } else {
        setDoctors([]);
      }
    } catch {
      setErrorDoctors(true);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedHospitalId, selectedSpecialty]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Client-side search filter (name/qualifications)
  const filteredDoctors = doctors.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const quals = (doc.qualifications || '').toLowerCase();
    const specs = (doc.specializations || '').toLowerCase();
    return fullName.includes(query) || quals.includes(query) || specs.includes(query);
  });

  const getDoctorName = (doc: PublicDoctor) => `Dr. ${doc.firstName} ${doc.lastName}`;
  const getDoctorImage = (doc: PublicDoctor) => {
    if (doc.profilePictureUrl && doc.profilePictureUrl.trim().length > 0) {
      return doc.profilePictureUrl;
    }
    const seed = (doc.doctorId || doc.id || 1);
    return FALLBACK_AVATARS[seed % FALLBACK_AVATARS.length];
  };
  const getDoctorSpecialty = (doc: PublicDoctor) => doc.specializations || 'General Medicine';
  const getDoctorExperience = (doc: PublicDoctor) => doc.experienceYears ? `${doc.experienceYears}+ Years Exp.` : '';

  const handleOpenBooking = (doc: PublicDoctor) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
    setIsSuccess(false);
    setPatientName('');
    setPatientMobile('');
    setPatientEmail('');
    setAppointmentDate('');
    setAppointmentTime('10:00 AM');
    setConfirmedAppointment(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patientEmail || !emailRegex.test(patientEmail.trim())) {
      alert('Please enter a valid email address to receive your appointment confirmation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(API.APPOINTMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor?.doctorId || selectedDoctor?.id,
          appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
          startTime: appointmentTime,
          patientName,
          patientMobile,
          patientEmail,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        alert(errJson?.message || 'Failed to book appointment. Please try again.');
        return;
      }

      const json = await res.json().catch(() => null);
      if (json?.data) {
        setConfirmedAppointment(json.data);
      }
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit appointment:', err);
      alert('Network error while booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen font-sans antialiased pt-[74px] pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="w-full bg-[#ca699d] text-white py-2 px-4 sm:px-8 lg:px-14">
        <div className="container mx-auto max-w-7xl flex items-center text-[13px] font-medium font-sans">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">»</span>
          <span className="text-white font-semibold">Doctors</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Find a Doctor Filter Card */}
        <div className="w-full bg-white rounded-[10px] border border-gray-200/90 shadow-xs p-4 sm:px-6 sm:py-4 mb-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-[20px] md:text-[22px] font-bold text-[#333333] whitespace-nowrap">
              Find a Doctor
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 md:max-w-2xl">
              {/* Select Hospital / Location */}
              <div>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => { setSelectedHospitalId(e.target.value); setSelectedSpecialty(''); }}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-[13.5px] text-[#444444] focus:outline-none focus:border-[#622060] cursor-pointer"
                >
                  <option value="">
                    {loadingHospitals ? 'Loading hospitals...' : 'All Hospitals'}
                  </option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}{h.city ? `, ${h.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Speciality */}
              <div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md text-[13.5px] text-[#444444] focus:outline-none focus:border-[#622060] cursor-pointer"
                >
                  <option value="">
                    {loadingSpecialities ? 'Loading specialities...' : 'All Specialities'}
                  </option>
                  {specialities.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Doctor Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-md text-[13.5px] text-[#444444] focus:outline-none focus:border-[#622060]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Count */}
        {!loadingDoctors && !errorDoctors && (
          <div className="mb-4 text-[13px] text-gray-500 font-medium">
            Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading State */}
        {loadingDoctors && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#622060] mb-3" />
            <span className="text-[14px] font-medium">Loading doctors...</span>
          </div>
        )}

        {/* Error State */}
        {errorDoctors && !loadingDoctors && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-red-100 text-red-500">
            <AlertCircle className="w-10 h-10 mb-3" />
            <p className="text-[15px] font-semibold mb-2">Unable to load doctors</p>
            <p className="text-[13px] text-gray-500 mb-4">Please check your connection and try again.</p>
            <button
              onClick={fetchDoctors}
              className="px-4 py-2 bg-[#622060] text-white text-[13px] font-semibold rounded-lg hover:bg-[#521950] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingDoctors && !errorDoctors && filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
            <p className="text-[15px] font-semibold mb-1">No doctors found</p>
            <p className="text-[13px]">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Doctors Grid */}
        {!loadingDoctors && !errorDoctors && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={`doctor-${doc.doctorId || doc.id}`}
                className="group bg-white rounded-[22px] border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(98,32,96,0.16)] hover:border-[#622060]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col h-full justify-between">
                  {/* Photo Frame */}
                  <div className="relative w-full h-[240px] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200/60 shrink-0">
                    <Image
                      src={getDoctorImage(doc)}
                      alt={getDoctorName(doc)}
                      fill
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Experience Badge */}
                    {getDoctorExperience(doc) && (
                      <div className="absolute top-3 left-3 bg-[#622060]/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                        {getDoctorExperience(doc)}
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-4 pt-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Doctor Name */}
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-[17px] group-hover:text-[#622060] transition-colors tracking-tight flex items-center justify-center gap-1.5">
                          <span>{getDoctorName(doc)}</span>
                          <CheckCircle2 className="w-4 h-4 text-[#0d829d] shrink-0" />
                        </h3>

                        {/* Qualifications */}
                        {doc.qualifications && (
                          <p className="text-[12px] text-gray-500 font-medium line-clamp-1 mt-0.5">
                            {doc.qualifications}
                          </p>
                        )}
                      </div>

                      {/* Specialty Pill */}
                      <div className="flex justify-center mt-2.5">
                        <span className="inline-flex items-center text-[12px] font-semibold text-[#0d829d] bg-[#0d829d]/10 px-3 py-1 rounded-full border border-[#0d829d]/15">
                          {getDoctorSpecialty(doc)}
                        </span>
                      </div>
                    </div>

                    {/* Book Appointment Button */}
                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="w-full mt-3.5 py-2.5 px-4 rounded-xl font-semibold text-[13.5px] tracking-wide text-white bg-gradient-to-r from-[#622060] to-[#782376] hover:from-[#722268] hover:to-[#8a2986] active:scale-[0.98] shadow-sm hover:shadow-[0_6px_20px_rgba(98,32,96,0.28)] transition-all flex items-center justify-center gap-2 cursor-pointer group/btn"
                    >
                      <Calendar className="w-4 h-4 text-white/90 group-hover/btn:scale-110 transition-transform" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Appointment Modal */}
      {isModalOpen && selectedDoctor && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[460px] bg-white rounded-[16px] p-6 shadow-2xl text-[#333333] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-[#622060] hover:bg-[#622060] hover:text-white flex items-center justify-center shadow-md transition-colors border border-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {!isSuccess ? (
              <>
                {/* Modal Header */}
                <div className="text-center mb-4">
                  <h3 className="text-[18px] font-bold text-[#622060]">
                    Book An Appointment
                  </h3>
                  <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                    Consult with <span className="font-bold text-[#333]">{getDoctorName(selectedDoctor)}</span>
                  </p>
                  <span className="inline-block bg-[#daf8ff] text-[#0081a0] font-semibold text-[12px] px-3 py-0.5 rounded-full mt-1.5">
                    {getDoctorSpecialty(selectedDoctor)}
                  </span>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Preferred Slot
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-[#622060] hover:bg-[#521950] text-white font-bold rounded-[8px] text-[14px] transition-colors mt-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-[20px] font-bold text-[#333333] mb-1">
                  Appointment Confirmed!
                </h4>
                {(confirmedAppointment?.appointmentId || confirmedAppointment?.id) && (
                  <div className="inline-block bg-purple-50 text-[#622060] px-3.5 py-1 rounded-full text-[12.5px] font-bold border border-purple-200 mb-3">
                    Appointment ID: #{confirmedAppointment?.appointmentId || confirmedAppointment?.id}
                    {confirmedAppointment?.appointmentNumber ? ` • ${confirmedAppointment.appointmentNumber}` : ''}
                  </div>
                )}
                <p className="text-[13.5px] text-gray-600 mb-4">
                  Your appointment with <span className="font-bold text-[#622060]">{confirmedAppointment?.doctorName || getDoctorName(selectedDoctor)}</span> has been booked for{' '}
                  <span className="font-bold">{appointmentDate || 'Today'}</span> at{' '}
                  <span className="font-bold">{confirmedAppointment?.slot || appointmentTime}</span>.
                </p>
                <div className="bg-[#f8f9fa] rounded-lg p-3 text-[12.5px] text-gray-600 text-left mb-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#622060]" />
                    <span>{confirmedAppointment?.hospitalName || 'Swarnika Hospitals'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#622060]" />
                    <span>Slot: {confirmedAppointment?.slot || appointmentTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-[#622060] hover:bg-[#521950] text-white font-bold rounded-[8px] text-[14px] transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
