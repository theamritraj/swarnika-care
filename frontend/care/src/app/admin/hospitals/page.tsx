'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, MoreVertical, Building2, Phone, Mail, 
  MapPin, Bed, Activity, Check, X, Edit3, Eye, 
  ArrowRight, AlertCircle, RefreshCw, CheckCircle2,
  Ambulance, HeartPulse, Building
} from 'lucide-react';

interface Hospital {
  id: number;
  code: string;
  name: string;
  type?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  emergencyPhone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  totalBeds?: number | null;
  icuBeds?: number | null;
  emergencyAvailable?: boolean | null;
  otAvailable?: boolean | null;
  bloodBankAvailable?: boolean | null;
  ambulanceAvailable?: boolean | null;
  status: string;
}

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

export default function HospitalsAdminPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'MULTI_SPECIALTY_HOSPITAL',
    description: '',
    phone: '',
    email: '',
    emergencyPhone: '',
    website: '',
    address: '',
    city: 'Sasaram',
    state: 'Bihar',
    country: 'India',
    pincode: '821115',
    totalBeds: 100,
    icuBeds: 20,
    emergencyAvailable: true,
    otAvailable: true,
    bloodBankAvailable: false,
    ambulanceAvailable: true,
  });
  
  const [isDescriptionManuallyEdited, setIsDescriptionManuallyEdited] = useState(false);
  const [showDescriptionPrompt, setShowDescriptionPrompt] = useState(false);
  const [pendingDescription, setPendingDescription] = useState<string | null>(null);

  const handleTypeChange = (newType: string) => {
    const newDefaultDescription = FACILITY_TYPE_DESCRIPTIONS[newType] || '';
    
    // If the description is empty, just fill it and mark as not manually edited
    if (!formData.description.trim()) {
      setFormData({ ...formData, type: newType, description: newDefaultDescription });
      setIsDescriptionManuallyEdited(false);
      return;
    }

    // If description is exactly the default of the CURRENT type, it's auto-generated, so just swap it
    const currentDefaultDescription = FACILITY_TYPE_DESCRIPTIONS[formData.type] || '';
    if (!isDescriptionManuallyEdited && formData.description === currentDefaultDescription) {
      setFormData({ ...formData, type: newType, description: newDefaultDescription });
      return;
    }

    // Otherwise, it was manually edited or doesn't match default. We should prompt.
    setFormData({ ...formData, type: newType }); // Change the dropdown right away
    setPendingDescription(newDefaultDescription);
    setShowDescriptionPrompt(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
    setIsDescriptionManuallyEdited(true);
    setShowDescriptionPrompt(false);
  };

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/api/v1/hospitals');
      if (!res.ok) {
        throw new Error(`Failed to load hospitals: HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHospitals(json.data);
      } else {
        setHospitals([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to Organization Service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch = 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.city && h.city.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === 'ALL' || h.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [hospitals, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      code: `HOS-${String.fromCharCode(65 + hospitals.length)}`,
      name: '',
      type: 'MULTI_SPECIALTY_HOSPITAL',
      description: '',
      phone: '',
      email: '',
      emergencyPhone: '',
      website: '',
      address: '',
      city: 'Sasaram',
      state: 'Bihar',
      country: 'India',
      pincode: '821115',
      totalBeds: 100,
      icuBeds: 20,
      emergencyAvailable: true,
      otAvailable: true,
      bloodBankAvailable: false,
      ambulanceAvailable: true,
    });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (h: Hospital) => {
    setSelectedHospital(h);
    setFormData({
      code: h.code,
      name: h.name,
      type: h.type || 'MULTI_SPECIALTY_HOSPITAL',
      description: h.description || '',
      phone: h.phone || '',
      email: h.email || '',
      emergencyPhone: h.emergencyPhone || '',
      website: h.website || '',
      address: h.address || '',
      city: h.city || '',
      state: h.state || '',
      country: h.country || 'India',
      pincode: h.pincode || '',
      totalBeds: h.totalBeds || 0,
      icuBeds: h.icuBeds || 0,
      emergencyAvailable: !!h.emergencyAvailable,
      otAvailable: !!h.otAvailable,
      bloodBankAvailable: !!h.bloodBankAvailable,
      ambulanceAvailable: !!h.ambulanceAvailable,
    });
    
    // Setup state for auto-description
    setIsDescriptionManuallyEdited(h.description && h.description.trim().length > 0 ? true : false);
    setShowDescriptionPrompt(false);
    setPendingDescription(null);
    
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenView = (h: Hospital) => {
    setSelectedHospital(h);
    setIsViewOpen(true);
  };

  const handleSaveHospital = async (e: React.FormEvent, isUpdate = false) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = isUpdate 
        ? `/api/proxy/api/v1/hospitals/${selectedHospital?.id}`
        : '/api/proxy/api/v1/hospitals';
      
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `Operation failed with status ${res.status}`);
      }

      setSuccessBanner(isUpdate ? 'Hospital updated successfully!' : 'Hospital created successfully!');
      setTimeout(() => setSuccessBanner(null), 4000);
      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchHospitals();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit hospital details');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#007b92]" />
            Hospital Management
          </h1>
          <p className="text-muted-foreground mt-1">Authoritative multi-hospital facility directory and branch configurations.</p>
        </div>
        <Link 
          href="/admin/hospitals/new"
          className="bg-[#007b92] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> Add Hospital
        </Link>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchHospitals}
            className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-800 border border-border rounded-lg text-xs font-semibold hover:bg-accent"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospitals by name, code, or city..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Filter Status:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-card-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button 
            onClick={fetchHospitals}
            title="Refresh list"
            className="p-2 border border-border rounded-lg hover:bg-accent text-muted-foreground hover:text-card-foreground transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-medium">Facility / Code</th>
                <th className="px-6 py-3.5 font-medium">Location</th>
                <th className="px-6 py-3.5 font-medium">Contact</th>
                <th className="px-6 py-3.5 font-medium">Beds / Capacity</th>
                <th className="px-6 py-3.5 font-medium">Services</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#007b92]" />
                      <span>Loading hospitals from Organization Service...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredHospitals.length > 0 ? (
                filteredHospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-background/80 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#007b92]/10 flex items-center justify-center border border-[#007b92]/20 text-[#007b92]">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-card-foreground flex items-center gap-2">
                            {h.name}
                            {h.type && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {h.type}
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs font-mono mt-0.5">{h.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-card-foreground/80">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{h.city || 'Sasaram'}, {h.state || 'Bihar'}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        {h.address || 'Standard facility branch'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-card-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{h.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{h.email || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-card-foreground">
                        {h.totalBeds || 0} Total Beds
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {h.icuBeds || 0} ICU Beds
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {h.emergencyAvailable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50">
                            ER
                          </span>
                        )}
                        {h.otAvailable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50">
                            OT
                          </span>
                        )}
                        {h.ambulanceAvailable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                            AMB
                          </span>
                        )}
                        {h.bloodBankAvailable && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50">
                            BLOOD
                          </span>
                        )}
                        {!h.emergencyAvailable && !h.otAvailable && !h.ambulanceAvailable && !h.bloodBankAvailable && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        h.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          h.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-muted-foreground'
                        }`}></span>
                        {h.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenView(h)}
                          title="View Details"
                          className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(h)}
                          title="Edit Hospital"
                          className="p-1.5 text-muted-foreground hover:text-[#007b92] hover:bg-accent rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <Link 
                          href={`/admin/infrastructure?hospitalId=${h.id}`}
                          title="Manage Infrastructure (Buildings, Floors, Wards, Beds)"
                          className="p-1.5 text-muted-foreground hover:text-[#007b92] hover:bg-accent rounded-lg transition flex items-center text-xs gap-0.5 font-medium"
                        >
                          <span className="hidden xl:inline">Infrastructure</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    {searchTerm || statusFilter !== 'ALL' 
                      ? 'No hospitals match your search criteria.' 
                      : 'No hospitals registered in database. Click "Add Hospital" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-scale-in my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#007b92]" />
                Edit Hospital: {selectedHospital?.name}
              </h2>
              <button 
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveHospital(e, isEditOpen)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">1. Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Internal Branch Code *</label>
                    <input 
                      type="text" 
                      required
                      disabled={true} // Code is immutable primary identifier
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SC-SAS-01"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] font-mono disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Hospital Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Swarnika Care Hospital"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Facility Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
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
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Description</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Specialty focus or branch overview"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                    {!showDescriptionPrompt && (
                      <p className="text-[11px] text-muted-foreground mt-1">Suggested description based on facility type. You can edit it.</p>
                    )}
                    {showDescriptionPrompt && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg animate-in slide-in-from-top-1">
                        <p className="text-xs text-blue-800 dark:text-blue-300 mb-2 font-medium">Facility type changed. Replace the current description with the default description for this facility type?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowDescriptionPrompt(false)} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-border rounded text-xs font-medium hover:bg-accent transition">Keep Current</button>
                          <button type="button" onClick={() => { setFormData({...formData, description: pendingDescription || ''}); setIsDescriptionManuallyEdited(false); setShowDescriptionPrompt(false); }} className="px-2 py-1 bg-[#007b92] text-white rounded text-xs font-medium hover:bg-[#006072] transition">Use Default</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">2. Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Reception Phone</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@swarnikahospitals.com"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Emergency Hotline</label>
                    <input 
                      type="text" 
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="+91 98765 43219"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Website URL</label>
                    <input 
                      type="text" 
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.swarnikahospitals.com"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Location Details */}
              <div className="pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">3. Location & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-card-foreground block mb-1">Physical Address</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Sector 4, Main Road, Near Old Bus Stand"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">City</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">State</label>
                    <input 
                      type="text" 
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Pincode</label>
                    <input 
                      type="text" 
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Operational Configuration */}
              <div className="pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">4. Operational Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">Total Bed Capacity</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.totalBeds}
                      onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-card-foreground block mb-1">ICU Bed Count</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.icuBeds}
                      onChange={(e) => setFormData({ ...formData, icuBeds: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent text-xs">
                    <input 
                      type="checkbox" 
                      checked={formData.emergencyAvailable}
                      onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                      className="rounded text-[#007b92] focus:ring-[#007b92]"
                    />
                    <span>Emergency (ER)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent text-xs">
                    <input 
                      type="checkbox" 
                      checked={formData.otAvailable}
                      onChange={(e) => setFormData({ ...formData, otAvailable: e.target.checked })}
                      className="rounded text-[#007b92] focus:ring-[#007b92]"
                    />
                    <span>Operation Theater</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent text-xs">
                    <input 
                      type="checkbox" 
                      checked={formData.ambulanceAvailable}
                      onChange={(e) => setFormData({ ...formData, ambulanceAvailable: e.target.checked })}
                      className="rounded text-[#007b92] focus:ring-[#007b92]"
                    />
                    <span>Ambulance</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent text-xs">
                    <input 
                      type="checkbox" 
                      checked={formData.bloodBankAvailable}
                      onChange={(e) => setFormData({ ...formData, bloodBankAvailable: e.target.checked })}
                      className="rounded text-[#007b92] focus:ring-[#007b92]"
                    />
                    <span>Blood Bank</span>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#007b92] text-white rounded-lg text-sm font-medium hover:bg-[#006072] transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isEditOpen ? 'Save Changes' : 'Create Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selectedHospital && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-in p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono text-[#007b92] font-semibold">{selectedHospital.code}</span>
                <h2 className="text-xl font-bold text-card-foreground">{selectedHospital.name}</h2>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">Facility Type</span>
                  <span className="font-medium text-card-foreground">{selectedHospital.type || 'GENERAL_HOSPITAL'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <span className="font-semibold text-emerald-600">{selectedHospital.status}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Address</span>
                <p className="text-card-foreground mt-0.5">{selectedHospital.address || 'Standard branch'}</p>
                <p className="text-xs text-muted-foreground">{selectedHospital.city}, {selectedHospital.state} - {selectedHospital.pincode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Contact Phone</span>
                  <p className="text-card-foreground">{selectedHospital.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Emergency Phone</span>
                  <p className="text-card-foreground text-red-600 font-medium">{selectedHospital.emergencyPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <p className="text-card-foreground">{selectedHospital.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Website</span>
                  <p className="text-card-foreground">{selectedHospital.website || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Capacity & Facilities</span>
                <div className="flex justify-between text-xs mb-2">
                  <span>Total Beds: <strong>{selectedHospital.totalBeds || 0}</strong></span>
                  <span>ICU Beds: <strong>{selectedHospital.icuBeds || 0}</strong></span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedHospital.emergencyAvailable && <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">24x7 ER</span>}
                  {selectedHospital.otAvailable && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">OT</span>}
                  {selectedHospital.ambulanceAvailable && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Ambulance</span>}
                  {selectedHospital.bloodBankAvailable && <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Blood Bank</span>}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Link 
                href={`/admin/infrastructure?hospitalId=${selectedHospital.id}`}
                className="text-xs text-[#007b92] font-semibold hover:underline flex items-center gap-1"
              >
                Go to Physical Infrastructure <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-1.5 bg-muted text-card-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
