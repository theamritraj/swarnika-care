import Link from 'next/link';

const footerLinks = {
  aboutUs: [
    { label: 'Vision / Mission', href: '/about-us' },
    { label: 'Management', href: '/about-us' },
    { label: 'In Safe Hands', href: '/about-us' },
    { label: 'Natural is Priceless', href: '/about-us' },
    { label: 'Insurance Partners', href: '/about-us' },
  ],
  specialities: [
    { label: 'Aesthetic and Functional Gynecology', href: '/specialities' },
    { label: 'Maternity', href: '/specialities' },
    { label: 'Fetal Medicine', href: '/specialities' },
    { label: 'Gynecology', href: '/specialities' },
    { label: 'Pediatrics', href: '/specialities' },
    { label: 'Department of Medical Genetics', href: '/specialities' },
    { label: 'Fertility', href: '/specialities' },
  ],
  quickLinks1: [
    { label: 'Request an Appointment', href: '/book' },
    { label: 'Search a Doctor', href: '/doctors' },
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Blog', href: '/blogs' },
    { label: 'Careers', href: '/careers' },
    { label: 'Personal Health Record', href: '/phr' },
    { label: 'Patient Videos', href: '/videos' },
    { label: 'Pregnancy FAQs', href: '/faqs' },
  ],
  quickLinks2: [
    { label: 'Swarnika Hospitals App', href: '#' },
    { label: 'Terms and Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Symptom Checker', href: '/symptom-checker' },
    { label: 'Recruitment Disclaimer', href: '/recruitment-disclaimer' },
    { label: 'Safety Quiz', href: '/safety-quiz' },
    { label: 'Blissful Pregnancy', href: '/blissful-pregnancy' },
    { label: 'Pregnancy Calculator', href: '/pregnancy-calculator' },
  ],
};

const ChevronLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="group flex items-start gap-2 text-white/85 hover:text-white transition-all duration-200 text-[13px] md:text-[13.5px] py-1 hover:translate-x-1"
  >
    <span className="text-white/60 group-hover:text-white transition-colors text-sm font-bold shrink-0">»</span>
    <span>{children}</span>
  </Link>
);

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="w-full relative overflow-hidden bg-[#470a45] bg-no-repeat bg-right-bottom [background-size:contain] lg:[background-size:auto_100%]"
      style={{
        backgroundImage: "url('/images/footerbg.png')",
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-14 pb-20 md:pt-16 md:pb-24">
        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-4xl xl:max-w-5xl">
          {/* About Us */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[3px] h-4 md:h-5 bg-white shrink-0" />
              <h3 className="text-white font-bold text-[15px] tracking-wide">About Us</h3>
            </div>
            <ul className="flex flex-col">
              {footerLinks.aboutUs.map((link) => (
                <li key={link.label}>
                  <ChevronLink href={link.href}>{link.label}</ChevronLink>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Link href="#" className="text-white font-bold hover:underline text-[13.5px]">
                Download Our App
              </Link>
            </div>
          </div>

          {/* Specialities */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[3px] h-4 md:h-5 bg-white shrink-0" />
              <h3 className="text-white font-bold text-[15px] tracking-wide">Specialities</h3>
            </div>
            <ul className="flex flex-col">
              {footerLinks.specialities.map((link) => (
                <li key={link.label}>
                  <ChevronLink href={link.href}>{link.label}</ChevronLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Part 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[3px] h-4 md:h-5 bg-white shrink-0" />
              <h3 className="text-white font-bold text-[15px] tracking-wide">Quick Links</h3>
            </div>
            <ul className="flex flex-col">
              {footerLinks.quickLinks1.map((link) => (
                <li key={link.label}>
                  <ChevronLink href={link.href}>{link.label}</ChevronLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Part 2 */}
          <div className="pt-0 lg:pt-9">
            <ul className="flex flex-col">
              {footerLinks.quickLinks2.map((link) => (
                <li key={link.label}>
                  <ChevronLink href={link.href}>{link.label}</ChevronLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social icons + Copyright */}
        <div className="mt-12 md:mt-14 flex flex-col items-center max-w-4xl xl:max-w-5xl">
          <div className="flex items-center gap-5 mb-3">
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </Link>
            <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </Link>
          </div>
          <p className="text-white/85 text-[13px] md:text-sm font-normal text-center">
            Copyright @ 2026, <span className="font-semibold text-white">Swarnika Hospitals.</span> All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
