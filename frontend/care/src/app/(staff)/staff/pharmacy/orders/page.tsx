'use client';
import { useEffect, useState } from 'react';

export default function PharmacyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safe backend fetching pattern via Proxy
        // fetch('/api/proxy/pharmacy/orders?hospitalId=1')
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handleDispense = async (orderId: number, medicineId: number, qty: number, patientId: number) => {
        if (!confirm('Dispense this medication?')) return;
        try {
            const res = await fetch(`/api/proxy/pharmacy/orders/${orderId}/dispense?hospitalId=1`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineId, quantity: qty, patientId })
            });
            if (res.ok) alert('Successfully dispensed. Billing charge generated.');
            else alert('Failed to dispense (Check stock).');
        } catch (e) { alert('Error connecting to backend.'); }
    };

    if (loading) return <div className="p-4">Loading Pharmacy Orders...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Pharmacy Orders</h1>
            <p className="text-gray-600 mb-4">List of verified prescriptions awaiting dispensing.</p>
            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Order #</th>
                        <th className="border p-2">Medicine ID</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border p-2 text-center">1001</td>
                        <td className="border p-2 text-center">1</td>
                        <td className="border p-2 text-center">10</td>
                        <td className="border p-2 text-center">
                            <button onClick={() => handleDispense(1001, 1, 10, 500)} className="bg-green-600 text-white px-3 py-1 rounded">Dispense</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}