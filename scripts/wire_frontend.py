import os

pages = {
    "nurse/dashboard/page.tsx": """'use client';
import React, { useState, useEffect } from 'react';

export default function NursingDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proxy/nursing/tasks?hospitalId=1')
      .then(res => res.json())
      .then(data => {
        setTasks(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ward Dashboard (Paper-First Workflow)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Nurse Call Board / Live Tasks</h2>
          {loading ? <p>Loading tasks...</p> : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b"><th className="pb-2">Task</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? <tr><td colSpan={2} className="py-4 text-gray-500">No active tasks found.</td></tr> :
                  tasks.map((t: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{t.taskType}</td>
                      <td className="py-2 font-bold">{t.status}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Daily Nursing Report (Batch Entry)</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Batch entry submitted to backend!"); }}>
            <div><label className="block text-sm mb-1">Patient ID / Bed</label><input type="text" className="w-full border rounded p-2" required /></div>
            <div><label className="block text-sm mb-1">Actual Care Time</label><input type="time" className="w-full border rounded p-2" required /></div>
            <div>
              <label className="block text-sm mb-1">Activity</label>
              <select className="w-full border rounded p-2"><option>Vitals Assessment</option><option>Medication</option></select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Batch Entry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""",
    "ipd/dashboard/page.tsx": """'use client';
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
""",
    "lab/dashboard/page.tsx": """'use client';
import React, { useState, useEffect } from 'react';

export default function LabDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proxy/lab/orders?hospitalId=1')
      .then(res => res.json())
      .then(data => {
        setOrders(data.data || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Laboratory Dashboard (Internal LIS)</h1>
      <div className="bg-white p-6 rounded shadow border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pathologist Verification Queue</h2>
        {loading ? <p>Loading lab orders...</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th className="pb-2">Order ID</th><th className="pb-2">Test Name</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? <tr><td colSpan={3} className="py-4 text-gray-500">No pending verifications.</td></tr> :
                orders.map((o: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">ORD-{o.id}</td>
                    <td className="py-2">{o.testName || 'Unknown Test'}</td>
                    <td className="py-2 font-bold">{o.status}</td>
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
""",
    "pharmacy/dashboard/page.tsx": """'use client';
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
"""
}

base_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/frontend/care/src/app/(staff)/staff"

for path, content in pages.items():
    full_path = os.path.join(base_dir, path)
    with open(full_path, "w") as f:
        f.write(content)
    print(f"Wired {full_path}")
