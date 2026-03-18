"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Flame, X, RefreshCw, Check, Tag, LayoutList } from "lucide-react";
import { useHotelBranding, useMoods, saveMood, deleteMood, Mood } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_PRESETS = [
    { name: "Spicy", icon: "🌶️", tag_linked: "Spicy" },
    { name: "Light", icon: "🍃", tag_linked: "Light" },
    { name: "Sweet", icon: "🍨", tag_linked: "Dessert" },
    { name: "Heavy", icon: "🍔", tag_linked: "Heavy" },
    { name: "Healthy", icon: "🥗", tag_linked: "Healthy" },
];

export default function AdminMoodsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { moods, loading } = useMoods(branding?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingMood, setEditingMood] = useState<Partial<Mood> | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingMood?.name || !editingMood?.tag_linked || !editingMood?.icon) {
            alert("Name, Icon, and Linked Tag are required.");
            return;
        }

        setIsSaving(true);
        const { error } = await saveMood(branding.id, editingMood);
        setIsSaving(false);
        
        if (error) {
            alert(`Failed to save: ${error.message}`);
        } else {
            setIsModalOpen(false);
            setEditingMood(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete the mood "${name}"?`)) {
            const { error } = await deleteMood(id);
            if (error) alert(`Failed to delete: ${error.message}`);
        }
    };

    return (
        <div className="p-10 max-w-[1200px] mx-auto min-h-screen bg-[#FDFCFB]">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                            <Flame className="w-5 h-5" />
                        </div>
                        <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Eat by Mood</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic">Configure the emotional triggers for your guest menu</p>
                </div>

                <button
                    onClick={() => {
                        setEditingMood({ is_active: true, priority: 0, icon: "🔥" });
                        setIsModalOpen(true);
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-serif italic text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-3 opacity-50" /> Add New Mood
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Syncing Engine...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {moods?.map(mood => (
                        <motion.div 
                            key={mood.id}
                            layout
                            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 flex items-center justify-center text-3xl shadow-inner border border-orange-100">
                                    {mood.icon}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${mood.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {mood.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                        <LayoutList className="w-3 h-3" /> Priority: {mood.priority}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900">{mood.name}</h3>
                                
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <Tag className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-600">Filters tagged: <strong className="text-slate-900">"{mood.tag_linked}"</strong></span>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] flex items-center justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setEditingMood(mood);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-colors shadow-lg"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(mood.id, mood.name)}
                                    className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-colors shadow-lg"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {(!moods || moods.length === 0) && (
                        <div className="col-span-full py-20 bg-slate-50 border border-slate-100 border-dashed rounded-[3rem] text-center flex flex-col items-center">
                            <Flame className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Moods Configured</h3>
                            <p className="text-slate-500 mb-6 max-w-sm">Create moods like "Spicy" or "Light" to build an emotional connection with guests ordering.</p>
                            <button
                                onClick={() => {
                                    setEditingMood({ is_active: true, priority: 0, icon: "🔥" });
                                    setIsModalOpen(true);
                                }}
                                className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                Create First Mood
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {editingMood?.id ? 'Edit Mood' : 'New Mood'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Experience Engine</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                                <form id="moodForm" onSubmit={handleSave} className="space-y-8">
                                    
                                    {/* Presets */}
                                    {!editingMood?.id && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Start Presets</label>
                                            <div className="flex flex-wrap gap-2">
                                                {MOOD_PRESETS.map(preset => (
                                                    <button
                                                        key={preset.name}
                                                        type="button"
                                                        onClick={() => setEditingMood({ ...editingMood, name: preset.name, icon: preset.icon, tag_linked: preset.tag_linked })}
                                                        className="px-4 py-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                                                    >
                                                        <span>{preset.icon}</span> {preset.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mood Name</label>
                                            <input
                                                type="text"
                                                value={editingMood?.name || ""}
                                                onChange={e => setEditingMood({...editingMood, name: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:font-medium"
                                                placeholder="e.g. Spicy, Guilt-Free"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Emoji Icon</label>
                                                <input
                                                    type="text"
                                                    value={editingMood?.icon || ""}
                                                    onChange={e => setEditingMood({...editingMood, icon: e.target.value})}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                                    placeholder="🔥"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Priority (Order)</label>
                                                <input
                                                    type="number"
                                                    value={editingMood?.priority || 0}
                                                    onChange={e => setEditingMood({...editingMood, priority: parseInt(e.target.value)})}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Linked Menu Tag</label>
                                            <input
                                                type="text"
                                                value={editingMood?.tag_linked || ""}
                                                onChange={e => setEditingMood({...editingMood, tag_linked: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                                                placeholder="e.g. Spicy or Vegan"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 font-medium">This mood will automatically show menu items that have this tag.</p>
                                        </div>

                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setEditingMood({...editingMood, is_active: !editingMood?.is_active})}>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-slate-900">Active Status</h4>
                                                <p className="text-xs text-slate-500 font-medium">Show this mood on the guest app</p>
                                            </div>
                                            <div className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${editingMood?.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <motion.div 
                                                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                                                    animate={{ x: editingMood?.is_active ? 24 : 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100">
                                <button
                                    form="moodForm"
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 flex items-center justify-center group"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Save Mood Configuration
                                            <Check className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
