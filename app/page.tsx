"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Star, ShieldCheck, Zap, Check, Smile, Users, ArrowUpRight, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function LandingPage() {
    const router = useRouter();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                // First check if supabase is even configured
                const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                   process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co');
                
                if (!isConfigured) {
                    console.warn("Supabase not configured, showing placeholders");
                    throw new Error("unconfigured");
                }

                const { data, error } = await supabase.from('hotels').select('*').order('name');
                if (error) throw error;
                
                if (data && data.length > 0) {
                    setHotels(data);
                } else {
                    console.log("Supabase connected but 'hotels' table is empty.");
                    setHotels([]); // Show empty state, not placeholders
                }
            } catch (err) {
                console.error("Home Page Fetch Error:", err);
                // Only show placeholders if fundamentally unconfigured
                setHotels([
                    { id: '1', name: 'The Golden Saffron', slug: 'golden-saffron', logo_image: null },
                    { id: '2', name: 'Bistro 21', slug: 'bistro-21', logo_image: null },
                    { id: '3', name: 'Crostini & Co', slug: 'crostini-co', logo_image: null }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    const scrollToProperties = () => {
        document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--primary-color)] selection:bg-[#C58B2A]/20 selection:text-[#0F1B2D] font-sans overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C58B2A]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0F1B2D]/5 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#D94F33] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D94F33]/20 transform hover:rotate-12 transition-transform duration-500">
                        <Utensils className="text-white w-7 h-7" />
                    </div>
                    <span className="text-2xl font-serif font-black tracking-tight italic">Chilli<span className="text-[#D94F33] not-italic">form</span></span>
                </div>
                <div className="hidden md:flex items-center space-x-10 text-[11px] font-black text-[var(--primary-color)] uppercase tracking-[0.2em]">
                    <a href="#properties" className="hover:text-[#C58B2A] transition-colors relative group">
                        Properties
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C58B2A] group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="#features" className="hover:text-[#C58B2A] transition-colors relative group">
                        Experience
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C58B2A] group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="#pricing" className="hover:text-[#C58B2A] transition-colors relative group">
                        Pricing
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C58B2A] group-hover:w-full transition-all duration-300"></span>
                    </a>
                </div>
                <button
                    onClick={() => router.push('/register')}
                    className="bg-[#D94F33] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-2xl shadow-[#D94F33]/20"
                >
                    Add Your Restaurant
                </button>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-24 pb-40">
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-5xl"
                    >
                        <div className="inline-flex items-center space-x-2 bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/10 text-[var(--primary-color)] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-sm">
                            <Zap className="w-3.5 h-3.5 text-[#C58B2A]" />
                            <span>v2.0 Scale Release</span>
                        </div>

                        <h1 className="text-6xl md:text-[9.5rem] font-serif font-black tracking-tighter leading-[0.85] mb-12 transform-gpu">
                            Future of Digital <br />
                            <span className="text-[#D94F33]">Dining.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                            The AI-Powered Management Platform for Modern Restaurants. Automate table service, streamline kitchen workflows, and delight your guests effortlessly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
                            <button
                                onClick={() => router.push('/register')}
                                className="group bg-[var(--primary-color)] text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-[#0F1B2D]/30 hover:bg-black transition-all active:scale-95 flex items-center"
                            >
                                Start Free Trial <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                            </button>
                            <button
                                onClick={scrollToProperties}
                                className="text-[var(--primary-color)] px-10 py-6 rounded-[2.5rem] font-black text-xl hover:bg-white hover:shadow-xl transition-all active:scale-95 border-2 border-transparent hover:border-[var(--primary-color)]/5"
                            >
                                View Live Demo
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Authority Layer */}
            <section className="bg-white py-24 border-y border-[var(--primary-color)]/5">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mb-16">Trusted by World-Class Dining Groups</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        {['NOBU', 'WAGAMAMA', 'CHIPOTLE', 'STARBUCKS', 'DIN TAI FUNG', 'ZUMA'].map(brand => (
                            <div key={brand} className="font-serif font-black text-xl md:text-3xl tracking-tighter">{brand}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Properties Grid */}
            <section id="properties" className="py-32 max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-sm font-black text-[#D94F33] uppercase tracking-[0.3em] mb-6">Top Restaurants</h2>
                        <h3 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-none text-[var(--primary-color)]">
                            Powering Premium <br /> Dining Globally.
                        </h3>
                    </div>
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-14 h-14 rounded-full border-4 border-[var(--background)] bg-slate-200 overflow-hidden shadow-xl">
                                <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Guest" />
                            </div>
                        ))}
                        <div className="w-14 h-14 rounded-full border-4 border-[var(--background)] bg-[#C58B2A] text-white flex items-center justify-center text-xs font-black shadow-xl">
                            +2k
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {hotels.length > 0 ? (
                            hotels.map((hotel) => (
                                <motion.button
                                    variants={item}
                                    key={hotel.id}
                                    onClick={() => router.push(`/${hotel.slug}/guest/dashboard`)}
                                    className="group bg-white p-8 rounded-[3rem] transition-all text-left shadow-2xl shadow-[#0F1B2D]/5 hover:shadow-[#0F1B2D]/10 hover:-translate-y-2 border border-transparent hover:border-[#C58B2A]/20 flex flex-col h-[320px]"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--background)] flex items-center justify-center mb-8 border border-[var(--primary-color)]/5 overflow-hidden">
                                        {hotel.logo_image ? (
                                            <img src={hotel.logo_image} alt={hotel.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-[#C58B2A]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-3xl font-serif font-black mb-3 text-[var(--primary-color)]">{hotel.name}</h4>
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-[#C58B2A] fill-[#C58B2A]" />)}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Luxury Collection</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-[#C58B2A] font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Enter Dashboard <ArrowUpRight className="ml-2 w-4 h-4" />
                                    </div>
                                </motion.button>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-slate-900 mb-2">No properties found</h4>
                                <p className="text-slate-500 max-w-sm mx-auto">Please add your first restaurant from the admin panel or check your database connection.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Database Connectivity Diagnostic (Small & Subtle) */}
                <div className="mt-20 flex justify-center">
                    <div className="inline-flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span>System Status: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Live Data Enabled' : 'Placeholder Mode (Check Vercel ENV)'}</span>
                    </div>
                </div>
            </section>

            {/* Features / Product Psychology */}
            <section id="features" className="py-32 bg-[var(--primary-color)] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C58B2A]/10 rounded-full blur-[150px] -mr-80 -mt-80" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h2 className="text-sm font-black text-[#C58B2A] uppercase tracking-[0.3em] mb-8">Product Experience</h2>
                            <h3 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9] mb-12">
                                Seamless Flow. <br /> Effortless Control.
                            </h3>
                            <div className="space-y-12">
                                {[
                                    { icon: <Zap />, title: "Instant Feedback", desc: "Guest requests reach your team in < 200ms. No waiting, no friction." },
                                    { icon: <Smile />, title: "Cognitive Fluency", desc: "An interface designed for zero effort. If it's easy to use, it's used more." },
                                    { icon: <Users />, title: "Staff Habit Loop", desc: "Reward mechanisms that encourage staff to resolve requests faster." }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start space-x-6">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#C58B2A] shrink-0 border border-white/10">
                                            {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-7 h-7" })}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black mb-2">{feature.title}</h4>
                                            <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-[#1a283dbb] backdrop-blur-3xl rounded-[3rem] p-12 border border-white/5 shadow-2xl relative">
                                <div className="absolute top-8 left-8 flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="mt-8 space-y-6">
                                    <div className="h-12 bg-white/5 rounded-2xl animate-pulse" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
                                        <div className="h-40 bg-[#C58B2A]/20 rounded-3xl" />
                                    </div>
                                    <div className="h-32 bg-white/5 rounded-3xl animate-pulse" />
                                </div>
                                <div className="absolute -bottom-12 -right-12 bg-[#C58B2A] p-8 rounded-[2.5rem] shadow-2xl rotate-6 hover:rotate-0 transition-transform hidden md:block">
                                    <div className="flex items-center space-x-4 text-white">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Smile className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success</p>
                                            <p className="text-lg font-black italic">Guest Satisfied!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-40 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-sm font-black text-[#C58B2A] uppercase tracking-[0.3em] mb-6">Pricing</h2>
                        <h3 className="text-5xl md:text-8xl font-serif font-black tracking-tighter text-[var(--primary-color)]">Invest in Perfection.</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-stretch">
                        {[
                            {
                                name: "Starter",
                                price: "3,999",
                                desc: "For boutique hospitality",
                                features: ["Up to 50 rooms", "Base Guest Experience", "Email Concierge", "Analytics Lite"],
                                accent: false
                            },
                            {
                                name: "Professional",
                                price: "8,999",
                                desc: "The Gold Standard",
                                features: ["Unlimited rooms", "Full AI Automation", "Custom Branding", "Priority Support", "Staff Habit Engine"],
                                accent: true,
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                desc: "Global Hotel Chains",
                                features: ["Multi-property Sync", "White-label Option", "Direct Integration", "Dedicated Account Mgr", "SOC2 Compliance"],
                                accent: false
                            }
                        ].map((pkg, i) => (
                            <motion.div
                                key={pkg.name}
                                whileHover={{ y: -10 }}
                                className={`rounded-[3rem] p-12 border relative flex flex-col ${pkg.accent ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'bg-[var(--background)] border-[var(--primary-color)]/5'}`}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 right-12 -translate-y-1/2 bg-[#C58B2A] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-12">
                                    <h4 className={`text-2xl font-black mb-2 ${pkg.accent ? 'text-[#C58B2A]' : 'text-[var(--primary-color)]'}`}>{pkg.name}</h4>
                                    <p className={`font-medium ${pkg.accent ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{pkg.desc}</p>
                                </div>
                                <div className="mb-12">
                                    <div className="flex items-baseline">
                                        {pkg.price !== "Custom" && <span className="text-2xl font-serif font-black mr-1 italic">₹</span>}
                                        <span className="text-7xl font-serif font-black tracking-tighter">{pkg.price}</span>
                                        {pkg.price !== "Custom" && <span className={`ml-2 font-black text-xs uppercase opacity-40`}>/mo</span>}
                                    </div>
                                </div>
                                <ul className="space-y-6 mb-16 flex-1">
                                    {pkg.features.map(feat => (
                                        <li key={feat} className="flex items-center space-x-4 text-sm font-bold">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${pkg.accent ? 'bg-[#C58B2A] text-white' : 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className={pkg.accent ? 'text-slate-200' : 'text-slate-600'}>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => router.push('/register')}
                                    className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${pkg.accent ? 'bg-[#C58B2A] text-white hover:bg-[#d49a37] shadow-xl shadow-[#C58B2A]/20' : 'bg-[var(--primary-color)] text-white hover:bg-black shadow-xl shadow-[#0F1B2D]/10'}`}
                                >
                                    Choose {pkg.name}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 bg-[var(--background)]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-black text-[#C58B2A] uppercase tracking-[0.4em] mb-8">Take the Leap</h2>
                        <h3 className="text-6xl md:text-[9rem] font-serif font-black tracking-tighter text-[var(--primary-color)] leading-none mb-16">
                            Ready for the <br /> <span className="italic">Standard?</span>
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
                            <button
                                onClick={() => router.push('/register')}
                                className="group bg-[var(--primary-color)] text-white px-16 py-8 rounded-[3rem] font-black text-2xl shadow-2xl shadow-[#0F1B2D]/30 hover:bg-black transition-all active:scale-95 flex items-center"
                            >
                                Get Started Now <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-3 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 bg-white border-t border-[var(--primary-color)]/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center space-x-3">
                        <Utensils className="text-[#D94F33] w-8 h-8" />
                        <span className="text-xl font-serif font-black italic">Chilli<span className="text-[#D94F33] not-italic">form</span></span>
                    </div>
                    <div className="flex items-center space-x-12 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                        <a href="#" className="hover:text-[#C58B2A] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[#C58B2A] transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-[#C58B2A] transition-colors">Instagram</a>
                    </div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">© 2026 Chilliform Labs</p>
                </div>
            </footer>
        </div>
    );
}
