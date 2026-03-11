"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Utensils, Palette, X, RefreshCw, Check, Image as ImageIcon } from "lucide-react";
import { useHotelBranding, useSupabaseMenuItems, saveSupabaseMenuItem, deleteSupabaseMenuItem, MenuItem } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

    const categories = ["Breakfast", "Lunch", "Dinner", "All Day Snacks"];

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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight" style={{ color: branding?.primaryColor }}>Menu Management</h1>
                    <p className="text-slate-500 font-medium">Curate the signature dining experience</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem({ category: "All Day Snacks", is_available: true });
                        setIsModalOpen(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:opacity-90 transition-all flex items-center active:scale-95"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    <Plus className="w-5 h-5 mr-3" /> Add Creation
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Category</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Gastronomy...</td>
                            </tr>
                        ) : menuItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No items found. Create your first masterpiece!</td>
                            </tr>
                        ) : menuItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30 transition-colors group">
                                <td className="p-6">
                                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center mr-4 text-slate-400 group-hover:text-blue-500 transition-colors">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Utensils className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{item.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5 max-w-[300px] truncate italic">"{item.description}"</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="font-black text-slate-900">₹{Number(item.price).toFixed(2)}</p>
                                </td>
                                <td className="p-6">
                                    {item.is_available ? (
                                        <span className="flex items-center text-[10px] font-black uppercase text-green-500 tracking-tighter">
                                            <Check className="w-3 h-3 mr-1" /> Available
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                                            <X className="w-3 h-3 mr-1" /> Sold Out
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingItem(item);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mr-6 text-blue-400">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black">Smart Pricing Active</h4>
                        <p className="text-sm text-slate-400 font-medium">Prices are automatically adjusted for in-room delivery vs restaurant floor.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                    Configure Rates
                </button>
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{editingItem?.id ? "Edit Creation" : "New Gastronomy"}</h3>
                                    <p className="text-slate-400 text-sm font-medium">Refine the details of your dish</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                        <select
                                            value={editingItem?.category ?? "All Day Snacks"}
                                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valuation (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingItem?.price ?? ""}
                                            onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none"
                                            placeholder="12.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Item Title</label>
                                    <input
                                        type="text"
                                        value={editingItem?.title ?? ""}
                                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-bold text-slate-900 focus:ring-2 transition-all outline-none"
                                        placeholder="e.g. Signature Truffle Pizza"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sensory Description</label>
                                    <textarea
                                        value={editingItem?.description}
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 font-medium text-slate-900 focus:ring-2 transition-all outline-none h-24 resize-none"
                                        placeholder="Describe the flavors, textures, and aromas..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visual URL (Optional)</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={editingItem?.image_url}
                                                onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 font-medium text-xs text-slate-900 focus:ring-2 transition-all outline-none"
                                                placeholder="https://..."
                                            />
                                            <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem({ ...editingItem, is_available: !editingItem?.is_available })}
                                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center ${editingItem?.is_available ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                                    >
                                        {editingItem?.is_available ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                        {editingItem?.is_available ? "Available" : "Sold Out"}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50 active:scale-[0.98]"
                                    style={{ backgroundColor: branding?.primaryColor }}
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        editingItem?.id ? "Update Masterpiece" : "Finalize Creation"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
