'use client';

import { useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function PregnancyCalculatorSection({ city }: { city?: string } = {}) {
  const displayLocation = city 
    ? (city.toLowerCase() === 'rohtas' ? 'Rohtas, Bihar' : (city.toLowerCase() === 'dehri' ? 'Dehri-on-Sone, Rohtas' : 'Sasaram, Rohtas, Bihar'))
    : 'Sasaram, Rohtas, Bihar';

  const [lmpDate, setLmpDate] = useState('');
  const [cycleLength, setCycleLength] = useState<string>('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const [estimatedDueDate, setEstimatedDueDate] = useState('');
  const [estimatedFetalAge, setEstimatedFetalAge] = useState('');

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

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="calculator" className="w-full font-sans antialiased">
      {/* ========================================================= */}
      {/* PURPLE SECTION: Intro Text & Pregnancy Calculator         */}
      {/* Matches Mobile Screenshots 3 & 4                          */}
      {/* ========================================================= */}
      <section className="w-full bg-[#622060] text-white pt-10 pb-12 px-4 sm:px-8 lg:px-14">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column / Mobile Screenshot 3: Intro Paragraphs */}
            <div className="lg:col-span-7 text-left space-y-5 text-white pr-0 lg:pr-4">
              <p className="text-[15.5px] sm:text-[17px] md:text-[18px] leading-[1.65] font-normal text-white/95">
                We, at Swarnika Hospitals, {displayLocation} are the country&apos;s leading and
                most trusted healthcare destination, both for the mother as well as
                for the child. Swarnika Hospitals, {displayLocation} offers patients the
                highest quality care and most advanced treatment in the country in
                nearly every medical specialty including Gynecology, Laparoscopy,
                Pediatrics &amp; Neonatology, Fertility, Fetal Medicine &amp; NICU etc.,
                all supported with the highly qualified specialists.
              </p>
              <p className="text-[15px] sm:text-[16px] md:text-[17px] leading-[1.65] font-normal text-white/90">
                At our signature state-of-the-art facilities in {displayLocation}, we ensure that every child and mother
                receive the highest levels of care. We provide comprehensive range of health care services under
                one roof to provide growing medical needs of today&apos;s women and
                children in {displayLocation}.
              </p>
            </div>

            {/* Right Column / Mobile Screenshot 4: Crisp White Calculator Card */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <div className="w-full max-w-[420px] bg-white rounded-[16px] p-6 shadow-2xl text-[#333333]">
                <div className="text-center mb-5">
                  <h3 className="text-[17px] md:text-[18px] font-bold text-[#333333] uppercase tracking-wider">
                    PREGNANCY CALCULATOR
                  </h3>
                  <div className="w-8 h-[2px] bg-[#622060] mx-auto mt-1.5 opacity-80"></div>
                </div>

                <form onSubmit={calculatePregnancy} className="space-y-3.5">
                  <div>
                    <label className="block text-[12.5px] font-medium text-[#444444] mb-1">
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
                      className="w-full h-10 px-3 bg-white rounded-md border border-gray-300 text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-[#444444] mb-1">
                      Average Length of Cycles:
                    </label>
                    <input
                      type="text"
                      value={cycleLength}
                      onChange={(e) => setCycleLength(e.target.value)}
                      placeholder="No. of Days (28 to 30 - defaults to 28)"
                      className="w-full h-10 px-3 bg-white rounded-md border border-gray-300 text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-[#444444] mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full h-10 px-3 bg-white rounded-md border border-gray-300 text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-[#444444] mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter your number"
                      className="w-full h-10 px-3 bg-white rounded-md border border-gray-300 text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-medium text-[#444444] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-10 px-3 bg-white rounded-md border border-gray-300 text-[13px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-10 bg-[#4a0448] hover:bg-[#60095d] text-white font-bold rounded-[8px] text-[14px] transition-colors duration-200 cursor-pointer"
                    >
                      Calculate
                    </button>
                  </div>
                </form>

                {/* Result Output Boxes */}
                <div className="space-y-3 mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-[12px] font-medium text-[#666666] mb-1">
                      Estimated Due Date:
                    </label>
                    <div className="w-full h-9 px-3 bg-[#e9ecef] rounded-md border border-gray-200 text-[#333333] font-semibold text-[13px] flex items-center justify-center">
                      {estimatedDueDate || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#666666] mb-1">
                      Estimated Fetal Age:
                    </label>
                    <div className="w-full h-9 px-3 bg-[#e9ecef] rounded-md border border-gray-200 text-[#333333] font-semibold text-[13px] flex items-center justify-center">
                      {estimatedFetalAge || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4 STATS SECTION: Matches Mobile Screenshot 5 (2x2 Grid)   */}
      {/* ========================================================= */}
      <section className="w-full bg-white py-12 md:py-16 px-4 sm:px-8 border-b border-gray-200 relative">
        <div className="container mx-auto max-w-5xl">
          {/* Mobile: 2x2 Grid (Screenshot 5); Desktop: 4 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 items-center">
            
            {/* Stat 1: 200000 / Babies Delivered */}
            <div className="text-center px-2 md:border-r border-gray-200">
              <div className="text-[34px] sm:text-[38px] md:text-[44px] font-bold text-[#077faa] leading-tight mb-1">
                200000
              </div>
              <div className="text-[13px] sm:text-[14px] font-semibold text-[#333333]">
                Babies Delivered
              </div>
            </div>

            {/* Stat 2: 2300 / Specialists */}
            <div className="text-center px-2 md:border-r border-gray-200">
              <div className="text-[34px] sm:text-[38px] md:text-[44px] font-bold text-[#077faa] leading-tight mb-1">
                2300
              </div>
              <div className="text-[13px] sm:text-[14px] font-semibold text-[#333333]">
                Specialists
              </div>
            </div>

            {/* Stat 3: 18 / Centres */}
            <div className="text-center px-2 md:border-r border-gray-200">
              <div className="text-[34px] sm:text-[38px] md:text-[44px] font-bold text-[#077faa] leading-tight mb-1">
                18
              </div>
              <div className="text-[13px] sm:text-[14px] font-semibold text-[#333333]">
                Centres
              </div>
            </div>

            {/* Stat 4: 5 / Google Rating */}
            <div className="text-center px-2">
              <div className="text-[34px] sm:text-[38px] md:text-[44px] font-bold text-[#077faa] leading-tight mb-1">
                5
              </div>
              <div className="text-[13px] sm:text-[14px] font-semibold text-[#333333]">
                Google Rating
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-to-Top Button at Bottom Center */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-[#68285a] hover:bg-[#521c45] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </section>
    </div>
  );
}
