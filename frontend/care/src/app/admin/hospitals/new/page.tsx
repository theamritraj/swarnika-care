'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, RefreshCw, AlertCircle, Phone, Mail, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const FACILITY_TYPE_DESCRIPTIONS: Record<string, string> = {
  GENERAL_HOSPITAL: "Comprehensive hospital providing general medical, diagnostic, emergency, inpatient and outpatient healthcare services.",
  MULTI_SPECIALTY_HOSPITAL: "Multi-specialty hospital providing a broad range of medical and surgical specialties, diagnostic services, outpatient care and inpatient treatment.",
  SUPER_SPECIALTY_HOSPITAL: "Specialized tertiary-care hospital providing advanced medical and surgical treatment across selected super-specialty disciplines.",
  MATERNITY_WOMEN_HOSPITAL: "Specialized hospital focused on women's health, maternity care, obstetrics and gynaecology, childbirth, neonatal care and related services.",
  WOMEN_CHILD_HOSPITAL: "Specialized healthcare facility providing comprehensive women's and children's healthcare, including maternity, paediatric and neonatal services.",
  CHILDREN_HOSPITAL: "Specialized hospital dedicated to paediatric healthcare, providing medical, surgical, emergency and supportive care for children.",
  MOTHER_CHILD_HOSPITAL: "Specialized healthcare facility providing integrated maternity, maternal, newborn and paediatric care for mothers and children.",
  DISTRICT_HOSPITAL: "District-level healthcare facility providing comprehensive medical, emergency, diagnostic, inpatient and outpatient services to the surrounding population.",
  DAY_CLINIC: "Outpatient healthcare facility providing consultations, minor procedures, diagnostics and other services without routine overnight admission.",
  SPECIALTY_CLINIC: "Specialized outpatient healthcare facility focused on consultations, diagnosis and treatment within specific medical specialties.",
  OTHER: "Healthcare facility providing specialized medical or healthcare services based on its operational scope."
};

export default function AddHospitalPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    code: '',
    name: 'Swarnika Bloom',
    type: 'MATERNITY_WOMEN_HOSPITAL',
    description: '',
    phone: '',
    email: '',
    emergencyPhone: '',
    address: '',
    city: 'Sasaram',
    state: 'Bihar',
    country: 'India',
    pincode: '821115',
    totalBeds: 0,
    icuBeds: 0,
    nicuBeds: 0,
    emergencyBeds: 0,
    emergencyAvailable: false,
    otAvailable: false,
    ambulanceAvailable: false,
    nicuAvailable: false,
    bloodBankAvailable: false,
  });

  // Clinical Services — stored as comma-separated list, persisted via clinicalServices field
  const ALL_CLINICAL_SERVICES = [
    'Maternity', 'Obstetrics & Gynaecology', 'Neonatology', 'Paediatrics', 'NICU',
    'Labour & Delivery', 'OT / Operation Theatre', 'OPD', 'IPD', 'Emergency',
    'ICU', 'HDU', 'Day Care', 'Dialysis', 'Radiology', 'Other'
  ];

  const FACILITY_DEFAULT_SERVICES: Record<string, string[]> = {
    MATERNITY_WOMEN_HOSPITAL: ['Maternity', 'Obstetrics & Gynaecology', 'Neonatology', 'Paediatrics', 'NICU', 'Labour & Delivery', 'OT / Operation Theatre', 'OPD', 'IPD'],
    GENERAL_HOSPITAL: ['OPD', 'IPD', 'Emergency', 'OT / Operation Theatre', 'ICU', 'Day Care'],
    MULTI_SPECIALTY_HOSPITAL: ['OPD', 'IPD', 'Emergency', 'OT / Operation Theatre', 'ICU', 'HDU', 'Day Care', 'Dialysis', 'Radiology'],
    SUPER_SPECIALTY_HOSPITAL: ['OPD', 'IPD', 'Emergency', 'OT / Operation Theatre', 'ICU', 'HDU', 'Dialysis', 'Radiology'],
    DISTRICT_HOSPITAL: ['OPD', 'IPD', 'Emergency', 'OT / Operation Theatre', 'ICU'],
    DAY_CLINIC: ['OPD', 'Day Care'],
    SPECIALTY_CLINIC: ['OPD', 'Day Care'],
  };

  const [selectedServices, setSelectedServices] = useState<string[]>(
    FACILITY_DEFAULT_SERVICES['MATERNITY_WOMEN_HOSPITAL'] || []
  );

  const SUPPORT_OPTIONS = ['IN_HOUSE', 'OUTSOURCED', 'CONTRACTED', 'NOT_AVAILABLE'];
  const SUPPORT_LABELS: Record<string, string> = {
    IN_HOUSE: 'In-house', OUTSOURCED: 'Outsourced', CONTRACTED: 'Contracted', NOT_AVAILABLE: 'Not Available'
  };

  const [supportServices, setSupportServices] = useState({
    laboratory: 'NOT_AVAILABLE',
    bloodBank: 'NOT_AVAILABLE',
    pharmacy: 'IN_HOUSE',
    radiology: 'NOT_AVAILABLE',
  });

  const toggleService = (svc: string) => {
    setSelectedServices(prev =>
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  const capacityError = (() => {
    const t = formData.totalBeds || 0;
    if (formData.icuBeds > t) return 'ICU Beds cannot exceed Total Beds';
    if (formData.nicuBeds > t) return 'NICU Beds cannot exceed Total Beds';
    if (formData.emergencyBeds > t) return 'Emergency Beds cannot exceed Total Beds';
    return null;
  })();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDescriptionManuallyEdited, setIsDescriptionManuallyEdited] = useState(false);
  const [showDescriptionPrompt, setShowDescriptionPrompt] = useState(false);
  const [pendingDescription, setPendingDescription] = useState<string | null>(null);

  useEffect(() => {
    // Generate an internal branching code following industry conventions (e.g., ORG-CITY-SEQ)
    const randomCode = `SC-SAS-0${Math.floor(1 + Math.random() * 9)}`;
    const defaultDesc = FACILITY_TYPE_DESCRIPTIONS['MATERNITY_WOMEN_HOSPITAL'];
    setFormData(prev => ({ ...prev, code: randomCode, description: defaultDesc }));
  }, []);

  const handleTypeChange = (newType: string) => {
    const newDefaultDescription = FACILITY_TYPE_DESCRIPTIONS[newType] || '';
    
    // If the description is empty, just fill it and mark as not manually edited
    if (!formData.description.trim()) {
      setFormData({ ...formData, type: newType, description: newDefaultDescription });
      setIsDescriptionManuallyEdited(false);
      return;
    }

    const defaultServices = FACILITY_DEFAULT_SERVICES[newType] || [];
    if (!isDescriptionManuallyEdited && formData.description === (FACILITY_TYPE_DESCRIPTIONS[formData.type] || '')) {
      setFormData({ ...formData, type: newType, description: newDefaultDescription });
      setSelectedServices(defaultServices);
      return;
    }

    // If description is empty, auto-fill it and update services
    if (!formData.description.trim()) {
      setFormData({ ...formData, type: newType, description: newDefaultDescription });
      setIsDescriptionManuallyEdited(false);
      setSelectedServices(defaultServices);
      return;
    }

    // Otherwise, description was manually edited — prompt
    setFormData({ ...formData, type: newType });
    setSelectedServices(defaultServices);
    setPendingDescription(newDefaultDescription);
    setShowDescriptionPrompt(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
    setIsDescriptionManuallyEdited(true);
    setShowDescriptionPrompt(false);
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacityError) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      clinicalServices: selectedServices.join(','),
      laboratoryService: supportServices.laboratory,
      bloodBankService: supportServices.bloodBank,
      pharmacyService: supportServices.pharmacy,
      radiologyService: supportServices.radiology,
    };

    try {
      const res = await fetch('/api/proxy/api/v1/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `Operation failed with status ${res.status}`);
      }

      router.push('/admin/hospitals');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to submit hospital details');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Add New Hospital Facility</h1>
          <p className="text-muted-foreground mt-1">Register a new physical hospital branch and operational configuration.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveHospital} className="space-y-6 pb-8">
        {/* Section 1: Basic Information */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <Building2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">1. Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Internal Branch Code *</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SC-SAS-01"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] font-mono transition"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hospital Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Swarnika Care Hospital"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Facility Type</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition appearance-none"
                  >
                    <option value="GENERAL_HOSPITAL">General Hospital</option>
                    <option value="MULTI_SPECIALTY_HOSPITAL">Multi-Specialty Hospital</option>
                    <option value="SUPER_SPECIALTY_HOSPITAL">Super-Specialty Hospital</option>
                    <option value="MATERNITY_WOMEN_HOSPITAL">Maternity & Women's Hospital</option>
                    <option value="DISTRICT_HOSPITAL">District Hospital</option>
                    <option value="DAY_CLINIC">Day Clinic</option>
                    <option value="SPECIALTY_CLINIC">Specialty Clinic</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Specialty focus or branch overview"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
                {!showDescriptionPrompt && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">Suggested description based on facility type. You can edit it.</p>
                )}
                {showDescriptionPrompt && (
                  <div className="mt-2.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl animate-in slide-in-from-top-1">
                    <p className="text-xs text-blue-800 dark:text-blue-300 mb-2.5 font-medium">Facility type changed. Replace the current description with the default description for this facility type?</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowDescriptionPrompt(false)} className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-border rounded-lg text-xs font-medium hover:bg-accent transition shadow-sm">Keep Current</button>
                      <button type="button" onClick={() => { setFormData({...formData, description: pendingDescription || ''}); setIsDescriptionManuallyEdited(false); setShowDescriptionPrompt(false); }} className="px-3 py-1.5 bg-[#007b92] text-white rounded-lg text-xs font-medium hover:bg-[#006072] transition shadow-sm">Use Default</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <Phone className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">2. Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reception Phone *</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Emergency Hotline</label>
                <input 
                  type="text" 
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="+91 98765 43219"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hospital Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@swarnikahospitals.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Location Details */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#007b92]">
              <MapPin className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">3. Location & Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Physical Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Sector 4, Main Road, Near Old Bus Stand"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">State</label>
                <input 
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pincode</label>
                <input 
                  type="text" 
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Operational Configuration */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6 text-[#007b92]">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">4. Operational Configuration</h3>
          </div>

          {/* A. Clinical Services */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">A. Clinical Services</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-background/50 p-4 rounded-2xl border border-border/50">
              {ALL_CLINICAL_SERVICES.map(svc => (
                <label key={svc} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border cursor-pointer hover:bg-accent transition">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(svc)}
                    onChange={() => toggleService(svc)}
                    className="w-4 h-4 rounded text-[#007b92] focus:ring-[#007b92]"
                  />
                  <span className="text-xs font-medium leading-tight">{svc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* B. Support Services */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">B. Support Services</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: 'laboratory', label: 'Laboratory' },
                { key: 'bloodBank', label: 'Blood Bank' },
                { key: 'pharmacy', label: 'Pharmacy' },
                { key: 'radiology', label: 'Radiology' },
              ] as {key: keyof typeof supportServices, label: string}[]).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-xl gap-3">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="relative">
                    <select
                      value={supportServices[key]}
                      onChange={(e) => setSupportServices({ ...supportServices, [key]: e.target.value })}
                      className="pl-3 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] appearance-none"
                    >
                      {SUPPORT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{SUPPORT_LABELS[opt]}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-muted-foreground">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Operational Capabilities */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">C. Operational Capabilities</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {([
                { key: 'emergencyAvailable', label: '24×7 Emergency' },
                { key: 'ambulanceAvailable', label: 'Ambulance' },
                { key: 'otAvailable', label: 'OT Available' },
                { key: 'nicuAvailable', label: 'NICU Available' },
                { key: 'bloodBankAvailable', label: 'Blood Bank Available' },
              ] as {key: keyof typeof formData, label: string}[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border cursor-pointer hover:bg-accent transition">
                  <input
                    type="checkbox"
                    checked={!!formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-4 h-4 rounded text-[#007b92] focus:ring-[#007b92]"
                  />
                  <span className="text-xs font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* D. Capacity */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">D. Capacity</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { key: 'totalBeds', label: 'Total Bed Capacity' },
                { key: 'icuBeds', label: 'ICU Beds' },
                { key: 'nicuBeds', label: 'NICU Beds' },
                { key: 'emergencyBeds', label: 'Emergency Beds' },
              ] as {key: keyof typeof formData, label: string}[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData[key] as number || ''}
                    onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]/50 focus:border-[#007b92] transition"
                  />
                </div>
              ))}
            </div>
            {capacityError && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                {capacityError}
              </div>
            )}
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
          <Link
            href="/admin/hospitals"
            className="px-5 py-2.5 border border-border bg-background rounded-xl text-sm font-medium hover:bg-accent transition shadow-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#007b92] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#006072] transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
            Register Hospital
          </button>
        </div>
      </form>
    </div>
  );
}
