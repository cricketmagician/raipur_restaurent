"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, supabase } from "@/utils/store";
import { Save, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandingSettingsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);

    const [bgPatternUrl, setBgPatternUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (branding?.bgPattern) {
            setBgPatternUrl(branding.bgPattern);
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
                .update({ bg_pattern: bgPatternUrl })
                .eq("id", branding.id);

            if (error) throw error;

            setMessage({ type: "success", text: "Settings saved successfully!" });
        } catch (error) {
            console.error("Error saving background pattern:", error);
            setMessage({ type: "error", text: "Failed to save settings. Please try again." });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Restaurant Settings</h1>
                <p className="text-slate-500 font-medium mt-2">Customize the guest experience and branding elements.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Welcome Screen Background</h2>
                            <p className="text-sm font-medium text-slate-500">
                                This image will be displayed on the QR code landing page where guests choose "Dine In" or "Parcel".
                            </p>
                        </div>
                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl mb-6 flex items-center ${
                                message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                        >
                            {message.type === "success" ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                            <span className="font-bold text-sm tracking-wide">{message.text}</span>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Background Image URL</label>
                            <input
                                type="url"
                                value={bgPatternUrl}
                                onChange={(e) => setBgPatternUrl(e.target.value)}
                                placeholder="https://example.com/background.jpg"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                        
                        {bgPatternUrl && (
                            <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden relative group h-64 bg-slate-100">
                                <img
                                    src={bgPatternUrl}
                                    alt="Background Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-slate-400 font-bold">Invalid Image URL</span>';
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white text-center">
                                    <h3 className="text-2xl font-black mb-1">{branding?.name}</h3>
                                    <p className="text-white/80 font-medium text-sm">Welcome Preview</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                        ) : (
                            <Save className="w-5 h-5 mr-3" />
                        )}
                        Save Branding Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
