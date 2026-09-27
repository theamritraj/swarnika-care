import React from 'react';
import { Search, FileText, Download } from 'lucide-react';

export default function AuditLogsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Review system activity, security events, and administrative actions.</p>
        </div>
        <button className="bg-card border border-border text-card-foreground/80 px-4 py-2 rounded-lg font-medium hover:bg-background transition flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search logs by action or user..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="date"
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          />
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Modules</option>
            <option>IAM</option>
            <option>Appointment</option>
            <option>System</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Resource</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4 text-muted-foreground">
                  Oct 25, 2026 - 14:32:01
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-card-foreground/80">System Admin</div>
                  <div className="text-xs text-muted-foreground/70">SUPER_ADMIN</div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">Create User</td>
                <td className="px-6 py-4 text-muted-foreground font-mono text-xs">USER-9402</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                    Success
                  </span>
                </td>
              </tr>
              {/* Dummy Row 2 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4 text-muted-foreground">
                  Oct 25, 2026 - 14:10:45
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-card-foreground/80">System</div>
                  <div className="text-xs text-muted-foreground/70">SYSTEM</div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">DB Backup</td>
                <td className="px-6 py-4 text-muted-foreground font-mono text-xs">SYS-DB-01</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                    Success
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
