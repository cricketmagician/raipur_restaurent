"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, Reorder } from "framer-motion";
import { 
    Plus, 
    GripVertical, 
    Settings2, 
    Trash2, 
    Eye, 
    EyeOff, 
    Sparkles, 
    Flame, 
    LayoutGrid, 
    Tags, 
    Shuffle
} from "lucide-react";
import { MenuCategory, MenuSection, normalizeCategoryKey, updateMenuSection, deleteMenuSection, addMenuSection } from "@/utils/store";

interface MenuStrategyProps {
    sections: MenuSection[];
    categories: MenuCategory[];
    hotelId: string;
    onRefresh: () => void;
}

export function MenuStrategy({ sections: initialSections, categories, hotelId, onRefresh }: MenuStrategyProps) {
    const [sections, setSections] = useState(initialSections);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Partial<MenuSection> | null>(null);
    const [tagDraft, setTagDraft] = useState("");

    const categoryNameById = useMemo(() => {
        return categories.reduce<Record<string, string>>((acc, category) => {
            acc[category.id] = category.name;
            return acc;
        }, {});
    }, [categories]);

    useEffect(() => {
        setSections(initialSections);
    }, [initialSections]);

    useEffect(() => {
        setTagDraft((editingSection?.tags || []).join(", "));
    }, [editingSection]);

    const handleReorder = async (newOrder: MenuSection[]) => {
        setSections(newOrder);
        // Update priorities in DB
        const updates = newOrder.map((section, index) => 
            updateMenuSection(section.id, { priority: index })
        );
        await Promise.all(updates);
    };

    const handleToggleActive = async (section: MenuSection) => {
        await updateMenuSection(section.id, { is_active: !section.is_active });
        onRefresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this section strategy?")) {
            await deleteMenuSection(id);
            onRefresh();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSection?.title || !editingSection?.type) return;

        const normalizedTags = tagDraft
            .split(",")
            .map((tag) => normalizeCategoryKey(tag))
            .filter(Boolean);
        const normalizedRules = editingSection.type === "static"
            ? {}
            : {
                ...(editingSection.rules || {}),
                limit: Math.max(1, Number(editingSection.rules?.limit || 5)),
            };
        const payload = {
            ...editingSection,
            category_id: editingSection.type === "category" ? editingSection.category_id : undefined,
            tags: editingSection.type === "tag" ? normalizedTags : [],
            rules: normalizedRules,
        };

        if (payload.id) {
            await updateMenuSection(payload.id, payload);
        } else {
            await addMenuSection(hotelId, {
                title: payload.title as string,
                type: payload.type as any,
                priority: sections.length,
                is_active: true,
                category_id: payload.category_id || undefined,
                tags: payload.tags || [],
                rules: payload.rules || {}
            } as any);
        }
        setIsConfigModalOpen(false);
        setEditingSection(null);
        onRefresh();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif italic text-[#3E2723]">Revenue Engine Strategy</h2>
                    <p className="text-slate-500 font-medium">Drag and drop sections to change the psychological flow for your guests.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingSection({ title: "", type: "category", priority: sections.length, rules: { limit: 5 }, tags: [] });
                        setIsConfigModalOpen(true);
                    }}
                    className="bg-[#3E2723] text-white px-8 py-4 rounded-[1.5rem] font-serif italic text-lg shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" /> Add Strategy Block
                </button>
            </div>

            <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-4">
                {sections.map((section) => (
                    <Reorder.Item 
                        key={section.id} 
                        value={section}
                        className={`bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all ${!section.is_active ? 'opacity-50' : ''}`}
                    >
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-[#3E2723] transition-colors">
                            <GripVertical className="w-6 h-6" />
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3E2723]">
                            {section.type === 'static' && <LayoutGrid className="w-6 h-6" />}
                            {section.type === 'bestseller' && <Flame className="w-6 h-6 text-orange-500" />}
                            {section.type === 'category' && <Sparkles className="w-6 h-6 text-blue-500" />}
                            {section.type === 'tag' && <Tags className="w-6 h-6 text-emerald-500" />}
                            {section.type === 'upsell' && <Shuffle className="w-6 h-6 text-purple-500" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-serif italic text-[#3E2723]">{section.title}</h3>
                                <span className="px-3 py-1 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 rounded-full">
                                    {section.type}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 font-medium mt-1">
                                {section.type === 'category' && "Displays items from a specific category."}
                                {section.type === 'bestseller' && "Automatically picks top 5 bestsellers."}
                                {section.type === 'tag' && "Filters items by specific mood tags."}
                                {section.type === 'upsell' && "Rules-based cross-selling logic."}
                                {section.type === 'static' && "Visual divider or custom title block."}
                            </p>
                            {section.type === "category" && section.category_id && (
                                <p className="text-xs text-slate-500 font-semibold mt-2">
                                    Category: {categoryNameById[section.category_id] || "Unknown"}
                                </p>
                            )}
                            {section.type === "tag" && (section.tags || []).length > 0 && (
                                <p className="text-xs text-slate-500 font-semibold mt-2">
                                    Tags: {(section.tags || []).join(", ")}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleToggleActive(section)}
                                className={`p-4 rounded-2xl transition-all ${section.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}
                            >
                                {section.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                            <button 
                                onClick={() => {
                                    setEditingSection(section);
                                    setIsConfigModalOpen(true);
                                }}
                                className="p-4 bg-slate-50 text-slate-400 hover:bg-[#3E2723] hover:text-white rounded-2xl transition-all"
                            >
                                <Settings2 className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleDelete(section.id)}
                                className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {/* Config Modal placeholder */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3E2723]/60 backdrop-blur-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <h3 className="text-2xl font-serif italic text-[#3E2723] mb-6">Configure Strategy Block</h3>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Title</label>
                                <input 
                                    type="text"
                                    value={editingSection?.title || ""}
                                    onChange={e => setEditingSection({...editingSection, title: e.target.value})}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-lg font-serif italic outline-none"
                                    placeholder="e.g. Popular Right Now"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategy Type</label>
                                <select 
                                    value={editingSection?.type || "category"}
                                    onChange={e => setEditingSection({
                                        ...editingSection,
                                        type: e.target.value as any,
                                        category_id: e.target.value === "category" ? editingSection?.category_id : undefined,
                                        tags: e.target.value === "tag" ? editingSection?.tags || [] : [],
                                        rules: e.target.value === "static" ? {} : { ...(editingSection?.rules || {}), limit: Number(editingSection?.rules?.limit || 5) },
                                    })}
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none"
                                >
                                    <option value="static">Static Divider</option>
                                    <option value="bestseller">Auto Bestseller</option>
                                    <option value="category">Category Based</option>
                                    <option value="tag">Tag Based</option>
                                    <option value="upsell">Upsell Engine</option>
                                </select>
                            </div>

                            {editingSection?.type === "category" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Source</label>
                                    <select
                                        value={editingSection?.category_id || ""}
                                        onChange={(e) => setEditingSection({ ...editingSection, category_id: e.target.value || undefined })}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none"
                                    >
                                        <option value="">Current opened category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {editingSection?.type === "tag" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Tags</label>
                                    <input
                                        type="text"
                                        value={tagDraft}
                                        onChange={(e) => setTagDraft(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none"
                                        placeholder="spicy, sweet, coffee"
                                    />
                                </div>
                            )}

                            {editingSection?.type !== "static" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Items</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={editingSection?.rules?.limit || 5}
                                        onChange={(e) =>
                                            setEditingSection({
                                                ...editingSection,
                                                rules: {
                                                    ...(editingSection?.rules || {}),
                                                    limit: Number(e.target.value) || 5,
                                                },
                                            })
                                        }
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none"
                                    />
                                </div>
                            )}

                            <div className="pt-6 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsConfigModalOpen(false);
                                        setEditingSection(null);
                                    }}
                                    className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-[#3E2723] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Apply Strategy
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
