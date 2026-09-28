'use client';
import React, { useState, useEffect } from 'react';

export default function IpdDashboard() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proxy/admissions?hospitalId=1')
      .then(res => res.json())
      .then(data => {
        setAdmissions(data.data || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">IPD Ward Operations</h1>
      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Current Admissions</h2>
        {loading ? <p>Loading admissions...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th className="pb-2">Admission ID</th><th className="pb-2">Patient ID</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody>
              {admissions.length === 0 ? <tr><td colSpan={3} className="py-4 text-gray-500">No active admissions.</td></tr> :
                admissions.map((a: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">ADM-{a.id}</td>
                    <td className="py-2">{a.patientId}</td>
                    <td className="py-2 text-blue-600 font-bold">{a.status}</td>
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
