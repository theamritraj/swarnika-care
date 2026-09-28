import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Baby, HeartPulse, ShieldCheck, ArrowLeft, Share2 } from 'lucide-react';

export default function BlogPost({ params }: { params: { id: string } }) {
  // Mock data for the Swarnika Bloom Guide (assuming id '1' is this guide)
  const isBloomGuide = params.id === '1' || params.id === 'swarnika-bloom';

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back to Home / Breadcrumb */}
        <Link href="/" className="inline-flex items-center text-[#622060] font-medium hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Blog Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffeaf3] rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-[#622060] text-white text-sm font-bold rounded-full mb-6 shadow-sm">
              Swarnika Bloom Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#2b2b2b] leading-tight mb-6">
              {isBloomGuide ? "The Complete Mother & Child Healthcare Guide" : "Understanding Your Health Journey"}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {isBloomGuide 
                ? "From planning your pregnancy to nurturing your newborn, Swarnika Bloom is your trusted companion at every step of motherhood." 
                : "Read our latest insights and medical advice from the experts at Swarnika Hospitals."}
            </p>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSarah" alt="Author" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-[#004e66]">Dr. Sarah Mathews</h4>
                  <p className="text-sm text-gray-500">Head of Obstetrics & Gynecology</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex flex-col items-end">
                <span>Published on Oct 12, 2025</span>
                <span>8 min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          
          {isBloomGuide ? (
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="lead text-2xl text-[#622060] font-medium mb-10">
                Welcome to Swarnika Bloom! We understand that pregnancy is a beautiful, yet overwhelming journey. That's why we've compiled all the essential tools, guides, and advice you need into one comprehensive hub.
              </p>

              {/* Section 1 */}
              <div className="flex items-center gap-4 mb-6 mt-12">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-[#2b2b2b] m-0">1. Pregnancy Tools</h2>
              </div>
              <p>Planning and tracking are crucial parts of a healthy pregnancy. Our specialized digital tools are designed to give you peace of mind:</p>
              <ul className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 my-6 list-none space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-xl mt-1">•</span>
                  <div>
                    <strong>Pregnancy Due Date Calculator:</strong> Simply enter the first day of your last period, and we'll estimate your baby's arrival date.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-xl mt-1">•</span>
                  <div>
                    <strong>Ovulation & Fertility Calendar:</strong> For those trying to conceive, identifying your most fertile window is the first step to success.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-xl mt-1">•</span>
                  <div>
                    <strong>Estimated Fetal Age Checker:</strong> Track how far along you are and what milestones your baby is reaching this week.
                  </div>
                </li>
              </ul>

              {/* Section 2 */}
              <div className="flex items-center gap-4 mb-6 mt-16">
                <div className="bg-teal-100 p-3 rounded-2xl text-teal-600">
                  <HeartPulse className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-[#2b2b2b] m-0">2. Trimester Guides</h2>
              </div>
              <p>Your body goes through incredible changes over 40 weeks. Here is what you need to know for each phase:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="bg-white border-2 border-teal-50 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-bold text-[#004e66] mb-3 mt-0">First Trimester</h3>
                  <p className="text-sm">Focus on crucial diet changes, folic acid intake, and managing early symptoms like morning sickness.</p>
                </div>
                <div className="bg-white border-2 border-teal-50 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-bold text-[#004e66] mb-3 mt-0">Second Trimester</h3>
                  <p className="text-sm">The "golden period". Time for vital anomaly scans (TIFFA) and feeling your baby's first movements.</p>
                </div>
                <div className="bg-white border-2 border-teal-50 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-bold text-[#004e66] mb-3 mt-0">Third Trimester</h3>
                  <p className="text-sm">Preparing for labor. Learn the signs of contractions, hospital bag checklists, and readiness plans.</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="flex items-center gap-4 mb-6 mt-16">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-[#2b2b2b] m-0">3. Childbirth & Parenting</h2>
              </div>
              <p>When the big day arrives, knowledge is your best defense against anxiety. Our specialists answer your most pressing questions:</p>
              <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 p-6 italic my-8 rounded-r-2xl">
                "Whether you have a Normal or Cesarean delivery, our priority is a safe and comfortable experience for both mother and child."
              </blockquote>
              <p>We provide comprehensive counseling on <strong>Breastfeeding & Latch Techniques</strong> immediately after birth, and guide you through essential <strong>Postpartum Recovery Tips</strong> to ensure your body heals properly.</p>

              {/* Section 4 */}
              <div className="flex items-center gap-4 mb-6 mt-16">
                <div className="bg-purple-100 p-3 rounded-2xl text-[#622060]">
                  <Baby className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-[#2b2b2b] m-0">4. Newborn & Infant Care</h2>
              </div>
              <p>Taking your baby home is just the beginning. The Swarnika Bloom guide extends into pediatric care to help you navigate the early months:</p>
              <ul className="bg-purple-50/30 p-6 rounded-2xl border border-purple-100 my-6">
                <li className="mb-3"><strong>Vaccination Chart:</strong> Never miss a shot. We provide a complete schedule from Day 1 to Year 5.</li>
                <li className="mb-3"><strong>Growth Milestones:</strong> Track your infant's weight, height, and cognitive milestones to ensure healthy development.</li>
                <li><strong>When to Visit a Pediatrician:</strong> Learn to identify common newborn issues like colic, jaundice, or fever, and know exactly when to seek medical help.</li>
              </ul>

              <div className="mt-16 bg-gradient-to-r from-[#ffeaf3] to-[#f0f9f9] p-8 rounded-3xl text-center">
                <h3 className="text-2xl font-bold text-[#622060] mb-4 mt-0">Ready to start your journey?</h3>
                <p className="mb-6">Book a consultation with our maternity experts today.</p>
                <Link href="/appointments" className="inline-block bg-[#622060] text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-[#4d194c] transition-colors">
                  Book an Appointment
                </Link>
              </div>

            </div>
          ) : (
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>This is a standard blog post detailing medical advice and hospital news. Please select the Swarnika Bloom Guide to see the comprehensive maternity layout.</p>
            </div>
          )}

          {/* Social Share */}
          <div className="flex items-center justify-center gap-6 mt-16 pt-8 border-t border-gray-100">
            <span className="text-gray-500 font-medium flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Share this guide:
            </span>
            <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
