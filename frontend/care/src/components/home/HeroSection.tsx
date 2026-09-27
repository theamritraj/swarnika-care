import { Search } from "lucide-react";
import { QuickActionBar } from "./QuickActionBar";

export function HeroSection() {
  return (
    <section className="relative w-full h-[100vh] min-h-[600px] bg-slate-900 flex flex-col justify-end overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop')" }}
      />
      
      {/* Top Gradient for Navbar legibility */}
      <div className="absolute inset-x-0 top-0 h-32 z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      
      {/* Left Gradient */}
      <div className="absolute inset-y-0 left-0 w-48 z-10 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      
      {/* Right Gradient */}
      <div className="absolute inset-y-0 right-0 w-48 z-10 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
      
      {/* Bottom Gradient (Teal-ish dark) */}
      <div className="absolute inset-x-0 bottom-0 h-64 z-10 bg-gradient-to-t from-[#064e5b]/95 via-[#064e5b]/50 to-transparent pointer-events-none" />
      
      {/* Additional full-cover vignette for overall mood */}
      <div className="absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)] pointer-events-none" />
      
      <div className="relative z-20 w-full max-w-4xl mx-auto mb-14 px-6">
        <div className="relative w-full shadow-2xl rounded-full">
          <input 
            type="text" 
            placeholder="Search For Doctors, Specialities And Health Check Packages..." 
            className="w-full pl-6 pr-16 py-4 rounded-full bg-[#043640]/90 text-white placeholder:text-gray-300 focus:outline-none focus:bg-[#043640] backdrop-blur-md border border-[#1d5b66]"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#f97316] rounded-full flex items-center justify-center hover:bg-[#ea580c] transition shadow-md">
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      <div className="relative z-20 w-full mb-12">
        <QuickActionBar />
      </div>
    </section>
  );
}
