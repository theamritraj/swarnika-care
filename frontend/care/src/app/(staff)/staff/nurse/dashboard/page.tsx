'use client';
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
