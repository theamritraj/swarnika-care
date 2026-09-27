import React from 'react';
import { Search, Plus, MoreVertical, Link as LinkIcon } from 'lucide-react';

export default function RoleAssignmentsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Role Assignments</h1>
          <p className="text-muted-foreground mt-1">Assign roles to system users and audit effective access.</p>
        </div>
        <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Assign Role
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search by user or email..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Roles</option>
            <option>SUPER_ADMIN</option>
            <option>DOCTOR</option>
            <option>STAFF</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Assigned Role</th>
                <th className="px-6 py-3 font-medium">Assigned By</th>
                <th className="px-6 py-3 font-medium">Date Assigned</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-card-foreground">System Administrator</div>
                  <div className="text-muted-foreground text-xs mt-0.5">swarnikahospitals@gmail.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">
                    SUPER_ADMIN
                  </span>
                </td>
                <td className="px-6 py-4 text-card-foreground/80 text-xs">System Setup</td>
                <td className="px-6 py-4 text-card-foreground/80 text-xs">Oct 10, 2026</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-muted-foreground/70 hover:text-muted-foreground transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
              {/* Dummy Row 2 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-card-foreground">Dr. SK Singh</div>
                  <div className="text-muted-foreground text-xs mt-0.5">sksingh@swarnikahospitals.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                    DOCTOR
                  </span>
                </td>
                <td className="px-6 py-4 text-card-foreground/80 text-xs">System Administrator</td>
                <td className="px-6 py-4 text-card-foreground/80 text-xs">Oct 11, 2026</td>
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
