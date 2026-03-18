"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
    useHotelBranding, 
    useCart, 
    useSupabaseMenuItems, 
    useMenuCategories, 
    deriveMenuCategories, 
    normalizeCategoryKey, 
    formatCategoryName, 
    getRoomAccessState, 
    addSupabaseRequest,
    type MenuItem 
} from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { MinimalMenuItemCard } from "@/components/MinimalMenuItemCard";
import { CategoryCard } from "@/components/CategoryCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useTheme } from "@/utils/themes";
import { CategoryScrollNav } from "@/components/CategoryScrollNav";
import { CategorySectionHeader } from "@/components/CategorySectionHeader";
import { Search, ChevronLeft, Sparkles, X, ShoppingCart, Plus, Minus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { roomNumber, orderMode } = useGuestRoom();
    const { cart, updateQuantity, clearCart } = useCart(branding?.id);
    const theme = useTheme(branding);
    
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [orderComplete, setOrderComplete] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const { menuItems } = useSupabaseMenuItems(branding?.id);
    const effectiveItems = menuItems.length > 0 ? menuItems : [];
    
    const availableItems = useMemo(
        () => effectiveItems.filter((item: any) => item.is_available !== false),
        [effectiveItems]
    );

    const categoryRecords = useMemo(() => {
        return menuCategories.filter((category) => category.is_active !== false).length > 0
            ? menuCategories.filter((category) => category.is_active !== false)
            : deriveMenuCategories(availableItems as any);
    }, [menuCategories, availableItems]);

    const categories = useMemo(() => ([
        { id: "all", name: "All", icon: "🍱", tagline: undefined, imageUrl: undefined },
        ...categoryRecords.map((category) => ({
            id: normalizeCategoryKey(category.slug || category.name),
            name: category.name,
            icon: category.icon_emoji || "🍽️",
            tagline: category.description,
            imageUrl: category.image_url
        })),
    ]), [categoryRecords]);

    // Derived Search Results
    const filteredItems = useMemo(() => {
        return availableItems.filter(i => 
            (searchTerm === "" || i.title.toLowerCase().includes(searchTerm.toLowerCase()) || i.description?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [availableItems, searchTerm]);

    // Scroll Logic: Sticky & Intersection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            if (activeCategory !== "all") {
                const scrollPos = window.scrollY + 150;
                let current = activeCategory;

                for (const catId in sectionRefs.current) {
                    const element = sectionRefs.current[catId];
                    if (element && element.offsetTop <= scrollPos) {
                        current = catId;
                    }
                }
                // Only update if it's a different category but still within the category story view
                if (current !== activeCategory && current !== "all") {
                    // This logic is mostly for multi-category story pages if we ever support them
                    // For now, CategoryStoryView is usually one category at a time
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [activeCategory]);

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <LoadingScreen 
                hotelName={branding?.name} 
                logo={branding?.logoImage || branding?.logo} 
                backgroundImage={branding?.loadingImage}
            />
        );
    }

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center px-6 bg-[#F5F1E8]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-3xl font-semibold italic mb-2 text-[#0F3D2E]">Order Received!</h2>
                    <p className="text-[#0F3D2E]/40 mb-12 italic">“Chef is starting your meal.”</p>
                    <button onClick={() => router.push(`/${hotelSlug}/guest/status`)} className="w-full py-6 rounded-full bg-[#0F3D2E] text-white font-black text-[10px] uppercase tracking-widest shadow-xl">View Status</button>
                    <button onClick={() => setOrderComplete(false)} className="w-full mt-4 py-6 text-[#0F3D2E] font-black text-[10px] uppercase tracking-widest">Order More</button>
                </motion.div>
            </div>
        );
    }

    const currentCategory = categories.find(c => c.id === activeCategory);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F5F1E8] pb-40">
            {/* 1. PREMIUM MINIMAL TOP BAR */}

            {/* 2. GLOBAL CATEGORY NAV */}
            <CategoryScrollNav 
                categories={categories} 
                activeCategory={activeCategory} 
                onCategoryClick={handleCategoryClick} 
                scrolled={scrolled || activeCategory !== 'all'} 
            />

            <div className="max-w-md mx-auto px-6 pt-4">
                {/* 3. SUB-HEADER (Back & Search) */}
                <div className="flex items-center gap-4 mb-6">
                    {activeCategory !== 'all' ? (
                        <motion.button 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={() => setActiveCategory('all')} 
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0F3D2E] border border-[#0F3D2E]/5"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <button 
                            onClick={() => router.back()} 
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0F3D2E]/60 border border-[#0F3D2E]/5"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F3D2E]/30" />
                        <input 
                            type="text" 
                            placeholder="Search flavors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-[#0F3D2E]/5 shadow-sm rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:ring-2 focus:ring-[#C8A96A]/20 transition-all placeholder:text-[#0F3D2E]/20 text-[#0F3D2E]"
                        />
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {searchTerm ? (
                        /* SEARCH RESULTS VIEW */
                        <motion.div 
                            key="search"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black italic tracking-tighter text-[#0F3D2E]">Search Results</h2>
                                <p className="text-[#0F3D2E]/40 text-xs font-medium italic">{filteredItems.length} items found for "{searchTerm}"</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {filteredItems.map(item => (
                                    <MinimalMenuItemCard 
                                        key={item.id} 
                                        item={item} 
                                        quantity={cart[item.id] || 0}
                                        onAdd={() => updateQuantity(item.id, (cart[item.id] || 0) + 1)}
                                        onRemove={() => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                                        onClick={() => setSelectedItem(item as any)}
                                        theme={theme}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : activeCategory === "all" ? (
                        /* DISCOVERY VIEW: PREMIUM CATEGORY CARDS */
                        <motion.div 
                            key="discovery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#C8A96A] fill-[#C8A96A]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Curated Collections</span>
                                </div>
                                <h2 className="text-5xl font-black italic tracking-tighter text-[#0F3D2E] leading-none">Explore Our World</h2>
                                <p className="text-[#0F3D2E]/40 text-sm font-medium italic">Discover flavors handcrafted for your mood.</p>
                            </div>

                            <div className="flex flex-wrap justify-between gap-y-12">
                                {categories.filter(c => c.id !== "all").map((cat, idx) => (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="w-[45%]"
                                    >
                                        <CategoryCard 
                                            category={cat as any} 
                                            onClick={() => handleCategoryClick(cat.id)} 
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* CATEGORY STORY VIEW: DETAILED MENU */
                        <motion.div 
                            key={activeCategory}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            {/* CATEGORY HERO */}
                            <section className="space-y-4">
                                <CategorySectionHeader 
                                    name={currentCategory?.name || ""} 
                                    tagline={currentCategory?.tagline || "Freshly prepared masterpiece."} 
                                    imageUrl={currentCategory?.imageUrl || branding?.hero_image} 
                                />
                            </section>

                            {/* CATEGORY ITEMS LIST */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0F3D2E]/40">Full Selection</h4>
                                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                                </div>
                                
                                <div className="space-y-4">
                                    {availableItems.filter(item => normalizeCategoryKey(item.category) === activeCategory).map((item) => (
                                        <MinimalMenuItemCard 
                                            key={item.id} 
                                            item={item} 
                                            quantity={cart[item.id] || 0} 
                                            onAdd={() => updateQuantity(item.id, (cart[item.id] || 0) + 1)} 
                                            onRemove={() => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                                            onClick={() => setSelectedItem(item as any)}
                                            theme={theme}
                                        />
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. PRODUCT STORY MODAL (Full View) */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md px-0 sm:px-6">
                        <motion.div
                            initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="bg-[#F5F1E8] w-full max-w-lg sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                            >
                                {/* Sticky Header with Close */}
                                <div className="absolute top-6 right-6 z-10">
                                    <button 
                                        onClick={() => setSelectedItem(null)}
                                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto no-scrollbar pb-32">
                                    {/* Hero Image */}
                                    <div className="relative aspect-square w-full">
                                        <img 
                                            src={getDirectImageUrl(selectedItem.image_url)} 
                                            className="w-full h-full object-cover" 
                                            alt={selectedItem.title} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F1E8] via-transparent to-black/20" />
                                    </div>

                                    {/* Content */}
                                    <div className="px-8 -mt-12 relative z-10 space-y-8">
                                        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-black/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-3xl font-black text-[#0F3D2E] tracking-tight">{selectedItem.title}</h2>
                                                    <p className="text-[#C8A96A] text-xs font-black uppercase tracking-[0.3em] mt-2">Premium Creation</p>
                                                </div>
                                                <div className="bg-[#0F3D2E] text-white px-5 py-3 rounded-2xl font-black text-lg shadow-lg">
                                                    ₹{selectedItem.price}
                                                </div>
                                            </div>
                                            <p className="text-[#0F3D2E]/70 text-sm leading-relaxed italic font-medium">
                                                {selectedItem.description || "A masterpiece of flavors, handcrafted for the ultimate indulgence."}
                                            </p>
                                        </div>

                                        {/* SMART COMBO SUGGESTIONS */}
                                        {selectedItem.upsell_items && selectedItem.upsell_items.length > 0 && (
                                            <div className="space-y-4 pb-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40">Complete Your Meal</h4>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A96A]">Special Combo</span>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                                                    {availableItems
                                                        .filter(item => selectedItem.upsell_items?.includes(item.id))
                                                        .map(upsell => (
                                                            <motion.div 
                                                                key={upsell.id}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="shrink-0 w-48 bg-white/60 backdrop-blur-md rounded-[2rem] p-4 border border-white/80 shadow-sm flex flex-col gap-3"
                                                            >
                                                                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner">
                                                                    <img src={getDirectImageUrl(upsell.image_url)} className="w-full h-full object-cover" alt={upsell.title} />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <h5 className="font-black italic text-xs text-[#0F3D2E] line-clamp-1">{upsell.title}</h5>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-black text-[#C8A96A]">₹{upsell.price}</span>
                                                                        <button 
                                                                            onClick={() => updateQuantity(upsell.id, (cart[upsell.id] || 0) + 1)}
                                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${cart[upsell.id] ? 'bg-[#0F3D2E] text-white' : 'bg-[#C8A96A] text-white'}`}
                                                                        >
                                                                            {cart[upsell.id] ? (
                                                                                <span className="text-[10px] font-black">{cart[upsell.id]}</span>
                                                                            ) : (
                                                                                <Plus className="w-4 h-4" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Action Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F5F1E8] via-[#F5F1E8] to-transparent">
                                    <div className="flex items-center gap-4 bg-[#0F3D2E] p-3 rounded-[2rem] shadow-2xl">
                                        <div className="flex items-center bg-white/10 rounded-full p-1.5 ml-1">
                                            <button 
                                                onClick={() => updateQuantity(selectedItem.id, Math.max(0, (cart[selectedItem.id] || 0) - 1))}
                                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center text-white font-black text-lg">{cart[selectedItem.id] || 0}</span>
                                            <button 
                                                onClick={() => updateQuantity(selectedItem.id, (cart[selectedItem.id] || 0) + 1)}
                                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0F3D2E] active:scale-90 transition-all font-black"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (!cart[selectedItem.id]) updateQuantity(selectedItem.id, 1);
                                                setSelectedItem(null);
                                            }}
                                            className="flex-1 text-center text-white font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                                        >
                                            <ShoppingCart className="w-5 h-5 opacity-40" />
                                            {cart[selectedItem.id] ? "Done" : "Add to Cart"}
                                        </button>
                                    </div>
                                </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
