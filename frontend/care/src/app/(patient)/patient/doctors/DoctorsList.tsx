'use client';

import { useState } from 'react';
import { Stethoscope, Search, Calendar, Star, Building2, ChevronRight } from 'lucide-react';
import { BookingModal } from './BookingModal';

interface Doctor {
  doctorId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  hospitalName?: string;
  hospitalId?: number;
  departmentId?: number;
  bio?: string;
  profilePublished?: boolean;
}

interface DoctorsListProps {
  doctors: Doctor[];
  specialities: string[];
  patientId: number;
}

export function DoctorsList({ doctors, specialities, patientId }: DoctorsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const filtered = doctors.filter(d => {
    const nameMatch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const specMatch = !selectedSpec || d.specialization === selectedSpec;
    return nameMatch && specMatch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
          />
        </div>
        <select
          value={selectedSpec}
          onChange={e => setSelectedSpec(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all min-w-[180px]"
        >
          <option value="">All Specialities</option>
          {specialities.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-4">
        Showing {filtered.length} doctor{filtered.length !== 1 ? 's' : ''}
        {selectedSpec ? ` in ${selectedSpec}` : ''}
        {searchQuery ? ` matching "${searchQuery}"` : ''}
      </p>

      {/* Doctor Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No doctors found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const docName = `Dr. ${doc.firstName} ${doc.lastName}`;
            const initial = doc.firstName?.charAt(0).toUpperCase() || 'D';

            return (
              <div
                key={doc.doctorId}
                className="rounded-xl border border-border bg-card p-5 hover:border-[#007b92]/30 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#007b92]/20 to-[#007b92]/10 flex items-center justify-center text-[#007b92] font-bold text-lg shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate">{docName}</h3>
                    <p className="text-xs text-[#007b92] font-medium mt-0.5 truncate">{doc.specialization}</p>
                    {doc.qualification && (
                      <p className="text-xs text-muted-foreground truncate">{doc.qualification}</p>
                    )}
                  </div>
                </div>

                {doc.experienceYears !== undefined && doc.experienceYears !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span>{doc.experienceYears} years experience</span>
                  </div>
                )}

                {doc.hospitalName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{doc.hospitalName}</span>
                  </div>
                )}

                {doc.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                    {doc.bio}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setBookingDoctor(doc)}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-[#007b92] text-white text-sm font-semibold rounded-lg hover:bg-[#006274] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          patientId={patientId}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </>
  );
}
