"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, supabase } from "@/utils/store";
import { Save, Image as ImageIcon, CheckCircle, AlertCircle, Type, Palette, Smartphone } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandingSettingsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);

    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        logoImage: "",
        primaryColor: "#3C2A21", // Coffee Brown default
        accentColor: "#8B4513", // Warm Wood default
        bgPattern: "",
        guestTheme: "CAFE" as "CAFE" | "FINE_DINE"
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (branding) {
            setFormData({
                name: branding.name || "",
                logo: branding.logo || "",
                logoImage: branding.logoImage || "",
                primaryColor: branding.primaryColor || "#2563eb",
                accentColor: branding.accentColor || "#4f46e5",
                bgPattern: branding.bgPattern || "",
                guestTheme: (branding.guestTheme as any) || "CAFE"
            });
        }
    }, [branding]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from("hotels")
                .update({ 
                    name: formData.name,
                    logo: formData.logo,
                    logo_image: formData.logoImage,
                    primary_color: formData.primaryColor,
                    accent_color: formData.accentColor,
                    bg_pattern: formData.bgPattern,
                    guest_theme: formData.guestTheme
                })
                .eq("id", branding.id);

            if (error) throw error;

            setMessage({ type: "success", text: "Branding settings updated successfully!" });
        } catch (error: any) {
            console.error("Error saving branding settings:", error);
            setMessage({ type: "error", text: `Failed to save settings: ${error.message || 'Unknown error'}` });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 pb-20">
            <header>
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Identity & Style</p>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                    Property <span className="text-indigo-600">Branding</span>
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Configure your digital presence and guest touchpoints</p>
            </header>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-[2rem] border flex items-center shadow-xl ${
                            message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                        }`}
                    >
                        {message.type === "success" ? <CheckCircle className="w-6 h-6 mr-4" /> : <AlertCircle className="w-6 h-6 mr-4" />}
                        <span className="font-black text-xs uppercase tracking-widest">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Basic Identity */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Type className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Core Identity</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Property Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="e.g. Grand Plaza Hotel"
                                />
                            </div>
                        </div>
                    </section>
                    
                    {/* Theme Experience Selector */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-2xl">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Experience Theme</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'CAFE', name: 'Modern Café', desc: 'Cozy, Coffee-driven vibe', colors: ['#3C2A21', '#EADBC8'] },
                                { id: 'FINE_DINE', name: 'Fine Dining', desc: 'Minimalist, Luxury, Elite', colors: ['#1A1A1A', '#C5A059'] }
                            ].map((theme) => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, guestTheme: theme.id as any})}
                                    className={`relative p-5 rounded-3xl border-2 text-left transition-all group overflow-hidden ${
                                        formData.guestTheme === theme.id 
                                            ? "border-indigo-600 bg-indigo-50/30" 
                                            : "border-slate-50 hover:border-slate-200 bg-slate-50/50"
                                    }`}
                                >
                                    <div className="flex space-x-1 mb-3">
                                        {theme.colors.map(c => (
                                            <div key={c} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${formData.guestTheme === theme.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                                        {theme.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 leading-tight">
                                        {theme.desc}
                                    </p>
                                    
                                    {formData.guestTheme === theme.id && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Visual Assets */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Visual Assets</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Interface Logo (URL)</label>
                                <input
                                    type="url"
                                    value={formData.logo}
                                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="https://link-to-small-logo.png"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Welcome Branding Image (URL)</label>
                                <input
                                    type="url"
                                    value={formData.logoImage}
                                    onChange={(e) => setFormData({...formData, logoImage: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="https://link-to-large-hero-branding.png"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Homepage Hero Image (URL)</label>
                                
                                {/* AI Presets Gallery */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[
                                        { id: 'default', name: 'Premium Luxury', url: '/images/branding/hero.png' },
                                        { id: 'cafe', name: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000' },
                                        { id: 'fine', name: 'Fine Dining', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000' },
                                        { id: 'modern', name: 'Modern Vibe', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000' }
                                    ].map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setFormData({...formData, bgPattern: preset.url})}
                                            className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${
                                                formData.bgPattern === preset.url ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                        >
                                            <img src={getDirectImageUrl(preset.url)} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{preset.name}</span>
                                            </div>
                                            {formData.bgPattern === preset.url && (
                                                <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="url"
                                    value={formData.bgPattern}
                                    onChange={(e) => setFormData({...formData, bgPattern: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="Or paste custom image URL here..."
                                />
                                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">
                                    Select a preset or paste a link. This image appears as the background for your guest dashboard.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Color Palette */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Palette className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Color Palette</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Primary Color</label>
                                <div className="flex space-x-4">
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                                        className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Accent Color</label>
                                <div className="flex space-x-4">
                                    <input
                                        type="color"
                                        value={formData.accentColor}
                                        onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
                                        className="w-16 h-16 rounded-2xl cursor-pointer border-none bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={formData.accentColor}
                                        onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
                                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900 font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-4"
                    >
                        {isSaving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <><Save className="w-6 h-6" /> <span>Apply System Branding</span></>
                        )}
                    </button>
                </div>

                {/* Live Preview Panel */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guest Experience View</h2>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50 flex items-center">
                                <Smartphone className="w-3 h-3 mr-2" /> Live Perspective
                            </span>
                        </div>

                        <div 
                            className="aspect-[9/16] rounded-[3rem] shadow-2xl relative overflow-hidden border-[8px] border-slate-900"
                            style={{ 
                                backgroundColor: formData.primaryColor,
                                backgroundImage: formData.bgPattern ? `url(${getDirectImageUrl(formData.bgPattern)})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />

                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl p-4 mb-8 border border-white/20 shadow-2xl">
                                    {formData.logoImage || formData.logo ? (
                                        <img src={getDirectImageUrl(formData.logoImage || formData.logo)} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 rounded-xl animate-pulse" />
                                    )}
                                </div>
                                <h3 className="text-white font-serif text-3xl font-black mb-1 drop-shadow-lg">Welcome to</h3>
                                <h4 className="text-4xl font-serif font-black mb-8 drop-shadow-xl" style={{ color: formData.accentColor }}>
                                    {formData.name || "Your Property"}
                                </h4>

                                <div className="w-full space-y-3">
                                    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-left">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl mb-4" />
                                        <div className="h-4 bg-white/30 rounded-full w-24 mb-2" />
                                        <div className="h-2 bg-white/10 rounded-full w-32" />
                                    </div>
                                    <div className="w-full bg-white p-4 rounded-2xl text-left flex items-center">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl mr-4" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-200 rounded-full w-20 mb-2" />
                                            <div className="h-2 bg-slate-100 rounded-full w-28" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Implementation Note</p>
                            <p className="text-[10px] font-bold text-amber-600 leading-relaxed uppercase">
                                Changes applied here propagate instantly to the Guest Dashboard, Welcome Screens, and Admin Portals globally.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`border-2 border-white/30 border-t-white rounded-full ${className}`} 
    />;
}
