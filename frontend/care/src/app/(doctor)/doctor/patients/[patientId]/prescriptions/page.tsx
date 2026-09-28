'use client';
export default function DoctorPrescriptions({ params }: { params: { id: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Prescriptions for Patient {params.id}</h1>
            <p className="text-gray-600">Doctor can issue new prescriptions here.</p>
        </div>
    );
}