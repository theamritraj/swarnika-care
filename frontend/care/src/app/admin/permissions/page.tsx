import React from 'react';
import { Search, Plus, MoreVertical, Key } from 'lucide-react';

export default function PermissionsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Permissions</h1>
          <p className="text-muted-foreground mt-1">View the system permission catalog and domain assignments.</p>
        </div>
        <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Permission
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search permissions..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Domains</option>
            <option>IAM</option>
            <option>Patient</option>
            <option>Appointment</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Permission</th>
                <th className="px-6 py-3 font-medium">Domain</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground/70" />
                    <span className="font-semibold text-card-foreground">USER_MANAGE</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">IAM</td>
                <td className="px-6 py-4 text-card-foreground/80">Create, update, and deactivate users</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-muted-foreground/70 hover:text-muted-foreground transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
              {/* Dummy Row 2 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground/70" />
                    <span className="font-semibold text-card-foreground">APPOINTMENT_VIEW</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">Appointment</td>
                <td className="px-6 py-4 text-card-foreground/80">View appointments across the organization</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-muted-foreground/70 hover:text-muted-foreground transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
