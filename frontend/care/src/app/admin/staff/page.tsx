'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Plus, MoreVertical, Users, Building2, Layers,
  X, Edit2, Eye, Trash2, CheckCircle2, AlertCircle, Clock,
  User, Mail, Phone, Calendar, Briefcase, Award, RefreshCw,
  ShieldCheck, ArrowUpDown, ChevronRight, UserMinus, UserCheck,
  Filter, Sparkles, HelpCircle, Check, FileText
} from 'lucide-react';

export interface StaffMember {
  id: number;
  userId: string;
  email: string;
  role: string;
  employeeCode: string;
  hospitalId: number;
  hospitalName?: string;
  hospitalCode?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  designationId?: number;
  designationName?: string;
  designationCode?: string;
  positionId?: number;
  positionTitle?: string;
  positionCode?: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  joiningDate?: string;
  employmentType?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Hospital {
  id: number;
  name: string;
  code: string;
  status?: string;
}

interface Department {
  id: number;
  hospitalId: number;
  name: string;
  code: string;
  status?: string;
}

interface Designation {
  id: number;
  code: string;
  name: string;
  functionalArea?: string;
  active?: boolean;
}

const ROLES = [
  { value: 'NURSE', label: 'Nurse', description: 'Bedside patient care & vitals administration', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
  { value: 'CHARGE_NURSE', label: 'Charge Nurse', description: 'Unit shift supervisor & triage management', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300' },
  { value: 'RECEPTIONIST', label: 'Receptionist', description: 'Front desk intake, appointments & check-in', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician', description: 'Pathology, specimen collection & diagnostics', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300' },
  { value: 'PHARMACIST', label: 'Pharmacist', description: 'Medication dispensation & formulary management', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
  { value: 'BILLING_STAFF', label: 'Billing Staff', description: 'Invoicing, insurance claims & payments', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300' },
  { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', description: 'Branch management & operational authority', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Mgr', description: 'Resource planning & floor coordination', color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300' },
];

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
];

const ROLE_TO_AREA_MAP: Record<string, string[]> = {
  'NURSE': ['NURSING'],
  'CHARGE_NURSE': ['NURSING'],
  'RECEPTIONIST': ['ADMINISTRATIVE'],
  'LAB_TECHNICIAN': ['DIAGNOSTICS'],
  'PHARMACIST': ['PHARMACY'],
  'BILLING_STAFF': ['FINANCE'],
  'HOSPITAL_ADMIN': ['OPERATIONS', 'ADMINISTRATIVE'],
  'OPERATIONS_MANAGER': ['OPERATIONS']
};

function StaffContent() {
  const searchParams = useSearchParams();
  const initialHospitalId = searchParams.get('hospitalId');

  // Core Data State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>(initialHospitalId || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals & Drawers
  const [activeModal, setActiveModal] = useState<'onboard' | 'view' | 'edit' | 'status' | 'deactivate' | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State: Onboard
  const [onboardForm, setOnboardForm] = useState({
    email: '',
    role: 'NURSE',
    employeeCode: '',
    hospitalId: '',
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  // Form State: Edit
  const [editForm, setEditForm] = useState({
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  // Form State: Status change
  const [targetStatus, setTargetStatus] = useState<string>('ACTIVE');

  // Load Lookup Data
  useEffect(() => {
    async function loadLookups() {
      try {
        const [hospRes, deptRes, desigRes] = await Promise.all([
          fetch('/api/proxy/api/v1/hospitals'),
          fetch('/api/proxy/api/v1/departments'),
          fetch('/api/proxy/api/v1/designations')
        ]);

        if (hospRes.ok) {
          const json = await hospRes.json();
          setHospitals(json.data || json || []);
        }
        if (deptRes.ok) {
          const json = await deptRes.json();
          setDepartments(json.data || json || []);
        }
        if (desigRes.ok) {
          const json = await desigRes.json();
          setDesignations(json.data || json || []);
        }
      } catch (err) {
        console.error('Failed to load lookup metadata', err);
      }
    }
    loadLookups();
  }, []);

  // Fetch Staff Directory
  async function loadStaffDirectory(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let url = '/api/proxy/api/v1/employees/directory';
      const params = new URLSearchParams();
      if (selectedHospital && selectedHospital !== 'all') {
        params.append('hospitalId', selectedHospital);
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('departmentId', selectedDepartment);
      }
      if (selectedRole && selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Failed to fetch staff directory (HTTP ${res.status})`);
      }
      const json = await res.json();
      setStaffList(json.data || json || []);
    } catch (err: any) {
      console.error('Error fetching staff directory:', err);
      setError(err.message || 'Failed to load staff members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Reload when filters change
  useEffect(() => {
    loadStaffDirectory();
  }, [selectedHospital, selectedDepartment, selectedRole, selectedStatus]);

  // Search debounce / manual enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStaffDirectory();
  };

  // Auto-generate employee code helper
  const handleAutoGenerateCode = (role: string) => {
    const prefix = role.slice(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setOnboardForm(prev => ({ ...prev, employeeCode: `STF-${prefix}-${rand}` }));
  };

  // Open Onboard Modal
  const openOnboardModal = () => {
    const defaultHosp = selectedHospital !== 'all' ? selectedHospital : (hospitals[0]?.id?.toString() || '');
    const prefix = 'NUR';
    const rand = Math.floor(1000 + Math.random() * 9000);
    
    setOnboardForm({
      email: '',
      role: 'NURSE',
      employeeCode: `STF-${prefix}-${rand}`,
      hospitalId: defaultHosp,
      departmentId: '',
      designationId: '',
      employmentType: 'FULL_TIME',
      joiningDate: new Date().toISOString().split('T')[0],
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
    });
    setError(null);
    setShowAdvanced(false);
    setActiveModal('onboard');
  };

  // Open View Modal
  const openViewModal = (staff: StaffMember) => {
    setActiveStaff(staff);
    setOpenDropdownId(null);
    setActiveModal('view');
  };

  // Open Edit Modal
  const openEditModal = (staff: StaffMember) => {
    setActiveStaff(staff);
    setEditForm({
      departmentId: staff.departmentId ? staff.departmentId.toString() : '',
      designationId: staff.designationId ? staff.designationId.toString() : '',
      employmentType: staff.employmentType || 'FULL_TIME',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
    });
    setOpenDropdownId(null);
    setActiveModal('edit');
  };

  // Open Status Modal
  const openStatusModal = (staff: StaffMember) => {
    setActiveStaff(staff);
    setTargetStatus(staff.status);
    setOpenDropdownId(null);
    setActiveModal('status');
  };

  // Open Deactivate Modal
  const openDeactivateModal = (staff: StaffMember) => {
    setActiveStaff(staff);
    setOpenDropdownId(null);
    setActiveModal('deactivate');
  };

  // Filtered departments for onboarding/edit based on selected hospital
  const availableDepartmentsForOnboard = useMemo(() => {
    if (!onboardForm.hospitalId) return [];
    return departments.filter(d => d.hospitalId.toString() === onboardForm.hospitalId.toString());
  }, [departments, onboardForm.hospitalId]);

  const availableDepartmentsForEdit = useMemo(() => {
    if (!activeStaff?.hospitalId) return departments;
    return departments.filter(d => d.hospitalId.toString() === activeStaff.hospitalId.toString());
  }, [departments, activeStaff]);

  const availableDesignationsForOnboard = useMemo(() => {
    if (!onboardForm.role) return designations;
    const allowedAreas = ROLE_TO_AREA_MAP[onboardForm.role] || [];
    return designations.filter(d => !d.functionalArea || allowedAreas.includes(d.functionalArea));
  }, [designations, onboardForm.role]);

  const availableDesignationsForEdit = useMemo(() => {
    if (!activeStaff?.role) return designations;
    const allowedAreas = ROLE_TO_AREA_MAP[activeStaff.role] || [];
    return designations.filter(d => !d.functionalArea || allowedAreas.includes(d.functionalArea));
  }, [designations, activeStaff]);

  // Submit: Onboard Staff
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!onboardForm.email.trim()) throw new Error('Email address is required.');
      if (!onboardForm.employeeCode.trim()) throw new Error('Employee code is required.');
      if (!onboardForm.hospitalId) throw new Error('Hospital assignment is required.');

      const payload = {
        email: onboardForm.email.trim(),
        role: onboardForm.role,
        employeeCode: onboardForm.employeeCode.trim(),
        hospitalId: Number(onboardForm.hospitalId),
        departmentId: onboardForm.departmentId ? Number(onboardForm.departmentId) : null,
        designationId: onboardForm.designationId ? Number(onboardForm.designationId) : null,
        employmentType: onboardForm.employmentType,
        joiningDate: onboardForm.joiningDate || null,
        emergencyContactName: onboardForm.emergencyContactName.trim() || null,
        emergencyContactPhone: onboardForm.emergencyContactPhone.trim() || null,
        notes: onboardForm.notes.trim() || null,
      };

      const res = await fetch('/api/proxy/api/v1/employees/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Onboarding failed with HTTP status ${res.status}`);
      }

      setSuccess(`Staff member ${onboardForm.employeeCode} successfully onboarded and IAM user provisioned!`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal(null);
      loadStaffDirectory(true);
    } catch (err: any) {
      console.error('Onboard error:', err);
      setError(err.message || 'Failed to onboard staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        departmentId: editForm.departmentId ? Number(editForm.departmentId) : null,
        designationId: editForm.designationId ? Number(editForm.designationId) : null,
        employmentType: editForm.employmentType,
        emergencyContactName: editForm.emergencyContactName.trim() || null,
        emergencyContactPhone: editForm.emergencyContactPhone.trim() || null,
        notes: editForm.notes.trim() || null,
      };

      const res = await fetch(`/api/proxy/api/v1/employees/${activeStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Update failed with HTTP status ${res.status}`);
      }

      setSuccess(`Staff member ${activeStaff.employeeCode} updated successfully.`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal(null);
      loadStaffDirectory(true);
    } catch (err: any) {
      console.error('Edit error:', err);
      setError(err.message || 'Failed to update staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Status Change
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/api/v1/employees/${activeStaff.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Status change failed with HTTP status ${res.status}`);
      }

      setSuccess(`Staff status updated to ${targetStatus}.`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal(null);
      loadStaffDirectory(true);
    } catch (err: any) {
      console.error('Status error:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit: Deactivate Staff
  const handleDeactivateSubmit = async () => {
    if (!activeStaff) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/api/v1/employees/${activeStaff.id}`, {
        method: 'DELETE',
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Deactivation failed with HTTP status ${res.status}`);
      }

      setSuccess(`Staff member ${activeStaff.employeeCode} has been deactivated.`);
      setTimeout(() => setSuccess(null), 5000);
      setActiveModal(null);
      loadStaffDirectory(true);
    } catch (err: any) {
      console.error('Deactivate error:', err);
      setError(err.message || 'Failed to deactivate staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(s => s.status === 'ACTIVE').length;
    const onLeave = staffList.filter(s => s.status === 'ON_LEAVE').length;
    const inactive = staffList.filter(s => s.status === 'INACTIVE').length;
    const nurses = staffList.filter(s => s.role === 'NURSE' || s.role === 'CHARGE_NURSE').length;
    const reception = staffList.filter(s => s.role === 'RECEPTIONIST').length;
    return { total, active, onLeave, inactive, nurses, reception };
  }, [staffList]);

  // Role Badge Helper
  const getRoleBadge = (roleName: string) => {
    const roleDef = ROLES.find(r => r.value === roleName);
    const color = roleDef?.color || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
        {roleDef?.label || roleName}
      </span>
    );
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
          Active
        </span>
      );
    }
    if (status === 'ON_LEAVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
          On Leave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1.5"></span>
        Inactive
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notifications */}
      {success && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Navigation & Live KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#007b92]">
            <Users className="w-4 h-4" />
            <span>Workforce & Staff Domain</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground mt-1">Staff Management Directory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage hospital staff credentials, IAM security roles, department deployments, and operational status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStaffDirectory(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-card hover:bg-muted transition shadow-sm disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openOnboardModal}
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Total Staff</span>
          <span className="text-2xl font-bold text-foreground mt-1">{metrics.total}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.active}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> On Leave
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.onLeave}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Nursing Team</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.nurses}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Front Desk</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.reception}</span>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Inactive / Exited</span>
          <span className="text-2xl font-bold text-slate-500 mt-1">{metrics.inactive}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, email, designation..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all placeholder:text-muted-foreground/60"
            />
          </form>

          {/* Quick Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-wrap">
            {/* Hospital Selector */}
            <select
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                setSelectedDepartment('all'); // Reset cascaded dept
              }}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id.toString()}>{h.name}</option>
              ))}
            </select>

            {/* Department Selector */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
            >
              <option value="all">All Departments</option>
              {(selectedHospital === 'all' 
                ? departments 
                : departments.filter(d => d.hospitalId.toString() === selectedHospital)
              ).map(d => (
                <option key={d.id} value={d.id.toString()}>{d.name}</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground font-medium"
            >
              <option value="all">All Roles</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border border-border text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Display */}
        {(selectedHospital !== 'all' || selectedDepartment !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Active Filters:
            </span>
            {selectedHospital !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Hospital: {hospitals.find(h => h.id.toString() === selectedHospital)?.name || selectedHospital}
                <button onClick={() => setSelectedHospital('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedDepartment !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Dept: {departments.find(d => d.id.toString() === selectedDepartment)?.name || selectedDepartment}
                <button onClick={() => setSelectedDepartment('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedRole !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Role: {ROLES.find(r => r.value === selectedRole)?.label || selectedRole}
                <button onClick={() => setSelectedRole('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('all')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedHospital('all');
                setSelectedDepartment('all');
                setSelectedRole('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-[#007b92] hover:underline font-medium ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Staff Directory Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/30 text-[#007b92] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No staff members found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedHospital !== 'all' || selectedRole !== 'all' || searchQuery
                  ? 'No workforce records match your active filter criteria. Try adjusting filters or search term.'
                  : 'Start by onboarding your first hospital staff member with IAM security credentials.'}
              </p>
            </div>
            <button
              onClick={openOnboardModal}
              className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Onboard Staff Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Staff Code & Employee</th>
                  <th className="px-6 py-3.5">Security Role & Designation</th>
                  <th className="px-6 py-3.5">Hospital & Department</th>
                  <th className="px-6 py-3.5">Employment</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    {/* Staff Code & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007b92] flex items-center justify-center font-bold text-xs shrink-0 border border-teal-200/50 dark:border-teal-800">
                          {staff.employeeCode.slice(-3)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{staff.employeeCode}</span>
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                              ID: {staff.id}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-xs flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{staff.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Designation */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div>{getRoleBadge(staff.role)}</div>
                        <div className="text-xs text-foreground font-medium flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-muted-foreground" />
                          <span>{staff.designationName || 'General Staff'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Hospital & Department */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{staff.hospitalName || `Hospital #${staff.hospitalId}`}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Layers className="w-3 h-3" />
                          <span>{staff.departmentName || 'Unassigned Department'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Employment */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs">
                        <span className="font-medium text-foreground">
                          {staff.employmentType ? staff.employmentType.replace('_', ' ') : 'FULL TIME'}
                        </span>
                        {staff.joiningDate && (
                          <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined: {staff.joiningDate}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(staff.status)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewModal(staff)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            title="Edit Assignment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === staff.id ? null : staff.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdownId === staff.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-1 text-xs">
                                <button
                                  onClick={() => openStatusModal(staff)}
                                  className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-foreground"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Change Status</span>
                                </button>
                                <button
                                  onClick={() => openDeactivateModal(staff)}
                                  className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  <span>Deactivate Staff</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL 1: Onboard Staff Member --- */}
      {activeModal === 'onboard' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#007b92]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Onboard Staff Member</h2>
                  <p className="text-xs text-muted-foreground">Provisions IAM user credentials and creates the employee contract.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#007b92]" /> Email Address (IAM Account) *
                  </label>
                  <input
                    type="email"
                    required
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    placeholder="e.g. staff.member@swarnikacare.com"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  />
                  <p className="text-[11px] text-muted-foreground">Staff credentials will be provisioned directly in the IAM Service with OTP login capability.</p>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#007b92]" /> Security Role *
                  </label>
                  <select
                    value={onboardForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setOnboardForm({ ...onboardForm, role: newRole });
                      handleAutoGenerateCode(newRole);
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
                    ))}
                  </select>
                </div>

                {/* Employee Code (Auto-generated badge) */}
                <div className="space-y-1 sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border/50 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#007b92]" /> Employee Code (Auto-generated)
                    </label>
                    <p className="text-sm font-mono font-medium text-foreground mt-1">{onboardForm.employeeCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoGenerateCode(onboardForm.role)}
                    className="text-xs text-[#007b92] hover:underline px-3 py-1.5 bg-[#007b92]/10 rounded-md"
                  >
                    Regenerate
                  </button>
                </div>

                {/* Hospital Selection */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#007b92]" /> Primary Hospital Branch *
                  </label>
                  <select
                    required
                    value={onboardForm.hospitalId}
                    onChange={(e) => setOnboardForm({ ...onboardForm, hospitalId: e.target.value, departmentId: '' })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Select Hospital...</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id.toString()}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Advanced Toggle */}
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-medium text-[#007b92] hover:underline flex items-center gap-1"
                  >
                    {showAdvanced ? 'Hide Advanced Details' : 'Show Advanced Details (Optional)'}
                  </button>
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <>
                    {/* Department Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#007b92]" /> Department
                      </label>
                      <select
                        value={onboardForm.departmentId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, departmentId: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                        disabled={!onboardForm.hospitalId}
                      >
                        <option value="">Select Department...</option>
                        {availableDepartmentsForOnboard.map(d => (
                          <option key={d.id} value={d.id.toString()}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Designation Selection */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#007b92]" /> Designation
                      </label>
                      <select
                        value={onboardForm.designationId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, designationId: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                      >
                        <option value="">Select Designation...</option>
                        {availableDesignationsForOnboard.map(des => (
                          <option key={des.id} value={des.id.toString()}>{des.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Employment Type</label>
                      <select
                        value={onboardForm.employmentType}
                        onChange={(e) => setOnboardForm({ ...onboardForm, employmentType: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                      >
                        {EMPLOYMENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Joining Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#007b92]" /> Joining Date
                      </label>
                      <input
                        type="date"
                        value={onboardForm.joiningDate}
                        onChange={(e) => setOnboardForm({ ...onboardForm, joiningDate: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <span>Onboard & Provision</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: View Staff Details Drawer --- */}
      {activeModal === 'view' && activeStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#007b92] flex items-center justify-center font-bold text-sm border border-teal-200/50 dark:border-teal-800">
                  {activeStaff.employeeCode.slice(-3)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>{activeStaff.employeeCode}</span>
                    {getStatusBadge(activeStaff.status)}
                  </h2>
                  <p className="text-xs text-muted-foreground">{activeStaff.email}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-muted/30 border border-border/70 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Security Identity Status</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> IAM Linked & Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">IAM User ID</span>
                    <span className="font-mono font-medium text-foreground">{activeStaff.userId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Assigned Role</span>
                    <span className="mt-0.5 inline-block">{getRoleBadge(activeStaff.role)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Employee ID</span>
                    <span className="font-mono font-medium text-foreground">#{activeStaff.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Employment Type</span>
                    <span className="font-medium text-foreground">{activeStaff.employmentType || 'FULL TIME'}</span>
                  </div>
                </div>
              </div>

              {/* Organization Deployment Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Deployment Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <span className="text-muted-foreground block text-[11px]">Hospital</span>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-[#007b92]" />
                      {activeStaff.hospitalName || `Hospital #${activeStaff.hospitalId}`}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <span className="text-muted-foreground block text-[11px]">Department</span>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Layers className="w-4 h-4 text-[#007b92]" />
                      {activeStaff.departmentName || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <span className="text-muted-foreground block text-[11px]">Designation</span>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-4 h-4 text-[#007b92]" />
                      {activeStaff.designationName || 'General Staff'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <span className="text-muted-foreground block text-[11px]">Joining Date</span>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#007b92]" />
                      {activeStaff.joiningDate || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-[11px] text-muted-foreground border-t border-border pt-3 flex justify-between">
                <span>Created: {activeStaff.createdAt ? new Date(activeStaff.createdAt).toLocaleDateString() : 'N/A'}</span>
                <span>Last Updated: {activeStaff.updatedAt ? new Date(activeStaff.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-between items-center">
              <button
                onClick={() => {
                  openStatusModal(activeStaff);
                }}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Change Status
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(activeStaff)}
                  className="bg-[#007b92] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#006072] transition"
                >
                  Edit Deployment
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted text-foreground transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Edit Staff Deployment --- */}
      {activeModal === 'edit' && activeStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h2 className="text-base font-bold text-foreground">Edit Staff Deployment</h2>
                <p className="text-xs text-muted-foreground">{activeStaff.employeeCode} • {activeStaff.email}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-3">
                {/* Department Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#007b92]" /> Department
                  </label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Select Department...</option>
                    {availableDepartmentsForEdit.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Designation Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#007b92]" /> Designation
                  </label>
                  <select
                    value={editForm.designationId}
                    onChange={(e) => setEditForm({ ...editForm, designationId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    <option value="">Select Designation...</option>
                    {availableDesignationsForEdit.map(des => (
                      <option key={des.id} value={des.id.toString()}>{des.name}</option>
                    ))}
                  </select>
                </div>

                {/* Employment Type */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007b92]"
                  >
                    {EMPLOYMENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Change Status --- */}
      {activeModal === 'status' && activeStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-base font-bold text-foreground">Update Staff Status</h2>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Select the current operational status for <strong>{activeStaff.employeeCode}</strong> ({activeStaff.email}).
              </p>

              <div className="space-y-2">
                {[
                  { value: 'ACTIVE', label: 'Active', desc: 'Staff member is on duty and available for shift scheduling' },
                  { value: 'ON_LEAVE', label: 'On Leave', desc: 'Temporarily on medical or scheduled leave' },
                  { value: 'INACTIVE', label: 'Inactive', desc: 'Revoked operational duties or contract suspended' },
                ].map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      targetStatus === s.value
                        ? 'border-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.value}
                      checked={targetStatus === s.value}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="mt-1 text-[#007b92]"
                    />
                    <div>
                      <div className="font-semibold text-foreground text-xs">{s.label}</div>
                      <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: Deactivate Confirmation --- */}
      {activeModal === 'deactivate' && activeStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                <UserMinus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Deactivate Staff Member?</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to deactivate <strong>{activeStaff.employeeCode}</strong> ({activeStaff.email})?
                  This will mark their employee contract as INACTIVE and revoke shift access.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted text-foreground transition"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  onClick={handleDeactivateSubmit}
                  disabled={submitting}
                  className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Deactivating...' : 'Confirm Deactivation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffAdminPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-12 text-center text-muted-foreground">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#007b92] mb-2" />
        <p className="text-sm">Loading Staff Management Directory...</p>
      </div>
    }>
      <StaffContent />
    </Suspense>
  );
}
