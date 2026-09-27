'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export function RequestCallback() {
  return (
    <section className="py-12 bg-white relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="w-full rounded-[30px] overflow-hidden flex flex-col md:flex-row relative shadow-2xl h-auto md:h-[450px]">
          
          {/* Background Image (Right Side) */}
          <div className="absolute inset-0 w-full h-full bg-[#f8f9fa]">
            <Image 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop" 
              alt="Doctor smiling" 
              fill 
              className="object-cover object-top md:object-right"
            />
          </div>

          {/* Smooth SVG Curve Overlay */}
          <svg 
            className="absolute top-0 left-0 w-full h-full z-10 hidden md:block drop-shadow-xl" 
            preserveAspectRatio="none" 
            viewBox="0 0 100 100"
          >
            {/* Outer lighter/translucent swoosh */}
            <path d="M0,0 L63,0 C45,40 73,60 56,100 L0,100 Z" fill="#006f85" opacity="0.6" />
            {/* Inner main teal area */}
            <path d="M0,0 L60,0 C42,40 70,60 53,100 L0,100 Z" fill="#005b6e" />
          </svg>
          
          {/* Mobile solid background */}
          <div className="absolute inset-0 w-full h-full bg-[#005b6e] z-10 md:hidden" style={{ opacity: 0.95 }} />

          {/* Content Container */}
          <div className="relative z-20 flex flex-col md:flex-row w-full h-full">
            
            {/* Left Side (Form) */}
            <div className="w-full md:w-[50%] p-10 md:p-12 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-white italic mb-8 drop-shadow-md">Request A Callback</h2>
              
              <div className="border border-white/30 rounded-xl overflow-hidden flex flex-col bg-white/10 backdrop-blur-sm shadow-lg">
                <div className="flex items-center px-4 py-4 border-b border-white/30">
                  <span className="text-white/90 text-[15px] font-medium mr-2 w-14">Name:</span>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="bg-transparent text-white focus:outline-none flex-1 text-[15px] placeholder:text-white/60" 
                  />
                </div>
                <div className="flex items-center px-4 py-4">
                  <span className="text-white/90 text-[15px] font-medium mr-2 whitespace-nowrap">Mobile Number:</span>
                  <input 
                    type="text" 
                    placeholder="Enter your mobile number" 
                    className="bg-transparent text-white focus:outline-none flex-1 text-[15px] placeholder:text-white/60 w-full min-w-[100px]" 
                  />
                  <button className="text-white text-[14px] font-semibold whitespace-nowrap ml-2 hover:text-yellow-200 transition-colors">
                    Send OTP
                  </button>
                </div>
              </div>

              <button className="group w-full md:w-[85%] bg-white text-[#006f85] font-bold text-[16px] py-4 rounded-full mt-8 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-lg">
                Submit <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right Side (Text & Badge) */}
            <div className="w-full md:w-[50%] p-10 md:p-12 relative flex flex-col justify-end items-end md:items-start text-right md:text-left">
              
              {/* Authentic Scalloped Red Badge */}
              <div className="absolute top-8 left-auto right-8 md:right-auto md:left-12 w-28 h-28 flex items-center justify-center -rotate-6 shadow-2xl drop-shadow-xl z-30">
                {/* Jagged Edges (Rotated squares) */}
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(0deg)' }}></div>
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(15deg)' }}></div>
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(30deg)' }}></div>
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(45deg)' }}></div>
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(60deg)' }}></div>
                <div className="absolute inset-0 bg-[#d32f2f] rounded-lg shadow-sm" style={{ transform: 'rotate(75deg)' }}></div>
                
                {/* Inner Circle content */}
                <div className="absolute inset-1 bg-[#d32f2f] rounded-full border-[1.5px] border-yellow-400/80 border-dashed z-10 flex flex-col items-center justify-center overflow-hidden">
                  <div className="text-[9px] font-bold tracking-widest text-white text-center leading-[1.1] mt-1.5 uppercase">
                    Always<br/>Open
                  </div>
                  
                  {/* Miniature Swarnika Logo representation */}
                  <div className="w-6 h-6 my-1 bg-white rounded flex items-center justify-center shadow-inner">
                    <span className="text-[#d32f2f] text-xs font-black">+</span>
                  </div>
                  
                  <div className="text-[9px] font-bold tracking-widest text-white text-center leading-[1.1] mb-1.5 uppercase">
                    Always<br/>Here
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="mt-48 md:mt-0 text-white drop-shadow-lg md:ml-12">
                <h3 className="text-3xl md:text-[38px] font-bold leading-tight mb-3">
                  DON'T LOSE A<br />WEEKDAY.
                </h3>
                <div className="w-16 h-1 bg-[#ffb703] mb-4 ml-auto md:ml-0"></div>
                <p className="text-xl md:text-[22px] font-medium leading-snug">
                  CHOOSE TO SEE US<br />
                  ON A <span className="text-[#ffb703] font-bold">SUNDAY.</span>
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
