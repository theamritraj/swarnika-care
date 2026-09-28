'use client';
import React, { useState, useEffect } from 'react';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pharmacy routes to external partner, so we fetch encounter prescriptions
    fetch('/api/proxy/encounters?hospitalId=1')
      .then(res => res.json())
      .then(data => {
        // Mock processing for outsourced dashboard visibility
        setPrescriptions(data.data?.slice(0, 5) || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pharmacy Dashboard (Outsourced Model)</h1>
      <div className="bg-blue-50 p-4 rounded border border-blue-200 text-blue-800 mb-6">
        <p><strong>Note:</strong> Pharmacy dispensing is currently OUTSOURCED. This module serves to verify external prescriptions and route them appropriately.</p>
      </div>
      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">External Prescription Queue</h2>
        {loading ? <p>Loading prescriptions...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th className="pb-2">Encounter ID</th><th className="pb-2">Patient ID</th><th className="pb-2">Actions</th></tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? <tr><td colSpan={3} className="py-4 text-gray-500">No active prescriptions.</td></tr> :
                prescriptions.map((p: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">ENC-{p.id}</td>
                    <td className="py-2">{p.patientId}</td>
                    <td className="py-2"><button className="text-blue-500 hover:underline">Route to Partner</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
