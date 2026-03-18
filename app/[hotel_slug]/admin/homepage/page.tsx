"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Save, Layout, Type, MousePointer2, Image as ImageIcon, Star, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, supabase, useSupabaseMenuItems, useHeroes, saveSupabaseHero, deleteSupabaseHero } from "@/utils/store";
import { getDirectImageUrl } from "@/utils/image";
import { Toast } from "@/components/Toast";

export default function AdminHomepage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);
    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);

    const [form, setForm] = useState({
        hero_cta: "Start Ordering",
        trust_signal: "1,000+ happy customers in Raipur",
        quick_order_ids: [] as string[]
    });

    const { heroes, loading: heroesLoading } = useHeroes(branding?.id);
    const [newHero, setNewHero] = useState({ title: "", subtext: "", image_url: "", is_active: true });
    const [isAddingHero, setIsAddingHero] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", isVisible: false });

    useEffect(() => {
        if (branding) {
            setForm({
                hero_cta: branding.hero_cta || "Start Ordering",
                trust_signal: branding.trust_signal || "1,000+ happy customers in Raipur",
                quick_order_ids: branding.quick_order_ids || []
            });
        }
    }, [branding]);

    const handleSave = async () => {
        if (!branding?.id) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('hotels')
                .update({
                    hero_cta: form.hero_cta,
                    trust_signal: form.trust_signal,
                    quick_order_ids: form.quick_order_ids
                })
                .eq('id', branding.id);

            if (error) throw error;
            setToast({ message: "Homepage settings updated! ✨", type: "success", isVisible: true });
        } catch (error: any) {
            setToast({ message: "Failed to save: " + error.message, type: "error", isVisible: true });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddHero = async () => {
        if (!branding?.id || !newHero.image_url) return;
        setIsAddingHero(true);
        try {
            const { error } = await saveSupabaseHero(branding.id, newHero);
            if (error) throw error;
            setNewHero({ title: "", subtext: "", image_url: "", is_active: true });
            setToast({ message: "New hero slide added! 📸", type: "success", isVisible: true });
        } catch (error: any) {
            setToast({ message: "Failed to add hero: " + error.message, type: "error", isVisible: true });
        } finally {
            setIsAddingHero(false);
        }
    };

    const handleDeleteHero = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;
        try {
            const { error } = await deleteSupabaseHero(id);
            if (error) throw error;
            setToast({ message: "Hero slide deleted", type: "success", isVisible: true });
        } catch (error: any) {
            setToast({ message: "Delete failed: " + error.message, type: "error", isVisible: true });
        }
    };

    const handleToggleHero = async (hero: any) => {
        try {
            const { error } = await saveSupabaseHero(branding?.id!, { ...hero, is_active: !hero.is_active });
            if (error) throw error;
        } catch (error: any) {
            setToast({ message: "Update failed: " + error.message, type: "error", isVisible: true });
        }
    };

    const toggleQuickOrder = (id: string) => {
        setForm(prev => {
            const current = [...prev.quick_order_ids];
            if (current.includes(id)) {
                return { ...prev, quick_order_ids: current.filter(i => i !== id) };
            }
            if (current.length >= 4) {
                setToast({ message: "Max 4 items allowed in Quick Order", type: "error", isVisible: true });
                return prev;
            }
            return { ...prev, quick_order_ids: [...current, id] };
        });
    };

    if (brandingLoading || menuLoading || heroesLoading) {
        return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto pb-40">
            <header className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <Layout className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Conversion Center</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Guest Dashboard Homepage</h1>
                <p className="text-slate-500 font-medium mt-2">Manage the hero section, quick order slots, and trust signals to boost conversions.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Visual Preview */}
                <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Live Preview</h3>
                    <div className="aspect-[9/16] w-full max-w-[320px] mx-auto bg-[#F1F8F5] rounded-[3rem] shadow-2xl border-[8px] border-slate-900 relative overflow-hidden flex flex-col scale-[0.85] origin-top">
                        {/* Mock Hero */}
                        <div className="h-[45%] bg-[#002B1B] relative overflow-hidden flex flex-col justify-end p-6 pb-12">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={heroes?.length ? heroes.filter(h => h.is_active)[0]?.id : 'default'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0"
                                >
                                    <img 
                                        src={getDirectImageUrl(heroes?.filter(h => h.is_active)[0]?.image_url || "")} 
                                        className="absolute inset-0 w-full h-full object-cover opacity-50" 
                                        alt="" 
                                    />
                                </motion.div>
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F1F8F5] via-transparent to-transparent" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-tighter">
                                    {heroes?.filter(h => h.is_active)[0]?.title || "Your Favorite Café. Now One Tap Away."}
                                </h2>
                                <p className="text-white/60 text-[10px] font-medium italic mb-6">
                                    {heroes?.filter(h => h.is_active)[0]?.subtext || "Order instantly. Skip the wait."}
                                </p>
                                <button className="px-6 py-3 bg-[#00704A] text-white rounded-full font-black text-[9px] uppercase tracking-widest w-fit shadow-xl">
                                    {form.hero_cta}
                                </button>
                            </div>
                        </div>
                        
                        {/* Mock Quick Order */}
                        <div className="p-6">
                            <h4 className="text-sm font-black tracking-tight mb-4 text-[#1E3932]">⚡ Quick Order</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {form.quick_order_ids.length > 0 ? (
                                    form.quick_order_ids.map(id => {
                                        const item = menuItems.find(i => i.id === id);
                                        return (
                                            <div key={id} className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                                                <div className="aspect-square bg-slate-100 rounded-xl mb-2 overflow-hidden">
                                                    <img src={getDirectImageUrl(item?.image_url)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-[8px] font-black tracking-tight truncate">{item?.title}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 py-8 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 text-[10px] font-bold">
                                        No items selected
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mock Trust */}
                        <div className="mt-auto p-6 border-t border-slate-100">
                           <p className="text-[8px] font-black text-center text-[#1E3932]">{form.trust_signal}</p>
                        </div>
                    </div>

                    {/* Hero Carousel Manager */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mt-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Hero Carousel Slides</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            {heroes?.map(hero => (
                                <div key={hero.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                                        <img src={getDirectImageUrl(hero.image_url)} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black truncate">{hero.title}</h4>
                                        <p className="text-[10px] text-slate-400 truncate italic">{hero.subtext}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleToggleHero(hero)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${hero.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteHero(hero.id)}
                                            className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!heroes || heroes.length === 0) && (
                                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
                                    <ImageIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Slides Added Yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[2rem] space-y-4">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Add New Slide</h3>
                            <input 
                                placeholder="Slide Headline"
                                value={newHero.title}
                                onChange={e => setNewHero({...newHero, title: e.target.value})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-rose-500 transition-all font-bold"
                            />
                            <input 
                                placeholder="Subtext"
                                value={newHero.subtext}
                                onChange={e => setNewHero({...newHero, subtext: e.target.value})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-rose-500 transition-all font-bold"
                            />
                            <input 
                                placeholder="Image URL"
                                value={newHero.image_url}
                                onChange={e => setNewHero({...newHero, image_url: e.target.value})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-rose-500 transition-all font-bold"
                            />
                            <button 
                                onClick={handleAddHero}
                                disabled={isAddingHero || !newHero.image_url}
                                className="w-full py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isAddingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add Slide
                            </button>
                        </div>
                    </div>
                </section>

                {/* Controls */}
                <section className="space-y-8">
                    {/* Homepage Configuration */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Type className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Homepage Settings</h2>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">CTA Label (Button Text)</label>
                                <input 
                                    value={form.hero_cta}
                                    onChange={e => setForm({...form, hero_cta: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Start Ordering"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trust Signal Social Proof</label>
                                <input 
                                    value={form.trust_signal}
                                    onChange={e => setForm({...form, trust_signal: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. 1000+ happy customers"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Order Selection */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Star className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Quick Order Slots (Max 4)</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto no-scrollbar pr-2">
                            {menuItems.map(item => {
                                const isSelected = form.quick_order_ids.includes(item.id);
                                return (
                                    <button 
                                        key={item.id}
                                        onClick={() => toggleQuickOrder(item.id)}
                                        className={`p-3 rounded-2xl border-2 text-left transition-all relative ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="aspect-square w-10 bg-slate-100 rounded-lg overflow-hidden mb-2">
                                            <img src={getDirectImageUrl(item.image_url)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[9px] font-black tracking-tight leading-tight line-clamp-1 truncate">{item.title}</p>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-16 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? "Updating Experience..." : "Publish to Dashboard"}
                    </button>
                </section>
            </div>

            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
}
