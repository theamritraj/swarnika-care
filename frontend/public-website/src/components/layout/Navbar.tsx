'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Menu, 
  HeartHandshake, 
  Baby, 
  Stethoscope, 
  Sparkles, 
  Calendar, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGetCallOpen, setIsGetCallOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [callName, setCallName] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callSubmitted, setCallSubmitted] = useState(false);
  const pathname = usePathname();

  const getCurrentCity = () => {
    return 'Sasaram';
  };
  const currentCity = getCurrentCity();

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsCityDropdownOpen(false);
  }, [pathname]);

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCallSubmitted(true);
    setTimeout(() => {
      setIsGetCallOpen(false);
      setCallSubmitted(false);
      setCallName('');
      setCallPhone('');
    }, 2000);
  };

  return (
    <header 
      className="w-full fixed top-0 z-50 bg-white border-b border-gray-100 shadow-xs transition-all duration-200 font-sans"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="max-w-[1480px] w-full mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-8 h-[74px]">
        
        {/* Left: Swarnika Logo & City Selector (matches Apollo Cradle iPad Pro Screenshot) */}
        <div className="shrink-0 flex items-center gap-2 sm:gap-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Swarnika Hospitals" 
              width={140} 
              height={44} 
              className="object-contain h-8 sm:h-10 w-auto" 
              priority 
            />
          </Link>

          {/* City Selector Pill next to Logo */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#622060] text-white text-[11px] lg:text-[12px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs cursor-pointer hover:bg-[#50164e] transition-colors"
            >
              <MapPin className="w-3 h-3 opacity-90" />
              <span>{currentCity}</span>
              <ChevronDown className={`w-3 h-3 opacity-80 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCityDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-[13px] font-medium text-gray-700 animate-in fade-in slide-in-from-top-1 duration-150"
                onClick={() => setIsCityDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Available Branches
                </div>
                <Link
                  href="/sasaram"
                  className="flex items-center justify-between px-3 py-2 hover:bg-[#ffeaf3] hover:text-[#622060] transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-gray-800">Sasaram</span>
                    <span className="text-[11px] text-gray-500">Super Speciality Centre</span>
                  </div>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                  </span>
                </Link>

                <div className="border-t border-gray-100 my-1.5"></div>
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Other Locations</span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">Coming Soon</span>
                </div>
                <Link
                  href="/dehri"
                  className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium">Dehri-on-Sone</span>
                    <span className="text-[11px] text-gray-400">Outpatient & Scanning</span>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/60">Coming Soon</span>
                </Link>
                <Link
                  href="/rohtas"
                  className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-medium">Rohtas</span>
                    <span className="text-[11px] text-gray-400">Mother & Child Clinic</span>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/60">Coming Soon</span>
                </Link>
                <Link
                  href="/patna"
                  className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>Patna</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/60">Coming Soon</span>
                </Link>
                <Link
                  href="/varanasi"
                  className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>Varanasi</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/60">Coming Soon</span>
                </Link>
                <Link
                  href="/gaya"
                  className="flex items-center justify-between px-3 py-2 hover:bg-amber-50/50 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>Gaya</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/60">Coming Soon</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Navigation Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          
          {/* Nav Links (shown on Tablet & Desktop >= 768px) */}
          <nav className="hidden md:flex items-center gap-2.5 lg:gap-4 xl:gap-6 text-[11.5px] lg:text-[12.5px] xl:text-[13.5px] font-medium text-[#333333] whitespace-nowrap">
            
            {/* Specialties Dropdown */}
            <div 
              className="relative py-6 cursor-pointer group"
              onMouseEnter={() => setActiveMenu('specialties')}
            >
              <div className="flex items-center gap-1 hover:text-[#622060] transition-colors">
                <span>Specialties</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'specialties' ? 'rotate-180 text-[#622060]' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Our Centres Dropdown */}
            <div 
              className="relative py-6 cursor-pointer group"
              onMouseEnter={() => setActiveMenu('centres')}
            >
              <div className="flex items-center gap-1 hover:text-[#622060] transition-colors">
                <span>Our Centres</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'centres' ? 'rotate-180 text-[#622060]' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Our Doctors Link */}
            <Link 
              href="/doctors" 
              className="hover:text-[#622060] transition-colors py-6"
            >
              Our Doctors
            </Link>

            {/* Preggo & Mother Care Dropdown */}
            <div 
              className="relative py-6 cursor-pointer group"
              onMouseEnter={() => setActiveMenu('preggo')}
            >
              <div className="flex items-center gap-1 hover:text-[#622060] transition-colors">
                <span className="flex items-center gap-1">
                  Preggo <span className="bg-[#ffeaf3] text-[#622060] text-[9.5px] font-bold px-1.5 py-0.2 rounded-full">Guide</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'preggo' ? 'rotate-180 text-[#622060]' : 'text-gray-400'}`} />
              </div>
            </div>

            {/* Contact Us */}
            <Link 
              href="/contact-us" 
              className="hover:text-[#622060] transition-colors py-6"
            >
              Contact Us
            </Link>
          </nav>

          {/* Action Buttons: Get a Call & Search */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* "Get a Call" Pill Button */}
            <button 
              onClick={() => setIsGetCallOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[#622060] hover:bg-[#50164e] text-white text-[11px] lg:text-[12px] font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Phone className="w-3 h-3 fill-white stroke-none" />
              <span>Get a Call</span>
            </button>

            {/* Search Icon */}
            <Link 
              href="/doctors"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#622060] hover:bg-[#50164e] text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              aria-label="Search Doctors"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>

            {/* Mobile Only: Phone Icon Button (< 768px) */}
            <a
              href="tel:18605001066"
              className="md:hidden w-7 h-7 rounded-full border border-gray-400 flex items-center justify-center text-gray-700 hover:text-[#622060] hover:border-[#622060] transition-colors"
              aria-label="Call Hospital"
            >
              <Phone className="w-3.5 h-3.5 text-gray-700" />
            </a>

            {/* Mobile Only: Hamburger Toggle (< 768px) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 text-gray-700 hover:text-[#622060] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP MEGA MENUS (Maternity & Children Focused)          */}
      {/* ========================================================= */}
      {activeMenu && (
        <div className="hidden xl:block absolute top-[74px] left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* SPECIALTIES MENU */}
          {activeMenu === 'specialties' && (
            <div className="max-w-7xl mx-auto py-8 px-8">
              <div className="grid grid-cols-4 gap-8">
                
                {/* Column 1: Maternity */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-[#622060] font-bold text-[15px]">
                    <Baby className="w-5 h-5 text-[#622060]" />
                    <h4>Maternity Care</h4>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13.5px] text-gray-600">
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Pre-Conception Check-Up</Link></li>
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Comprehensive Pregnancy Care</Link></li>
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Normal & Painless Delivery</Link></li>
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">High-Risk Pregnancy</Link></li>
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">C-Section & VBAC</Link></li>
                    <li><Link href="/specialities?tab=maternity" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Postnatal & Lactation Support</Link></li>
                  </ul>
                </div>

                {/* Column 2: Pediatrics & Neonatology */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-[#0081a0] font-bold text-[15px]">
                    <Sparkles className="w-5 h-5 text-[#0081a0]" />
                    <h4>Pediatrics & NICU</h4>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13.5px] text-gray-600">
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Level-III Neonatal ICU (NICU)</Link></li>
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Pediatric Intensive Care (PICU)</Link></li>
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Newborn Health Screening</Link></li>
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Child Immunization & Vaccines</Link></li>
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Pediatric Emergency 24/7</Link></li>
                    <li><Link href="/specialities?tab=pediatrics" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Growth & Nutrition Clinic</Link></li>
                  </ul>
                </div>

                {/* Column 3: Gynecology & Laparoscopy */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-[#622060] font-bold text-[15px]">
                    <Stethoscope className="w-5 h-5 text-[#622060]" />
                    <h4>Gynecology & Surgery</h4>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13.5px] text-gray-600">
                    <li><Link href="/specialities?tab=gynecology" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Advanced Laparoscopic Surgery</Link></li>
                    <li><Link href="/specialities?tab=gynecology" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">PCOS & PCOD Management</Link></li>
                    <li><Link href="/specialities?tab=gynecology" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Fibroid & Ovarian Cyst Clinic</Link></li>
                    <li><Link href="/specialities?tab=gynecology" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Adolescent & Menopause Health</Link></li>
                    <li><Link href="/specialities?tab=gynecology" className="hover:text-[#622060] hover:translate-x-1 inline-block transition-transform">Infertility & Fertility Surgery</Link></li>
                  </ul>
                </div>

                {/* Column 4: Fetal Medicine & Diagnostics */}
                <div>
                  <div className="flex items-center gap-2 mb-3.5 text-[#0081a0] font-bold text-[15px]">
                    <HeartHandshake className="w-5 h-5 text-[#0081a0]" />
                    <h4>Fetal Medicine</h4>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-[13.5px] text-gray-600">
                    <li><Link href="/specialities?tab=fetal" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">First Trimester NT Scan</Link></li>
                    <li><Link href="/specialities?tab=fetal" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Targeted Anomaly Scan (TIFFA)</Link></li>
                    <li><Link href="/specialities?tab=fetal" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Fetal 3D/4D Ultrasound & Echo</Link></li>
                    <li><Link href="/specialities?tab=fetal" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Genetic Screening & Amniocentesis</Link></li>
                    <li><Link href="/specialities?tab=fetal" className="hover:text-[#0081a0] hover:translate-x-1 inline-block transition-transform">Multiple Pregnancy Surveillance</Link></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[13px]">
                <span className="text-gray-500 font-medium">
                  Leading destination for Mother & Child Healthcare in Sasaram, Rohtas
                </span>
                <Link 
                  href="/specialities" 
                  className="font-bold text-[#622060] hover:underline flex items-center gap-1"
                >
                  View All Mother & Child Specialties <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* OUR CENTRES MENU */}
          {activeMenu === 'centres' && (
            <div className="max-w-7xl mx-auto py-8 px-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#622060]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2 font-bold text-[#622060] text-[15px]">
                    <MapPin className="w-4 h-4" />
                    <h4>Swarnika Hospital (Main Centre)</h4>
                  </div>
                  <p className="text-[13px] text-gray-600 mb-3">
                    Super-speciality Maternity, Neonatal ICU (NICU) & Pediatric Care Centre.
                  </p>
                  <span className="text-[12px] font-semibold text-[#0081a0]">Sasaram, Rohtas, Bihar 821115</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#622060]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2 font-bold text-[#622060] text-[15px]">
                    <MapPin className="w-4 h-4" />
                    <h4>Upcoming Facilities</h4>
                  </div>
                  <p className="text-[13px] text-gray-600 mb-3">
                    Expanding across Dehri-on-Sone, Rohtas District, Patna & Varanasi soon.
                  </p>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">Coming Soon</span>
                </div>

                <div className="p-4 rounded-xl bg-[#ffeaf3] border border-[#622060]/20 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[#622060] text-[15px] mb-1">24x7 Maternity Emergency</h4>
                    <p className="text-[13px] text-gray-700">Immediate admission, emergency labor rooms and on-call gynecologists & neonatologists.</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#622060]/20 flex items-center justify-between">
                    <span className="font-bold text-[14px] text-[#622060]">Emergency: 1066</span>
                    <Link href="/book" className="text-[12px] font-bold text-white bg-[#622060] px-3 py-1 rounded-full">Book Bed</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREGGO MOTHER CARE HUB MENU */}
          {activeMenu === 'preggo' && (
            <div className="max-w-7xl mx-auto py-8 px-8">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <h4 className="font-bold text-[#622060] text-[14.5px] mb-3">Pregnancy Tools</h4>
                  <ul className="flex flex-col gap-2 text-[13px] text-gray-600">
                    <li><Link href="/#calculator" className="hover:text-[#622060] font-medium">Pregnancy Due Date Calculator</Link></li>
                    <li><Link href="/#calculator" className="hover:text-[#622060]">Ovulation & Fertility Calendar</Link></li>
                    <li><Link href="/#calculator" className="hover:text-[#622060]">Estimated Fetal Age Checker</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#622060] text-[14.5px] mb-3">Trimester Guides</h4>
                  <ul className="flex flex-col gap-2 text-[13px] text-gray-600">
                    <li><Link href="/#blogs" className="hover:text-[#622060]">First Trimester Diet & Care</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#622060]">Second Trimester Anomaly Scans</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#622060]">Third Trimester & Labor Readiness</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#0081a0] text-[14.5px] mb-3">Childbirth & Parenting</h4>
                  <ul className="flex flex-col gap-2 text-[13px] text-gray-600">
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">Normal vs Cesarean Delivery FAQs</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">Breastfeeding & Latch Counseling</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">Postpartum Recovery Tips</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-[#0081a0] text-[14.5px] mb-3">Newborn & Infant</h4>
                  <ul className="flex flex-col gap-2 text-[13px] text-gray-600">
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">Newborn Vaccination Chart</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">Infant Weight & Height Milestones</Link></li>
                    <li><Link href="/#blogs" className="hover:text-[#0081a0]">When to Visit Pediatrician</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE & TABLET DRAWER NAVIGATION                       */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="xl:hidden w-full bg-white border-b border-gray-200 px-6 py-5 shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4 text-[15px] font-medium text-gray-800">
            
            {/* Mobile Specialties */}
            <div className="border-b border-gray-100 pb-3">
              <span className="font-bold text-[#622060] block mb-2">Our Specialties</span>
              <ul className="pl-3 flex flex-col gap-2 text-[13.5px] text-gray-600">
                <li><Link href="/specialities?tab=maternity">Maternity & Childbirth</Link></li>
                <li><Link href="/specialities?tab=pediatrics">Pediatrics & Level-III NICU</Link></li>
                <li><Link href="/specialities?tab=gynecology">Gynecology & Laparoscopy</Link></li>
                <li><Link href="/specialities?tab=fetal">Fetal Medicine & TIFFA Scan</Link></li>
              </ul>
            </div>

            <Link href="/doctors" className="border-b border-gray-100 pb-3 font-semibold text-gray-800 flex justify-between items-center">
              Our Doctors <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link href="/#calculator" className="border-b border-gray-100 pb-3 font-semibold text-gray-800 flex justify-between items-center">
              Pregnancy Calculator <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link href="/book" className="border-b border-gray-100 pb-3 font-semibold text-[#622060] flex justify-between items-center">
              Book Appointment <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link href="/contact-us" className="border-b border-gray-100 pb-3 font-semibold text-gray-800 flex justify-between items-center">
              Contact Us <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <div className="pt-2 flex flex-col gap-2.5">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsGetCallOpen(true); }}
                className="w-full py-2.5 bg-[#622060] text-white font-bold rounded-lg text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 fill-white stroke-none" /> Get a Call
              </button>
              <a 
                href="tel:18605001066"
                className="w-full py-2.5 border border-[#622060] text-[#622060] font-bold rounded-lg text-center flex items-center justify-center gap-2"
              >
                Emergency: 1066
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* "GET A CALL" CALLBACK MODAL                               */}
      {/* ========================================================= */}
      {isGetCallOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={() => setIsGetCallOpen(false)}
        >
          <div 
            className="relative w-full max-w-[420px] bg-white rounded-[16px] p-6 shadow-2xl text-[#333333] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsGetCallOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-[#622060] hover:bg-[#622060] hover:text-white flex items-center justify-center shadow-md transition-colors border border-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {!callSubmitted ? (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-[19px] font-bold text-[#622060]">
                    Request a Callback
                  </h3>
                  <p className="text-[13px] text-gray-600 mt-1">
                    Our Maternity & Child Care Desk will connect with you shortly.
                  </p>
                </div>

                <form onSubmit={handleCallSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={callName}
                      onChange={(e) => setCallName(e.target.value)}
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
                      placeholder="Enter 10-digit number"
                      value={callPhone}
                      onChange={(e) => setCallPhone(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[#622060]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#622060] hover:bg-[#521950] text-white font-bold rounded-[8px] text-[14px] transition-colors mt-2 cursor-pointer"
                  >
                    Submit Request
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-[18px] font-bold text-[#333333] mb-1">
                  Request Received!
                </h4>
                <p className="text-[13px] text-gray-600">
                  Our doctor desk will call you at <span className="font-bold text-[#622060]">{callPhone}</span> within 15 minutes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
