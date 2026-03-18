"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Utensils, Palette, X, RefreshCw, Check, Image as ImageIcon, Sparkles, LayoutGrid, List, Eye, Shuffle, Tags } from "lucide-react";
import {
    useHotelBranding,
    useSupabaseMenuItems,
    saveSupabaseMenuItem,
    deleteSupabaseMenuItem,
    MenuItem,
    MenuCategory,
    useMenuCategories,
    saveMenuCategory,
    deleteMenuCategory,
    deriveMenuCategories,
    normalizeCategoryKey,
    formatCategoryName,
    useMenuSections,
    MenuSection
} from "@/utils/store";
import { MenuStrategy } from "@/components/admin/MenuStrategy";
import { motion, AnimatePresence } from "framer-motion";
import { MenuCard } from "@/components/MenuCard";
import { CATEGORY_THEMES } from "@/utils/themes";
import { getDirectImageUrl } from "@/utils/image";

export default function MenuPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);
    const { categories, loading: categoriesLoading } = useMenuCategories(branding?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [editingCategory, setEditingCategory] = useState<Partial<MenuCategory> | null>(null);
    const [viewMode, setViewMode] = useState<'sections' | 'list' | 'strategy'>('sections');
    const [availabilityDrafts, setAvailabilityDrafts] = useState<Record<string, boolean>>({});
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const categoryRecords = useMemo(() => {
        const activeCategories = categories.filter((category) => category.is_active !== false);
        return activeCategories.length > 0 ? activeCategories : deriveMenuCategories(menuItems);
    }, [categories, menuItems]);

    useEffect(() => {
        if (!activeCategoryId && categoryRecords.length > 0) {
            setActiveCategoryId(categoryRecords[0].id);
            return;
        }

        if (activeCategoryId && !categoryRecords.some((category) => category.id === activeCategoryId)) {
            setActiveCategoryId(categoryRecords[0]?.id || null);
        }
    }, [activeCategoryId, categoryRecords]);

    const categoryLookup = useMemo(() => {
        return categoryRecords.reduce<Record<string, MenuCategory>>((acc, category) => {
            acc[normalizeCategoryKey(category.slug || category.name)] = category;
            return acc;
        }, {});
    }, [categoryRecords]);

    const itemCountByCategory = useMemo(() => {
        return menuItems.reduce<Record<string, number>>((acc, item) => {
            const key = normalizeCategoryKey(item.category);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [menuItems]);

    const itemsByCategory = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        menuItems.forEach(item => {
            const cat = normalizeCategoryKey(item.category);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [menuItems]);

    useEffect(() => {
        setAvailabilityDrafts((prev) => {
            const next: Record<string, boolean> = { ...prev };
            menuItems.forEach((item) => {
                if (next[item.id] === undefined) {
                    next[item.id] = item.is_available !== false;
                }
            });

            Object.keys(next).forEach((itemId) => {
                if (!menuItems.some((item) => item.id === itemId)) {
                    delete next[itemId];
                }
            });

            return next;
        });
    }, [menuItems]);

    const { sections, loading: sectionsLoading, refresh: refreshSections } = useMenuSections(branding?.id, { includeInactive: true });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingItem?.title || !editingItem?.price) return;

        setIsSaving(true);
        await saveSupabaseMenuItem(branding.id, editingItem);
        setIsSaving(false);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingCategory?.name) return;

        setIsSaving(true);
        const { error } = await saveMenuCategory(branding.id, editingCategory);
        setIsSaving(false);
        if (error) {
            alert(`Category save failed: ${error.message || "Please run the latest SQL schema update."}`);
            return;
        }
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = async (id: string) => {
        if (!branding?.id) return;
        if (confirm("Delete this menu item?")) {
            setDeletingItemId(id);
            try {
                await deleteSupabaseMenuItem(id, branding.id);
            } finally {
                setDeletingItemId(null);
            }
        }
    };

    const handleToggleAvailability = (item: MenuItem) => {
        setAvailabilityDrafts((prev) => ({
            ...prev,
            [item.id]: !(prev[item.id] ?? item.is_available !== false),
        }));
    };

    const handleSaveAvailability = async (item: MenuItem) => {
        if (!branding?.id) return;

        setStatusUpdatingId(item.id);
        const nextAvailability = availabilityDrafts[item.id] ?? item.is_available !== false;
        await saveSupabaseMenuItem(branding.id, {
            ...item,
            is_available: nextAvailability,
        });
        setStatusUpdatingId(null);
    };

    const handleDeleteCategory = async (category: MenuCategory) => {
        const categoryKey = normalizeCategoryKey(category.slug || category.name);
        const linkedItems = itemCountByCategory[categoryKey] || 0;

        if (linkedItems > 0) {
            alert(`This category still has ${linkedItems} menu items. Please move or delete those items first.`);
            return;
        }

        if (confirm(`Delete category "${category.name}"?`)) {
            await deleteMenuCategory(category.id);
        }
    };

    const scrollToCategorySection = (categoryId: string) => {
        setViewMode("sections");
        setActiveCategoryId(categoryId);

        window.requestAnimationFrame(() => {
            window.setTimeout(() => {
                const target = document.getElementById(`category-section-${categoryId}`);
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
        });
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
                        <button 
                            onClick={() => setViewMode('strategy')}
                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all ${viewMode === 'strategy' ? 'bg-[#3E2723] text-white shadow-lg' : 'text-slate-400 hover:text-[#3E2723]'}`}
                        >
                            <Shuffle className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Strategy</span>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setEditingCategory({
                                name: "",
                                icon_emoji: "🍽️",
                                sort_order: categoryRecords.length,
                                is_active: true,
                            });
                            setIsCategoryModalOpen(true);
                        }}
                        className="bg-white text-[#3E2723] px-6 py-4 rounded-[1.5rem] font-black text-sm border border-slate-100 shadow-sm hover:scale-[1.02] transition-all flex items-center active:scale-95"
                    >
                        <Palette className="w-4 h-4 mr-3 opacity-50" /> Manage Categories
                    </button>

                    <button
                        onClick={() => {
                            setEditingItem({ category: categoryRecords[0]?.slug || "uncategorized", is_available: true, upsell_items: [] });
                            setIsModalOpen(true);
                        }}
                        className="bg-[#3E2723] text-[#FFF8F2] px-8 py-4 rounded-[1.5rem] font-serif italic text-lg shadow-2xl shadow-[#3E2723]/20 hover:scale-[1.02] transition-all flex items-center active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-3 opacity-50" /> Add New Creation
                    </button>
                </div>
            </div>

            <section className="mb-12 rounded-[2.5rem] border border-white/60 bg-[#0F3D2E] p-5 md:p-6 shadow-[0_30px_90px_-38px_rgba(15,61,46,0.65)] text-white overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.36em] text-white/45 mb-2">Category Bar</p>
                        <h2 className="text-2xl md:text-3xl font-serif italic tracking-tight">Browse like a flagship cafe</h2>
                        <p className="mt-2 text-sm md:text-[15px] font-medium text-white/70 max-w-2xl">
                            Create and organize categories here, then let the menu flow feel premium at the top of the page.
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Live Categories</span>
                        <span className="mt-2 text-2xl font-black">{categoryRecords.length}</span>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1">
                    {categoryRecords.map((category) => {
                        const categoryKey = normalizeCategoryKey(category.slug || category.name);
                        const itemCount = itemCountByCategory[categoryKey] || 0;
                        const isActive = activeCategoryId === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => scrollToCategorySection(category.id)}
                                className={`relative min-w-[250px] h-[160px] overflow-hidden rounded-[2rem] snap-center border text-left shadow-[0_18px_50px_-26px_rgba(0,0,0,0.55)] transition-all duration-300 active:scale-[0.98] ${isActive ? "border-[#F59E0B]/80 ring-2 ring-[#F59E0B]/30" : "border-white/10 hover:border-white/25"}`}
                            >
                                {category.image_url ? (
                                    <img
                                        src={getDirectImageUrl(category.image_url)}
                                        alt={category.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.35),transparent_30%),linear-gradient(160deg,rgba(255,255,255,0.08),rgba(15,61,46,0.98))]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/28 to-black/18" />

                                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-white backdrop-blur-md border border-white/10">
                                    <span className="text-base leading-none">{category.icon_emoji || "🍽️"}</span>
                                    <span>{itemCount} items</span>
                                </div>

                                <div className="absolute inset-x-4 bottom-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/55 mb-1">
                                        {category.description || "Curated shelf"}
                                    </p>
                                    <h3 className="text-[1.45rem] font-black leading-none text-white line-clamp-1">
                                        {category.name}
                                    </h3>
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white text-[#0F3D2E] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] shadow-lg">
                                        Open Shelf
                                        <span className="text-[#F59E0B]">→</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    <button
                        onClick={() => {
                            setEditingCategory({
                                name: "",
                                icon_emoji: "🍽️",
                                sort_order: categoryRecords.length,
                                is_active: true,
                            });
                            setIsCategoryModalOpen(true);
                        }}
                        className="min-w-[250px] h-[160px] snap-center rounded-[2rem] border border-dashed border-white/20 bg-white/8 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_18px_50px_-26px_rgba(0,0,0,0.35)] transition-all hover:bg-white/12 active:scale-[0.98]"
                    >
                        <div className="w-14 h-14 rounded-full bg-white text-[#0F3D2E] flex items-center justify-center shadow-lg mb-3">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.32em] text-white/72">Create Category</span>
                        <span className="mt-2 text-sm font-medium text-white/50 max-w-[16ch]">
                            Add a new shelf for the top menu
                        </span>
                    </button>
                </div>
            </section>

            {(loading || categoriesLoading) ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                    <RefreshCw className="w-12 h-12 animate-spin mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Syncing with Kitchen...</p>
                </div>
            ) : viewMode === 'sections' ? (
                <div className="space-y-16">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-serif italic text-[#3E2723]">Category Studio</h2>
                                <p className="text-slate-500 font-medium">Create visual categories first, then attach dishes under them.</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {categoryRecords.length} Active Categories
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {categoryRecords.map((category) => {
                                const categoryKey = normalizeCategoryKey(category.slug || category.name);
                                const itemCount = itemCountByCategory[categoryKey] || 0;

                                return (
                                    <div
                                        key={category.id}
                                        className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                                    >
                                        <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] overflow-hidden mb-5 relative">
                                            {category.image_url ? (
                                                <img
                                                    src={getDirectImageUrl(category.image_url)}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                                    <span className="text-4xl mb-2">{category.icon_emoji || "🍽️"}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Cover Yet</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#3E2723]">
                                                {itemCount} items
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{category.icon_emoji || "🍽️"}</span>
                                                <h3 className="text-xl font-serif italic text-[#3E2723]">{category.name}</h3>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {category.description || `${category.name} section for your restaurant menu.`}
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(category.id.startsWith("derived-") ? {
                                                        name: category.name,
                                                        description: category.description,
                                                        image_url: category.image_url,
                                                        icon_emoji: category.icon_emoji,
                                                        sort_order: category.sort_order,
                                                        is_active: true,
                                                    } : category);
                                                    setIsCategoryModalOpen(true);
                                                }}
                                                className="flex-1 bg-slate-50 hover:bg-[#3E2723] hover:text-white py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                            </button>
                                            {category.id.startsWith("derived-") ? null : (
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {categoryRecords.map((category) => {
                        const categoryKey = normalizeCategoryKey(category.slug || category.name);
                        return (
                        <div key={category.id} id={`category-section-${category.id}`} className="space-y-8 scroll-mt-32">
                            <div className="flex items-center space-x-4 px-2">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {category.image_url ? (
                                        <img src={getDirectImageUrl(category.image_url)} alt={category.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl">{category.icon_emoji || "🍽️"}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif italic text-[#3E2723]">{category.name}</h2>
                                    <p className="text-xs font-medium text-slate-400">{category.description || "Menu section"}</p>
                                </div>
                                <div className="h-[1px] flex-1 bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {itemsByCategory[categoryKey]?.length || 0} Items
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {itemsByCategory[categoryKey]?.map(item => (
                                    (() => {
                                        const isAvailableDraft = availabilityDrafts[item.id] ?? item.is_available !== false;
                                        return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
                                    >
                                        <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden mb-6 relative">
                                            {item.image_url ? (
                                                <img src={getDirectImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <Utensils className="w-12 h-12" />
                                                </div>
                                            )}

                                            <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-2">
                                                    {item.is_popular && <div className="bg-[#F59E0B] text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2"><Sparkles className="w-3 h-3" /><span className="text-[9px] font-black uppercase tracking-widest">Best Seller</span></div>}
                                                    {item.is_recommended && <div className="bg-[#3E2723] text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2"><Check className="w-3 h-3" /><span className="text-[9px] font-black uppercase tracking-widest">Chef Pick</span></div>}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleAvailability(item)}
                                                    className={`px-3 py-2 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 ${isAvailableDraft ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}
                                                >
                                                    {isAvailableDraft ? (
                                                        <Check className="w-3 h-3" />
                                                    ) : (
                                                        <X className="w-3 h-3" />
                                                    )}
                                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                                        {isAvailableDraft ? "Available" : "Sold Out"}
                                                    </span>
                                                </button>
                                            </div>

                                            {!isAvailableDraft && (
                                                <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center">
                                                    <div className="px-4 py-2 rounded-full bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">
                                                        Item off menu
                                                    </div>
                                                </div>
                                            )}
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
                                                onClick={() => handleSaveAvailability(item)}
                                                disabled={statusUpdatingId === item.id}
                                                className={`px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border transition-all flex items-center space-x-2 ${statusUpdatingId === item.id ? 'opacity-60' : ''} ${isAvailableDraft ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                                            >
                                                {statusUpdatingId === item.id ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5" />
                                                )}
                                                <span>Save</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingItemId === item.id}
                                                className={`px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border transition-all flex items-center gap-2 ${deletingItemId === item.id ? 'opacity-60' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                                            >
                                                {deletingItemId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                        );
                                    })()
                                ))}
                                
                                <button 
                                    onClick={() => {
                                        setEditingItem({ category: categoryKey, is_available: true, upsell_items: [] });
                                        setIsModalOpen(true);
                                    }}
                                    className="rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-slate-300 hover:bg-slate-50 hover:border-slate-200 transition-all hover:text-[#3E2723] group"
                                >
                                    <Plus className="w-8 h-8 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">New {category.name}</span>
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            ) : viewMode === 'strategy' ? (
                <MenuStrategy 
                    sections={sections || []} 
                    categories={categoryRecords}
                    hotelId={branding?.id || ""} 
                    onRefresh={refreshSections} 
                />
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
                            (() => {
                                const isAvailableDraft = availabilityDrafts[item.id] ?? item.is_available !== false;
                                return (
                            <tr key={item.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/20 transition-colors">
                                <td className="p-8">
                                    <span className="bg-[#3E2723]/5 text-[#3E2723] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {categoryLookup[normalizeCategoryKey(item.category)]?.name || formatCategoryName(item.category)}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden mr-4">
                                            {item.image_url ? <img src={getDirectImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Utensils className="w-6 h-6" /></div>}
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
                                        {item.is_popular && <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Best Seller</span>}
                                        {item.is_recommended && <span className="bg-[#3E2723]/5 text-[#3E2723] px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Chef Recommend</span>}
                                        {item.is_combo && <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">Combo Meal</span>}
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isAvailableDraft ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                            {isAvailableDraft ? 'Available' : 'Sold Out'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleToggleAvailability(item)}
                                            className={`px-4 py-3 rounded-2xl border font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isAvailableDraft ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                                        >
                                            {isAvailableDraft ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                            {isAvailableDraft ? "Available" : "Sold Out"}
                                        </button>
                                        <button
                                            onClick={() => handleSaveAvailability(item)}
                                            disabled={statusUpdatingId === item.id}
                                            className={`px-4 py-3 rounded-2xl border font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${statusUpdatingId === item.id ? 'opacity-60' : ''} ${isAvailableDraft ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-[#3E2723] text-white border-[#3E2723]'}`}
                                        >
                                            {statusUpdatingId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Save
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingItemId === item.id}
                                            className={`px-4 py-3 rounded-2xl border font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${deletingItemId === item.id ? 'opacity-60' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                                        >
                                            {deletingItemId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            Delete
                                        </button>
                                        <button 
                                            onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                            className="p-4 hover:bg-[#3E2723] hover:text-[#FFF8F2] rounded-2xl transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                                );
                            })()
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
                                                value={editingItem?.category || categoryRecords[0]?.slug || "uncategorized"}
                                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                                className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 px-6 font-serif italic text-lg text-[#3E2723] focus:ring-2 focus:ring-[#3E2723]/10 transition-all outline-none"
                                            >
                                                {categoryRecords.map((category) => (
                                                    <option key={category.id} value={category.slug}>
                                                        {category.name}
                                                    </option>
                                                ))}
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
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Psychological Tags (Comma separated)</label>
                                         <div className="relative">
                                             <input
                                                 type="text"
                                                 value={editingItem?.tags?.join(", ") || ""}
                                                 onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                                                 className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-medium text-slate-600 focus:ring-2 transition-all outline-none"
                                                 placeholder="Light, Quick, Premium, Dessert..."
                                             />
                                             <Tags className="absolute left-6 top-5 w-5 h-5 text-slate-300" />
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
                                                                {item.image_url && <img src={getDirectImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />}
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-600 group-hover/pair:text-[#3E2723]">{item.title}</span>
                                                            <span className="text-[9px] font-black text-[#F59E0B]">₹{item.price}</span>
                                                        </div>
                                                    </label>
                                                ))
                                            }
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic">These items power the inline upsell rail and add-on prompts when this dish is added in the guest menu.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                            <Sparkles className="w-3 h-3 mr-2" /> Best Seller
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, is_recommended: !editingItem?.is_recommended })}
                                            className={`py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${editingItem?.is_recommended ? 'bg-[#3E2723]/10 text-[#3E2723] border-[#3E2723]/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            Chef Recommend
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem({ ...editingItem, is_combo: !editingItem?.is_combo })}
                                            className={`py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center border-2 ${editingItem?.is_combo ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            Combo Meal
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
                                            theme={CATEGORY_THEMES[normalizeCategoryKey(editingItem?.category || "burgers")] || CATEGORY_THEMES.all}
                                        />
                                    </div>
                                    
                                    <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white shadow-sm space-y-4">
                                        <div className="flex items-center space-x-4 opacity-40">
                                            <div className="w-10 h-10 rounded-xl bg-[#3E2723]/5 flex items-center justify-center"><Eye className="w-4 h-4 text-[#3E2723]" /></div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Psychology Applied</p>
                                                <p className="text-[10px] font-serif italic text-slate-600">The "{CATEGORY_THEMES[normalizeCategoryKey(editingItem?.category || "burgers")]?.emotion}" trigger is active.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#3E2723]/50 backdrop-blur-lg">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 30 }}
                            className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-100 flex items-start justify-between gap-6">
                                <div>
                                    <h3 className="text-3xl font-serif italic text-[#3E2723] mb-2">
                                        {editingCategory?.id ? "Refine Category" : "Create Category"}
                                    </h3>
                                    <p className="text-slate-500 font-medium">Control the structure guests see before they browse dishes.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCategoryModalOpen(false);
                                        setEditingCategory(null);
                                    }}
                                    className="p-3 hover:bg-slate-50 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</label>
                                        <input
                                            type="text"
                                            value={editingCategory?.name || ""}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-4 px-5 font-serif italic text-xl text-[#3E2723] outline-none"
                                            placeholder="Burgers"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Emoji</label>
                                        <input
                                            type="text"
                                            value={editingCategory?.icon_emoji || ""}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, icon_emoji: e.target.value })}
                                            className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-4 px-5 text-lg text-[#3E2723] outline-none"
                                            placeholder="🍔"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Description</label>
                                    <textarea
                                        value={editingCategory?.description || ""}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                        className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-4 px-5 font-medium text-slate-600 outline-none h-28 resize-none"
                                        placeholder="Crispy, juicy crowd-favourites with bold flavours."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Cover Image URL</label>
                                    <input
                                        type="text"
                                        value={editingCategory?.image_url || ""}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                                        className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-4 px-5 text-sm font-medium text-slate-600 outline-none"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Order</label>
                                        <input
                                            type="number"
                                            value={editingCategory?.sort_order ?? 0}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value || "0", 10) })}
                                            className="w-full bg-[#3E2723]/5 border-none rounded-2xl py-4 px-5 text-sm font-medium text-slate-600 outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingCategory({ ...editingCategory, is_active: !(editingCategory?.is_active ?? true) })}
                                        className={`mt-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                                            (editingCategory?.is_active ?? true)
                                                ? 'bg-green-50 text-green-600 border-green-200'
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}
                                    >
                                        {(editingCategory?.is_active ?? true) ? "Active on Guest UI" : "Hidden from Guest UI"}
                                    </button>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCategoryModalOpen(false);
                                            setEditingCategory(null);
                                        }}
                                        className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] py-4 rounded-2xl bg-[#3E2723] text-[#FFF8F2] font-serif italic text-xl shadow-xl disabled:opacity-50"
                                    >
                                        {isSaving ? "Saving..." : (editingCategory?.id ? "Update Category" : "Create Category")}
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
