'use client';

import React, { useEffect, useState } from 'react';
import { useReceptionSidebar } from '../components/ReceptionSidebarContext';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AuditLog {
  id: number;
  hospitalId: number;
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  timestamp: string;
}

export default function ReceptionAuditLogsPage() {
  const { activeHospitalId } = useReceptionSidebar();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospId = activeHospitalId || 101;
      const url = new URL('/api/v1/audit-logs', window.location.origin);
      url.searchParams.set('hospitalId', String(hospId));
      if (entityFilter !== 'ALL') {
        url.searchParams.set('entityType', entityFilter);
      }
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error('Failed to load audit trail');
      }
      const j = await res.json();
      setLogs(j.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading operational audit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [activeHospitalId, entityFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchAction = log.action.toLowerCase().includes(q);
    const matchActor = log.actorUserId.toLowerCase().includes(q);
    const matchEntity = log.entityType.toLowerCase().includes(q);
    const matchId = log.entityId.toLowerCase().includes(q);
    const matchDetails = (log.details || '').toLowerCase().includes(q);
    return matchAction || matchActor || matchEntity || matchId || matchDetails;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Front-Desk Operational Traceability & Audit Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable front-desk activity log tracking patient registrations, appointments, admissions, referrals, and check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'APPOINTMENT', 'PATIENT', 'ADMISSION', 'REFERRAL', 'TOKEN', 'EMERGENCY'].map((st) => (
            <button
              key={st}
              onClick={() => setEntityFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                entityFilter === st
                  ? 'bg-[#007b92] text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, actor, entity ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-[#007b92]"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#007b92] mb-2" />
            <p className="text-xs">Loading operational audit events...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">No Audit Records Found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No operational events recorded for the selected scope yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Staff Actor</th>
                  <th className="py-3 px-4">Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/40">
                    <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#007b92]">{log.action}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      #{log.entityId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{log.actorUserId}</span>
                      <p className="text-[10px] text-muted-foreground">{log.actorRole}</p>
                    </td>
                    <td className="py-3 px-4 text-foreground max-w-md truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
