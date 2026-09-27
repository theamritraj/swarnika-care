import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pt-[74px] pb-24 font-sans text-center">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-2xl mx-auto">
        
        {/* 404 Illustration matching Apollo reference */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center gap-2 select-none">
            {/* Left 4 */}
            <span className="text-[100px] md:text-[140px] font-black text-[#58184d] leading-none drop-shadow-md">
              4
            </span>

            {/* Middle 0 with Teal Circle Character */}
            <div className="relative w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-full bg-[#0284a8] flex items-center justify-center shadow-inner overflow-hidden border-4 border-[#016580]">
              {/* Hole depth effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
              
              {/* Vector character looking out */}
              <svg 
                className="w-24 h-24 md:w-32 md:h-32 text-white relative z-10 -bottom-2" 
                viewBox="0 0 100 100" 
                fill="none"
              >
                {/* Hair */}
                <path d="M30 45 C30 25, 70 25, 70 45 C75 55, 65 65, 50 65 C35 65, 25 55, 30 45 Z" fill="#2d3748" />
                {/* Head */}
                <circle cx="50" cy="46" r="16" fill="#fbd38d" />
                {/* Cheerful Expression */}
                <circle cx="45" cy="45" r="2" fill="#2d3748" />
                <circle cx="55" cy="45" r="2" fill="#2d3748" />
                <path d="M46 51 Q50 55 54 51" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" />
                {/* Body / Shirt (Yellow) */}
                <path d="M36 62 L64 62 L60 85 L40 85 Z" fill="#f6e05e" />
                {/* Arms waving */}
                <path d="M36 64 L24 50 L28 48 L38 60 Z" fill="#fbd38d" />
                <path d="M64 64 L76 50 L72 48 L62 60 Z" fill="#fbd38d" />
              </svg>
            </div>

            {/* Right 4 */}
            <span className="text-[100px] md:text-[140px] font-black text-[#58184d] leading-none drop-shadow-md">
              4
            </span>
          </div>

          {/* "page not found" subtitle */}
          <div className="text-[24px] md:text-[28px] font-bold text-[#0081a0] italic tracking-wide mt-2">
            page not found
          </div>
        </div>

        {/* Message */}
        <p className="text-[16px] md:text-[18px] text-[#2b5c92] font-semibold mt-4">
          We&apos;re sorry. The page you requested does not exist on visit the{' '}
          <Link 
            href="/" 
            className="text-[#0081a0] underline hover:text-[#622060] font-bold transition-colors"
          >
            Home Page
          </Link>
        </p>

        {/* Quick Return Button */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#622060] hover:bg-[#50164e] text-white font-semibold rounded-full text-[14px] shadow-sm transition-colors"
          >
            Go to Main Hospital Page
          </Link>
          <Link
            href="/doctors"
            className="px-6 py-2.5 border border-[#622060] text-[#622060] hover:bg-[#622060] hover:text-white font-semibold rounded-full text-[14px] transition-colors"
          >
            Find a Doctor
          </Link>
        </div>

      </div>

    </div>
  );
}
