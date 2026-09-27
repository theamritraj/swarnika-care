import React from 'react';

export default function SpecialitiesPage() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a3b42] mb-6 font-serif">
        Our Specialities
      </h1>
      <p className="text-lg text-slate-600 max-w-3xl mb-12">
        Explore our comprehensive range of medical specialities designed to provide holistic care for you and your family.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {['Cardiac Sciences', 'Orthopaedics', 'Neurology', 'Oncology', 'Gastroenterology', 'Pediatrics'].map((spec) => (
          <div key={spec} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{spec}</h3>
            <p className="text-slate-500 text-sm">Expert care and advanced treatments for your specific medical needs.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
