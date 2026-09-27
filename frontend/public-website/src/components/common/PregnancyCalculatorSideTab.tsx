'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export function PregnancyCalculatorSideTab() {
  const [isOpen, setIsOpen] = useState(false);

  const [lmpDate, setLmpDate] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const [estimatedDueDate, setEstimatedDueDate] = useState('');
  const [estimatedFetalAge, setEstimatedFetalAge] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const calculatePregnancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmpDate) return;

    const lmp = new Date(lmpDate);
    if (isNaN(lmp.getTime())) return;

    // Calculate EDD: Naegele's rule (LMP + 9 months + 7 days) + cycle adjustment
    const edd = new Date(lmp);
    edd.setMonth(edd.getMonth() + 9);
    edd.setDate(edd.getDate() + 7);

    // Adjust for cycle length (default 28)
    const cycleDays = parseInt(cycleLength, 10) || 28;
    const cycleAdjustment = cycleDays - 28;
    edd.setDate(edd.getDate() + cycleAdjustment);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    setEstimatedDueDate(edd.toLocaleDateString(undefined, options));

    // Calculate Fetal Age: Current date - LMP date
    const today = new Date();
    const diffTime = today.getTime() - lmp.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setEstimatedFetalAge('0 Weeks');
    } else {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      setEstimatedFetalAge(`${weeks} Weeks, ${days} Days`);
    }
  };

  return (
    <>
      {/* Right Edge Fixed Trigger Button (Apollo style .bokaptrig) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-[45%] -translate-y-1/2 z-40 bg-[#027fa1] hover:bg-[#622060] text-white flex flex-col items-center justify-center py-3 px-2 rounded-l-[6px] shadow-lg transition-all duration-200 hover:-translate-x-1 cursor-pointer font-sans"
        style={{ writingMode: 'vertical-lr' }}
        aria-label="Open Pregnancy Calculator"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide select-none">
          <Calendar className="w-4 h-4 text-white -rotate-90" />
          Pregnancy Calculator
        </span>
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-[460px] bg-white rounded-[14px] p-6 sm:p-7 shadow-2xl text-[#333333] font-sans animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button on top-right */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3.5 -right-3.5 w-8 h-8 rounded-full bg-white text-[#622060] hover:bg-[#622060] hover:text-white flex items-center justify-center shadow-md transition-colors border border-gray-200 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Modal Title */}
            <h3 className="text-[18px] font-bold text-center text-[#333333] mb-4 uppercase tracking-wider">
              PREGNANCY CALCULATOR
            </h3>

            {/* Form */}
            <form onSubmit={calculatePregnancy} className="space-y-3">
              <div>
                <label className="block text-[13px] font-medium text-[#333333] mb-1">
                  First Day of Last Menstrual Period:
                </label>
                <input
                  type="text"
                  placeholder="Select Date (DD/MM/YYYY)"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = 'text';
                  }}
                  required
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full h-10 px-3 bg-white rounded border border-[#d2d2d2] text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#333333] mb-1">
                  Average Length of Cycles:
                </label>
                <input
                  type="text"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  placeholder="No. of Days (28 to 30 - defaults to 28)"
                  className="w-full h-10 px-3 bg-white rounded border border-[#d2d2d2] text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#333333] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-10 px-3 bg-white rounded border border-[#d2d2d2] text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#333333] mb-1">
                  Mobile
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter your number"
                  className="w-full h-10 px-3 bg-white rounded border border-[#d2d2d2] text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#333333] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 bg-white rounded border border-[#d2d2d2] text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full h-10 bg-[#4a0448] hover:bg-[#60095d] text-white font-bold rounded-[8px] text-[14px] transition-colors duration-200 cursor-pointer"
                >
                  Calculate
                </button>
              </div>
            </form>

            {/* Results Row */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[12px] font-medium text-[#555555] mb-1">
                  Estimated Due Date:
                </label>
                <div className="w-full h-9 px-3 bg-[#e9ecef] rounded border border-gray-300/40 text-[#333333] font-semibold text-[13px] flex items-center justify-center">
                  {estimatedDueDate}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#555555] mb-1">
                  Estimated Fetal Age:
                </label>
                <div className="w-full h-9 px-3 bg-[#e9ecef] rounded border border-gray-300/40 text-[#333333] font-semibold text-[13px] flex items-center justify-center">
                  {estimatedFetalAge}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
