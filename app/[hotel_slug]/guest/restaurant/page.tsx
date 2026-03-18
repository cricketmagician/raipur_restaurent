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
import { CartOverlay } from "@/components/CartOverlay";
import { useTheme } from "@/utils/themes";
import { CategoryScrollNav } from "@/components/CategoryScrollNav";
import { CategorySectionHeader } from "@/components/CategorySectionHeader";
import { MinimalMenuItemCard } from "@/components/MinimalMenuItemCard";
import { FloatingCartBar } from "@/components/FloatingCartBar";
import { CategoryCard } from "@/components/CategoryCard";
import { Search, ChevronLeft, Sparkles } from "lucide-react";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { roomNumber, orderMode } = useGuestRoom();
    const { cart, updateQuantity, clearCart } = useCart(branding?.id);
    const theme = useTheme(branding);
    
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [showCart, setShowCart] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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

    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = availableItems.find(i => i.id === id);
        return sum + (item?.price || 0) * (q as number);
    }, 0);

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        const cartItemsData = Object.entries(cart).map(([id, q]) => {
            const item = availableItems.find(m => m.id === id);
            return { id, title: item?.title || 'Unknown', quantity: q, price: item?.price || 0, total: (item?.price || 0) * (q as number) };
        });
        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber || 'Unknown',
            type: "Dining Order",
            notes: cartItemsData.map(item => `${item.title} x${item.quantity}`).join(", "),
            total: cartTotal,
            price: cartTotal,
            items: cartItemsData
        });
        setIsOrdering(false);
        if (error) alert(`Order Failed: ${error.message}`);
        else { setOrderComplete(true); clearCart(); setShowCart(false); }
    };

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
            {/* 1. PREMIUM TOP BAR */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 flex items-center justify-between ${scrolled || activeCategory !== 'all' ? "bg-white/80 backdrop-blur-2xl border-b border-[#0F3D2E]/5 shadow-sm" : "bg-transparent"}`}>
                <div className="flex items-center gap-4">
                    {activeCategory !== 'all' ? (
                        <motion.button 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={() => setActiveCategory('all')} 
                            className="w-10 h-10 rounded-full bg-[#0F3D2E]/5 flex items-center justify-center text-[#0F3D2E]"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <button onClick={() => router.back()} className="text-[#0F3D2E]/40 text-[10px] font-black uppercase tracking-widest">← Back</button>
                    )}
                    <h1 className="text-[#0F3D2E] text-sm font-black italic tracking-tighter">
                        {activeCategory === 'all' ? 'The Menu' : currentCategory?.name}
                    </h1>
                </div>
                
                <div className="relative flex-1 max-w-[160px] ml-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0F3D2E]/40" />
                    <input 
                        type="text" 
                        placeholder="Search flavors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0F3D2E]/5 border-none rounded-full py-2.5 pl-10 pr-4 text-[11px] font-medium focus:ring-1 focus:ring-[#C8A96A] transition-all placeholder:text-[#0F3D2E]/20"
                    />
                </div>
            </header>

            {/* 2. GLOBAL CATEGORY NAV */}
            <CategoryScrollNav 
                categories={categories} 
                activeCategory={activeCategory} 
                onCategoryClick={handleCategoryClick} 
                scrolled={scrolled || activeCategory !== 'all'} 
            />

            <main className="max-w-md mx-auto px-6 pt-28">
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
                            className="space-y-10"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#C8A96A] fill-[#C8A96A]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Curated Collections</span>
                                </div>
                                <h2 className="text-5xl font-black italic tracking-tighter text-[#0F3D2E] leading-none">Explore Our World</h2>
                                <p className="text-[#0F3D2E]/40 text-sm font-medium italic">Discover flavors handcrafted for your mood.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {categories.filter(c => c.id !== "all").map((cat, idx) => (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
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
                                        />
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <FloatingCartBar count={cartCount} total={cartTotal} onClick={() => setShowCart(true)} isVisible={!showCart} />
            <CartOverlay isOpen={showCart} onClose={() => setShowCart(false)} cart={cart} updateQuantity={updateQuantity} cartTotal={cartTotal} isOrdering={isOrdering} onOrder={handleOrder} hotelId={branding?.id} menuItems={availableItems} />
        </motion.div>
    );
}
