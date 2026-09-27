import React from 'react';
import { Search, Plus, MoreVertical, Shield } from 'lucide-react';

export default function RolesAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Roles</h1>
          <p className="text-muted-foreground mt-1">Manage system roles and their associated permissions.</p>
        </div>
        <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search roles..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Role Name</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Users Assigned</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-card-foreground">SUPER_ADMIN</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">Full system access and control</td>
                <td className="px-6 py-4 text-card-foreground/80">3</td>
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
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-card-foreground">DOCTOR</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-card-foreground/80">Access to patient medical records and appointments</td>
                <td className="px-6 py-4 text-card-foreground/80">186</td>
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
