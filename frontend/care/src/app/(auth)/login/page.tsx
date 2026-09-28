'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                setStep(2);
            } else {
                setError(data.message || 'Failed to request OTP');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                const roles = data.data?.user?.roles || [];
                if (roles.includes('SUPER_ADMIN') || roles.includes('HOSPITAL_ADMIN')) {
                    window.location.href = '/admin';
                } else if (roles.includes('DOCTOR')) {
                    window.location.href = '/doctor/dashboard';
                } else if (roles.includes('RECEPTIONIST')) {
                    window.location.href = '/staff/reception/dashboard';
                } else if (roles.includes('NURSE')) {
                    window.location.href = '/staff/nurse/dashboard';
                } else if (roles.includes('BILLING_STAFF')) {
                    window.location.href = '/staff/billing/dashboard';
                } else if (roles.includes('LAB_TECHNICIAN')) {
                    window.location.href = '/staff/lab/dashboard';
                } else if (roles.includes('PATIENT')) {
                    window.location.href = '/patient/dashboard';
                } else {
                    window.location.href = '/';
                }
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex w-full items-center justify-center p-4 pt-[80px] bg-background dark:bg-[radial-gradient(ellipse_at_top,oklch(0.18_0.02_200)_0%,oklch(0.145_0_0)_70%)]">
            <div className="w-full max-w-md rounded-2xl border border-border dark:border-white/10 bg-card p-10 shadow-2xl dark:shadow-[0_0_60px_-10px_rgba(0,123,146,0.25)]">
                <h1 className="mb-3 text-3xl font-bold text-center text-foreground">Login to Swarnika Care</h1>
                <p className="text-[14px] text-muted-foreground text-center mb-8 px-2">
                    Enter your registered email to receive an OTP.
                </p>
                
                {error && (
                    <div className="mb-6 rounded-[8px] bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 flex items-center justify-center text-center">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-[13px] font-bold text-foreground">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted-foreground/70" />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    placeholder="name@swarnikahospitals.com"
                                    className="w-full rounded-[8px] border border-border bg-background py-3.5 pl-12 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#007b92] focus:ring-1 focus:ring-[#007b92] transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !email}
                            className="w-full rounded-[8px] bg-[#007b92] py-4 text-white text-[15px] font-semibold hover:bg-[#006274] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#007b92]/20"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-[13px] font-bold text-foreground">Enter OTP</label>
                            <input 
                                type="text" 
                                required
                                placeholder="Enter 6-digit OTP"
                                className="w-full rounded-[8px] border border-border bg-background py-3.5 px-4 text-[15px] tracking-[0.2em] text-center text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#007b92] focus:ring-1 focus:ring-[#007b92] transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !otp}
                            className="w-full rounded-[8px] bg-[#007b92] py-4 text-white text-[15px] font-semibold hover:bg-[#006274] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#007b92]/20"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
