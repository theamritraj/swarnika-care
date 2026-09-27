'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'Why is Swarnika Hospitals recognised as one of the leading multispeciality hospital groups in India?',
    answer: 'Swarnika Hospitals is renowned for its clinical excellence, cutting-edge technology, and a patient-centric approach. With state-of-the-art facilities and a team of globally acclaimed medical professionals, we consistently set benchmarks in healthcare delivery across various specialties.'
  },
  {
    question: 'How can I book an appointment at Swarnika Hospitals in India?',
    answer: 'You can easily book an appointment through our official website by navigating to the "Book Appointment" section. Alternatively, you can use our 24/7 dedicated helpline or visit the front desk of any Swarnika facility to schedule your visit.'
  },
  {
    question: 'Does Swarnika Hospitals offer second opinions and online consultations?',
    answer: 'Yes, Swarnika Hospitals offers comprehensive telehealth services, including online consultations and second opinions from our expert panels. This allows patients from any part of the world to access our world-class medical expertise from the comfort of their homes.'
  },
  {
    question: 'What are the visiting hours and visitor policies at Swarnika Hospitals?',
    answer: 'Visiting hours and policies vary by hospital and department. Structured visiting hours are followed to prioritise patient safety and recovery, with restricted access in ICUs and critical care areas based on clinical needs and hospital policy.'
  },
  {
    question: 'How can I find and book a Sunday doctor appointment at Swarnika Hospitals?',
    answer: 'You can find and book a Sunday doctor appointment online through the Swarnika Hospitals Sunday Doctors booking page. The page allows you to check doctors available on Sunday, review their specialties, select a suitable hospital location, and choose from the available consultation slots.\n\nOnline booking is subject to doctor and appointment availability. Patients are advised to confirm the selected doctor, hospital, date, and consultation time before visiting.'
  },
  {
    question: 'Is advance booking required for a Sunday doctor consultation?',
    answer: 'Advance booking may not always be mandatory, but it is strongly recommended for Sunday doctor consultations at Swarnika Hospitals. Weekend appointment slots may be limited because fewer doctors or departments may be available compared with regular weekdays. Popular specialists may also have limited availability or become fully booked in advance.\n\nBooking early allows you to confirm the doctor’s availability, select a convenient consultation time, and choose the appropriate Swarnika Hospitals location. Patients should also verify the appointment details before travelling, as doctor schedules and Sunday timings may change.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white relative z-10">
      <div className="max-w-[1000px] mx-auto px-6 lg:pl-28">
        
        <h2 className="text-[32px] font-medium text-[#1a3b42] mb-4">
          Frequently Asked Questions - Swarnika Hospitals
        </h2>
        
        <p className="text-[15px] text-[#1a3b42] leading-relaxed mb-12">
          Explore detailed answers to commonly asked questions about healthcare services, specialist consultations, treatment processes, and patient care at Swarnika Hospitals, one of India's leading multispeciality hospital networks.
        </p>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#007b92]/30 shadow-md' : 'border-slate-200'}`}
              >
                <div 
                  className="flex justify-between items-center p-6 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <h3 className="font-bold text-[#1a3b42] text-[16px] pr-8">
                    {faq.question}
                  </h3>
                  <div className="shrink-0 w-8 h-8 rounded-full border-[1.5px] border-[#007b92] flex items-center justify-center text-[#007b92]">
                    {isOpen ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 pt-2 text-[15px] text-[#1a3b42] leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
