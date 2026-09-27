'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, Layers, DoorOpen, Bed as BedIcon, Stethoscope, 
  Search, Plus, Eye, Edit3, Check, X, AlertCircle, RefreshCw, 
  CheckCircle2, ChevronRight, Filter, ShieldCheck, MapPin, 
  Info, Tag, Lock, ArrowRight, Activity, Settings2
} from 'lucide-react';

interface Hospital {
  id: number;
  code: string;
  name: string;
  city?: string | null;
  status: string;
}

interface Building {
  id: number;
  hospitalId: number;
  code: string;
  name: string;
  description?: string | null;
  address?: string | null;
  status: string;
}

interface Floor {
  id: number;
  hospitalId: number;
  buildingId: number;
  floorNumber: number;
  code: string;
  name: string;
  description?: string | null;
  status: string;
}

interface Unit {
  id: number;
  hospitalId: number;
  buildingId: number;
  floorId: number;
  departmentId?: number | null;
  code: string;
  name: string;
  type: string;
  description?: string | null;
  capacity?: number | null;
  genderRestriction?: string | null;
  ageGroup?: string | null;
  status: string;
  publicVisibility: boolean;
}

interface Room {
  id: number;
  hospitalId: number;
  buildingId: number;
  floorId: number;
  unitId: number;
  roomNumber: string;
  roomName?: string | null;
  roomType: string;
  capacity?: number | null;
  bedCount?: number;
  genderRestriction?: string | null;
  status: string;
}

interface Bed {
  id: number;
  hospitalId: number;
  buildingId: number;
  floorId: number;
  unitId: number;
  roomId: number;
  bedNumber: string;
  bedType: string;
  status: string;
  genderRestriction?: string | null;
  isIsolation: boolean;
}

interface NursingStation {
  id: number;
  hospitalId: number;
  buildingId: number;
  floorId: number;
  unitId: number;
  code: string;
  name: string;
  description?: string | null;
  location?: string | null;
  status: string;
}

type TabType = 'BUILDINGS' | 'FLOORS' | 'UNITS' | 'ROOMS' | 'BEDS' | 'NURSING_STATIONS';

const UNIT_TYPES = [
  'WARD', 'ICU', 'NICU', 'HDU', 'EMERGENCY', 'OT', 
  'DAY_CARE', 'DIALYSIS', 'MATERNITY', 'PEDIATRIC', 
  'ISOLATION', 'RECOVERY', 'OTHER'
];

const ROOM_TYPES = [
  'GENERAL', 'PRIVATE', 'SEMI_PRIVATE', 'SUITE', 'ICU', 
  'ISOLATION', 'NICU', 'OT', 'PROCEDURE', 'OTHER'
];

const BED_TYPES = [
  'GENERAL', 'ICU', 'NICU', 'HDU', 'PRIVATE', 
  'SEMI_PRIVATE', 'EMERGENCY', 'PEDIATRIC', 'MATERNITY', 'OTHER'
];

const BED_STATUSES = [
  'AVAILABLE', 'RESERVED', 'OCCUPIED', 'BLOCKED', 'MAINTENANCE', 'CLEANING'
];

const ROOM_STATUSES = [
  'AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'BLOCKED', 'INACTIVE'
];

function InfrastructureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialHospitalId = searchParams.get('hospitalId');

  // Hierarchy Selection State
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [beds, setBeds] = useState<Bed[]>([]);
  const [nursingStations, setNursingStations] = useState<NursingStation[]>([]);

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<TabType>('BUILDINGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Loading & Feedback State
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal State
  const [modalType, setModalType] = useState<{
    action: 'ADD' | 'EDIT' | 'VIEW' | 'STATUS';
    tier: TabType;
    item?: any;
  } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Universal Form State
  const [formData, setFormData] = useState<Record<string, any>>({});

  // 1. Initial Load: Fetch Hospitals
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/api/v1/hospitals');
      if (!res.ok) throw new Error(`Failed to load hospitals: HTTP ${res.status}`);
      const data = await res.json();
      const hospList: Hospital[] = data.data || [];
      setHospitals(hospList);

      if (hospList.length > 0) {
        // Select from URL if provided, else first hospital
        const target = initialHospitalId 
          ? hospList.find(h => String(h.id) === initialHospitalId) || hospList[0]
          : hospList[0];
        handleSelectHospital(target);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading hospitals');
    } finally {
      setLoading(false);
    }
  };

  // 2. Cascade: Handle Hospital Change
  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedUnit(null);
    setSelectedRoom(null);
    setFloors([]);
    setUnits([]);
    setRooms([]);
    setBeds([]);
    setNursingStations([]);
    setActiveTab('BUILDINGS');
    setSearchTerm('');

    // Update URL query parameter
    router.replace(`/admin/infrastructure?hospitalId=${hospital.id}`);

    // Load buildings for this hospital
    loadBuildings(hospital.id);
  };

  const loadBuildings = async (hospitalId: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/buildings?hospitalId=${hospitalId}`);
      if (!res.ok) throw new Error(`Failed to load buildings: HTTP ${res.status}`);
      const data = await res.json();
      setBuildings(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading buildings');
    } finally {
      setSubLoading(false);
    }
  };

  // 3. Cascade: Handle Building Change
  const handleSelectBuilding = (bld: Building) => {
    setSelectedBuilding(bld);
    setSelectedFloor(null);
    setSelectedUnit(null);
    setSelectedRoom(null);
    setUnits([]);
    setRooms([]);
    setBeds([]);
    setNursingStations([]);
    setActiveTab('FLOORS');
    setSearchTerm('');
    loadFloors(bld.id);
  };

  const loadFloors = async (buildingId: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/floors?buildingId=${buildingId}`);
      if (!res.ok) throw new Error(`Failed to load floors: HTTP ${res.status}`);
      const data = await res.json();
      setFloors(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading floors');
    } finally {
      setSubLoading(false);
    }
  };

  // 4. Cascade: Handle Floor Change
  const handleSelectFloor = (floor: Floor) => {
    setSelectedFloor(floor);
    setSelectedUnit(null);
    setSelectedRoom(null);
    setRooms([]);
    setBeds([]);
    setNursingStations([]);
    setActiveTab('UNITS');
    setSearchTerm('');
    loadUnits(floor.id);
  };

  const loadUnits = async (floorId: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/units?floorId=${floorId}`);
      if (!res.ok) throw new Error(`Failed to load units: HTTP ${res.status}`);
      const data = await res.json();
      setUnits(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading units');
    } finally {
      setSubLoading(false);
    }
  };

  // 5. Cascade: Handle Unit Change
  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedRoom(null);
    setBeds([]);
    setSearchTerm('');
    loadRooms(unit.id);
    loadNursingStations(unit.id);
  };

  const loadRooms = async (unitId: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/rooms?unitId=${unitId}`);
      if (!res.ok) throw new Error(`Failed to load rooms: HTTP ${res.status}`);
      const data = await res.json();
      setRooms(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading rooms');
    } finally {
      setSubLoading(false);
    }
  };

  const loadNursingStations = async (unitId: number) => {
    try {
      const res = await fetch(`/api/proxy/api/v1/nursing-stations?unitId=${unitId}`);
      if (!res.ok) throw new Error(`Failed to load nursing stations: HTTP ${res.status}`);
      const data = await res.json();
      setNursingStations(data.data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  // 6. Cascade: Handle Room Change
  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setActiveTab('BEDS');
    setSearchTerm('');
    loadBeds(room.id);
  };

  const loadBeds = async (roomId: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/beds?roomId=${roomId}`);
      if (!res.ok) throw new Error(`Failed to load beds: HTTP ${res.status}`);
      const data = await res.json();
      setBeds(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading beds');
    } finally {
      setSubLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CRUD Actions
  // -------------------------------------------------------------
  const openModal = (action: 'ADD' | 'EDIT' | 'VIEW' | 'STATUS', tier: TabType, item?: any) => {
    setFormError(null);
    if (action === 'ADD') {
      // Pre-fill required hierarchy
      if (tier === 'BUILDINGS') {
        setFormData({ hospitalId: selectedHospital?.id, code: '', name: '', description: '', address: '', status: 'ACTIVE' });
      } else if (tier === 'FLOORS') {
        setFormData({ hospitalId: selectedHospital?.id, buildingId: selectedBuilding?.id, floorNumber: (floors.length + 1), code: '', name: '', description: '', status: 'ACTIVE' });
      } else if (tier === 'UNITS') {
        setFormData({ hospitalId: selectedHospital?.id, buildingId: selectedBuilding?.id, floorId: selectedFloor?.id, code: '', name: '', type: 'WARD', description: '', capacity: 20, genderRestriction: 'ANY', status: 'ACTIVE', publicVisibility: true });
      } else if (tier === 'ROOMS') {
        setFormData({ hospitalId: selectedHospital?.id, buildingId: selectedBuilding?.id, floorId: selectedFloor?.id, unitId: selectedUnit?.id, roomNumber: '', roomName: '', roomType: 'GENERAL', capacity: 2, genderRestriction: 'ANY', status: 'ACTIVE' });
      } else if (tier === 'BEDS') {
        setFormData({ hospitalId: selectedHospital?.id, buildingId: selectedBuilding?.id, floorId: selectedFloor?.id, unitId: selectedUnit?.id, roomId: selectedRoom?.id, bedNumber: '', bedType: 'GENERAL', status: 'AVAILABLE', genderRestriction: 'ANY', isIsolation: false });
      } else if (tier === 'NURSING_STATIONS') {
        setFormData({ hospitalId: selectedHospital?.id, buildingId: selectedBuilding?.id, floorId: selectedFloor?.id, unitId: selectedUnit?.id, code: '', name: '', description: '', location: '', status: 'ACTIVE' });
      }
    } else {
      setFormData({ ...item });
    }
    setModalType({ action, tier, item });
  };

  const closeModal = () => {
    setModalType(null);
    setFormError(null);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) return;
    setFormSubmitting(true);
    setFormError(null);

    const { action, tier, item } = modalType;
    const isEdit = action === 'EDIT';

    // Route map
    const routeMap: Record<TabType, string> = {
      BUILDINGS: 'buildings',
      FLOORS: 'floors',
      UNITS: 'units',
      ROOMS: 'rooms',
      BEDS: 'beds',
      NURSING_STATIONS: 'nursing-stations'
    };

    const endpoint = isEdit 
      ? `/api/proxy/api/v1/${routeMap[tier]}/${item.id}`
      : `/api/proxy/api/v1/${routeMap[tier]}`;

    try {
      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Operation failed with HTTP ${res.status}`);

      setSuccessBanner(`${tier.replace('_', ' ')} ${isEdit ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccessBanner(null), 4000);
      closeModal();

      // Refresh corresponding tier
      if (tier === 'BUILDINGS' && selectedHospital) loadBuildings(selectedHospital.id);
      if (tier === 'FLOORS' && selectedBuilding) loadFloors(selectedBuilding.id);
      if (tier === 'UNITS' && selectedFloor) loadUnits(selectedFloor.id);
      if (tier === 'ROOMS' && selectedUnit) loadRooms(selectedUnit.id);
      if (tier === 'BEDS' && selectedRoom) loadBeds(selectedRoom.id);
      if (tier === 'NURSING_STATIONS' && selectedUnit) loadNursingStations(selectedUnit.id);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit changes');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateBedStatus = async (bedId: number, targetStatus: string) => {
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/beds/${bedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update status`);

      setSuccessBanner(`Bed status updated to ${targetStatus}`);
      setTimeout(() => setSuccessBanner(null), 4000);
      closeModal();
      if (selectedRoom) loadBeds(selectedRoom.id);
    } catch (err: any) {
      setFormError(err.message || 'Status update failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateRoomStatus = async (roomId: number, targetStatus: string) => {
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/api/v1/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to update status`);

      setSuccessBanner(`Room status updated to ${targetStatus}`);
      setTimeout(() => setSuccessBanner(null), 4000);
      closeModal();
      if (selectedUnit) loadRooms(selectedUnit.id);
    } catch (err: any) {
      setFormError(err.message || 'Status update failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered lists
  // -------------------------------------------------------------
  const filteredBuildings = useMemo(() => {
    return buildings.filter(b => {
      const matchSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (b.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [buildings, searchTerm, statusFilter]);

  const filteredFloors = useMemo(() => {
    return floors.filter(f => {
      const matchSearch = (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (f.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [floors, searchTerm, statusFilter]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [units, searchTerm, statusFilter]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchSearch = (r.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.roomName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rooms, searchTerm, statusFilter]);

  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const matchSearch = (b.bedNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.bedType || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [beds, searchTerm, statusFilter]);

  const filteredNursingStations = useMemo(() => {
    return nursingStations.filter(ns => {
      const matchSearch = (ns.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (ns.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || ns.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [nursingStations, searchTerm, statusFilter]);

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    let colorClass = 'bg-muted text-muted-foreground';
    let dotClass = 'bg-muted-foreground';

    if (status === 'ACTIVE' || status === 'AVAILABLE') {
      colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50';
      dotClass = 'bg-emerald-500';
    } else if (status === 'OCCUPIED' || status === 'RESERVED') {
      colorClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50';
      dotClass = 'bg-blue-500';
    } else if (status === 'MAINTENANCE' || status === 'CLEANING') {
      colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50';
      dotClass = 'bg-amber-500';
    } else if (status === 'BLOCKED' || status === 'INACTIVE') {
      colorClass = 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50';
      dotClass = 'bg-red-500';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotClass}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER & HOSPITAL SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#007b92]" />
            Physical Infrastructure
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Authoritative facility hierarchy: Buildings, Floors, Wards, Rooms, Beds, and Nursing Stations.
          </p>
        </div>

        {/* Global Hospital Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-card-foreground whitespace-nowrap flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#007b92]" /> Hospital:
          </label>
          <select 
            value={selectedHospital?.id || ''} 
            onChange={(e) => {
              const h = hospitals.find(item => String(item.id) === e.target.value);
              if (h) handleSelectHospital(h);
            }}
            disabled={loading}
            className="bg-background border border-border text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#007b92] text-card-foreground shadow-xs min-w-[240px]"
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => selectedHospital && loadBuildings(selectedHospital.id)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-800 border border-border rounded-lg text-xs font-semibold hover:bg-accent"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* BREADCRUMB CONTEXT TRAIL */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-muted/40 px-4 py-2.5 rounded-xl border border-border/60 text-muted-foreground">
        <span className="font-semibold text-card-foreground flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#007b92]" /> Hierarchy:
        </span>
        <button 
          onClick={() => { setActiveTab('BUILDINGS'); setSelectedBuilding(null); setSelectedFloor(null); setSelectedUnit(null); setSelectedRoom(null); }}
          className="font-medium hover:text-[#007b92] hover:underline"
        >
          {selectedHospital?.name || 'Hospital'}
        </button>

        {selectedBuilding && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => { setActiveTab('FLOORS'); setSelectedFloor(null); setSelectedUnit(null); setSelectedRoom(null); }}
              className="font-medium hover:text-[#007b92] hover:underline"
            >
              {selectedBuilding.name}
            </button>
          </>
        )}

        {selectedFloor && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => { setActiveTab('UNITS'); setSelectedUnit(null); setSelectedRoom(null); }}
              className="font-medium hover:text-[#007b92] hover:underline"
            >
              Floor {selectedFloor.floorNumber} ({selectedFloor.name})
            </button>
          </>
        )}

        {selectedUnit && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => { setActiveTab('ROOMS'); setSelectedRoom(null); }}
              className="font-medium hover:text-[#007b92] hover:underline"
            >
              {selectedUnit.name}
            </button>
          </>
        )}

        {selectedRoom && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button 
              onClick={() => setActiveTab('BEDS')}
              className="font-semibold text-[#007b92]"
            >
              Room {selectedRoom.roomNumber}
            </button>
          </>
        )}
      </div>

      {/* TIER TABS */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('BUILDINGS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'BUILDINGS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" /> Buildings ({buildings.length})
        </button>

        <button
          onClick={() => setActiveTab('FLOORS')}
          disabled={!selectedBuilding}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'FLOORS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <Layers className="w-4 h-4" /> Floors ({floors.length})
          {!selectedBuilding && <span className="text-[10px] text-muted-foreground">(Select Building)</span>}
        </button>

        <button
          onClick={() => setActiveTab('UNITS')}
          disabled={!selectedFloor}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'UNITS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <Activity className="w-4 h-4" /> Units / Wards ({units.length})
          {!selectedFloor && <span className="text-[10px] text-muted-foreground">(Select Floor)</span>}
        </button>

        <button
          onClick={() => setActiveTab('ROOMS')}
          disabled={!selectedUnit}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'ROOMS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <DoorOpen className="w-4 h-4" /> Rooms ({rooms.length})
          {!selectedUnit && <span className="text-[10px] text-muted-foreground">(Select Unit)</span>}
        </button>

        <button
          onClick={() => setActiveTab('BEDS')}
          disabled={!selectedRoom}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'BEDS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <BedIcon className="w-4 h-4" /> Beds ({beds.length})
          {!selectedRoom && <span className="text-[10px] text-muted-foreground">(Select Room)</span>}
        </button>

        <button
          onClick={() => setActiveTab('NURSING_STATIONS')}
          disabled={!selectedUnit}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'NURSING_STATIONS'
              ? 'border-[#007b92] text-[#007b92] bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-muted-foreground hover:text-card-foreground'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Nursing Stations ({nursingStations.length})
          {!selectedUnit && <span className="text-[10px] text-muted-foreground">(Select Unit)</span>}
        </button>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase().replace('_', ' ')}...`} 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-muted-foreground font-medium">Status:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92] text-card-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <button 
            onClick={() => openModal('ADD', activeTab)}
            disabled={
              (activeTab === 'FLOORS' && !selectedBuilding) ||
              (activeTab === 'UNITS' && !selectedFloor) ||
              (activeTab === 'ROOMS' && !selectedUnit) ||
              (activeTab === 'BEDS' && (!selectedRoom || (selectedRoom.capacity != null && selectedRoom.bedCount != null && selectedRoom.bedCount >= selectedRoom.capacity))) ||
              (activeTab === 'NURSING_STATIONS' && !selectedUnit)
            }
            className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2 shadow-xs text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add {activeTab === 'NURSING_STATIONS' ? 'Station' : activeTab.slice(0, -1)}
          </button>
          {activeTab === 'BEDS' && selectedRoom && selectedRoom.capacity != null && selectedRoom.bedCount != null && selectedRoom.bedCount >= selectedRoom.capacity && (
            <span className="text-xs text-red-500 font-semibold ml-2">Room full</span>
          )}
        </div>
      </div>

      {/* TABLE VIEWS FOR ACTIVE TAB */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">

          {/* 1. BUILDINGS TABLE */}
          {activeTab === 'BUILDINGS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Building Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading buildings...</td></tr>
                ) : filteredBuildings.length > 0 ? (
                  filteredBuildings.map(b => (
                    <tr key={b.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-semibold text-card-foreground">
                        <button 
                          onClick={() => handleSelectBuilding(b)}
                          className="hover:text-[#007b92] hover:underline flex items-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4 text-[#007b92]" /> {b.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{b.code}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{b.description || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{b.address || '—'}</td>
                      <td className="px-6 py-4">{renderStatusBadge(b.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'BUILDINGS', b)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'BUILDINGS', b)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button 
                            onClick={() => handleSelectBuilding(b)}
                            className="p-1.5 text-[#007b92] hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            Explore <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No buildings configured for this hospital. Click "Add Building" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* 2. FLOORS TABLE */}
          {activeTab === 'FLOORS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Floor Number</th>
                  <th className="px-6 py-4">Floor Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading floors...</td></tr>
                ) : filteredFloors.length > 0 ? (
                  filteredFloors.map(f => (
                    <tr key={f.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-card-foreground">Floor {f.floorNumber}</td>
                      <td className="px-6 py-4 font-semibold">
                        <button onClick={() => handleSelectFloor(f)} className="hover:text-[#007b92] hover:underline flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#007b92]" /> {f.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{f.code}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{f.description || '—'}</td>
                      <td className="px-6 py-4">{renderStatusBadge(f.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'FLOORS', f)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'FLOORS', f)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleSelectFloor(f)} className="p-1.5 text-[#007b92] hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg text-xs font-semibold flex items-center gap-1">
                            Units <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No floors configured for this building. Click "Add Floor" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* 3. UNITS / WARDS TABLE */}
          {activeTab === 'UNITS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Unit Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading units...</td></tr>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map(u => (
                    <tr key={u.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-semibold">
                        <button onClick={() => handleSelectUnit(u)} className="hover:text-[#007b92] hover:underline flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-[#007b92]" /> {u.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{u.code}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                          {u.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs">{u.capacity || '—'} Beds</td>
                      <td className="px-6 py-4">{renderStatusBadge(u.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'UNITS', u)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'UNITS', u)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleSelectUnit(u)} className="p-1.5 text-[#007b92] hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg text-xs font-semibold flex items-center gap-1">
                            Rooms <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No units/wards configured for this floor. Click "Add Unit" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* 4. ROOMS TABLE */}
          {activeTab === 'ROOMS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Room Number</th>
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Capacity / Beds</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading rooms...</td></tr>
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map(r => (
                    <tr key={r.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-card-foreground">
                        <button onClick={() => handleSelectRoom(r)} className="hover:text-[#007b92] hover:underline flex items-center gap-1.5">
                          <DoorOpen className="w-4 h-4 text-[#007b92]" /> Room {r.roomNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium">{r.roomName || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {r.roomType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs">
                        {r.capacity || '—'} | <span className={r.bedCount && r.capacity && r.bedCount >= r.capacity ? 'text-red-500' : 'text-[#007b92]'}>{r.bedCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(r.status)}
                          <button 
                            onClick={() => openModal('STATUS', 'ROOMS', r)}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-card-foreground"
                            title="Change Room Status"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'ROOMS', r)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'ROOMS', r)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleSelectRoom(r)} className="p-1.5 text-[#007b92] hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg text-xs font-semibold flex items-center gap-1">
                            Beds <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No rooms configured for this unit. Click "Add Room" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* 5. BEDS TABLE */}
          {activeTab === 'BEDS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Bed Number</th>
                  <th className="px-6 py-4">Bed Type</th>
                  <th className="px-6 py-4">Gender Restriction</th>
                  <th className="px-6 py-4">Isolation</th>
                  <th className="px-6 py-4">Operational Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading beds...</td></tr>
                ) : filteredBeds.length > 0 ? (
                  filteredBeds.map(b => (
                    <tr key={b.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-mono font-bold text-card-foreground flex items-center gap-1.5">
                        <BedIcon className="w-4 h-4 text-[#007b92]" /> {b.bedNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">
                          {b.bedType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{b.genderRestriction || 'ANY'}</td>
                      <td className="px-6 py-4">
                        {b.isIsolation ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">ISOLATION</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(b.status)}
                          <button 
                            onClick={() => openModal('STATUS', 'BEDS', b)}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-card-foreground"
                            title="Change Status"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'BEDS', b)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'BEDS', b)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No beds configured for this room. Click "Add Bed" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* 6. NURSING STATIONS TABLE */}
          {activeTab === 'NURSING_STATIONS' && (
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Station Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subLoading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading nursing stations...</td></tr>
                ) : filteredNursingStations.length > 0 ? (
                  filteredNursingStations.map(ns => (
                    <tr key={ns.id} className="hover:bg-accent/40 transition">
                      <td className="px-6 py-4 font-semibold text-card-foreground flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-[#007b92]" /> {ns.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{ns.code}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{ns.location || '—'}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">{ns.description || '—'}</td>
                      <td className="px-6 py-4">{renderStatusBadge(ns.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal('VIEW', 'NURSING_STATIONS', ns)} className="p-1.5 text-muted-foreground hover:text-card-foreground rounded-lg transition" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openModal('EDIT', 'NURSING_STATIONS', ns)} className="p-1.5 text-muted-foreground hover:text-[#007b92] rounded-lg transition" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No nursing stations configured for this unit. Click "Add Station" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* UNIVERSAL ADD / EDIT MODAL */}
      {modalType && (modalType.action === 'ADD' || modalType.action === 'EDIT') && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-scale-in my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#007b92]" />
                {modalType.action === 'EDIT' ? `Edit ${modalType.tier}` : `Add New ${modalType.tier}`}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* BUILDINGS FIELDS */}
              {modalType.tier === 'BUILDINGS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Building Code *</label>
                      <input 
                        type="text" required value={formData.code || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. BLD-A"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Building Name *</label>
                      <input 
                        type="text" required value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Apex Surgical Block"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Description</label>
                    <textarea 
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2} placeholder="Optional notes"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Address / Campus Zone</label>
                    <input 
                      type="text" value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. West Campus, Gate 2"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </>
              )}

              {/* FLOORS FIELDS */}
              {modalType.tier === 'FLOORS' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Floor Number *</label>
                      <input 
                        type="number" required value={formData.floorNumber ?? ''}
                        onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                        placeholder="e.g. 1"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Floor Code *</label>
                      <input 
                        type="text" required value={formData.code || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. FL-01"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Floor Name *</label>
                      <input 
                        type="text" required value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. First Floor"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Description</label>
                    <textarea 
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2} placeholder="Optional notes"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </>
              )}

              {/* UNITS FIELDS */}
              {modalType.tier === 'UNITS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Unit Code *</label>
                      <input 
                        type="text" required value={formData.code || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. ICU-01"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Unit Name *</label>
                      <input 
                        type="text" required value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Cardiac ICU"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Unit Type *</label>
                      <select 
                        value={formData.type || 'WARD'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      >
                        {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Capacity (Beds)</label>
                      <input 
                        type="number" value={formData.capacity ?? ''}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        placeholder="e.g. 15"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ROOMS FIELDS */}
              {modalType.tier === 'ROOMS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Room Number *</label>
                      <input 
                        type="text" required value={formData.roomNumber || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        placeholder="e.g. 101"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Room Name</label>
                      <input 
                        type="text" value={formData.roomName || ''}
                        onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                        placeholder="e.g. Semi-Private Suite 1"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Room Type *</label>
                      <select 
                        value={formData.roomType || 'GENERAL'}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      >
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Bed Capacity</label>
                      <input 
                        type="number" value={formData.capacity ?? ''}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        placeholder="e.g. 2"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* BEDS FIELDS (STRICTLY PHYSICAL, NO PATIENT / ADMISSION) */}
              {modalType.tier === 'BEDS' && (
                <>
                  {selectedRoom && modalType.action === 'ADD' && (
                    <div className="mb-4 bg-muted/30 border border-border p-3 rounded-lg text-xs flex justify-between">
                      <span className="font-semibold text-muted-foreground">Room Capacity: <span className="text-card-foreground">{selectedRoom.capacity || '—'}</span></span>
                      <span className="font-semibold text-muted-foreground">Existing Beds: <span className="text-[#007b92]">{selectedRoom.bedCount || 0}</span></span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Bed Number *</label>
                      <input 
                        type="text" required value={formData.bedNumber || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. BED-A1"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Bed Type *</label>
                      <select 
                        value={formData.bedType || 'GENERAL'}
                        onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      >
                        {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Operational Status</label>
                      <select 
                        value={formData.status || 'AVAILABLE'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      >
                        {BED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Gender Restriction</label>
                      <select 
                        value={formData.genderRestriction || 'ANY'}
                        onChange={(e) => setFormData({ ...formData, genderRestriction: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      >
                        <option value="ANY">Any</option>
                        <option value="MALE_ONLY">Male Only</option>
                        <option value="FEMALE_ONLY">Female Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" id="isIsolation"
                      checked={formData.isIsolation || false}
                      onChange={(e) => setFormData({ ...formData, isIsolation: e.target.checked })}
                      className="w-4 h-4 text-[#007b92] rounded"
                    />
                    <label htmlFor="isIsolation" className="text-xs font-medium text-card-foreground">
                      Negative Pressure / Isolation Bed
                    </label>
                  </div>
                </>
              )}

              {/* NURSING STATIONS FIELDS */}
              {modalType.tier === 'NURSING_STATIONS' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Station Code *</label>
                      <input 
                        type="text" required value={formData.code || ''}
                        disabled={modalType.action === 'EDIT'}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. NS-ICU-1"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Station Name *</label>
                      <input 
                        type="text" required value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Central Nursing Post 1"
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Physical Location</label>
                    <input 
                      type="text" value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. West Wing Corridor Center"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Description</label>
                    <textarea 
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2} placeholder="Optional notes"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                  </div>
                </>
              )}

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={formSubmitting}
                  className="bg-[#007b92] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#006072] text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {modalType.action === 'EDIT' ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {modalType && modalType.action === 'VIEW' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <Info className="w-5 h-5 text-[#007b92]" />
                {modalType.tier} Details
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {Object.entries(modalType.item || {}).map(([key, value]) => {
                if (key === 'createdAt' || key === 'updatedAt') return null;
                return (
                  <div key={key} className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-card-foreground">{String(value ?? '—')}</span>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-muted/20 border-t border-border flex justify-end">
              <button onClick={closeModal} className="px-4 py-1.5 bg-[#007b92] text-white text-xs font-semibold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* BED STATUS CHANGE MODAL */}
      {modalType && modalType.action === 'STATUS' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#007b92]" />
                Change {modalType.tier === 'ROOMS' ? 'Room' : 'Bed'} Operational Status
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-card-foreground p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Target {modalType.tier === 'ROOMS' ? 'Room' : 'Bed'}:</p>
                <p className="text-sm font-bold text-card-foreground mt-0.5">
                  {modalType.tier === 'ROOMS' 
                    ? `Room ${modalType.item?.roomNumber} (${modalType.item?.roomType})`
                    : `${modalType.item?.bedNumber} (${modalType.item?.bedType})`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Current Status: {renderStatusBadge(modalType.item?.status)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select New Operational Status:</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(modalType.tier === 'ROOMS' ? ROOM_STATUSES : BED_STATUSES).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (modalType.tier === 'ROOMS') {
                          handleUpdateRoomStatus(modalType.item?.id, s);
                        } else {
                          handleUpdateBedStatus(modalType.item?.id, s);
                        }
                      }}
                      disabled={formSubmitting || modalType.item?.status === s}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-left flex items-center justify-between ${
                        modalType.item?.status === s 
                          ? 'border-border bg-muted/60 opacity-50 cursor-not-allowed'
                          : 'border-border hover:border-[#007b92] hover:bg-teal-50 dark:hover:bg-teal-950/20'
                      }`}
                    >
                      <span>{s}</span>
                      {modalType.item?.status === s && <Check className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function InfrastructureAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading infrastructure console...</div>}>
      <InfrastructureContent />
    </Suspense>
  );
}
