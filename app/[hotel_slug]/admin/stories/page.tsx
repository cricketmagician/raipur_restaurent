"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Sparkles, X, RefreshCw, Check, Image as ImageIcon, Search, Tag, DollarSign, ExternalLink } from "lucide-react";
import { useHotelBranding, useSeasonalStories, saveSeasonalStory, deleteSeasonalStory, useSupabaseMenuItems, SeasonalStory } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";
import { getDirectImageUrl } from "@/utils/image";

const STORY_PRESETS = [
    { name: "Coffee Glow", url: "/images/menu_demo/coffee.png", type: "Morning" },
    { name: "Sizzling Patty", url: "/images/menu_demo/burger.png", type: "Viral" },
    { name: "Crispy Rush", url: "/images/menu_demo/fries.png", type: "Trending" },
    { name: "Midnight Sweet", url: "/images/menu_demo/dessert.png", type: "Limited" },
    { name: "Fresh Slice", url: "/images/menu_demo/pizza.png", type: "Fresh" },
];

export default function AdminStoriesPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { stories, loading } = useSeasonalStories(branding?.id);
    const { menuItems } = useSupabaseMenuItems(branding?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStory, setEditingStory] = useState<Partial<SeasonalStory> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingStory?.label) return;

        setIsSaving(true);
        await saveSeasonalStory(branding.id, editingStory);
        setIsSaving(false);
        setIsModalOpen(false);
        setEditingStory(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this story?")) {
            await deleteSeasonalStory(id);
        }
    };

    const filteredMenuItems = useMemo(() => {
        if (!searchTerm) return [];
        return menuItems.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [menuItems, searchTerm]);

    return (
        <div className="p-10 max-w-[1400px] mx-auto min-h-screen bg-[#FDFCFB]">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h1 className="text-4xl font-serif italic text-red-950 tracking-tight">Seasonal Stories</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic">Curate cinematic highlights and viral craving triggers</p>
                </div>

                <button
                    onClick={() => {
                        setEditingStory({ is_active: true, type: "Viral" });
                        setIsModalOpen(true);
                    }}
                    className="bg-red-900 text-white px-8 py-4 rounded-3xl font-serif italic text-lg shadow-2xl shadow-red-900/20 hover:scale-[1.02] transition-all flex items-center active:scale-95"
                >
                    <Plus className="w-5 h-5 mr-3 opacity-50" /> Add Story Highlight
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Syncing Content Grid...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {stories.map(story => (
                        <motion.div 
                            key={story.id}
                            layout
                            className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative"
                        >
                            <div className="aspect-[4/5] relative bg-slate-100 overflow-hidden">
                                {story.image_url ? (
                                    <img src={getDirectImageUrl(story.image_url)} alt={story.label} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <ImageIcon className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                
                                <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full border border-white/20 shadow-lg">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{story.type || "LIVE"}</span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-2xl font-serif italic text-white mb-1">{story.label}</h3>
                                    <p className="text-white/60 font-black text-[10px] uppercase tracking-widest">
                                        {story.price ? `Value: ₹${story.price}` : "Highlight Only"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 flex items-center justify-between gap-4">
                                <button 
                                    onClick={() => { setEditingStory(story); setIsModalOpen(true); }}
                                    className="flex-1 bg-slate-50 hover:bg-slate-900 hover:text-white py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 group/btn"
                                >
                                    <Edit className="w-3.5 h-3.5 opacity-40 group-hover/btn:opacity-100" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(story.id)}
                                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <button 
                        onClick={() => {
                            setEditingStory({ is_active: true, type: "Trending" });
                            setIsModalOpen(true);
                        }}
                        className="aspect-[4/5] rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-slate-300 hover:bg-slate-50 hover:border-slate-200 transition-all hover:text-red-900 group"
                    >
                        <Plus className="w-12 h-12 mb-6 opacity-50 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Design New Seasonal Highlight</span>
                    </button>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-serif italic text-slate-900">Story Architect</h2>
                                    <p className="text-xs text-slate-400 font-medium">Design your next craving pulse</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-white flex items-center justify-center transition-all border border-transparent hover:border-slate-100">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Left Side: Basic Info */}
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Tag className="w-3 h-3" /> Story Label
                                            </label>
                                            <input 
                                                required
                                                value={editingStory?.label || ""}
                                                onChange={e => setEditingStory(prev => ({ ...prev, label: e.target.value }))}
                                                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-red-900/10 focus:bg-white transition-all outline-none font-serif text-lg italic"
                                                placeholder="e.g. Midnight Craving"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Badge/Type</label>
                                                <select 
                                                    value={editingStory?.type || "Viral"}
                                                    onChange={e => setEditingStory(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-red-900/10 focus:bg-white transition-all outline-none font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <option value="Viral">Viral</option>
                                                    <option value="Trending">Trending</option>
                                                    <option value="Limited">Limited</option>
                                                    <option value="Must Try">Must Try</option>
                                                    <option value="Seasonal">Seasonal</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <DollarSign className="w-3 h-3" /> Price
                                                </label>
                                                <input 
                                                    type="number"
                                                    value={editingStory?.price || ""}
                                                    onChange={e => setEditingStory(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-red-900/10 focus:bg-white transition-all outline-none font-serif text-lg italic"
                                                    placeholder="299"
                                                />
                                            </div>
                                        </div>

                                        {/* Link to Menu Item */}
                                        <div className="space-y-4 relative">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <ExternalLink className="w-3 h-3" /> Connect to Menu Item
                                            </label>
                                            <div className="relative">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input 
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                    className="w-full bg-slate-50 pl-14 pr-6 py-4 rounded-2xl border-2 border-transparent focus:border-red-900/10 focus:bg-white transition-all outline-none text-sm font-medium"
                                                    placeholder="Search creations..."
                                                />
                                            </div>
                                            
                                            {/* Results */}
                                            {searchTerm && filteredMenuItems.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-100 shadow-2xl p-4 z-10 space-y-2">
                                                    {filteredMenuItems.map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingStory(prev => ({ ...prev, menu_item_id: item.id, label: item.title, price: item.price }));
                                                                setSearchTerm("");
                                                            }}
                                                            className="w-full flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden mr-3">
                                                                {item.image_url && <img src={getDirectImageUrl(item.image_url)} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black uppercase tracking-widest text-slate-900">{item.title}</p>
                                                                <p className="text-[10px] font-medium text-slate-400">{item.category}</p>
                                                            </div>
                                                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-red-900" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {editingStory?.menu_item_id && (
                                                <div className="flex items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                                                    <Check className="w-4 h-4 text-red-900 mr-3" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-900">
                                                        Linked to: {menuItems.find(i => i.id === editingStory.menu_item_id)?.title}
                                                    </p>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setEditingStory(prev => ({ ...prev, menu_item_id: undefined }))}
                                                        className="ml-auto text-[10px] font-black uppercase tracking-widest text-red-900/40 hover:text-red-900"
                                                    >
                                                        Unlink
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Visuals */}
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Visual Narrative
                                            </label>
                                            <div className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 overflow-hidden relative group">
                                                {editingStory?.image_url ? (
                                                    <img src={getDirectImageUrl(editingStory.image_url)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                        <ImageIcon className="w-12 h-12 mb-4 opacity-30" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No Image Chosen</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-black uppercase tracking-widest">Select Preset Below</p>
                                                </div>
                                            </div>
                                            <input 
                                                value={editingStory?.image_url || ""}
                                                onChange={e => setEditingStory(prev => ({ ...prev, image_url: e.target.value }))}
                                                className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-red-900/10 focus:bg-white transition-all outline-none text-[10px] font-medium text-slate-400"
                                                placeholder="Or paste custom image URL..."
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" /> AI Presets
                                            </p>
                                            <div className="grid grid-cols-5 gap-3">
                                                {STORY_PRESETS.map(preset => (
                                                    <button
                                                        key={preset.name}
                                                        type="button"
                                                        onClick={() => setEditingStory(prev => ({ ...prev, image_url: preset.url, type: preset.type }))}
                                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${editingStory?.image_url === preset.url ? 'border-red-900 scale-95' : 'border-transparent hover:scale-105'}`}
                                                    >
                                                        <img src={preset.url} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t flex justify-end gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        Discard Changes
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-red-950 text-white px-12 py-5 rounded-2xl font-serif italic text-xl shadow-2xl shadow-red-950/20 active:scale-95 transition-all flex items-center disabled:opacity-50"
                                    >
                                        {isSaving && <RefreshCw className="w-5 h-5 mr-3 animate-spin" />}
                                        Publish Highlight
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
