import Link from 'next/link';
import { Calendar, Stethoscope, ClipboardList, PhoneCall, Smile } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-white flex flex-col items-center pt-16 md:pt-24 pb-20 font-sans px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column - Doctors Image & 404 text */}
        <div className="relative rounded-[32px] overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col h-full min-h-[450px]">
          <div className="flex-1 relative w-full h-full bg-blue-50/30 flex items-end justify-center">
            {/* 
              Using an unsplash image for doctors as a placeholder. 
              In production, you can replace this with a transparent PNG of your doctors.
            */}
            <img 
              src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712526/swarnikacare/website/doctors-team.jpg" 
              alt="Our Doctors" 
              className="w-full h-full object-cover object-center" 
            />
          </div>
          {/* Blue Overlay Bar */}
          <div className="bg-[#00739d] text-white text-center py-6 px-4 absolute bottom-0 left-0 right-0 rounded-b-[32px]">
            <h1 className="text-5xl md:text-6xl font-bold flex items-center justify-center gap-2 mb-2 tracking-wide">
              4 <Smile className="w-12 h-12 md:w-14 md:h-14" strokeWidth={2.5} /> 4
            </h1>
            <p className="text-lg md:text-xl font-medium tracking-wide">
              Don't panic our Doctors here!
            </p>
          </div>
        </div>

        {/* Right Column - Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 h-full">
          {/* Card 1: Book Appointment */}
          <Link href="/appointments" className="bg-[#fdf9eb] hover:bg-[#fcf5e1] transition-colors rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-[#f5ead2]/40 h-full min-h-[200px]">
            <div className="mb-4 text-7xl filter drop-shadow-md transform hover:scale-110 transition-transform">
              📅
            </div>
            <h3 className="text-[#004e66] font-medium text-[16px]">Book Appointment</h3>
          </Link>

          {/* Card 2: Find a Doctor */}
          <Link href="/doctors" className="bg-[#f2fbfa] hover:bg-[#eaf8f7] transition-colors rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-[#dff1f5]/40 h-full min-h-[200px]">
            <div className="mb-4 text-7xl filter drop-shadow-md transform hover:scale-110 transition-transform">
              👨🏻‍⚕️
            </div>
            <h3 className="text-[#004e66] font-medium text-[16px]">Find a Doctor</h3>
          </Link>

          {/* Card 3: Book Health Checkup */}
          <Link href="/health-checkup" className="bg-[#f0fcf7] hover:bg-[#e7f9f3] transition-colors rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-[#cff2e8]/40 h-full min-h-[200px]">
            <div className="mb-4 text-7xl filter drop-shadow-md transform hover:scale-110 transition-transform flex items-center justify-center gap-0">
              📋
            </div>
            <h3 className="text-[#004e66] font-medium text-[16px]">Book Health Checkup</h3>
          </Link>

          {/* Card 4: Request a Call back */}
          <Link href="/contact" className="bg-[#f0fcfb] hover:bg-[#e7f9f7] transition-colors rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-sm border border-[#d9edf9]/40 h-full min-h-[200px]">
            <div className="mb-4 text-7xl filter drop-shadow-md transform hover:scale-110 transition-transform text-blue-600">
              📞
            </div>
            <h3 className="text-[#004e66] font-medium text-[16px]">Request a Call back</h3>
          </Link>
        </div>

      </div>
    </div>
  );
}
