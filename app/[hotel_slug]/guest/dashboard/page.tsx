"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Sparkles, Search, ArrowUpRight, Receipt, ChevronRight, User, ArrowRight } from "lucide-react";
import { ImpulseBottomSheet } from "@/components/ImpulseBottomSheet";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers, useCart, useSupabaseMenuItems } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";
import { ComboCard } from "@/components/ComboCard";
import { CategoryScroll } from "@/components/CategoryScroll";
import { MenuListItem } from "@/components/MenuListItem";
import { BottomNav } from "@/components/BottomNav";
import { FoodStory } from "@/components/FoodStory";
import { CartOverlay } from "@/components/CartOverlay";
import { SHARED_COMBOS } from "@/utils/constants";
import { getTimeTheme, CATEGORY_THEMES, useTheme } from "@/utils/themes";
import { StoryOverlay } from "@/components/StoryOverlay";
import { GlobalHeader } from "@/components/GlobalHeader";
import { TrendingNow } from "@/components/TrendingNow";
import { PerfectPairs } from "@/components/PerfectPairs";
import { MoodSection } from "@/components/MoodSection";
import { useAddEffectTrigger } from "@/components/AddEffect";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { useGuestLoyalty, addLoyaltyPoints } from "@/utils/store";


// Helper to safely render icons with className
const renderIcon = (icon: React.ReactNode, className: string) => {
    return React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, { className })
        : icon;
};

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { roomNumber: tableNumber, checkedInAt } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id);
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);
    const timeTheme = getTimeTheme();
    const theme = useTheme(branding);

    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [hungerMode, setHungerMode] = useState(false);
    const [upsellItem, setUpsellItem] = useState<{ id: string; title: string } | null>(null);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = React.useState(false);
    // Loyalty State
    const [loyaltyProfile, setLoyaltyProfile] = useState<{ phone: string; name: string } | null>(() => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        return stored ? JSON.parse(stored) : null;
    });
    const { loyalty: realLoyalty } = useGuestLoyalty(branding?.id, loyaltyProfile?.phone || null);
    const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

    const handleLoyaltySignIn = (phone: string, name: string) => {
        const profile = { phone, name };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(profile));
        setLoyaltyProfile(profile);
        // Points will auto-fetch via useGuestLoyalty
    };

    const currentPoints = realLoyalty?.points || 0;
    const pointsToNextTreat = Math.max(0, 150 - (currentPoints % 150));
    const progressPercent = ((currentPoints % 150) / 150) * 100;

    const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    const triggerFly = useAddEffectTrigger();

    // Story State
    const [storyConfig, setStoryConfig] = React.useState({ 
        isVisible: false, 
        initialIndex: 0 
    });

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const handleOpenCart = () => setShowCart(true);
        window.addEventListener("open_cart", handleOpenCart);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("open_cart", handleOpenCart);
        };
    }, []);

    const categories = [
        { id: "all", name: "All", icon: "🍱" },
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "fries", name: "Fries", icon: "🍟" },
        { id: "sides", name: "Sides", icon: "🥗" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
    ];

    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);


    const stories = [
        { id: "s1", image: "/images/menu_demo/dessert.png", label: "Choco Lava Delight", type: "Sweet", menuItemId: "d1137704-58a3-48b4-8395-8120387e7f6e", price: 219 },
        { id: "s2", image: "/images/menu_demo/fries.png", label: "Peri Peri Rush", type: "Viral", menuItemId: "f1137704-58a3-48b4-8395-8120387e7f6e", price: 159 },
        { id: "s3", image: "/images/menu_demo/burger.png", label: "Cheddar King", type: "Hot", menuItemId: "b1137704-58a3-48b4-8395-8120387e7f6e", price: 299 },
        { id: "s4", image: "/images/menu_demo/pizza.png", label: "Garden Special", type: "New", menuItemId: "a1137704-58a3-48b4-8395-8120387e7f6e", price: 349 },
    ];

    const trendingItems = useMemo(() => {
        const popular = menuItems.filter(i => i.is_popular).slice(0, 2);
        return popular.map((item, index) => ({
            id: `t${index}`,
            title: item.title,
            description: item.description || "The community favorite choice.",
            image: item.image_url || "/images/menu_demo/coffee.png",
            price: item.price,
            tag: index === 0 ? "Bestseller" : "Trending",
            menuItemId: item.id
        }));
    }, [menuItems]);

    const perfectPairs = useMemo(() => {
        // Try to find items with pairings, or just pick two interesting ones
        const itemsWithPairings = menuItems.filter(i => i.is_recommended && i.upsell_items && i.upsell_items.length > 0);
        const pairs: any[] = [];
        
        if (itemsWithPairings.length >= 1) {
            const main = itemsWithPairings[0];
            const companionId = main.upsell_items![0];
            const companion = menuItems.find(m => m.id === companionId);
            if (companion) {
                pairs.push({
                    id: "p1",
                    title: `${main.title} + ${companion.title}`,
                    subtitle: "Handcrafted Pairing",
                    image: main.image_url || "/images/menu_demo/coffee.png",
                    price: main.price + companion.price,
                    originalId: main.id // We'll just add the main one for simplicity or handle both
                });
            }
        }
        
        // Fallback or second pair
        if (pairs.length < 2) {
             const others = menuItems.filter(i => !pairs.some(p => p.originalId === i.id)).slice(0, 2 - pairs.length);
             others.forEach((item, i) => {
                 pairs.push({
                     id: `p${pairs.length + 1}`,
                     title: item.title,
                     subtitle: "Perfect with anything",
                     image: item.image_url || "/images/menu_demo/coffee.png",
                     price: item.price,
                     originalId: item.id
                 });
             });
        }
        return pairs;
    }, [menuItems]);

        // No change needed to updateQuantity itself as it's now from useCart

    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = menuItems.find(m => m.id === id);
        const comboItem = (id.includes("combo") || id === "king_size") ? SHARED_COMBOS.find(c => c.id === id) : null;
        
        return sum + ((item?.price || comboItem?.price || 0) * q);
    }, 0);
    
    // Calculate REAL sales data from requests
    const menuItemsWithSales = React.useMemo(() => {
        const salesMap: Record<string, number> = {};
        
        // Parse "Dining Order" notes to count item sales
        requests.forEach(req => {
            if (req.type?.includes("Dining Order") && req.notes) {
                // Regex matches patterns like "2x Item Name" or "1x Item Name"
                const matches = req.notes.matchAll(/(\d+)x\s+([^,]+)/g);
                for (const match of matches) {
                    const qty = parseInt(match[1]);
                    const itemName = match[2].trim();
                    salesMap[itemName] = (salesMap[itemName] || 0) + qty;
                }
            }
        });

        // Enrich menu items with real sales data
        const enriched = menuItems.map(item => ({
            ...item,
            salesCount: salesMap[item.title] || 0,
            isBestseller: (salesMap[item.title] || 0) >= 5 || !!item.is_popular
        }));

        return enriched as any[];
    }, [requests, menuItems]);

    const filteredItems = (activeCategory === "all" ? menuItemsWithSales : menuItemsWithSales.filter(i => i.category === activeCategory))
        .filter(item => !hungerMode || item.price > 150);

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cartItems = Object.entries(cart).map(([id, q]) => {
            let item = menuItems.find(m => m.id === id);
            if (!item && (id.includes("combo") || id === "king_size")) {
                const foundCombo = [
                    { id: "monster_combo", title: "Monster Combo Burger", price: 199 },
                    { id: "king_size", title: "King Size Platter", price: 299 }
                ].find(c => c.id === id);
                if (foundCombo) item = foundCombo as any;
            }
            if (!item) return null;
            return { ...item, quantity: q };
        }).filter(item => item !== null);

        const { error } = await addSupabaseRequest(branding.id, {
            room: tableNumber,
            type: `Dining Order (${cartCount} items)`,
            notes: cartItems.map((item: any) => `${item.quantity}x ${item.title}`).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal
        });

        setIsOrdering(false);

        if (error) {
            setToast({ message: `Order Failed: ${error.message}`, type: "error", isVisible: true });
        } else {
            // Loyalty Integration
            if (loyaltyProfile?.phone) {
                const earnedPoints = Math.floor(cartTotal / 10);
                if (earnedPoints > 0) {
                    await addLoyaltyPoints(branding.id, loyaltyProfile.phone, earnedPoints);
                    setToast({ message: `Order Placed! Earned ${earnedPoints} vibe points ✨`, type: "success", isVisible: true });
                } else {
                    setToast({ message: "Order Placed Successfully!", type: "success", isVisible: true });
                }
            } else {
                setToast({ message: "Order Placed Successfully!", type: "success", isVisible: true });
            }

            setOrderComplete(true);
            clearCart();
            setShowCart(false);
        }
    };

    const triggerUpsell = (item: any) => {
        // --- Smart Pairing Logic (Blueprint Phase) ---
        if (item.upsell_items && item.upsell_items.length > 0) {
            const potentialUpsell = menuItems.find(m => 
                item.upsell_items.includes(m.id) && 
                !cart[m.id]
            );

            if (potentialUpsell) {
                // 0.5s delay as per blueprint
                setTimeout(() => {
                    setUpsellItem(potentialUpsell);
                }, 500);
            }
        }
    };

    const addToCart = (item: any, isUpsell = false) => {
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);
        
        if (isUpsell) {
            setUpsellItem(null);
            return;
        }

        triggerUpsell(item);
    };

    const handleQuickRequest = async (type: string, notes: string) => {
        if (!branding?.id || submittingType) return;
        setSubmittingType(type);
        const { error } = await addSupabaseRequest(branding.id, {
            room: tableNumber,
            type: type,
            notes: notes,
            status: "Pending",
            price: 0,
            total: 0
        });
        setSubmittingType(null);
        if (error) {
            setToast({ message: `Error: ${error.message}`, type: "error", isVisible: true });
        } else {
            setToast({ message: `${type} Request Placed Successfully`, type: "success", isVisible: true });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-[#F55D2C] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const tableNumberDisplay = tableNumber;
    return (
        <div 
            className="pb-40 px-6 pt-10 min-h-screen max-w-[500px] mx-auto overflow-x-hidden transition-colors duration-500"
            style={{ 
                backgroundColor: theme.background,
                fontFamily: theme.fontSans,
                color: theme.text
            }}
        >
            {/* 1. Starbucks Style Greeting & Rewards */}
            <header className="mb-10">
                <div className="flex items-center justify-between mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-black tracking-tighter" style={{ color: theme.primary }}>
                            {timeTheme.greeting.split(" ")[0]}, {tableNumber !== "Takeaway" ? `Table ${tableNumber}` : "Guest"}
                        </h1>
                        <p className="text-sm font-bold mt-1 italic" style={{ color: theme.accent }}>{timeTheme.subtext}</p>
                    </motion.div>
                </div>

                {/* Starbucks Aesthetic Rewards Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => !loyaltyProfile && setIsLoyaltyOpen(true)}
                    className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${!loyaltyProfile ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                    style={{ 
                        backgroundColor: theme.primary,
                        borderRadius: theme.radius
                    }}
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                                {loyaltyProfile ? `Welcome, ${loyaltyProfile.name}` : "Guest Rewards"}
                            </span>
                            <Sparkles className="w-5 h-5 text-[#D4E9E2]" />
                        </div>
                        
                        {loyaltyProfile ? (
                            <>
                                <div className="flex items-baseline space-x-2 mb-2">
                                    <span className="text-5xl font-black">{currentPoints}</span>
                                    <span className="text-lg font-bold opacity-60 italic">vibe points</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className="h-full" 
                                        style={{ backgroundColor: theme.secondary }}
                                    />
                                </div>
                                <p className="text-[10px] font-bold mt-4 opacity-70 tracking-widest uppercase" style={{ color: theme.secondary }}>
                                    {pointsToNextTreat} POINTS UNTIL YOUR NEXT TREAT
                                </p>
                            </>
                        ) : (
                            <div className="py-2">
                                <h3 className="text-2xl font-black italic tracking-tight mb-2">Join the Vibe.</h3>
                                <p className="text-sm font-bold opacity-60">Tap to sign in and earn points on every order.</p>
                                <div className="mt-6 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#D4E9E2]">
                                    <span>Get Started</span>
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Abstract Siren Shape Background */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                </motion.div>
            </header>

            <div className="space-y-12">
                {/* 2. 🔥 Trending Now (Combo-focused) */}
                <TrendingNow 
                    items={trendingItems} 
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onItemClick={(id) => {
                        const trend = trendingItems.find((t: any) => t.id === id);
                        if (trend) router.push(`/${hotelSlug}/guest/item/${trend.menuItemId}`);
                    }} 
                />

                {/* 3. 🤤 Perfect Pairs (AOV Booster) */}
                <PerfectPairs 
                    pairs={perfectPairs}
                    cart={cart}
                    onUpdateQuantity={(id, q) => {
                        const item = menuItems.find(m => m.id === id);
                        if (item) {
                            updateQuantity(id, q);
                            if (q > (cart[id] || 0)) {
                                setToast({ message: "Excellent Choice! Added to Bag ✨", type: "success", isVisible: true });
                            }
                        }
                    }}
                />

                {/* 4. 🌈 Mood Section (Decision Shortcut) */}
                <MoodSection onMoodClick={(id) => router.push(`/${hotelSlug}/guest/restaurant?mood=${id}`)} />

                {/* 5. ⚡ Quick Picks (Refactored Visual Hierarchy) */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] px-2" style={{ color: theme.primary }}>⚡ Quick Picks</h3>
                    <div className="flex flex-nowrap overflow-x-auto pb-6 gap-4 no-scrollbar -mx-2 px-2">
                        {[
                            { label: 'Coffee', icon: '☕' },
                            { label: 'Burgers', icon: '🍔' },
                            { label: 'Sides', icon: '🍟' },
                            { label: 'Desserts', icon: '🍰' }
                        ].map((chip) => (
                            <button 
                                key={chip.label}
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant?cat=${chip.label.toLowerCase()}`)}
                                className="flex-none px-10 py-5 shadow-xl active:scale-95 transition-all flex items-center space-x-4 group border"
                                style={{ 
                                    borderRadius: theme.radius,
                                    backgroundColor: theme.surface,
                                    borderColor: `${theme.primary}10`
                                }}
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{chip.icon}</span>
                                <span className="font-black text-[10px] uppercase tracking-widest" style={{ color: theme.text }}>{chip.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 6. 🍽 Categories / Navigation */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.primary }}>
                            🍽 Browse Menu
                        </h3>
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                        className="w-full text-white py-8 shadow-2xl flex items-center justify-between px-8 group overflow-hidden relative"
                        style={{ 
                            backgroundColor: theme.primary,
                            borderRadius: theme.radius 
                        }}
                    >
                        <span className="text-2xl font-black tracking-tighter relative z-10">All Categories</span>
                        <ArrowUpRight className="w-8 h-8 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </motion.button>
                </div>

                {/* 7. 🧾 Current Tab (Discovery First, Bill Last) */}
                <AnimatePresence>
                    {requests.some(r => (r.total || 0) > 0) && (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] px-2" style={{ color: theme.primary }}>🧾 Current Tab</h3>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/bill`)}
                                className="w-full rounded-[2rem] p-8 border flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative"
                                style={{ 
                                    backgroundColor: `${theme.primary}10`, // 10% opacity
                                    borderColor: `${theme.primary}20`,
                                    borderRadius: theme.radius
                                }}
                            >
                                <div className="flex items-center relative z-10">
                                    <div 
                                        className="w-14 h-14 flex items-center justify-center mr-6 shadow-sm border" 
                                        style={{ 
                                            borderRadius: `calc(${theme.radius} * 0.6)`,
                                            backgroundColor: theme.surface,
                                            borderColor: `${theme.primary}10`
                                        }}
                                    >
                                        <Receipt className="w-6 h-6" style={{ color: theme.primary }} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: theme.primary }}>Total Bill</p>
                                        <span className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>
                                            ₹{requests.reduce((sum, r) => sum + (r.total || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-all relative z-10" style={{ color: theme.text }} />
                                <div className="absolute bottom-0 right-0 w-40 h-40 opacity-5 rounded-full blur-2xl translate-y-1/4 translate-x-1/4" style={{ backgroundColor: theme.primary }} />
                            </button>
                        </div>
                    )}
                </AnimatePresence>

                {/* Seasonal Collection (Optionalized at bottom or integrated elsewhere) */}
                <div className="space-y-6 pt-10 border-t" style={{ borderColor: `${theme.primary}10` }}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] px-2 opacity-40" style={{ color: theme.text }}>
                        ✨ Seasonal Stories
                    </h3>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
                        {stories.map((story, index) => (
                            <motion.div 
                                key={story.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStoryConfig({ isVisible: true, initialIndex: index })}
                                className="flex-none w-48 overflow-hidden shadow-lg border cursor-pointer group grayscale-0 hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
                                style={{ 
                                    backgroundColor: theme.surface,
                                    borderColor: `${theme.primary}10`,
                                    borderRadius: theme.radius
                                }}
                            >
                                <div className="aspect-square overflow-hidden relative">
                                    <img src={story.image} alt={story.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h4 className="text-xs font-black text-white leading-tight truncate">{story.label}</h4>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
            
            <ImpulseBottomSheet 
                item={upsellItem as any}
                isVisible={!!upsellItem}
                onAdd={() => upsellItem && addToCart(upsellItem, true)}
                onClose={() => setUpsellItem(null)}
            />

            <CartOverlay 
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                cart={cart}
                updateQuantity={updateQuantity}
                cartTotal={cartTotal}
                isOrdering={isOrdering}
                onOrder={handleOrder}
                hotelId={branding?.id}
                menuItems={menuItems}
            />

            <StoryOverlay 
                isVisible={storyConfig.isVisible}
                initialIndex={storyConfig.initialIndex}
                stories={stories}
                onClose={() => setStoryConfig({ ...storyConfig, isVisible: false })}
                onOrder={(story) => {
                    const item = menuItems.find(m => m.id === story.menuItemId);
                    if (item) {
                        addToCart(item);
                        setStoryConfig({ ...storyConfig, isVisible: false });
                        setToast({ message: "Added to Bag! ✨", type: "success", isVisible: true });
                    }
                }}
            />

            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
}
