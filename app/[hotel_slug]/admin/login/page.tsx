"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { signIn, useHotelBranding, getUserProfile, resetPasswordForEmail } from "@/utils/store";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { Lock, Mail, Loader2, Hotel, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const waitForAuthSession = async (userId: string, attempts = 8) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id === userId) {
            return true;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 200));
    }

    return false;
};

function LoginContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showReset, setShowReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // Use effect to handle error from search params
    useEffect(() => {
        const errorType = searchParams.get('error');
        if (errorType === 'unauthorized') {
            setError("Your account is not linked to this hotel. If you need to register a new property, visit the registration page below.");
        }
    }, [searchParams]);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        console.log("Login attempt started for:", email);
        setLoading(true);
        setError("");

        try {

            console.log("Calling signIn utility...");
            const { data, error: authError } = await signIn(email, password);

            if (authError) {
                console.error("Auth error returned from Supabase:", authError);
                throw authError;
            }

            if (!data.user) {
                throw new Error("Login completed but no user session was returned. Please try again.");
            }

            console.log("Sign-in successful, user ID:", data.user.id);

            const sessionReady = await waitForAuthSession(data.user.id);
            if (!sessionReady) {
                throw new Error("Login session could not be established. Please try again in a moment.");
            }

            // Fetch profile to determine role-based redirection
            const { data: profile } = await getUserProfile(data.user.id);

            console.log("User profile loaded, role:", profile?.role);

            let redirectPath = `/${hotelSlug}/admin/dashboard`;
            if (profile?.role === 'kitchen') {
                redirectPath = `/${hotelSlug}/admin/kitchen`;
            } else if (profile?.role === 'housekeeping') {
                redirectPath = `/${hotelSlug}/admin/housekeeping`;
            }

            console.log("Redirecting to:", redirectPath);
            window.location.assign(redirectPath);
        } catch (err: any) {
            console.error("Catch block error during login:", err);
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setError("Please enter your email.");
            return;
        }

        setLoading(true);
        setError("");

        try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                const { error: resetError } = await resetPasswordForEmail(
                    resetEmail,
                    `${appUrl}/auth/update-password`
                );
                if (resetError) throw resetError;
            setResetSent(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-10 border border-slate-100">
                    <div className="flex flex-col items-center mb-10">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                            style={{ backgroundColor: branding?.primaryColor || "#3b82f6" }}
                        >
                            {branding?.logoImage ? (
                                <img src={branding.logoImage} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
                            ) : (
                                <Hotel className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 text-center">{branding?.name || "Hotel Admin"}</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Secure Staff Portal
                        </p>
                    </div>

                    {!isSupabaseConfigured && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-8">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Database Disconnected</p>
                                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                                        Your Vercel environment variables are missing or invalid. Check <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-8 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="name@hotel.com"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none focus:ring-blue-100"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none focus:ring-blue-100"
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReset(true)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleLogin()}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: branding?.primaryColor || "#3b82f6" }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "AUTHENTICATE"}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showReset && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 pt-8 border-t border-slate-100"
                            >
                                {resetSent ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600">Reset link sent! Please check your inbox.</p>
                                        <button
                                            onClick={() => { setShowReset(false); setResetSent(false); }}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-slate-500 text-center">Enter your email to receive a password reset link.</p>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="recovery@hotel.com"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 font-bold text-slate-900 text-sm outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowReset(false)}
                                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleResetPassword}
                                                disabled={loading}
                                                className="flex-[2] py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col items-center mt-8 space-y-4">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Authorized Personnel Only
                    </p>
                    <button
                        onClick={() => window.location.assign('/register')}
                        className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                    >
                        Register a New Property
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}
