"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
    Zap, 
    Image as ImageIcon, 
    Plus, 
    Clock, 
    ChevronRight, 
    Sparkles, 
    TrendingUp, 
    BookOpen, 
    MousePointer2,
    Calendar,
    Sun,
    Sunrise,
    Moon,
    Coffee,
    ArrowRight,
    Star,
    Heart,
    Edit3,
    Trash2,
    Save,
    Check,
    Layers
} from "lucide-react";
import { 
    useHotelBranding, 
    useHeroes, 
    saveSupabaseHero, 
    deleteSupabaseHero,
    useMenuCategories,
    saveMenuCategory,
    useSupabaseMenuItems,
    saveSupabaseMenuItem,
    Hero,
    MenuCategory,
    MenuItem
} from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";

export default function ExperienceHub() {
    const { hotel_slug } = useParams();
    const { branding } = useHotelBranding(hotel_slug as string);
    const { heroes, loading: heroesLoading, refresh: refreshHeroes } = useHeroes(branding?.id);
    const { categories, loading: categoriesLoading, refresh: refreshCategories } = useMenuCategories(branding?.id);
    const { menuItems, loading: menuLoading, refresh: refreshMenu } = useSupabaseMenuItems(branding?.id);
    
    const [activeTab, setActiveTab] = useState<'hero' | 'category' | 'picking' | 'story'>('hero');
    const [isAddingHero, setIsAddingHero] = useState(false);
    const [editingHero, setEditingHero] = useState<Partial<Hero> | null>(null);
    const [editingCategory, setEditingCategory] = useState<Partial<MenuCategory> | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingPick, setIsAddingPick] = useState(false);
    const [editingPick, setEditingPick] = useState<Partial<MenuItem> | null>(null);
    const [editingStoryItem, setEditingStoryItem] = useState<Partial<MenuItem> | null>(null);

    const recommendedItems = menuItems.filter(item => item.is_recommended);
    const nonRecommendedItems = menuItems.filter(item => !item.is_recommended);

    const tabs = [
        { id: 'hero', name: 'Hero Engine', icon: ImageIcon, description: 'First impression & time-based triggers' },
        { id: 'category', name: 'Category Engine', icon: MousePointer2, description: 'Navigation flow & visual highlights' },
        { id: 'picking', name: 'Chef Picks', icon: TrendingUp, description: 'Revenue boosters & storytelling' },
        { id: 'story', name: 'Product Stories', icon: BookOpen, description: 'Luxury storytelling for each item' },
    ];

    const handleSaveHero = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingHero) return;

        try {
            await saveSupabaseHero(branding.id, editingHero);
            setIsAddingHero(false);
            setEditingHero(null);
            refreshHeroes();
        } catch (error) {
            console.error("Failed to save hero:", error);
        }
    };

    const handleDeleteHero = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hero?")) return;
        try {
            await deleteSupabaseHero(id);
            refreshHeroes();
        } catch (error) {
            console.error("Failed to delete hero:", error);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingCategory) return;

        try {
            await saveMenuCategory(branding.id, editingCategory);
            setIsAddingCategory(false);
            setEditingCategory(null);
            refreshCategories();
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    };

    const handleSavePick = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingPick) return;

        try {
            await saveSupabaseMenuItem(branding.id, { ...editingPick, is_recommended: true });
            setIsAddingPick(false);
            setEditingPick(null);
            refreshMenu();
        } catch (error) {
            console.error("Failed to save pick:", error);
        }
    };

    const handleRemovePick = async (item: MenuItem) => {
        if (!branding?.id || !confirm(`Stop boosting ${item.title}?`)) return;
        try {
            await saveSupabaseMenuItem(branding.id, { ...item, is_recommended: false });
            refreshMenu();
        } catch (error) {
            console.error("Failed to remove pick:", error);
        }
    };

    const handleSaveStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !editingStoryItem) return;

        try {
            await saveSupabaseMenuItem(branding.id, editingStoryItem);
            setEditingStoryItem(null);
            refreshMenu();
        } catch (error) {
            console.error("Failed to save story:", error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Experience Hub</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
                            Control the <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600">Journey</span>
                        </h1>
                    </div>
                </div>
                <p className="text-slate-500 font-medium max-w-2xl">
                    You’re not just managing a menu. You’re building a content engine to control revenue and customer psychology.
                </p>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex space-x-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-start p-5 rounded-[2rem] border transition-all duration-500 min-w-[240px] text-left group ${
                                isActive 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200 translate-y-[-4px]' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`p-3 rounded-2xl mb-4 transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-900'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className={`text-lg font-black tracking-tight mb-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>{tab.name}</h3>
                            <p className="text-xs font-medium opacity-70 leading-relaxed">{tab.description}</p>
                        </button>
                    );
                })}
            </nav>

            {/* Content Area */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'hero' && (
                        <motion.div
                            key="hero-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 italic">The First Impression</h2>
                                    <p className="text-slate-500 text-sm font-medium">Manage cinematic Food/Video banners with time-based triggers.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingHero({ 
                                            title: "You deserve something amazing today", 
                                            cta_text: "Explore Menu",
                                            priority: 1,
                                            is_active: true
                                        });
                                        setIsAddingHero(true);
                                    }}
                                    className="flex items-center px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Hero
                                </button>
                            </div>

                            {/* Hero List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {heroesLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-[280px] rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                                    ))
                                ) : (
                                    heroes.map((hero) => (
                                        <div 
                                            key={hero.id}
                                            className="group relative h-[320px] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
                                        >
                                            {/* Background */}
                                            <div className="absolute inset-0 z-0">
                                                {hero.image_url ? (
                                                    <img src={hero.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={hero.title} />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <ImageIcon className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
                                            </div>

                                            {/* Content */}
                                            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    {hero.start_time && (
                                                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center">
                                                            <Clock className="w-3 h-3 text-white mr-1.5" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{hero.start_time} - {hero.end_time}</span>
                                                        </div>
                                                    )}
                                                    <div className={`w-2 h-2 rounded-full ${hero.is_active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                </div>
                                                <h4 className="text-xl font-black text-white italic tracking-tight mb-2 leading-tight">"{hero.title}"</h4>
                                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-6">{hero.subtext}</p>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingHero(hero);
                                                                setIsAddingHero(true);
                                                            }}
                                                            className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteHero(hero.id)}
                                                            className="p-2.5 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-xl text-white transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                        {hero.cta_text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'category' && (
                        <motion.div
                            key="category-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Navigation Flow</h2>
                                    <p className="text-slate-500 text-sm font-medium">Control how customers navigate. Highlight top sellers or time-based specials.</p>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                        <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center">
                                            <MousePointer2 className="w-3 h-3 mr-2" />
                                            Active
                                        </button>
                                        <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                                            Disabled
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Category Experience List */}
                            <div className="grid grid-cols-1 gap-4">
                                {categoriesLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-24 rounded-[1.5rem] bg-slate-50 animate-pulse border border-slate-100" />
                                    ))
                                ) : (
                                    categories.map((cat) => (
                                        <div 
                                            key={cat.id}
                                            className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-6">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${cat.is_highlighted ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50'}`}>
                                                    {cat.icon_emoji || '🍽️'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{cat.name}</h3>
                                                        {cat.is_highlighted && (
                                                            <div className="px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white uppercase tracking-widest rounded-full flex items-center">
                                                                <Star className="w-2 h-2 mr-1 fill-white" />
                                                                Highlighted
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <div className="flex items-center">
                                                            <Layers className="w-3 h-3 mr-1.5" />
                                                            Style: <span className="text-slate-900 ml-1">{cat.display_style || 'Pill'}</span>
                                                        </div>
                                                        {cat.active_hours && (
                                                            <div className="flex items-center text-emerald-600">
                                                                <Clock className="w-3 h-3 mr-1.5" />
                                                                Scheduled: <span className="ml-1 font-black">{cat.active_hours.start} - {cat.active_hours.end}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={() => {
                                                        setEditingCategory(cat);
                                                        setIsAddingCategory(true);
                                                    }}
                                                    className="px-5 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center group/btn"
                                                >
                                                    <Edit3 className="w-3 h-3 mr-2 group-hover/btn:scale-110 transition-transform" />
                                                    Tweak Experience
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'picking' && (
                        <motion.div
                            key="picking-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Revenue Booster</h2>
                                    <p className="text-slate-500 text-sm font-medium">Control what customers want most. Boost profit-heavy items to the top.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingPick(true)}
                                    className="flex items-center px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-slate-200"
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Boost New Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {menuLoading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="h-32 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                                    ))
                                ) : (
                                    recommendedItems.length > 0 ? (
                                        recommendedItems.map((item) => (
                                            <div 
                                                key={item.id}
                                                className="group bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                                    <Sparkles className="w-12 h-12 text-slate-900" />
                                                </div>

                                                <div className="flex items-center space-x-6 relative z-10">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg transform group-hover:rotate-2 transition-transform duration-500">
                                                        <img src={item.image_url || "/placeholder.png"} className="w-full h-full object-cover" alt={item.title} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Currently Boosting</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2 italic">{item.title}</h3>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
                                                                ₹{item.price}
                                                            </div>
                                                            <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                                {item.category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3 relative z-10">
                                                    <button 
                                                        onClick={() => handleRemovePick(item)}
                                                        className="px-6 py-4 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all rounded-2xl border border-red-100 text-[10px] font-black uppercase tracking-widest"
                                                    >
                                                        Stop Boost
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <TrendingUp className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No boosted items yet</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'story' && (
                        <motion.div
                            key="story-tab"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 italic">Product Stories</h2>
                                    <p className="text-slate-500 text-sm font-medium">Add luxury storytelling, badges, and schedule-based FOMO to individual items.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {menuLoading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                                    ))
                                ) : (
                                    menuItems.map((item) => (
                                        <div 
                                            key={item.id}
                                            className="group bg-white p-5 rounded-[2.5rem] border border-slate-100 hover:border-slate-200 transition-all duration-500 flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-5">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                                                    <img src={item.image_url || "/placeholder.png"} className="w-full h-full object-cover" alt={item.title} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">{item.title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.badges?.map((badge: string, idx: number) => (
                                                            <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-100">
                                                                {badge}
                                                            </span>
                                                        ))}
                                                        {(!item.badges || item.badges.length === 0) && (
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">No badges added</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setEditingStoryItem(item)}
                                                className="p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-slate-900"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddingHero && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingHero(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 italic">Configure Hero Banner</h3>
                                    <button onClick={() => setIsAddingHero(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-black">✕</button>
                                </div>

                                <form onSubmit={handleSaveHero} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Hero Headline</label>
                                            <input 
                                                value={editingHero?.title || ''}
                                                onChange={(e) => setEditingHero({...editingHero, title: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="e.g. You deserve something amazing"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Subtext / Hook</label>
                                            <input 
                                                value={editingHero?.subtext || ''}
                                                onChange={(e) => setEditingHero({...editingHero, subtext: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="e.g. Freshly crafted"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">CTA Button Text</label>
                                            <input 
                                                value={editingHero?.cta_text || ''}
                                                onChange={(e) => setEditingHero({...editingHero, cta_text: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="Explore Menu"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Background Image URL</label>
                                            <input 
                                                value={editingHero?.image_url || ''}
                                                onChange={(e) => setEditingHero({...editingHero, image_url: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Trigger Start (HH:MM)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input 
                                                    value={editingHero?.start_time || ''}
                                                    onChange={(e) => setEditingHero({...editingHero, start_time: e.target.value})}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    placeholder="06:00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Trigger End (HH:MM)</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <input 
                                                    value={editingHero?.end_time || ''}
                                                    onChange={(e) => setEditingHero({...editingHero, end_time: e.target.value})}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    placeholder="11:00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-slate-200"
                                        >
                                            Save Experience
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingHero(false)}
                                            className="px-8 py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isAddingCategory && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingCategory(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 italic">Category Experience</h3>
                                    <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-black">✕</button>
                                </div>

                                <form onSubmit={handleSaveCategory} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 mb-1">Highlight Category</h4>
                                                    <p className="text-xs font-medium text-slate-400 leading-relaxed">Adds a premium glow and a 'Special' badge in the guest menu.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCategory({...editingCategory, is_highlighted: !editingCategory?.is_highlighted})}
                                                    className={`w-14 h-8 rounded-full transition-colors relative ${editingCategory?.is_highlighted ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${editingCategory?.is_highlighted ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Display Style</label>
                                            <select 
                                                value={editingCategory?.display_style || 'pill'}
                                                onChange={(e) => setEditingCategory({...editingCategory, display_style: e.target.value as any})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            >
                                                <option value="pill">Fluid Pills (iOS Style)</option>
                                                <option value="grid">Structured Grid</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Icon Emoji</label>
                                            <input 
                                                value={editingCategory?.icon_emoji || ''}
                                                onChange={(e) => setEditingCategory({...editingCategory, icon_emoji: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="e.g. 🍔"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Visibility Start</label>
                                            <input 
                                                value={editingCategory?.active_hours?.start || ''}
                                                onChange={(e) => setEditingCategory({
                                                    ...editingCategory, 
                                                    active_hours: { ...(editingCategory?.active_hours || {end: '23:59'}), start: e.target.value }
                                                })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="06:00"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Visibility End</label>
                                            <input 
                                                value={editingCategory?.active_hours?.end || ''}
                                                onChange={(e) => setEditingCategory({
                                                    ...editingCategory, 
                                                    active_hours: { ...(editingCategory?.active_hours || {start: '00:00'}), end: e.target.value }
                                                })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="11:00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-slate-200"
                                        >
                                            Apply Experience
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCategory(false)}
                                            className="px-8 py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isAddingPick && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingPick(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-10 pb-6 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 italic mb-2">Boost an Item</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Boosted items appear in the "Recommended" section, driving higher revenue and customer interest.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                                {nonRecommendedItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setEditingPick(item);
                                            saveSupabaseMenuItem(branding!.id, { ...item, is_recommended: true });
                                            setIsAddingPick(false);
                                            refreshMenu();
                                        }}
                                        className="w-full group bg-slate-50 hover:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 hover:border-slate-900 transition-all duration-300 flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                                                <img src={item.image_url || "/placeholder.png"} className="w-full h-full object-cover" alt={item.title} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-lg font-black text-slate-900 group-hover:text-white tracking-tight leading-none mb-1 group-hover:italic transition-all">{item.title}</h4>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60">₹{item.price}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60">•</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60">{item.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                            <TrendingUp className="w-5 h-5 text-slate-900" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="p-10 pt-6 bg-slate-50 border-t border-slate-100 text-center">
                                <button onClick={() => setIsAddingPick(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Close Booster</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {editingStoryItem && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingStoryItem(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 pb-6 border-b border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 italic mb-2">Item Storytelling</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Add a captivating story and premium badges to {editingStoryItem.title}.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <form id="story-form" onSubmit={handleSaveStory} className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Product Story (The Emotional Hook)</label>
                                        <textarea 
                                            value={editingStoryItem.product_story?.story_text || ''}
                                            onChange={(e) => setEditingStoryItem({
                                                ...editingStoryItem,
                                                product_story: { ...(editingStoryItem.product_story || { bullets: [], ingredients: [], story_text: '', section_image: '' }), story_text: e.target.value }
                                            })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[120px]"
                                            placeholder="e.g. Handcrafted using sun-ripened tomatoes and our secret 48-hour fermented dough..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Premium Badges (Comma separated)</label>
                                        <input 
                                            value={editingStoryItem.badges?.join(', ') || ''}
                                            onChange={(e) => setEditingStoryItem({
                                                ...editingStoryItem,
                                                badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                            })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="e.g. Organic, Chef's Special, Freshly Baked"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Available From</label>
                                            <input 
                                                value={editingStoryItem.availability_hours?.start || ''}
                                                onChange={(e) => setEditingStoryItem({
                                                    ...editingStoryItem,
                                                    availability_hours: { ...(editingStoryItem.availability_hours || {end: '23:59'}), start: e.target.value }
                                                })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="06:00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Available Until</label>
                                            <input 
                                                value={editingStoryItem.availability_hours?.end || ''}
                                                onChange={(e) => setEditingStoryItem({
                                                    ...editingStoryItem,
                                                    availability_hours: { ...(editingStoryItem.availability_hours || {start: '00:00'}), end: e.target.value }
                                                })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="23:00"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-10 pt-6 bg-slate-50 border-t border-slate-100 flex space-x-4">
                                <button 
                                    form="story-form"
                                    type="submit"
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-slate-200"
                                >
                                    Save Story
                                </button>
                                <button 
                                    onClick={() => setEditingStoryItem(null)}
                                    className="px-8 py-5 bg-white text-slate-400 rounded-[1.5rem] font-bold text-sm uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
