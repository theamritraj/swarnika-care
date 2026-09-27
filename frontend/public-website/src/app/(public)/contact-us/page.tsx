'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Maximize2 } from 'lucide-react';

interface HospitalLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  mapQuery: string;
}

const locationsData: { city: string; locations: HospitalLocation[] }[] = [
  {
    city: 'Sasaram',
    locations: [
      {
        id: 'sasaram-main',
        name: 'Sasaram Main Hospital (GT Road)',
        city: 'Sasaram',
        address: 'GT Road, Opposite Collectorate, Sasaram, Rohtas, Bihar - 821115',
        mapQuery: 'GT+Road+Sasaram+Rohtas+Bihar'
      },
      {
        id: 'sasaram-nicu-wing',
        name: 'Civil Lines Maternity Wing',
        city: 'Sasaram',
        address: 'Collectorate Road, Civil Lines, Sasaram, Rohtas, Bihar - 821115',
        mapQuery: 'Civil+Lines+Sasaram+Rohtas+Bihar'
      }
    ]
  }
];

export default function ContactUsPage() {
  const [selectedLocation, setSelectedLocation] = useState<HospitalLocation>(
    locationsData[0].locations[0]
  );
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');

  return (
    <div className="w-full bg-white min-h-screen pt-[74px] font-sans text-gray-800">
      
      {/* ========================================================= */}
      {/* 1. TOP BREADCRUMB BANNER (Matches Apollo Cradle pink bar) */}
      {/* ========================================================= */}
      <div className="w-full bg-[#ba4c8b] text-white py-2 px-4 sm:px-6 text-[12.5px] font-medium tracking-wide">
        <div className="w-full flex items-center gap-1.5">
          <Link href="/" className="hover:underline opacity-90 hover:opacity-100">Home</Link>
          <span className="opacity-75">»</span>
          <span className="font-semibold">Contact Us</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PAGE TITLE (Tight left-margin, matching Apollo Cradle) */}
      {/* ========================================================= */}
      <div className="w-full px-4 sm:px-6 pt-3 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
          Our Locations
        </h1>
      </div>

      {/* ========================================================= */}
      {/* 3. 2-COLUMN FULL-WIDTH LAYOUT (Apollo Cradle 1:1)         */}
      {/* Left: Sidebar (only Sasaram locations), Right: Full Map   */}
      {/* ========================================================= */}
      <div className="w-full flex flex-col md:flex-row items-stretch border-t border-gray-200">
        
        {/* LEFT COLUMN: Locations List by City (Only Sasaram) */}
        <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 pl-4 sm:pl-6 pr-3 py-3 border-r border-gray-200 bg-white">
          <div className="space-y-4">
            {locationsData.map((group) => (
              <div key={group.city} className="space-y-1.5">
                {/* City Heading */}
                <h3 className="text-[14px] font-bold text-[#222222] tracking-tight pt-1">
                  {group.city}
                </h3>

                {/* Branches under Sasaram */}
                <div className="space-y-1.5">
                  {group.locations.map((loc) => {
                    const isSelected = selectedLocation.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc)}
                        className={`w-full text-left py-2.5 px-3 rounded-[4px] text-[13px] font-semibold transition-colors cursor-pointer block ${
                          isSelected
                            ? 'bg-[#4d1045] text-white shadow-xs'
                            : 'bg-[#622060] text-white hover:bg-[#772675]'
                        }`}
                      >
                        <span className="truncate block">{loc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Full Map (Edge-to-edge, clean without floating card) */}
        <div className="flex-1 relative min-h-[550px] md:min-h-[700px] h-[calc(100vh-170px)] bg-slate-100 flex flex-col">
          
          {/* Map Top-Left Controls: [ Map | Satellite ] */}
          <div className="absolute top-4 left-4 z-20 bg-white shadow-md rounded-[3px] border border-gray-300 overflow-hidden flex items-center text-[12px] font-medium text-gray-700 select-none">
            <button
              onClick={() => setMapType('map')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                mapType === 'map' ? 'bg-gray-100 font-bold text-gray-900' : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1.5 transition-colors cursor-pointer border-l border-gray-300 ${
                mapType === 'satellite' ? 'bg-gray-100 font-bold text-gray-900' : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Fullscreen Button in top right */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name + ', ' + selectedLocation.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-20 bg-white/95 hover:bg-white text-gray-700 p-2 rounded-[3px] shadow-md border border-gray-300 transition-colors"
            title="Open Fullscreen Map"
          >
            <Maximize2 className="w-4 h-4" />
          </a>

          {/* Interactive Google Map */}
          <iframe
            title={selectedLocation.name}
            width="100%"
            height="100%"
            className="flex-1 border-0 w-full h-full min-h-[550px] md:min-h-[700px]"
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.mapQuery)}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=15&ie=UTF8&iwloc=&output=embed`}
          />

        </div>

      </div>

    </div>
  );
}
