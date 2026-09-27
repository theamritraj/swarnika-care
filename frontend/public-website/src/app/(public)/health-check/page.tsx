import React from 'react';

export default function HealthCheckPage() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-[#e6f8f1] text-4xl rounded-full flex items-center justify-center mb-6">🛡️</div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a3b42] mb-4 font-serif">
        Book Health Check
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mb-8">
        Preventive healthcare is the best step towards a long and healthy life. Choose from our specialized health checkup packages tailored for different age groups and needs.
      </p>
      <button className="bg-[#007b92] text-white px-8 py-3 rounded-full font-bold hover:bg-[#006072] transition shadow-md">
        View Packages
      </button>
    </div>
  );
}
