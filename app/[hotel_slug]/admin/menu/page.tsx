"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Utensils, Palette, X, RefreshCw, Check, Image as ImageIcon, Sparkles, LayoutGrid, List, Eye } from "lucide-react";
import { useHotelBranding, useSupabaseMenuItems, saveSupabaseMenuItem, deleteSupabaseMenuItem, MenuItem } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";
import { MenuCard } from "@/components/MenuCard";
import { CATEGORY_THEMES } from "@/utils/themes";

export default function MenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [viewMode, setViewMode] = useState<'sections' | 'list'>('sections');

    const categories = ["Burgers", "Pizzas", "Fries", "Sides", "Drinks", "Desserts"];

    const itemsByCategory = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        menuItems.forEach(item => {
            const cat = item.category || "Uncategorized";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [menuItems]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingItem?.title || !editingItem?.price) return;

        setIsSaving(true);
        await saveSupabaseMenuItem(branding.id, editingItem);
        setIsSaving(false);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (id: string) => {
        if (!branding?.id) return;
        if (confirm("Delete this menu item?")) {
            await deleteSupabaseMenuItem(id, branding.id);
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto min-h-screen bg-[#FDFCFB]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-[#3E2723] rounded-xl flex items-center justify-center text-[#FFF8F2]">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h1 className="text-4xl font-serif italic text-[#3E2723] tracking-tight">Menu Lab</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Engineer your craving triggers and impulse pairings</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 flex shadow-sm">
                        <button 
                            onClick={() => setViewMode('sections')}
                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${viewMode === 'sections' ? 'bg-[#3E2723] text-white shadow-lg' : 'text-slate-400 hover:text-[#3E2723]'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sections</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${viewMode === 'list' ? 'bg-[#3E2723] text-white shadow-lg' : 'text-slate-400 hover:text-[#3E2723]'}`}
                        >
                            <List className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Master List</span>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setEditingItem({ category: "Burgers", is_available: true, upsell_items: [] });
                            setIsModalOpen(true);
                        }}
                        className="bg-[#3E2723] text-[#FFF8F2] px-8 py-4 rounded-[1.5rem] font-serif italic text-lg shadow-2xl shadow-[#3E2723]/20 hover:scale-[1.02] transition-all flex items-center active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-3 opacity-50" /> Add New Creation
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Syncing with Kitchen...</p>
                </div>
            ) : viewMode === 'sections' ? (
                <div className="space-y-16">
                    {categories.map(category => (
                        <div key={category} className="space-y-8">
                            <div className="flex items-center space-x-4 px-2">
                                <h2 className="text-2xl font-serif italic text-[#3E2723]">{category}</h2>
                                <div className="h-[1px] flex-1 bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {itemsByCategory[category]?.length || 0} Items
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {itemsByCategory[category]?.map(item => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
                                    >
                                        <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden mb-6 relative">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <Utensils className="w-12 h-12" />
                                                </div>
                                            )}
                                            
                                            <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                                {item.is_popular && <div className="bg-[#F59E0B] text-white p-2 rounded-xl shadow-lg"><Sparkles className="w-3 h-3" /></div>}
                                                {!item.is_available && <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg"><X className="w-3 h-3" /></div>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xl font-serif italic text-[#3E2723]">{item.title}</h4>
                                                <p className="font-serif text-[#F59E0B]">₹{item.price}</p>
                                            </div>
                                            <p className="text-slate-400 text-xs font-medium italic line-clamp-2">"{item.description}"</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-3">
                                            <button 
                                                onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                className="flex-1 bg-slate-50 hover:bg-[#3E2723] hover:text-white py-3 rounded-xl transition-all flex items-center justify-center space-x-2 group/btn"
                                            >
                                                <Edit className="w-3.5 h-3.5 opacity-40 group-hover/btn:opacity-100" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                <button 
                                    onClick={() => {
                                        setEditingItem({ category, is_available: true, upsell_items: [] });
                                        setIsModalOpen(true);
                                    }}
                                    className="rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-slate-300 hover:bg-slate-50 hover:border-slate-200 transition-all hover:text-[#3E2723] group"
                                >
                                    <Plus className="w-8 h-8 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">New {category}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                     <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creation Category</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Impulse Tags</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/20 transition-colors">
                                <td className="p-8">
                                    <span className="bg-[#3E2723]/5 text-[#3E2723] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden mr-4">
                                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Utensils className="w-6 h-6" /></div>}
                                        </div>
                                        <div>
                                            <p className="font-serif italic text-lg text-[#3E2723]">{item.title}</p>
                                            <p className="text-xs text-slate-400 italic">"{item.description}"</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 font-serif text-[#F59E0B] text-lg">₹{item.price}</td>
                                <td className="p-8">
                                    <div className="flex space-x-2">
                                        {item.is_popular && <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Most Loved</span>}
                                        {item.is_recommended && <span className="bg-[#3E2723]/5 text-[#3E2723] px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Chef Choice</span>}
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <button 
                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                        className="p-4 hover:bg-[#3E2723] hover:text-[#FFF8F2] rounded-2xl transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}

            {/* Creation & Preview Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 bg-[#3E2723]/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white w-full max-w-[1100px] h-full max-h-[850px] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Editor Form */}
                            <div className="flex-1 p-10 md:p-14 overflow-y-auto no-scrollbar border-r border-slate-50">
                                <div className="mb-10">
                                    <h3 className="text-3xl font-serif italic text-[#3E2723] mb-2">{editingItem?.id ? "Refine Creation" : "New Gastronomy"}</h3>
                                    <p className="text-slate-400 font-medium">Configure flavors, pairings, and triggers</p>
                                </div>

                                <form onSubmit={handleSave} className="space-y-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Theme</label>
                                            <select
                                                value={editingItem?.category || "Burgers"}
                                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                                className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 px-6 font-serif italic text-lg text-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 transition-all outline-none"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation (₹)</label>
                                            <input
                                                type="number"
                                                value={editingItem?.price || ""}
                                                onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                                className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 px-6 font-serif italic text-lg text-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 transition-all outline-none"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Title</label>
                                        <input
                                            type="text"
                                            value={editingItem?.title || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 px-6 font-serif italic text-2xl text-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 transition-all outline-none"
                                            placeholder="The signature title..."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sensory Description (Triggers Cravings)</label>
                                        <textarea
                                            value={editingItem?.description || ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                            className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 px-6 font-medium text-slate-600 focus:ring-2 transition-all outline-none h-32 resize-none italic"
                                            placeholder="Describe the aroma, the first bite, the aftertaste..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High-Res Visual URL</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editingItem?.image_url || ""}
                                                onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                                                className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-medium text-slate-600 focus:ring-2 transition-all outline-none"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                            <ImageIcon className="absolute left-6 top-5 w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Pairing (Impulse Links)</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-4 bg-[#3E2723]/5 rounded-2xl no-scrollbar border border-slate-100/50">
                                            {menuItems
                                                .filter(item => item.id !== editingItem?.id) // Don't pair with self
                                                .map(item => (
                                                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer group/pair p-2 hover:bg-white rounded-xl transition-all">
                                                        <div className="relative">
                                                            <input 
                                                                type="checkbox"
                                                                checked={editingItem?.upsell_items?.includes(item.id) || false}
                                                                onChange={(e) => {
                                                                    const current = editingItem?.upsell_items || [];
                                                                    const next = e.target.checked 
                                                                        ? [...current, item.id]
                                                                        : current.filter(id => id !== item.id);
                                                                    setEditingItem({ ...editingItem, upsell_items: next });
                                                                }}
                                                                className="w-5 h-5 rounded-lg border-2 border-[#3E2723]/10 text-[#3E2723] focus:ring-[#3E2723]/20 cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-6 h-6 rounded-md bg-slate-100 overflow-hidden">
                                                                {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-600 group-hover/pair:text-[#3E2723]">{item.title}</span>
                                                            <span className="text-[9px] font-black text-[#F59E0B]">₹{item.price}</span>
                                                        </div>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic">These items will appear in the "Make it better?" toast when this item is selected.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, is_available: !editingItem?.is_available })}
                                            className={`py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${editingItem?.is_available ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            {editingItem?.is_available ? "In Stock" : "Sold Out"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, is_popular: !editingItem?.is_popular })}
                                            className={`py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${editingItem?.is_popular ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            <Sparkles className="w-3 h-3 mr-2" /> Most Loved
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, is_recommended: !editingItem?.is_recommended })}
                                            className={`py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${editingItem?.is_recommended ? 'bg-[#3E2723]/10 text-[#3E2723] border-[#3E2723]/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            Chef's Choice
                                        </button>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full py-6 bg-[#3E2723] text-[#FFF8F2] rounded-[2rem] font-serif italic text-xl shadow-2xl shadow-[#3E2723]/30 hover:opacity-95 transition-all flex items-center justify-center disabled:opacity-50 active:scale-[0.98]"
                                        >
                                            {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : (editingItem?.id ? "Update Masterpiece" : "Finalize Creation")}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Guest View Preview */}
                            <div className="w-full md:w-[420px] bg-slate-50 p-10 md:p-14 flex flex-col items-center justify-center overflow-y-auto no-scrollbar relative min-h-[400px]">
                                <div className="absolute top-10 left-10 flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Guest Preview</span>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-white rounded-full transition-all shadow-sm">
                                    <X className="w-6 h-6 text-slate-300" />
                                </button>

                                <div className="w-full scale-90 md:scale-100 origin-center space-y-12">
                                    <div className="flex items-center space-x-3 mb-4 opacity-30">
                                        <div className="h-[1px] flex-1 bg-slate-300" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">How it looks in Cravings Menu</span>
                                        <div className="h-[1px] flex-1 bg-slate-300" />
                                    </div>
                                    
                                    <div className="pointer-events-none transform -rotate-1">
                                        <MenuCard 
                                            id="preview"
                                            title={editingItem?.title || "Signature Dish Name"}
                                            description={editingItem?.description || "The story of this creation starts with the freshest ingredients..."}
                                            price={editingItem?.price || 0}
                                            image={editingItem?.image_url}
                                            isPopular={editingItem?.is_popular}
                                            isRecommended={editingItem?.is_recommended}
                                            theme={CATEGORY_THEMES[(editingItem?.category || "burgers").toLowerCase()] || CATEGORY_THEMES.all}
                                        />
                                    </div>
                                    
                                    <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm space-y-4">
                                        <div className="flex items-center space-x-4 opacity-40">
                                            <div className="w-10 h-10 rounded-xl bg-[#3E2723]/5 flex items-center justify-center"><Eye className="w-4 h-4 text-[#3E2723]" /></div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Psychology Applied</p>
                                                <p className="text-[10px] font-serif italic text-slate-600">The "{CATEGORY_THEMES[(editingItem?.category || "burgers").toLowerCase()]?.emotion}" trigger is active.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
