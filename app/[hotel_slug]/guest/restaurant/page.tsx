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
import { ChefPicksSnapRail } from "@/components/ChefPicksSnapRail";
import { MinimalMenuItemCard } from "@/components/MinimalMenuItemCard";
import { FloatingCartBar } from "@/components/FloatingCartBar";
import { PopularGrid } from "@/components/PopularGrid";
import { IndulgeSection } from "@/components/IndulgeSection";
import { Search, Sparkles } from "lucide-react";

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

    const categoryRecords = menuCategories.filter((category) => category.is_active !== false).length > 0
        ? menuCategories.filter((category) => category.is_active !== false)
        : deriveMenuCategories(availableItems as any);

    const categories = useMemo(() => ([
        { id: "all", name: "All", icon: "🍱" },
        ...categoryRecords.map((category) => ({
            id: normalizeCategoryKey(category.slug || category.name),
            name: category.name,
            icon: category.icon_emoji || "🍽️",
            tagline: category.description,
            imageUrl: category.image_url
        })),
    ]), [categoryRecords]);

    // --- REVENUE ENGINE LOGIC ---
    const chefPicks = useMemo(() => availableItems.filter(item => item.is_recommended).slice(0, 5), [availableItems]);
    
    const popularItems = useMemo(() => 
        availableItems.filter(i => i.is_popular && !i.is_recommended).slice(0, 4), 
    [availableItems]);

    const lightItems = useMemo(() => 
        availableItems.filter(i => i.price < 250 && !i.is_popular && !i.is_recommended).slice(0, 6), 
    [availableItems]);

    const indulgeItems = useMemo(() => 
        availableItems.filter(i => 
            i.category?.toLowerCase().includes("dessert") || 
            (i.price > 400 && i.is_recommended)
        ).slice(0, 2), 
    [availableItems]);

    const upsellItems = useMemo(() => {
        const cartItemNames = Object.keys(cart).map(id => effectiveItems.find(i => i.id === id)?.title?.toLowerCase() || "");
        const hasCoffee = cartItemNames.some(n => n.includes("coffee"));
        const hasBurger = cartItemNames.some(n => n.includes("burger"));

        return availableItems.filter(i => {
            if (hasCoffee) return i.category?.toLowerCase().includes("dessert") || i.category?.toLowerCase().includes("cake");
            if (hasBurger) return i.category?.toLowerCase().includes("sides") || i.title?.toLowerCase().includes("fries");
            return i.is_popular; // Fallback
        }).slice(0, 4);
    }, [cart, availableItems, effectiveItems]);

    // Scroll Logic: Sticky & Intersection
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Intersection Logic for auto-highlighting
            const scrollPos = window.scrollY + 150;
            let current = "all";

            for (const catId in sectionRefs.current) {
                const element = sectionRefs.current[catId];
                if (element && element.offsetTop <= scrollPos) {
                    current = catId;
                }
            }
            setActiveCategory(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToCategory = (id: string) => {
        if (id === "all") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const element = sectionRefs.current[id];
        if (element) {
            const offset = element.offsetTop - 120;
            window.scrollTo({ top: offset, behavior: "smooth" });
        }
    };

    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = availableItems.find(i => i.id === id);
        return sum + (item?.price || 0) * q;
    }, 0);

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        const cartItemsData = Object.entries(cart).map(([id, q]) => {
            const item = availableItems.find(m => m.id === id);
            return { id, title: item?.title || 'Unknown', quantity: q, price: item?.price || 0, total: (item?.price || 0) * q };
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

    return (
        <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-h-screen bg-[#F5F1E8] pb-40">
            {/* 1. GLASS TOP BAR */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 flex items-center justify-between ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200" : "bg-transparent"}`}>
                <button onClick={() => router.back()} className="text-[#0F3D2E]/40 text-[10px] font-black uppercase tracking-widest">← Back</button>
                <h1 className="text-[#0F3D2E] text-sm font-semibold tracking-tight">Menu</h1>
                <button onClick={() => setShowCart(true)} className="p-2"><Search className="w-5 h-5 text-[#0F3D2E]" /></button>
            </header>

            {/* 2. CATEGORY NAV (STICKY) */}
            <CategoryScrollNav categories={categories} activeCategory={activeCategory} onCategoryClick={scrollToCategory} scrolled={scrolled} />

            <div className="max-w-md mx-auto px-6 space-y-12 pt-24">
                {/* HERO */}
                <CategorySectionHeader 
                    name={activeCategory === "all" ? "Our Menu" : formatCategoryName(activeCategory)}
                    tagline={activeCategory === "all" ? "Experience premium flavors." : (categories.find(c => c.id === activeCategory) as any)?.tagline}
                    imageUrl={activeCategory === "all" ? branding?.hero_image : (categories.find(c => c.id === activeCategory) as any)?.imageUrl}
                />

                {/* FLOW 1: CHEF PICKS (TEMPTATION) */}
                <ChefPicksSnapRail 
                    items={chefPicks} cart={cart} 
                    onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)}
                    onRemove={(item) => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                />

                {/* FLOW 2: MORE TO EXPLORE (TRANSITION) */}
                <div className="flex items-center gap-6 py-4">
                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0F3D2E]/40">More to explore</h4>
                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                </div>

                {/* FLOW 3: POPULAR RIGHT NOW (CONVERSION) */}
                <PopularGrid items={popularItems} onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)} />

                {/* FLOW 4: MAIN CATEGORY ITEMS (CONTROL) */}
                {categories.filter(c => c.id !== "all").map((cat: any) => (
                    <section key={cat.id} id={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el as HTMLDivElement; }} className="space-y-6">
                        <CategorySectionHeader name={cat.name} tagline={cat.tagline || "Freshly prepared."} imageUrl={cat.imageUrl} />
                        <div className="space-y-4">
                            {availableItems.filter((item: any) => normalizeCategoryKey(item.category) === cat.id).map((item) => (
                                <MinimalMenuItemCard key={item.id} item={item} quantity={cart[item.id] || 0} onAdd={() => updateQuantity(item.id, (cart[item.id] || 0) + 1)} onRemove={() => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))} />
                            ))}
                        </div>
                    </section>
                ))}

                {/* FLOW 5: LIGHT & QUICK (GUIDANCE) */}
                {lightItems.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-xl font-semibold tracking-tight text-[#0F3D2E]">Light & refreshing</h3>
                        </div>
                        <ChefPicksSnapRail items={lightItems} cart={cart} onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)} onRemove={(item) => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))} />
                    </section>
                )}

                {/* FLOW 6: INDULGE YOURSELF (EMOTIONAL TRIGGER) */}
                <IndulgeSection items={indulgeItems} onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)} />

                {/* FLOW 7: PAIR WITH THIS (UPSELL) */}
                {cartCount > 0 && (
                    <section className="space-y-6">
                        <h3 className="px-1 text-xl font-semibold tracking-tight text-[#0F3D2E]">Perfect with your order</h3>
                        <PopularGrid items={upsellItems} onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)} />
                    </section>
                )}
            </div>

            <FloatingCartBar count={cartCount} total={cartTotal} onClick={() => setShowCart(true)} isVisible={!showCart} />
            <CartOverlay isOpen={showCart} onClose={() => setShowCart(false)} cart={cart} updateQuantity={updateQuantity} cartTotal={cartTotal} isOrdering={isOrdering} onOrder={handleOrder} hotelId={branding?.id} menuItems={availableItems} />
        </motion.div>
    );
}
