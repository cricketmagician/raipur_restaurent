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
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { useGuestLoyalty, addLoyaltyPoints, saveGuestLoyaltySession } from "@/utils/store";


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
    // Loyalty State
    const [loyaltyProfile, setLoyaltyProfile] = useState<{ phone: string; name: string; lastVisitAt?: string | null } | null>(() => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        return stored ? JSON.parse(stored) : null;
    });
    const { loyalty: realLoyalty } = useGuestLoyalty(branding?.id, loyaltyProfile?.phone || null);
    const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

    const handleLoyaltySignIn = async (phone: string, name: string) => {
        const profile = { phone, name, lastVisitAt: new Date().toISOString() };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(profile));
        setLoyaltyProfile(profile);
        if (branding?.id) {
            await saveGuestLoyaltySession(branding.id, phone, name, { lastVisitAt: profile.lastVisitAt });
        }
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
        // Try to find items with pairings, or just pick two interesting ones
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
                    originalId: main.id // We'll just add the main one for simplicity or handle both
                });
            }
        }
        
        // Fallback or second pair
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

        // No change needed to updateQuantity itself as it's now from useCart

    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = availableMenuItems.find(m => m.id === id);
        const comboItem = (id.includes("combo") || id === "king_size") ? SHARED_COMBOS.find(c => c.id === id) : null;
        
        return sum + ((item?.price || comboItem?.price || 0) * q);
    }, 0);
    const liveBillTotal = requests
        .filter((request) => (request.total || 0) > 0 && !request.is_paid)
        .reduce((sum, request) => sum + (request.total || 0), 0);
    const openOrderCount = requests.filter((request) => request.status !== "Completed").length;
    
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
        const enriched = availableMenuItems.map(item => ({
            ...item,
            salesCount: salesMap[item.title] || 0,
            isBestseller: (salesMap[item.title] || 0) >= 5 || !!item.is_popular
        }));

        return enriched as any[];
    }, [requests, availableMenuItems]);

    const filteredItems = (activeCategory === "all" ? menuItemsWithSales : menuItemsWithSales.filter(i => normalizeCategoryKey(i.category) === activeCategory))
        .filter(item => {
            if (hungerLevel === 'light') return item.price < 300; // Prefer snacks/drinks
            if (hungerLevel === 'very-hungry') return item.price > 150; // Prefer filling meals
            return true; // Hungry = Everything
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
        if (!loyaltyProfile) {
            setIsLoyaltyOpen(true);
            return;
        }

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

        if (loyaltyProfile?.phone) {
            const now = new Date().toISOString();
            await saveGuestLoyaltySession(branding.id, loyaltyProfile.phone, loyaltyProfile.name, {
                lastVisitAt: loyaltyProfile.lastVisitAt || now,
                lastOrderAt: now,
                lastOrderMode: orderMode,
            });
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
        // --- Smart Pairing Logic (Revenue Engine V3) ---
        // If it's a burger, auto-trigger the Perfect Pairs section
        if (item.name?.toLowerCase().includes('burger') || item.category === 'burgers') {
            setUpsellItem({ id: item.id, title: item.name });
            return;
        }

        if (item.is_available === false) return;

        if (item.upsell_items && item.upsell_items.length > 0) {
            const potentialUpsell = availableMenuItems.find(m =>
                item.upsell_items.includes(m.id) &&
                !cart[m.id]
            );

            if (potentialUpsell) {
                // 0.5s delay for natural feel
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

    const isHungry = hungerLevel === 'very-hungry' || scrolled;

    const tableNumberDisplay = tableNumber;
    return (
        <div 
            className="pb-40 pt-10 px-6 min-h-screen w-full max-w-[500px] mx-auto overflow-x-hidden transition-colors duration-500 relative"
            style={{ 
                fontFamily: theme.fontSans,
                color: theme.text
            }}
        >
            {/* Background Layer (only active when scrolled) */}
            <div 
                className="fixed inset-0 -z-20 transition-opacity duration-500"
                style={{ 
                    backgroundColor: theme.background,
                    opacity: scrolled ? 1 : 0 // Fully transparent at top, solid on scroll
                }}
            />
            {/* 1. Premium Hero Section */}
            <div className="absolute top-0 left-0 right-0 h-[38vh] overflow-hidden -z-10 bg-black">
                <img 
                    src={getDirectImageUrl(branding?.heroImage) || "/images/branding/hero.png"} 
                    alt="Hotel Interior" 
                    className="w-full h-full object-cover opacity-70 scale-100" // Reduced opacity and scale for stability
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
            </div>

            {/* 2. Floating Hotel Information Card (Ultra-Thin Glass Bar) */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-[28vh] mb-10 bg-white/10 backdrop-blur-2xl px-6 py-4 shadow-sm relative overflow-hidden group border border-white/20"
                style={{ 
                    borderRadius: "1rem"
                }}
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black text-white tracking-[0.25em] uppercase leading-none">
                            {branding?.name || "HOTEL TEEKLOVE"}
                        </h1>
                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                            <Utensils className="w-2.5 h-2.5 text-white" />
                            <span className="text-[8px] font-bold text-white uppercase tracking-widest">{branding?.guestTheme === 'FINE_DINE' ? 'Fine Dining' : 'Urban Cafe'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 3. Operational Services Grid (From Screenshot) */}

            <div className="space-y-12">
                {/* Seasonal Stories moved below hero/card */}
                <div className="mb-0">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif', color: theme.primary }}>
                            ✨ Seasonal Stories
                        </h3>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Swipe to Explore</span>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6">
                        {stories.map((story, index) => (
                            <motion.div 
                                key={story.id}
                                whileTap={{ scale: 0.96, rotate: -1 }}
                                onClick={() => setStoryConfig({ isVisible: true, initialIndex: index })}
                                className="flex-none w-[120px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.2)] cursor-pointer group relative active:shadow-sm transition-all duration-300 border border-white/10"
                                style={{ 
                                    backgroundColor: theme.surface,
                                    borderRadius: "1rem"
                                }}
                            >
                                <div className="aspect-[9/16] overflow-hidden relative">
                                    <img src={getDirectImageUrl(story.image_url)} alt={story.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                    
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 scale-90 origin-left">
                                        <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-[7px] font-black text-white uppercase tracking-widest">{story.type || 'LIVE'}</span>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h4 className="text-[10px] font-black text-white leading-tight uppercase tracking-widest">{story.label}</h4>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        <div className="flex-none w-10" /> {/* Spacer for scroll end */}
                    </div>
                </div>

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

                {/* 3. Premium Editorial Strip */}
                <section className="space-y-4">
                    <div className="relative overflow-hidden rounded-[2.5rem] border shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
                        <img
                            src={getDirectImageUrl(branding?.heroImage) || stories[0]?.image_url || "/images/branding/hero.png"}
                            alt="Dining atmosphere"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-black/20" />
                        <div className="relative z-10 px-6 py-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 border border-white/10 backdrop-blur-xl mb-4">
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white">Tonight&apos;s Edit</span>
                            </div>
                            <h3 className="text-[2rem] font-black tracking-tight leading-[0.95] text-white mb-3">
                                Explore the full menu,
                                <br />
                                not just a few shortcuts.
                            </h3>
                            <p className="text-sm font-medium leading-6 text-white/72 max-w-[280px] mb-6">
                                Mains, desserts, pairings and coffee live in one immersive menu flow designed for faster choices.
                            </p>
                            <button
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                            >
                                Open Full Menu
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/bill`)}
                            className="rounded-[2rem] border bg-white/82 backdrop-blur-xl p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}>
                                <Receipt className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2" style={{ color: theme.primary }}>
                                Live Bill
                            </p>
                            <h4 className="text-xl font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                ₹{liveBillTotal.toFixed(0)}
                            </h4>
                            <p className="text-[11px] font-medium leading-5 opacity-60" style={{ color: theme.primary }}>
                                {liveBillTotal > 0 ? "Review charges and request settlement anytime." : "Your table is clean. New orders will appear here."}
                            </p>
                        </button>

                        <button
                            onClick={() => loyaltyProfile ? router.push(`/${hotelSlug}/guest/profile`) : setIsLoyaltyOpen(true)}
                            className="rounded-[2rem] border bg-white/82 backdrop-blur-xl p-5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.secondary}55`, color: theme.primary }}>
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2" style={{ color: theme.primary }}>
                                {loyaltyProfile ? "Member Lounge" : "Guest Identity"}
                            </p>
                            <h4 className="text-lg font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                {loyaltyProfile ? `${currentPoints} vibe points` : "Save your details"}
                            </h4>
                            <p className="text-[11px] font-medium leading-5 opacity-60" style={{ color: theme.primary }}>
                                {loyaltyProfile
                                    ? `${openOrderCount > 0 ? `${openOrderCount} live table updates` : "Ready for a fresh order"}`
                                    : "Faster takeaway checkout and known guest recognition."}
                            </p>
                        </button>
                    </div>
                </section>

                {/* 4. 🤤 Perfect Pairs (AOV Booster - Contextual Appearance) */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {(cartCount > 0 || isHungry || upsellItem) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 5. 🌈 Mood Section (Decision Shortcut) */}
                <MoodSection onMoodClick={(id) => router.push(`/${hotelSlug}/guest/restaurant?mood=${id}`)} />

                {/* 🎁 Glassy & Thin Rewards Section (Moved lower) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => !loyaltyProfile && setIsLoyaltyOpen(true)}
                    className={`rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group transition-all duration-500 backdrop-blur-3xl border ${!loyaltyProfile ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
                    style={{ 
                        backgroundColor: `${theme.primary}05`, // Ultra-light tint
                        borderColor: `${theme.primary}20`,
                        borderRadius: theme.radius
                    }}
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                    {loyaltyProfile ? `Welcome, ${loyaltyProfile.name}` : "Member Lounge"}
                                </span>
                            </div>
                            
                            {loyaltyProfile ? (
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-black" style={{ color: theme.primary }}>{currentPoints}</span>
                                    <span className="text-xs font-bold opacity-40 tracking-tight uppercase">vibe points</span>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-black italic tracking-tighter" style={{ color: theme.primary }}>Join the Vibe.</h3>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Earn points while you order</p>
                                </div>
                            )}
                        </div>

                        {!loyaltyProfile && (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all border"
                                 style={{ backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}20`, color: theme.primary }}>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        )}

                        {loyaltyProfile && (
                            <div className="text-right">
                                <div className="w-24 bg-black/5 h-1 rounded-full overflow-hidden mb-1">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        className="h-full" 
                                        style={{ backgroundColor: theme.primary }}
                                    />
                                </div>
                                <p className="text-[8px] font-black opacity-30 tracking-widest uppercase">
                                    {pointsToNextTreat} TO GO
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>


            </div>

            <LoyaltySignIn
                isOpen={isLoyaltyOpen}
                onClose={() => setIsLoyaltyOpen(false)}
                onSignIn={handleLoyaltySignIn}
                initialName={loyaltyProfile?.name}
                initialPhone={loyaltyProfile?.phone}
                lastVisitAt={loyaltyProfile?.lastVisitAt || realLoyalty?.last_visit_at}
            />

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
