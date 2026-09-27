import React from 'react';
import { Search, Plus, MoreVertical, Receipt } from 'lucide-react';

export default function BillingConfigAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Billing Configuration</h1>
          <p className="text-muted-foreground mt-1">Configure consultation fees, service charges, taxes, and discounts.</p>
        </div>
        <button className="bg-[#007b92] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006072] transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Configuration
        </button>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consultation Fees */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground">Consultation Fees</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">General OPD</span>
              <span className="font-semibold text-card-foreground">₹ 500.00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">Specialist OPD</span>
              <span className="font-semibold text-card-foreground">₹ 800.00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">Emergency</span>
              <span className="font-semibold text-card-foreground">₹ 1000.00</span>
            </div>
            <button className="text-[#007b92] text-sm font-medium hover:underline mt-2">Manage Fees &rarr;</button>
          </div>
        </div>

        {/* Taxes & Discounts */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground">Taxes & Discounts</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">CGST</span>
              <span className="font-semibold text-card-foreground">9%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">SGST</span>
              <span className="font-semibold text-card-foreground">9%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-card-foreground/80">Senior Citizen Discount</span>
              <span className="font-semibold text-emerald-600">- 10%</span>
            </div>
            <button className="text-[#007b92] text-sm font-medium hover:underline mt-2">Manage Rates &rarr;</button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
