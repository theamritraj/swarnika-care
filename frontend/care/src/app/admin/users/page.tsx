import React from 'react';
import Link from 'next/link';
import { Search, Plus, MoreVertical, Shield } from 'lucide-react';

export default function UsersAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system access, roles, and user accounts.</p>
        </div>
        <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007b92] focus:bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Roles</option>
            <option>SUPER_ADMIN</option>
            <option>DOCTOR</option>
            <option>PATIENT</option>
            <option>STAFF</option>
          </select>
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">User ID</th>
                <th className="px-6 py-3 font-medium">Name & Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Login</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Dummy Row 1 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4 text-muted-foreground font-mono">USR-10492</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-card-foreground">Dr. Ramesh Kumar</div>
                  <div className="text-muted-foreground text-xs">ramesh.kumar@swarnika.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <Shield className="w-3 h-3" /> DOCTOR
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">2 hours ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-muted-foreground/70 hover:text-muted-foreground transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>

              {/* Dummy Row 2 */}
              <tr className="hover:bg-background transition">
                <td className="px-6 py-4 text-muted-foreground font-mono">USR-10493</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-card-foreground">Admin Team</div>
                  <div className="text-muted-foreground text-xs">admin@swarnikacare.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                    <Shield className="w-3 h-3" /> SUPER_ADMIN
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">Just now</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-muted-foreground/70 hover:text-muted-foreground transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing 1 to 10 of 12,458 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-[#007b92] text-white rounded">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-background">2</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-background">3</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
