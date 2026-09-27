import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await getSession();
    
    if (!session || !session.roles.includes('SUPER_ADMIN')) {
        redirect('/login');
    }

    return (
        <div className="p-8">
            <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
            <div className="rounded-lg border bg-white p-6 shadow-sm mb-6">
                <p className="text-gray-600 mb-4">Welcome to the super admin portal. (Shell implementation)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800">User Management</h3>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h3 className="font-semibold text-green-800">System Configuration</h3>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-purple-800">Audit Logs</h3>
                    </div>
                </div>
            </div>
            <form action="/api/auth/logout" method="POST">
                <button type="submit" className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">Logout</button>
            </form>
        </div>
    );
}
