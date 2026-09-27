'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
            <p className="mb-6 text-gray-600">We could not load your data. Please try again.</p>
            <button
                onClick={() => reset()}
                className="rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
