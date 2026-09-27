'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ClinicalOrder {
  id: number;
  orderNumber: string;
  encounterId: number;
  doctorId: number;
  patientId: number;
  hospitalId: number;
  orderType: 'LAB' | 'IMAGING';
  testName: string;
  priority: string;
  clinicalNotes?: string;
  status: string;
  createdAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
}

export default function DoctorOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [patients, setPatients] = useState<Record<number, Patient>>({});
  const [filterType, setFilterType] = useState<'ALL' | 'LAB' | 'IMAGING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch('/api/proxy/api/v1/doctors/me');
      if (!meRes.ok) throw new Error('Doctor authentication failed');
      const doc = (await meRes.json()).data;

      // Fetch all encounters for this doctor
      const encRes = await fetch(`/api/proxy/api/v1/encounters/doctor/${doc.id}`);
      if (!encRes.ok) throw new Error('Failed to fetch doctor encounters');
      const encs = (await encRes.json()).data || [];

      // For each encounter, fetch orders
      const orderList: ClinicalOrder[] = [];
      await Promise.all(
        encs.map(async (enc: any) => {
          try {
            const ordRes = await fetch(`/api/proxy/api/v1/encounters/${enc.id}/orders`);
            if (ordRes.ok) {
              const ordData: ClinicalOrder[] = (await ordRes.json()).data || [];
              orderList.push(...ordData);
            }
          } catch {
            // continue
          }
        })
      );

      orderList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(orderList);

      // Fetch patient profiles
      const pIds = Array.from(new Set(orderList.map((o) => o.patientId)));
      const pMap: Record<number, Patient> = {};
      await Promise.all(
        pIds.map(async (pid) => {
          try {
            const pRes = await fetch(`/api/proxy/api/v1/patients/${pid}`);
            if (pRes.ok) {
              const pData = (await pRes.json()).data;
              if (pData) {
                pMap[pid] = {
                  id: pid,
                  firstName: pData.firstName,
                  lastName: pData.lastName,
                  mrn: pData.mrn,
                };
              }
            }
          } catch {
            // continue
          }
        })
      );
      setPatients(pMap);
    } catch (err: any) {
      setError(err.message || 'Error loading clinical orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((ord) => {
      if (filterType !== 'ALL' && ord.orderType !== filterType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = patients[ord.patientId];
        const pName = `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase();
        const mrn = (p?.mrn || '').toLowerCase();
        const ordNum = ord.orderNumber.toLowerCase();
        const testName = ord.testName.toLowerCase();

        return pName.includes(q) || mrn.includes(q) || ordNum.includes(q) || testName.includes(q);
      }
      return true;
    });
  }, [orders, filterType, searchQuery, patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Diagnostic Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log of all laboratory tests and imaging/radiology orders placed for your patients.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          {(['ALL', 'LAB', 'IMAGING'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t === 'ALL' ? 'All Orders' : t === 'LAB' ? 'Laboratory' : 'Imaging / Radiology'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search test, patient, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No Diagnostic Orders Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are no orders matching your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Test Name</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ord) => {
                  const p = patients[ord.patientId];
                  return (
                    <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">
                        {ord.orderNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                          {ord.orderType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground text-xs">{ord.testName}</div>
                        {ord.clinicalNotes && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs">{ord.clinicalNotes}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/doctor/patients/${ord.patientId}`}
                          className="font-bold text-foreground hover:text-teal-600 hover:underline text-xs"
                        >
                          {p ? `${p.firstName} ${p.lastName}` : `Patient #${ord.patientId}`}
                        </Link>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          MRN: {p?.mrn || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <span className={`font-semibold ${
                          ord.priority === 'STAT' ? 'text-red-600' : ord.priority === 'URGENT' ? 'text-amber-600' : 'text-foreground'
                        }`}>
                          {ord.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/doctor/consultation/${ord.encounterId}`}
                          className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Encounter</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
