'use client';
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
