'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/proxy/api/v1/nursing/patients/my-patients', {
          // Headers handled by Next.js BFF and API Gateway
        });
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error("Failed to fetch assigned patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Nurse Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-800">My Shift</h2>
          <p className="text-blue-600 mt-2">Morning Shift (08:00 - 16:00)</p>
          <p className="text-sm text-blue-500 mt-1">Ward A / General</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
          <h2 className="text-lg font-semibold text-green-800">Assigned Patients</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{loading ? '-' : patients.length}</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 shadow-sm">
          <h2 className="text-lg font-semibold text-yellow-800">Pending Tasks</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Patients</h2>
      {loading ? (
        <p className="text-gray-500">Loading patients...</p>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No active patient assignments for your current shift.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{p.patientId}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Bed {p.bedId}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{p.admissionId}</td>
                  <td className="py-4 px-4 text-sm font-medium">
                    <Link href={`/staff/nurse/patients/${p.patientId}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      View Chart
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
