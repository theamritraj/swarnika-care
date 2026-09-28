'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NurseVitals() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patientId: '',
    admissionId: '',
    temperature: '',
    pulse: '',
    respiratoryRate: '',
    systolicBp: '',
    diastolicBp: '',
    oxygenSaturation: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/proxy/api/v1/nursing/patients/${formData.patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admissionId: Number(formData.admissionId),
          unitId: 1, // Example mock unit ID
          temperature: formData.temperature ? Number(formData.temperature) : null,
          pulse: formData.pulse ? Number(formData.pulse) : null,
          respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : null,
          systolicBp: formData.systolicBp ? Number(formData.systolicBp) : null,
          diastolicBp: formData.diastolicBp ? Number(formData.diastolicBp) : null,
          oxygenSaturation: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : null,
          notes: formData.notes
        })
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          patientId: '', admissionId: '', temperature: '', pulse: '', respiratoryRate: '',
          systolicBp: '', diastolicBp: '', oxygenSaturation: '', notes: ''
        });
      } else {
        setError('Failed to record vitals. Please check patient assignment and try again.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Record Patient Vitals</h1>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-6">
          Vitals recorded successfully!
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
            <input required type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission ID *</label>
            <input required type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.admissionId} onChange={e => setFormData({...formData, admissionId: e.target.value})} />
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Clinical Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
            <input type="number" step="0.1" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pulse (bpm)</label>
            <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.pulse} onChange={e => setFormData({...formData, pulse: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
            <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.oxygenSaturation} onChange={e => setFormData({...formData, oxygenSaturation: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
            <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.systolicBp} onChange={e => setFormData({...formData, systolicBp: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
            <input type="number" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
              value={formData.diastolicBp} onChange={e => setFormData({...formData, diastolicBp: e.target.value})} />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nursing Notes</label>
          <textarea rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" 
            value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </form>
    </div>
  );
}
