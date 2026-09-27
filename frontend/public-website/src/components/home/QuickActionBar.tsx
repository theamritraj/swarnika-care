import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function QuickActionBar() {
  return (
    <section className="w-full relative z-30 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap lg:flex-nowrap justify-center gap-0 shadow-2xl rounded-full overflow-hidden bg-white border border-[#1a3b42]">
        
        {/* Button 1: Warm Yellow */}
        <Link href="/book" className="flex-1 flex items-center justify-between py-4 px-6 bg-[#fffaeb] text-[#1a3b42] hover:bg-[#ffeac4] transition-colors cursor-pointer group border-r border-[#1a3b42]">
          <span className="font-bold text-[14px] tracking-wide">Book Appointment</span>
          <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1a3b42] flex items-center justify-center group-hover:bg-[#007b92] group-hover:border-[#007b92] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#1a3b42] group-hover:text-white transition-colors" />
          </div>
        </Link>

        {/* Button 2: Soft Blue */}
        <Link href="/specialities" className="flex-1 flex items-center justify-between py-4 px-6 bg-white text-[#1a3b42] hover:bg-[#e2ebfa] transition-colors cursor-pointer group border-r border-[#1a3b42]">
          <span className="font-bold text-[14px] tracking-wide">Our Specialities</span>
          <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1a3b42] flex items-center justify-center group-hover:bg-[#007b92] group-hover:border-[#007b92] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#1a3b42] group-hover:text-white transition-colors" />
          </div>
        </Link>

        {/* Button 3: Soft Green */}
        <Link href="#" className="flex-1 flex items-center justify-between py-4 px-6 bg-white text-[#1a3b42] hover:bg-[#ddf2e3] transition-colors cursor-pointer group border-r border-[#1a3b42]">
          <span className="font-bold text-[14px] tracking-wide">Book Health Check</span>
          <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1a3b42] flex items-center justify-center group-hover:bg-[#007b92] group-hover:border-[#007b92] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#1a3b42] group-hover:text-white transition-colors" />
          </div>
        </Link>

        {/* Button 4: Soft Cyan */}
        <Link href="#" className="flex-1 flex items-center justify-between py-4 px-6 bg-white text-[#1a3b42] hover:bg-[#dcf4fa] transition-colors cursor-pointer group">
          <span className="font-bold text-[14px] tracking-wide">Get Expert Opinion</span>
          <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1a3b42] flex items-center justify-center group-hover:bg-[#007b92] group-hover:border-[#007b92] transition-colors">
            <ArrowRight className="w-4 h-4 text-[#1a3b42] group-hover:text-white transition-colors" />
          </div>
        </Link>

      </div>
    </section>
  );
}
