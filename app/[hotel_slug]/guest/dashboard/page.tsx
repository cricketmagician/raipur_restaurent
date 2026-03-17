"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Sparkles, Search, ArrowUpRight, Receipt, ChevronRight, User, ArrowRight, Star, MapPin, Wifi, Car, Hammer, Shirt, Briefcase, Bath, MoreHorizontal, Home } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";
import { ImpulseBottomSheet } from "@/components/ImpulseBottomSheet";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers, useCart, useSupabaseMenuItems, useMenuCategories, deriveMenuCategories, normalizeCategoryKey, useSeasonalStories, getRoomAccessState } from "@/utils/store";
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
import { TrendingNow } from "@/components/TrendingNow";
import { PerfectPairs } from "@/components/PerfectPairs";
import { MoodSection } from "@/components/MoodSection";
import { useAddEffectTrigger } from "@/components/AddEffect";


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

    const { roomNumber: tableNumber, checkedInAt, numGuests, orderMode } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id);
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);
    const timeTheme = getTimeTheme();
    const theme = useTheme(branding);

    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [hungerLevel, setHungerLevel] = useState<'light' | 'hungry' | 'very-hungry'>('hungry');
    const [upsellItem, setUpsellItem] = useState<{ id: string; title: string } | null>(null);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = React.useState(false);

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

    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);
    const availableMenuItems = useMemo(
        () => menuItems.filter((item) => item.is_available !== false),
        [menuItems]
    );
    const categoryRecords = useMemo(() => {
        const activeCategories = menuCategories.filter((category) => category.is_active !== false);
        return activeCategories.length > 0 ? activeCategories : deriveMenuCategories(menuItems);
    }, [menuCategories, menuItems]);
    const categories = useMemo(() => ([
        { id: "all", name: "All", icon: "🍱" },
        ...categoryRecords.map((category) => ({
            id: normalizeCategoryKey(category.slug || category.name),
            name: category.name,
            icon: category.icon_emoji || "🍽️",
        })),
    ]), [categoryRecords]);


    const { stories: dynamicStories, loading: storiesLoading } = useSeasonalStories(branding?.id);

    const stories = useMemo(() => {
        if (dynamicStories.length > 0) return dynamicStories;
        // Fallback for demo/empty state
        return [
            { id: "s1", image_url: "/images/menu_demo/dessert.png", label: "Midnight Choco", type: "Viral", menu_item_id: "d1137704-58a3-48b4-8395-8120387e7f6e", price: 219, hotel_id: branding?.id || "", is_active: true },
            { id: "s2", image_url: "/images/menu_demo/fries.png", label: "Peri Peri Rush", type: "Trending", menu_item_id: "f1137704-58a3-48b4-8395-8120387e7f6e", price: 159, hotel_id: branding?.id || "", is_active: true },
            { id: "s3", image_url: "/images/menu_demo/burger.png", label: "Cheddar King", type: "New", menu_item_id: "b1137704-58a3-48b4-8395-8120387e7f6e", price: 299, hotel_id: branding?.id || "", is_active: true },
            { id: "s4", image_url: "/images/menu_demo/pizza.png", label: "Garden Fresh", type: "Must try", menu_item_id: "a1137704-58a3-48b4-8395-8120387e7f6e", price: 349, hotel_id: branding?.id || "", is_active: true },
            { id: "s5", image_url: "/images/menu_demo/coffee.png", label: "Cold Brew", type: "Classic", menu_item_id: "c1137704-58a3-48b4-8395-8120387e7f6e", price: 189, hotel_id: branding?.id || "", is_active: true },
        ];
    }, [dynamicStories, branding]);

    const trendingItems = useMemo(() => {
        const popular = availableMenuItems.filter(i => i.is_popular).slice(0, 2);
        return popular.map((item, index) => ({
            id: `t${index}`,
            title: item.title,
            description: item.description || "The community favorite choice.",
            image: item.image_url ? getDirectImageUrl(item.image_url) : "/images/menu_demo/coffee.png",
            price: item.price,
            tag: index === 0 ? "Bestseller" : "Trending",
            menuItemId: item.id
        }));
    }, [availableMenuItems]);

    const perfectPairs = useMemo(() => {
        const itemsWithPairings = availableMenuItems.filter(i => i.is_recommended && i.upsell_items && i.upsell_items.length > 0);
        const pairs: any[] = [];
        
        if (itemsWithPairings.length >= 1) {
            const main = itemsWithPairings[0];
            const companionId = main.upsell_items![0];
            const companion = availableMenuItems.find(m => m.id === companionId);
            if (companion) {
                pairs.push({
                    id: "p1",
                    title: `${main.title} + ${companion.title}`,
                    subtitle: "Handcrafted Pairing",
                    image: main.image_url ? getDirectImageUrl(main.image_url) : "/images/menu_demo/coffee.png",
                    price: main.price + companion.price,
                    originalId: main.id
                });
            }
        }
        
        if (pairs.length < 2) {
             const others = availableMenuItems.filter(i => !pairs.some(p => p.originalId === i.id)).slice(0, 2 - pairs.length);
             others.forEach((item, i) => {
                 pairs.push({
                     id: `p${pairs.length + 1}`,
                     title: item.title,
                     subtitle: "Perfect with anything",
                     image: item.image_url ? getDirectImageUrl(item.image_url) : "/images/menu_demo/coffee.png",
                     price: item.price,
                     originalId: item.id
                 });
             });
        }
        return pairs;
    }, [availableMenuItems]);

    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = availableMenuItems.find(m => m.id === id);
        const comboItem = (id.includes("combo") || id === "king_size") ? SHARED_COMBOS.find(c => c.id === id) : null;
        
        return sum + ((item?.price || comboItem?.price || 0) * q);
    }, 0);

    const liveBillTotal = requests
        .filter((request) => (request.total || 0) > 0 && !request.is_paid)
        .reduce((sum, request) => sum + (request.total || 0), 0);

    const openOrderCount = requests.filter((request) => request.status !== "Completed").length;
    
    const menuItemsWithSales = React.useMemo(() => {
        const salesMap: Record<string, number> = {};
        requests.forEach(req => {
            if (req.type?.includes("Dining Order") && req.notes) {
                const matches = req.notes.matchAll(/(\d+)x\s+([^,]+)/g);
                for (const match of matches) {
                    const qty = parseInt(match[1]);
                    const itemName = match[2].trim();
                    salesMap[itemName] = (salesMap[itemName] || 0) + qty;
                }
            }
        });
        const enriched = availableMenuItems.map(item => ({
            ...item,
            salesCount: salesMap[item.title] || 0,
            isBestseller: (salesMap[item.title] || 0) >= 5 || !!item.is_popular
        }));
        return enriched as any[];
    }, [requests, availableMenuItems]);

    const filteredItems = (activeCategory === "all" ? menuItemsWithSales : menuItemsWithSales.filter(i => normalizeCategoryKey(i.category) === activeCategory))
        .filter(item => {
            if (hungerLevel === 'light') return item.price < 300;
            if (hungerLevel === 'very-hungry') return item.price > 150;
            return true;
        });

    React.useEffect(() => {
        if (!menuItems.length) return;
        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );
        soldOutIds.forEach((id) => updateQuantity(id, 0));
    }, [menuItems, cart, updateQuantity]);

    const handleOrder = async () => {
        if (!branding?.id) return;

        if (orderMode !== "takeaway") {
            const accessState = await getRoomAccessState(branding.id, tableNumber);
            if (!accessState.active) {
                setToast({
                    message: "This table is not active right now. Ask staff to activate the table before placing an order.",
                    type: "error",
                    isVisible: true,
                });
                return;
            }
        }

        setIsOrdering(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        if (soldOutIds.length > 0) {
            soldOutIds.forEach((id) => updateQuantity(id, 0));
            setToast({ message: "Some sold out items were removed from your bag. Please review your cart.", type: "error", isVisible: true });
            return;
        }

        const cartItems = Object.entries(cart).map(([id, q]) => {
            let item = availableMenuItems.find(m => m.id === id);
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
        const cartItemsData = cartItems.map((item: any) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price || 0,
            total: (item.price || 0) * item.quantity,
        }));

        const { error } = await addSupabaseRequest(branding.id, {
            room: tableNumber,
            type: `Dining Order (${cartCount} items)`,
            notes: cartItems.map((item: any) => `${item.quantity}x ${item.title}`).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal,
            items: cartItemsData,
        });

        setIsOrdering(false);

        if (error) {
            setToast({ message: `Order Failed: ${error.message}`, type: "error", isVisible: true });
        } else {
            setToast({ message: "Order Placed Successfully!", type: "success", isVisible: true });
            setOrderComplete(true);
            clearCart();
            setShowCart(false);
        }
    };

    const triggerUpsell = (item: any) => {
        if (item.name?.toLowerCase().includes('burger') || item.category === 'burgers') {
            setUpsellItem({ id: item.id, title: item.name });
            return;
        }
        if (item.is_available === false) return;
        if (item.upsell_items && item.upsell_items.length > 0) {
            const potentialUpsell = availableMenuItems.find(m =>
                item.upsell_items.includes(m.id) && !cart[m.id]
            );
            if (potentialUpsell) {
                setTimeout(() => {
                    setUpsellItem(potentialUpsell);
                }, 500);
            }
        }
    };

    const addToCart = (item: any, isUpsell = false) => {
        if (item.is_available === false) {
            setToast({ message: "This item is sold out right now.", type: "error", isVisible: true });
            return;
        }
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);
        if (isUpsell) {
            setUpsellItem(null);
            return;
        }
        triggerUpsell(item);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-[#00704A] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const isHungry = hungerLevel === 'very-hungry' || scrolled;
    const tableNumberDisplay = tableNumber;

    return (
        <div 
            className="pb-40 pt-10 min-h-screen w-full overflow-x-hidden transition-colors duration-500 relative bg-[#F1F8F5]"
            style={{ 
                fontFamily: theme.fontSans,
                color: theme.text
            }}
        >
            {/* [Fix #10] Luxury Texture & Grain Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[200] mix-blend-overlay" 
                 style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

            {/* Background Layer (only active when scrolled) */}
            <div 
                className="fixed inset-0 -z-20 transition-opacity duration-500"
                style={{ 
                    backgroundColor: theme.background,
                    opacity: scrolled ? 1 : 0
                }}
            />

            {/* Simple Hero Section */}
            <div className="absolute top-0 left-0 right-0 h-[48vh] overflow-hidden -z-10 bg-[#002B1B]">
                <img 
                    src={getDirectImageUrl(branding?.hero_image || branding?.heroImage) || "/images/branding/hero.png"} 
                    alt="Hotel Interior" 
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F1F8F5] via-transparent to-black/30" />
            </div>

            <div className="h-[32vh]" /> {/* Spacer for Hero */}

            {/* Simple Hotel Info Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 px-6"
            >
                <div className="flex items-center justify-between bg-white px-6 py-5 rounded-[2rem] shadow-xl border border-black/5">
                    <div>
                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 mb-1" style={{ color: "#1E3932" }}>Dining At</h2>
                        <h1 className="text-xl font-black tracking-tight" style={{ color: "#1E3932" }}>
                            {branding?.name || "ELITE CAFE"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00704A] shadow-lg">
                        <MapPin className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">TABLE {tableNumberDisplay}</span>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-14 px-6">
                {/* [Fix #4] Quick Order Section (Dynamic) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black tracking-tighter" style={{ color: "#1E3932" }}>
                            ⚡ Quick Order
                        </h3>
                        <button onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)} className="text-[10px] font-black uppercase tracking-widest text-[#00704A]">See Full Menu</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
                        {(branding?.quick_order_ids && branding.quick_order_ids.length > 0 
                            ? branding.quick_order_ids.map(id => menuItemsWithSales.find(i => i.id === id)).filter(Boolean)
                            : menuItemsWithSales.filter(i => i.is_popular || i.isBestseller).slice(0, 4)
                        ).map((item: any) => (
                            <motion.div 
                                key={item.id}
                                whileTap={{ scale: 0.98 }}
                                className="flex-none w-[200px] bg-white rounded-[2rem] p-4 shadow-xl border border-[#1E3932]/5 flex flex-col items-center text-center"
                            >
                                <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 shadow-sm border border-black/5">
                                    <img src={getDirectImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="text-sm font-black tracking-tight mb-1 line-clamp-1" style={{ color: "#1E3932" }}>{item.title}</h4>
                                <p className="text-[12px] font-black text-[#00704A] mb-4">₹{item.price}</p>
                                <button 
                                    onClick={() => addToCart(item)}
                                    className="w-full py-3 bg-[#00704A]/5 text-[#00704A] rounded-2xl font-black text-[9px] uppercase tracking-widest border border-[#00704A]/10 active:scale-95 active:bg-[#00704A] active:text-white transition-all"
                                >
                                    + Add to Bag
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* [Fix #3] Seasonal Stories (Conversion Optimized) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black tracking-tighter" style={{ color: "#1E3932" }}>
                            ✨ Seasonal Stories
                        </h3>
                    </div>
                    <div className="flex space-x-5 overflow-x-auto no-scrollbar pb-10 -mx-6 px-6">
                        {stories.map((story, index) => (
                            <motion.div 
                                key={story.id}
                                whileTap={{ scale: 0.96 }}
                                className="flex-none w-[160px] relative"
                            >
                                <div 
                                    onClick={() => setStoryConfig({ isVisible: true, initialIndex: index })}
                                    className="aspect-[3/4] overflow-hidden relative shadow-2xl mb-4 border border-white/20"
                                    style={{ borderRadius: "1.75rem" }}
                                >
                                    <img src={getDirectImageUrl(story.image_url)} alt={story.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    


                                    <div className="absolute bottom-4 left-4">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{story.label}</h4>
                                        <p className="text-[#D4E9E2] text-[10px] font-bold tracking-widest uppercase">₹{story.price}</p>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        const item = menuItems.find(m => m.id === story.menu_item_id);
                                        if (item) addToCart(item);
                                    }}
                                    className="w-full py-3.5 bg-white text-[#1E3932] rounded-[1.25rem] shadow-xl font-black text-[10px] uppercase tracking-[0.2em] border border-[#1E3932]/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Quick Add</span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 2. 🔥 Trending Now */}
                <TrendingNow 
                    items={trendingItems} 
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onItemClick={(id) => {
                        const trend = trendingItems.find((t: any) => t.id === id);
                        if (trend) router.push(`/${hotelSlug}/guest/item/${trend.menuItemId}`);
                    }} 
                />

                {/* 3. Immersive Promo Strip */}
                <section className="mt-8 space-y-6">
                    <div className="relative overflow-hidden rounded-[2.5rem] border shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
                        <img
                            src={getDirectImageUrl(branding?.heroImage) || stories[0]?.image_url || "/images/branding/hero.png"}
                            alt="Dining atmosphere"
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3932]/95 via-[#1E3932]/60 to-transparent" />
                        <div className="relative z-10 px-6 py-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl mb-4">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white">Guest Choice</span>
                            </div>
                            <h3 className="text-[2.2rem] font-black tracking-tighter leading-[0.95] text-white mb-4">
                                Explore every flavor,<br />not just the basics.
                            </h3>
                            <p className="text-sm font-medium leading-6 text-white/70 max-w-[280px] mb-8 italic">
                                Handcrafted espresso, artisanal bowls and secret menu blends await.
                            </p>
                            <button
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white text-[#1E3932] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                            >
                                Open Full Menu
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/bill`)}
                            className="rounded-[2.25rem] border bg-white/60 backdrop-blur-xl p-6 text-left shadow-xl active:scale-[0.98] transition-all"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-[#00704A]/10 text-[#00704A]">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2">Live Bill</p>
                            <h4 className="text-2xl font-black tracking-tight mb-1 text-[#1E3932]">₹{liveBillTotal.toFixed(0)}</h4>
                            <p className="text-[10px] font-medium leading-relaxed opacity-60">View charges or request settlement.</p>
                        </button>

                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                            className="rounded-[2.25rem] border bg-white/60 backdrop-blur-xl p-6 text-left shadow-xl active:scale-[0.98] transition-all"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-amber-100 text-[#00704A]">
                                <Sparkles className="w-6 h-6 text-amber-600" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2">Ready to order</p>
                            <h4 className="text-xl font-black tracking-tight mb-1 text-[#1E3932]">Express Checkout</h4>
                            <p className="text-[10px] font-medium leading-relaxed opacity-60">Order instantly. Skip the wait.</p>
                        </button>
                    </div>
                </section>

                {/* 4. Perfect Pairs */}
                <section>
                    <AnimatePresence>
                        {(cartCount > 0 || isHungry || upsellItem) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <PerfectPairs 
                                    pairs={perfectPairs}
                                    cart={cart}
                                    onUpdateQuantity={(id, q) => {
                                        updateQuantity(id, q);
                                        if (q > (cart[id] || 0)) {
                                            setToast({ message: "Excellent Choice! Added to Bag ✨", type: "success", isVisible: true });
                                        }
                                    }} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* [Fix #7] Trust Injection Bar */}
                <section className="mt-4 border-y border-[#1E3932]/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2.5">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-[11px] font-black tracking-tight text-[#1E3932]">{branding?.trust_signal || "1,000+ Happy Customers"}</p>
                                <p className="text-[9px] font-bold text-[#00704A] uppercase tracking-widest opacity-60">Most loved in Raipur</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between opacity-30 invert px-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-5" alt="UPI" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-5" alt="PayPal" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3.5" alt="Visa" />
                    </div>
                </section>

                {/* 5. Mood Section */}
                <MoodSection onMoodClick={(id) => router.push(`/${hotelSlug}/guest/restaurant?mood=${id}`)} />

                {/* 🎁 Rewards Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group transition-all duration-500 border border-[#00704A]/10"
                    style={{ backgroundColor: "#00704A" }}
                >
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-32 h-32 text-white" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-center space-x-2 mb-4 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">ELITE STATUS</span>
                        </div>
                        
                        <>
                            <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2 leading-none">Vibe with Us.</h3>
                            <p className="text-white/70 text-sm font-medium italic mb-8">Join the elite circle and earn rewards on every order.</p>
                            <button className="px-10 py-5 bg-white text-[#00704A] rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                                Join The Lounge
                            </button>
                        </>
                    </div>
                </motion.div>
            </div>

            {/* Modals & Overlays */}
            {/* Loyalty removed */}
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
                onOrder={(story, e) => {
                    const mid = story.menu_item_id;
                    if (mid) {
                        updateQuantity(mid, (cart[mid] || 0) + 1);
                        triggerFly(mid, story.image_url || '', e);
                        setStoryConfig({ ...storyConfig, isVisible: false });
                        setToast({ message: "Added to Bag! ✨", type: "success", isVisible: true });
                    }
                }}
            />

            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
}
