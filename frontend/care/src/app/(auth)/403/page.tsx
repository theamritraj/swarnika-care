import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
            <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
            <Link href="/" className="text-blue-600 hover:underline">
                Return to Home
            </Link>
        </div>
    );
}
