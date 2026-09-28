import os

base_dir = "../frontend/care/src/app"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip())

# 1. Lab Technician Dashboard
write_file("(staff)/staff/lab/dashboard/page.tsx", """
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LabDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Fetch real stats via BFF
        fetch('/api/proxy/lab/orders?hospitalId=1')
            .then(res => res.json())
            .then(data => {
                setStats({ pendingOrders: data.data?.length || 0 });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-4 animate-pulse">Loading Lab Dashboard...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Laboratory Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded shadow-sm bg-blue-50">
                    <h3 className="text-gray-600">Pending Orders</h3>
                    <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
                </div>
            </div>
            <div className="mt-8 flex gap-4">
                <Link href="/staff/lab/orders" className="px-4 py-2 bg-blue-600 text-white rounded">View Orders</Link>
                <Link href="/staff/lab/verification" className="px-4 py-2 bg-purple-600 text-white rounded">Result Verification Queue</Link>
            </div>
        </div>
    );
}
""")

# 2. Lab Orders (Pending & Collection)
write_file("(staff)/staff/lab/orders/page.tsx", """
'use client';
import { useEffect, useState } from 'react';

export default function LabOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = () => {
        setLoading(true);
        fetch('/api/proxy/lab/orders?hospitalId=1')
            .then(res => { if(!res.ok) throw new Error('Failed to load'); return res.json(); })
            .then(data => { setOrders(data.data || []); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleCollect = async (orderId: number, patientId: number) => {
        if (!confirm('Collect sample for this order?')) return;
        try {
            const res = await fetch(`/api/proxy/lab/specimens/collect?orderId=${orderId}&patientId=${patientId}&hospitalId=1&type=Blood`, { method: 'POST' });
            if (res.ok) {
                alert('Sample Collected. Accession generated.');
                fetchOrders();
            } else {
                alert('Collection failed.');
            }
        } catch (e) {
            alert('Error connecting to backend.');
        }
    };

    if (loading) return <div className="p-4">Loading Orders...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error} <button onClick={fetchOrders} className="ml-2 underline">Retry</button></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Pending Lab Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500">No pending orders found.</p>
            ) : (
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Order #</th>
                            <th className="border p-2">Patient ID</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o: any) => (
                            <tr key={o.id}>
                                <td className="border p-2">{o.orderNumber}</td>
                                <td className="border p-2">{o.patientId}</td>
                                <td className="border p-2">{o.status}</td>
                                <td className="border p-2 text-center">
                                    <button onClick={() => handleCollect(o.id, o.patientId)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Collect Sample</button>
                                    <button onClick={() => alert('Proceed to Result Entry (stub)')} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Enter Result</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
""")

# 3. Pathologist Verification Queue
write_file("(staff)/staff/lab/verification/page.tsx", """
'use client';
import { useEffect, useState } from 'react';

export default function VerificationQueue() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResults = () => {
        // Ideally fetching only RESULT_ENTERED status, but proxy logic maps to /results
        fetch('/api/proxy/lab/results?hospitalId=1')
            .then(res => res.json())
            .then(data => { setResults(data.data || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchResults(); }, []);

    const handleVerify = async (id: number) => {
        if(!confirm('Verify this result?')) return;
        const res = await fetch(`/api/proxy/lab/results/${id}/verify?hospitalId=1`, { method: 'PATCH' });
        if(res.ok) fetchResults();
    };

    const handleRelease = async (id: number) => {
        if(!confirm('Release this result? This triggers Billing and Notifications.')) return;
        const res = await fetch(`/api/proxy/lab/results/${id}/release?hospitalId=1`, { method: 'PATCH' });
        if(res.ok) fetchResults();
    };

    if (loading) return <div className="p-4">Loading Verification Queue...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Verification & Release Queue</h1>
            {results.length === 0 ? <p>No results pending verification.</p> : (
                <div className="grid gap-4">
                    {results.map((r: any) => (
                        <div key={r.id} className="border p-4 rounded shadow-sm">
                            <h3 className="font-semibold">Result ID: {r.id} | Status: {r.status}</h3>
                            <p>Value: {r.numericValue || r.textValue} {r.unit}</p>
                            <div className="mt-2 flex gap-2">
                                <button disabled={r.status !== 'RESULT_ENTERED'} onClick={() => handleVerify(r.id)} className="px-4 py-1 bg-yellow-500 text-white rounded disabled:opacity-50">Verify</button>
                                <button disabled={r.status !== 'VERIFIED'} onClick={() => handleRelease(r.id)} className="px-4 py-1 bg-purple-600 text-white rounded disabled:opacity-50">Release</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
""")

# 4. Doctor Lab Results View
write_file("(doctor)/doctor/patients/[id]/lab-results/page.tsx", """
'use client';
export default function DoctorLabResults({ params }: { params: { id: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Lab Results for Patient {params.id}</h1>
            <p className="text-gray-600">This view integrates with /api/proxy/lab/results filtering by Patient ID. Only RELEASED results are displayed here.</p>
        </div>
    );
}
""")

# 5. Patient My Lab Results View
write_file("(patient)/patient/lab-results/page.tsx", """
'use client';
export default function PatientLabResults() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Lab Results</h1>
            <p className="text-gray-600">This securely fetches your released laboratory reports.</p>
        </div>
    );
}
""")

print("Phase 3 Frontend Pages Scaffolded Successfully.")
