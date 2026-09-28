import os

pages = {
    "nurse/dashboard/page.tsx": """import React from 'react';

export default function NursingDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ward Dashboard (Paper-First Workflow)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Nurse Call Board</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Room/Bed</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">Request</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">101-A</td>
                <td className="py-2">John Doe</td>
                <td className="py-2">Pain Medication</td>
                <td className="py-2 text-yellow-600 font-bold">OPEN</td>
              </tr>
              <tr>
                <td className="py-2">104-B</td>
                <td className="py-2">Jane Smith</td>
                <td className="py-2">Assistance</td>
                <td className="py-2 text-green-600 font-bold">RESOLVED</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Daily Nursing Report (Batch Entry)</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient MRN / Bed</label>
              <input type="text" className="w-full border rounded p-2" placeholder="e.g. BED-104" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Actual Care Time</label>
              <input type="time" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Activity</label>
              <select className="w-full border rounded p-2">
                <option>Vitals Assessment</option>
                <option>Medication Administration</option>
                <option>Wound Care</option>
                <option>General Observation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Performed By</label>
              <input type="text" className="w-full border rounded p-2" placeholder="Nurse Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea className="w-full border rounded p-2" rows="3"></textarea>
            </div>
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Batch Entry</button>
          </form>
        </div>
      </div>
    </div>
  );
}
""",
    "ipd/dashboard/page.tsx": """import React from 'react';

export default function IpdDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">IPD Ward Operations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Current Admissions</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Admission ID</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">Bed</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">IPD-1002</td>
                <td className="py-2">Alice Wonderland</td>
                <td className="py-2">Ward A - 102</td>
                <td className="py-2 text-blue-600 font-bold">ADMITTED</td>
                <td className="py-2">
                  <button className="text-blue-500 hover:underline mr-2">Discharge</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Bed Status Map</h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 border text-center rounded bg-green-100 border-green-500">101<br/><span className="text-xs">AVAILABLE</span></div>
            <div className="p-2 border text-center rounded bg-red-100 border-red-500">102<br/><span className="text-xs">OCCUPIED</span></div>
            <div className="p-2 border text-center rounded bg-yellow-100 border-yellow-500">103<br/><span className="text-xs">MAINTENANCE</span></div>
            <div className="p-2 border text-center rounded bg-green-100 border-green-500">104<br/><span className="text-xs">AVAILABLE</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "lab/dashboard/page.tsx": """import React from 'react';

export default function LabDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Laboratory Dashboard (Internal LIS)</h1>
      
      <div className="bg-white p-6 rounded shadow border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Verifications (Pathologist Queue)</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Accession ID</th>
              <th className="pb-2">Test</th>
              <th className="pb-2">Patient</th>
              <th className="pb-2">Result Value</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">ACC-54920</td>
              <td className="py-2">Complete Blood Count</td>
              <td className="py-2">John Doe</td>
              <td className="py-2">WBC: 12.5 (High)</td>
              <td className="py-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2">Verify & Release</button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
""",
    "pharmacy/dashboard/page.tsx": """import React from 'react';

export default function PharmacyDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pharmacy Dashboard</h1>
      <div className="bg-blue-50 p-4 rounded border border-blue-200 text-blue-800 mb-6">
        <p><strong>Note:</strong> Pharmacy dispensing is currently OUTSOURCED to an external partner network per Swarnika Bloom operational model.</p>
        <p>This module only serves to verify external prescriptions and route them appropriately.</p>
      </div>

      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">External Prescription Queue</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Prescription ID</th>
              <th className="pb-2">Patient</th>
              <th className="pb-2">Doctor</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">RX-9921</td>
              <td className="py-2">John Doe</td>
              <td className="py-2">Dr. Smith</td>
              <td className="py-2 text-yellow-600 font-bold">PENDING TRANSMISSION</td>
              <td className="py-2">
                <button className="text-blue-500 hover:underline">Send to Partner</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
"""
}

base_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/frontend/care/src/app/(staff)/staff"

for path, content in pages.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
    print(f"Generated {full_path}")
