'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Sparkles,
  X,
  Heart,
} from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Mrs. Malyuun',
    role: 'Delivered at Swarnika Hospitals',
    content:
      'I had my delivery at Swarnika Hospitals under the expert care of the doctors and medical team. The services provided by Swarnika are at par. The staff, including doctors and nurses, are really kind, knowledgeable, and skilled. The food and hygiene are of high quality. All our queries and doubts were addressed most efficiently. I would surely recommend Swarnika Hospitals to others in the future!',
  },
  {
    id: 2,
    name: 'Mrs. Aisha',
    role: 'Delivered at Swarnika Hospitals',
    content:
      'We chose Swarnika Hospitals for my delivery and I surely had the best experience. The staff, including the doctors, nurses, and housekeeping, all made me feel completely at ease during the course of my stay. The care before and after delivery was exemplary and prompt. I would happily recommend Swarnika Hospitals to my friends and family!',
  },
  {
    id: 3,
    name: 'Mrs. Nupur Sengupta',
    role: 'Delivered at Swarnika Hospitals',
    content:
      'I came to Swarnika Hospitals for my delivery and I am highly satisfied with the treatment I received here. From admission to discharge, we did not face any trouble. The complete experience was very smooth and homelike. The doctors are skilled, and the nursing staff attends to your needs with warmth and professionalism.',
  },
  {
    id: 4,
    name: 'Mrs. Komal Prasad',
    role: 'Delivered at Swarnika Hospitals',
    content:
      'We had an amazing experience at Swarnika Hospitals, with the kind of support and care we received from everybody in the hospital family. From the renowned doctors to the nurses, front desk, and housekeeping staff, I thank you all for your love, dedication, and care.',
  },
  {
    id: 5,
    name: 'Mrs. Shaoni Basu',
    role: 'Delivered at Swarnika Hospitals',
    content:
      'Swarnika Hospitals is a highly recommended birthing place. I had a very joyful journey during my stay. The ambience is welcoming, clean, and reassuring. Special thanks to the entire obstetrics and pediatric team for offering the best care for my newborn baby.',
  },
];

export function PatientsSpeak() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto rotate text testimonials
  useEffect(() => {
    if (isPaused || isModalOpen) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, isModalOpen]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[activeIndex];

  return (
    <section className="py-14 md:py-20 w-full bg-[#f4f9fb]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#333333] tracking-tight">
            Happy Mom's Speaks
          </h2>
          <div className="flex justify-center mt-2.5">
            <Image
              src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712528/swarnikacare/website/hedimgicon.png"
              alt="Happy Mom's Speaks Divider"
              width={130}
              height={42}
              className="object-contain"
            />
          </div>
        </div>

        {/* Two-Column Grid: Left Testimonial Card & Right Video Story Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left Column: Testimonial Card */}
          <div
            className="w-full h-full min-h-[380px] md:min-h-[410px] bg-white rounded-[24px] shadow-[0_12px_40px_rgba(215,228,249,0.55)] border border-slate-100 p-7 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300"
            style={{
              backgroundImage:
                'url("https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712536/swarnikacare/website/quote1.png"), url("https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712535/swarnikacare/website/quote.png")',
              backgroundPosition: 'top 16px left 16px, bottom 20px right 16px',
              backgroundSize: '110px auto, 110px auto',
              backgroundRepeat: 'no-repeat, no-repeat',
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Top Avatar & Star Rating */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-sm border-2 border-white mb-2">
                <Image
                  src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712538/swarnikacare/website/testimonial-icon.png"
                  alt="Mother & Baby"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="my-auto py-3 text-center px-2 md:px-4">
              <p className="text-[14px] md:text-[15px] text-[#444444] leading-relaxed italic line-clamp-5">
                "{current.content}"
              </p>
            </div>

            {/* Author Details & Navigation Flush at Bottom */}
            <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between">
              <div className="text-left">
                <h4 className="text-[16px] font-bold text-[#1a202c] leading-tight">
                  {current.name}
                </h4>
                <p className="text-[12px] text-[#718096] font-medium mt-0.5">
                  {current.role}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5 mr-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeIndex
                          ? 'w-5 bg-[#8B1A4A]'
                          : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow buttons */}
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#8B1A4A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#8B1A4A] text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Swarnika Hospitals Video Story Card */}
          <div
            className="w-full h-full min-h-[380px] md:min-h-[410px] rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(215,228,249,0.55)] border border-slate-100 relative group cursor-pointer select-none bg-slate-900"
            onClick={() => setIsModalOpen(true)}
          >
            {/* Background Maternity Photo */}
            <Image
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop"
              alt="Swarnika Hospitals Patient Story"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />

            {/* Top Header Badge */}
            <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shadow-md">
                  <Image
                    src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png"
                    alt="Swarnika Hospitals"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-white text-[15px] font-bold drop-shadow leading-tight flex items-center gap-1.5">
                    Swarnika Hospitals - Patient Story
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h4>
                  <p className="text-white/80 text-[12px] drop-shadow">
                    Safe Birthing & Maternity Experience
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                2:40 Min
              </span>
            </div>

            {/* Center Play Button with Pulse Animation */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#8B1A4A] blur-md opacity-60 group-hover:opacity-90 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-[#8B1A4A] text-white flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </div>
              <span className="mt-3.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[12px] font-medium border border-white/20 drop-shadow">
                Watch Pooja's Birthing Journey
              </span>
            </div>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-5 inset-x-5 z-10">
              <div className="bg-black/65 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center shadow-lg">
                <p className="text-white text-[13px] md:text-[14px] font-medium leading-relaxed drop-shadow line-clamp-2">
                  "From our first prenatal scan to delivery, the team at Swarnika Hospitals took care of every detail. My baby and I were in the safest hands!"
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5 text-pink-300 text-[11px] font-semibold">
                  <Heart className="w-3 h-3 fill-pink-300" />
                  <span>Pooja & Baby Aarav — Swarnika Hospitals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Swarnika Hospitals Patient Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-[24px] overflow-hidden shadow-2xl border border-white/20 flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-[#5a1a4a] to-[#8B1A4A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-1.5 shadow">
                  <Image
                    src="https://res.cloudinary.com/eb6pvtx2/image/upload/v1790712540/swarnikacare/website/logo.png"
                    alt="Swarnika Hospitals"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] leading-tight">
                    Swarnika Hospitals - Patient Story
                  </h3>
                  <p className="text-[12px] text-pink-200">
                    Maternity Journey of Pooja & Baby Aarav
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Hero Image */}
            <div className="relative w-full aspect-video bg-slate-900">
              <Image
                src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop"
                alt="Swarnika Maternity Story"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8B1A4A] text-[11px] font-bold uppercase tracking-wider">
                  Patient Testimonial
                </span>
                <p className="text-[14px] md:text-[15px] font-medium mt-1 leading-snug">
                  "The doctors and nurses at Swarnika Hospitals treated us like family during our 3-day stay."
                </p>
              </div>
            </div>

            {/* Story Details */}
            <div className="p-6 md:p-8 space-y-4 text-[#444444] text-[14px] md:text-[15px] leading-relaxed">
              <p>
                <strong>Pooja & her husband Rahul</strong> chose Swarnika Hospitals for their first delivery. From trimester checkups to high-resolution fetal scans, the clinical team guided them every step of the way.
              </p>
              <div className="p-4 rounded-xl bg-pink-50/70 border border-pink-100 italic text-[#5a1a4a]">
                “The labor and birthing suites at Swarnika Hospitals were spotless, peaceful, and equipped with round-the-clock neonatal care. The lactation and pediatric consultants were with us 24/7.”
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Care Team: <strong>Dr. Padmavathi & Pediatric Staff</strong>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-[#8B1A4A] hover:bg-[#6c143a] text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
