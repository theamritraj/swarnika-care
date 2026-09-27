import React from 'react';
import { Download, BarChart2, TrendingUp, Users } from 'lucide-react';

export default function OperationalReportsAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Operational Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and operational performance metrics.</p>
        </div>
        <button className="bg-card border border-border text-card-foreground/80 px-4 py-2 rounded-lg font-medium hover:bg-background transition flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Date Range & Filters */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="date"
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          />
          <span className="text-muted-foreground/70 self-center">to</span>
          <input 
            type="date"
            className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Hospitals</option>
            <option>Sasaram</option>
          </select>
          <select className="bg-card border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#007b92]">
            <option>All Departments</option>
            <option>Cardiology</option>
          </select>
          <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#006072] transition">
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Appointments</p>
              <h3 className="text-3xl font-bold text-card-foreground">1,248</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">+12.5%</span>
            <span className="text-muted-foreground/70 ml-2">vs last period</span>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">New Registrations</p>
              <h3 className="text-3xl font-bold text-card-foreground">452</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">+8.2%</span>
            <span className="text-muted-foreground/70 ml-2">vs last period</span>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Average Wait Time</p>
              <h3 className="text-3xl font-bold text-card-foreground">18 min</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">-2.1%</span>
            <span className="text-muted-foreground/70 ml-2">vs last period</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
