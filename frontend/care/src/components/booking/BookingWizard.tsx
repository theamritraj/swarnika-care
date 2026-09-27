'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, CheckCircle, Activity, ChevronRight } from 'lucide-react';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  isAvailable: boolean;
}

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch doctors from the API Gateway
    const fetchDoctors = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/doctors');
        if (!res.ok) {
          throw new Error('Failed to fetch from API Gateway');
        }
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Unable to connect to the Doctor Service. Please make sure the backend services are running.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  const specialties = Array.from(new Set(doctors.map(d => d.specialty)));
  const filteredDoctors = doctors.filter(d => d.specialty === selectedSpecialty);

  const steps = [
    { num: 1, label: 'Speciality & Doctor', icon: <Activity className="w-5 h-5" /> },
    { num: 2, label: 'Date & Time', icon: <Calendar className="w-5 h-5" /> },
    { num: 3, label: 'Patient Details', icon: <User className="w-5 h-5" /> },
    { num: 4, label: 'Confirmation', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar Progress */}
      <div className="w-full md:w-[300px] bg-[#004b5c] p-8 text-white shrink-0">
        <h3 className="text-xl font-bold mb-8">Booking Progress</h3>
        <div className="flex flex-col gap-6">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex relative items-start gap-4">
              {idx !== steps.length - 1 && (
                <div className={`absolute left-[15px] top-[30px] bottom-[-20px] w-0.5 ${step > s.num ? 'bg-yellow-400' : 'bg-white/20'}`}></div>
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                step >= s.num ? 'bg-yellow-400 text-slate-900 shadow-[0_0_10px_rgba(250,204,21,0.4)]' : 'bg-white/10 text-white/50'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <div className={`mt-1 font-medium ${step >= s.num ? 'text-white' : 'text-white/50'}`}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 min-h-[500px] flex flex-col">
        
        {/* Step 1: Select Speciality & Doctor */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Select a Speciality & Doctor</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-[#006f85] border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center text-center h-40">
                <span className="font-bold mb-2">Backend Connection Error</span>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-[#006f85] text-sm font-bold underline">Try Again</button>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Speciality Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">1. Choose Speciality</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specialties.map(spec => (
                      <button 
                        key={spec}
                        onClick={() => { setSelectedSpecialty(spec); setSelectedDoctorId(null); }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedSpecialty === spec 
                            ? 'border-[#006f85] bg-[#eef5f9] text-[#006f85] font-bold shadow-sm' 
                            : 'border-slate-200 text-slate-600 hover:border-[#006f85]/50 hover:bg-slate-50'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                {selectedSpecialty && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">2. Choose Doctor</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDoctors.map(doctor => (
                        <div 
                          key={doctor.id}
                          onClick={() => doctor.isAvailable && setSelectedDoctorId(doctor.id)}
                          className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                            !doctor.isAvailable 
                              ? 'opacity-50 cursor-not-allowed bg-slate-50' 
                              : selectedDoctorId === doctor.id 
                                ? 'border-[#006f85] bg-[#006f85] text-white shadow-md cursor-pointer' 
                                : 'border-slate-200 hover:border-[#006f85]/50 cursor-pointer hover:shadow-sm'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            selectedDoctorId === doctor.id ? 'bg-white text-[#006f85]' : 'bg-[#eef5f9] text-[#006f85]'
                          }`}>
                            {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold">Dr. {doctor.firstName} {doctor.lastName}</h4>
                            <p className={`text-sm ${selectedDoctorId === doctor.id ? 'text-blue-100' : 'text-slate-500'}`}>
                              {doctor.specialty}
                            </p>
                            {!doctor.isAvailable && <span className="text-xs text-red-500 font-medium mt-1 block">Currently Unavailable</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-auto pt-8 flex justify-end">
              <button 
                disabled={!selectedDoctorId}
                onClick={() => setStep(2)}
                className="bg-[#f97316] hover:bg-[#ea580c] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-colors"
              >
                Continue to Time Slot <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for future steps */}
        {step > 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-full text-center">
            <Calendar className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Next Step Coming Soon</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              You've successfully connected to the Doctor Service! We will build the Time Slot selection and Patient Details form in the next steps.
            </p>
            <button onClick={() => setStep(1)} className="text-[#006f85] font-bold hover:underline">
              &larr; Back to Doctor Selection
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
