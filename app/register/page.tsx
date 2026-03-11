"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowRight, Check, Loader2, Sparkles, Layout, Palette, Globe, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterHotelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        primary_color: "#2563eb",
        accent_color: "#4f46e5",
        email: "",
        password: "",
        full_name: "",
    });

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        setFormData({ ...formData, slug: value });
    };

    const nextStep = () => {
        if (step === 1 && !formData.name) return setError("Hotel name is required");
        if (step === 2 && !formData.slug) return setError("URL slug is required");
        if (step === 4) {
            if (!formData.email) return setError("Email is required");
            if (!formData.password || formData.password.length < 6) return setError("Password must be at least 6 characters");
            if (!formData.full_name) return setError("Full name is required");
        }
        setError("");
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            // Check if Supabase is connected (not using placeholders)
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const isPlaceholder = supabaseUrl.includes("your-project-id") || !supabaseUrl;

            if (isPlaceholder) {
                // Mock success for demo purposes if Supabase is not configured
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log("Supabase not configured, using mock success for demo.", formData);
                router.push(`/${formData.slug}/admin/dashboard`);
                return;
            }

            // 1. Sign Up the User
            let { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                    }
                }
            });

            // If user already exists, try to sign them in instead to complete database setup
            if (authError && authError.message.includes("already registered")) {
                console.log("User already registered, attempting sign in to complete hotel setup...");
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (signInError) {
                    if (signInError.message.includes("Invalid login credentials")) {
                        throw new Error("This email is already registered. Please use the correct password for this account to continue registration.");
                    }
                    throw signInError;
                }
                authData = signInData;
            } else if (authError) {
                throw authError;
            }

            if (!authData.user) throw new Error("Failed to authenticate user");

            // Check if we have a session (if not, email confirmation might be on)
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
                throw new Error("Email not confirmed. Please check your inbox or disable 'Confirm email' in Supabase Auth settings to enable automatic login.");
            }

            // 2. Insert the Hotel
            const { data: hotelData, error: hotelError } = await supabase
                .from('hotels')
                .insert([
                    {
                        name: formData.name,
                        slug: formData.slug,
                        primary_color: formData.primary_color,
                        accent_color: formData.accent_color,
                        logo: formData.name.charAt(0).toUpperCase()
                    }
                ])
                .select()
                .single();

            if (hotelError) {
                if (hotelError.code === '23505') {
                    throw new Error("This URL slug is already taken. Try another one.");
                }
                throw hotelError;
            }

            // 3. Create the Profile link
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        user_id: authData.user.id,
                        hotel_id: hotelData.id,
                        full_name: formData.full_name,
                        role: 'admin'
                    }
                ]);

            if (profileError) throw profileError;

            // Success redirect to admin
            router.push(`/${formData.slug}/admin/dashboard`);
        } catch (err: any) {
            console.error("Full Registration Error:", err);

            let message = "Unknown Error";
            if (err.message) message = err.message;
            else if (err.error_description) message = err.error_description;
            else if (typeof err === 'string') message = err;
            else message = JSON.stringify(err);

            if (message === "{}" || message === "null" || !message) {
                message = "Empty error response from Supabase. (Possible causes: Table not found, RLS policy violation, or Service unavailable)";
            }

            if (message.includes("Failed to fetch")) {
                setError("Network Error: Could not reach Supabase. Please ensure your .env.local contains the correct URL and Anon Key, and restart the dev server.");
            } else if (message.includes("Email not confirmed")) {
                setError("Success! Account created, but email confirmation is required. Please check your inbox or disable 'Confirm email' in Supabase Auth settings.");
            } else {
                setError(`Registration Failed: ${message}`);
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-blue-100 selection:text-blue-900">
            <div className="max-w-xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200"
                    >
                        <Building2 className="text-white w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Register Your Property</h1>
                    <p className="text-slate-500 font-medium">Launch your mobile guest experience in seconds.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border-2 border-slate-200"
                                }`}
                        >
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                        <Building2 className="w-3 h-3 mr-2" /> Hotel Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. The Grand Royale"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] px-6 py-5 text-xl font-bold transition-all outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={nextStep}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center group hover:bg-black transition-all active:scale-95"
                                >
                                    Continue <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                        <Globe className="w-3 h-3 mr-2" /> URL Slug
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">/</span>
                                        <input
                                            type="text"
                                            placeholder="grand-royale"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[1.5rem] pl-10 pr-6 py-5 text-xl font-bold transition-all outline-none"
                                            value={formData.slug}
                                            onChange={handleSlugChange}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-4 font-medium uppercase tracking-wider">Example: yourdomain.com/{formData.slug || 'your-slug'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-bold"
                                    > Back </button>
                                    <button
                                        onClick={nextStep}
                                        className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center group hover:bg-black transition-all active:scale-95"
                                    >
                                        Next <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                            <Palette className="w-3 h-3 mr-2" /> Brand Color
                                        </label>
                                        <div className="relative h-20 bg-slate-50 rounded-3xl p-2 flex items-center cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="color"
                                                className="w-12 h-12 rounded-2xl border-0 p-0 overflow-hidden cursor-pointer"
                                                value={formData.primary_color}
                                                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                            />
                                            <span className="ml-3 font-bold text-slate-600">{formData.primary_color}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                            <Sparkles className="w-3 h-3 mr-2" /> Accent
                                        </label>
                                        <div className="relative h-20 bg-slate-50 rounded-3xl p-2 flex items-center cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="color"
                                                className="w-12 h-12 rounded-2xl border-0 p-0 overflow-hidden cursor-pointer"
                                                value={formData.accent_color}
                                                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                                            />
                                            <span className="ml-3 font-bold text-slate-600">{formData.accent_color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg" style={{ backgroundColor: formData.primary_color }}>
                                        {formData.name.charAt(0) || <Layout className="w-6 h-6" />}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="font-black text-slate-900 tracking-tight">{formData.name || 'Your Hotel'}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest" style={{ color: formData.accent_color }}>Branding Preview</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-bold"
                                    > Back </button>
                                    <button
                                        onClick={nextStep}
                                        className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center group hover:bg-black transition-all active:scale-95"
                                    >
                                        Create Account <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                            <User className="w-3 h-3 mr-2" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 font-bold transition-all outline-none"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                            <Mail className="w-3 h-3 mr-2" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 font-bold transition-all outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center">
                                            <Lock className="w-3 h-3 mr-2" /> Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 font-bold transition-all outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold"
                                    > Back </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Free Trial"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-bold text-center mt-6 uppercase tracking-widest"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>

                {/* Footer Link */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => router.push('/')}
                        className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
