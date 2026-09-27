'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, MoreVertical, Network, Building2, 
  Stethoscope, Eye, Edit3, X, Check, AlertCircle, 
  RefreshCw, CheckCircle2, Globe, Lock, ArrowRight
} from 'lucide-react';

interface Hospital {
  id: number;
  code: string;
  name: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  status?: string;
}

interface Department {
  id: number;
  hospitalId: number;
  code: string;
  name: string;
  description?: string | null;
  headDoctorId?: number | null;
  publicVisibility: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    hospitalId: 101,
    code: '',
    name: '',
    description: '',
    headDoctorId: null as number | null,
    publicVisibility: true
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, hospRes, docRes] = await Promise.all([
        fetch('/api/proxy/api/v1/departments'),
        fetch('/api/proxy/api/v1/hospitals'),
        fetch('/api/proxy/api/v1/doctors')
      ]);

      if (!deptRes.ok) throw new Error(`Failed to load departments: HTTP ${deptRes.status}`);

      const deptJson = await deptRes.json();
      if (deptJson.success && Array.isArray(deptJson.data)) {
        setDepartments(deptJson.data);
      }

      if (hospRes.ok) {
        const hospJson = await hospRes.json();
        if (hospJson.success && Array.isArray(hospJson.data)) {
          setHospitals(hospJson.data);
          if (hospJson.data.length > 0 && !formData.hospitalId) {
            setFormData(prev => ({ ...prev, hospitalId: hospJson.data[0].id }));
          }
        }
      }

      if (docRes.ok) {
        const docJson = await docRes.json();
        if (docJson.success && Array.isArray(docJson.data)) {
          setDoctors(docJson.data);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not load data from Organization Service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hospitalMap = useMemo(() => {
    const map = new Map<number, Hospital>();
    hospitals.forEach(h => map.set(h.id, h));
    return map;
  }, [hospitals]);

  const doctorMap = useMemo(() => {
    const map = new Map<number, Doctor>();
    doctors.forEach(d => map.set(d.id, d));
    return map;
  }, [doctors]);

  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesHospital = 
        hospitalFilter === 'ALL' || d.hospitalId.toString() === hospitalFilter;

      const matchesStatus = 
        statusFilter === 'ALL' || d.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesHospital && matchesStatus;
    });
  }, [departments, searchTerm, hospitalFilter, statusFilter]);

  const handleOpenAdd = () => {
    const defaultHospId = hospitals.length > 0 ? hospitals[0].id : 101;
    setFormData({
      hospitalId: defaultHospId,
      code: `DEP-${String.fromCharCode(65 + departments.length)}`,
      name: '',
      description: '',
      headDoctorId: null,
      publicVisibility: true
    });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setSelectedDept(d);
    setFormData({
      hospitalId: d.hospitalId,
      code: d.code,
      name: d.name,
      description: d.description || '',
      headDoctorId: d.headDoctorId || null,
      publicVisibility: d.publicVisibility
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenView = (d: Department) => {
    setSelectedDept(d);
    setIsViewOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent, isUpdate = false) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = isUpdate 
        ? `/api/proxy/api/v1/departments/${selectedDept?.id}`
        : '/api/proxy/api/v1/departments';

      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || `Operation failed with HTTP ${res.status}`);
      }

      setSuccessBanner(isUpdate ? 'Department updated successfully!' : 'Department created successfully!');
      setTimeout(() => setSuccessBanner(null), 4000);
      setIsAddOpen(false);
      setIsEditOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit department');
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
            <Network className="w-6 h-6 text-[#007b92]" />
            Department Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage clinical departments, specializations, and leadership across hospitals.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#007b92] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
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
            onClick={fetchData}
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
            placeholder="Search departments by name or code..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Hospital Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Hospital:</label>
            <select 
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-card-foreground"
            >
              <option value="ALL">All Hospitals</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id.toString()}>{h.name} ({h.code})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium whitespace-nowrap">Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-card-foreground"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <button 
            onClick={fetchData}
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
                <th className="px-6 py-3.5 font-medium">Department</th>
                <th className="px-6 py-3.5 font-medium">Assigned Hospital</th>
                <th className="px-6 py-3.5 font-medium">Head of Department</th>
                <th className="px-6 py-3.5 font-medium">Visibility</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#007b92]" />
                      <span>Loading departments from Organization Service...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length > 0 ? (
                filteredDepartments.map((d) => {
                  const hosp = hospitalMap.get(d.hospitalId);
                  const headDoc = d.headDoctorId ? doctorMap.get(d.headDoctorId) : null;

                  return (
                    <tr key={d.id} className="hover:bg-background/80 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#007b92]/10 flex items-center justify-center border border-[#007b92]/20 text-[#007b92]">
                            <Network className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-card-foreground">{d.name}</div>
                            <div className="text-muted-foreground text-xs font-mono mt-0.5">{d.code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-card-foreground">
                          <Building2 className="w-3.5 h-3.5 text-[#007b92]" />
                          <span className="font-medium">{hosp ? hosp.name : `Hospital #${d.hospitalId}`}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {hosp?.code || `ID: ${d.hospitalId}`}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {headDoc ? (
                          <div className="flex items-center gap-1.5 text-xs text-card-foreground">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dr. {headDoc.firstName} {headDoc.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not Assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {d.publicVisibility ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            <Lock className="w-3 h-3" /> Internal
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          d.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            d.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-muted-foreground'
                          }`}></span>
                          {d.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenView(d)}
                            title="View Details"
                            className="p-1.5 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(d)}
                            title="Edit Department"
                            className="p-1.5 text-muted-foreground hover:text-[#007b92] hover:bg-accent rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    {searchTerm || hospitalFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'No departments match your filters.'
                      : 'No departments registered. Click "Add Department" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Network className="w-5 h-5 text-[#007b92]" />
                {isEditOpen ? `Edit Department: ${selectedDept?.name}` : 'Add New Department'}
              </h2>
              <button 
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveDepartment(e, isEditOpen)} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Hospital Selection (Only on Create) */}
              <div>
                <label className="text-xs font-medium text-card-foreground block mb-1">Target Hospital Facility *</label>
                <select 
                  disabled={isEditOpen}
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] disabled:opacity-60"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.code})</option>
                  ))}
                </select>
              </div>

              {/* Code */}
              <div>
                <label className="text-xs font-medium text-card-foreground block mb-1">Department Code *</label>
                <input 
                  type="text" 
                  required
                  disabled={isEditOpen} // Code immutable
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DEP-CARD-101"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] font-mono disabled:opacity-60"
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-card-foreground block mb-1">Department Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cardiology & Vascular Surgery"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-card-foreground block mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of medical services offered"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                />
              </div>

              {/* Head Doctor */}
              <div>
                <label className="text-xs font-medium text-card-foreground block mb-1">Head of Department (Optional)</label>
                <select 
                  value={formData.headDoctorId || ''}
                  onChange={(e) => setFormData({ ...formData, headDoctorId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92]"
                >
                  <option value="">-- No Head Doctor Assigned --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Visibility Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-card-foreground">
                  <input 
                    type="checkbox"
                    checked={formData.publicVisibility}
                    onChange={(e) => setFormData({ ...formData, publicVisibility: e.target.checked })}
                    className="rounded text-[#007b92] focus:ring-[#007b92]"
                  />
                  <span>Publicly visible on patient booking portal & website</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {isEditOpen ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selectedDept && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-in p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-xs font-mono text-[#007b92] font-semibold">{selectedDept.code}</span>
                <h2 className="text-xl font-bold text-card-foreground">{selectedDept.name}</h2>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <span className="text-xs text-muted-foreground block">Facility Assignment</span>
                <div className="font-semibold text-card-foreground">
                  {hospitalMap.get(selectedDept.hospitalId)?.name || `Hospital ID: ${selectedDept.hospitalId}`}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Code: {hospitalMap.get(selectedDept.hospitalId)?.code || 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Description</span>
                <p className="text-card-foreground mt-0.5">{selectedDept.description || 'Clinical specialty department.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Head of Department</span>
                  <p className="font-medium text-card-foreground">
                    {selectedDept.headDoctorId && doctorMap.get(selectedDept.headDoctorId)
                      ? `Dr. ${doctorMap.get(selectedDept.headDoctorId)?.firstName} ${doctorMap.get(selectedDept.headDoctorId)?.lastName}`
                      : 'None'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Portal Visibility</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {selectedDept.publicVisibility ? 'Public' : 'Internal Only'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
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
