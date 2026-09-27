'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    category: 'GENERAL',
    title: 'Mastitis: Symptoms, Causes & Treatment for Breastfeeding Mothers',
    excerpt: 'A sudden tender, swollen, or sore spot on your breast while you\'re nursing is often the first sign',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    category: 'GENERAL',
    title: 'Scans During Pregnancy: Types, Timeline & Why They Are Important',
    excerpt: 'Somewhere around week 6, most women get handed a slip of paper with a scan date on it, and that\'',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    category: 'GENERAL',
    title: 'How to Get Periods Immediately: Causes of Delay & Safe Ways to Induce Menstruation',
    excerpt: 'You may have searched for \'how to get periods fast or early,\' as many women do. However,',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop'
  }
];

export function OurBlogs() {
  return (
    <section className="py-20 bg-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-[40px] font-bold text-gray-800 mb-2 tracking-tight">Our Blogs</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Explore Blog Card (Special First Card) */}
          <Link href="/blogs" className="group rounded-[1.5rem] overflow-hidden relative shadow-md bg-[#137e93] hover:shadow-xl transition-shadow flex flex-col h-[420px] cursor-pointer">
            <div className="absolute inset-0 opacity-40 mix-blend-multiply group-hover:opacity-50 transition-opacity">
              <Image 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop" 
                alt="Doctor with Stethoscope" 
                fill 
                className="object-cover"
              />
            </div>
            
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-[#137e93]/30"></div>

            <div className="mt-auto relative z-10 p-8 flex items-center gap-2 text-white font-semibold text-lg hover:gap-3 transition-all pb-10">
              Explore Blog <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Blog Post Cards */}
          {blogPosts.map((post) => (
            <Link href={`/blogs/${post.id}`} key={post.id} className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transition-all duration-300 flex flex-col h-[420px] group cursor-pointer">
              
              {/* Image Container */}
              <div className="relative w-full h-[200px] rounded-2xl overflow-hidden mb-5">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow px-2">
                <span className="text-[#3b82f6] text-xs font-bold tracking-wider uppercase mb-3">
                  {post.category}
                </span>
                
                <h3 className="text-[#1a3b42] font-bold text-[17px] leading-snug mb-3 line-clamp-3 group-hover:text-[#5a1a4a] transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
