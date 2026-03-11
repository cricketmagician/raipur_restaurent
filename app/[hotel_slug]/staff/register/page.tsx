"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Lock, User, Loader2, Check, ArrowRight, Hotel, Shield } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useHotelBranding } from "@/utils/store";

export default function StaffRegisterPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!branding?.id) throw new Error("Hotel not identified. Please use a valid registration link.");

            // 1. Sign Up the Staff User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Failed to create user account.");

            // 2. Create the Profile link with 'staff' role
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        user_id: authData.user.id,
                        hotel_id: branding.id,
                        full_name: formData.full_name,
                        role: 'staff' // Default role
                    }
                ]);

            if (profileError) throw profileError;

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${hotelSlug}/admin/login`);
            }, 3000);

        } catch (err: any) {
            console.error("Staff Registration Error:", err);
            setError(err.message || "Failed to register. Please try again.");
            setLoading(false);
        }
    };

    if (brandingLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white"
                        style={{ backgroundColor: branding?.primaryColor || "#3b82f6" }}
                    >
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join {branding?.name || "The Team"}</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 flex items-center justify-center">
                        <Shield className="w-3 h-3 mr-1" /> Staff Onboarding Portal
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Aboard!</h2>
                                <p className="text-slate-500 font-medium">Account created successfully. Redirecting you to login...</p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="email"
                                            placeholder="staff@hotel.com"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-[1.5rem] text-white font-black text-sm flex items-center justify-center group shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    style={{ backgroundColor: branding?.primaryColor || "#3b82f6" }}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>Complete Onboarding <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Authorized Staff Registration for {branding?.name}
                </p>
            </div>
        </div>
    );
}
