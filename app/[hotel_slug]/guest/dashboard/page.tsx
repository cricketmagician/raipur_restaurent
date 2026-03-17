"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import {
    Utensils,
    Bell,
    Droplets,
    Zap,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Search,
    User,
    Wifi,
    Phone,
    Wrench,
    Shirt,
    Wind,
    Sparkles,
    Coffee,
    AlertCircle,
    ChevronLeft,
    Music,
    MapPin,
    ShoppingBag,
    RefreshCw,
    Receipt // Added Receipt icon
} from "lucide-react";
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

    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [hungerMode, setHungerMode] = useState(false);
    const [upsellItem, setUpsellItem] = useState<{ id: string; title: string } | null>(null);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
        { id: "s1", image: "/images/menu/choco_lava_cake_1773233674857.png", label: "New Dessert", type: "Sweet" },
        { id: "s2", image: "/images/menu/loaded_fries_hero_1773232655179.png", label: "Must Try", type: "Viral" },
        { id: "s3", image: "/images/menu/buttermilk_chicken_burger_1773233570467.png", label: "Chef Pick", type: "Hot" },
        { id: "s4", image: "/images/menu/garlic_bread_1773233624069.png", label: "Special", type: "New" },
    ];

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
            setOrderComplete(true);
            clearCart();
            setShowCart(false);
            setToast({ message: "Order Placed Successfully!", type: "success", isVisible: true });
        }
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
        <div className="pb-40 px-6 pt-10 min-h-screen bg-noise max-w-[500px] mx-auto overflow-x-hidden font-sans selection:bg-[#F59E0B]/30">
            {/* 1. Live Spend Widget (Pulse) */}
            <AnimatePresence>
                {requests.some(r => (r.total || 0) > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <button 
                            onClick={() => router.push(`/${hotelSlug}/guest/bill`)}
                            className="w-full bg-white rounded-[2rem] p-6 border border-[#3E2723]/5 shadow-xl shadow-[#3E2723]/5 flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-[#3E2723] rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-[#3E2723]/10">
                                    <Receipt className="w-5 h-5 text-[#FFF8F2]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Current Ledger</p>
                                    <div className="flex items-center">
                                        <span className="text-2xl font-serif italic text-[#3E2723] tracking-tighter">
                                            ₹{requests.reduce((sum, r) => sum + (r.total || 0), 0).toLocaleString()}
                                        </span>
                                        <motion.div 
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-2 h-2 bg-emerald-400 rounded-full ml-3" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-[#3E2723]/30 group-hover:text-[#3E2723] transition-colors" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-12">
                {/* 1. The Vibe Header */}
                <header className="text-center pt-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 rounded-[2.5rem] bg-white shadow-xl shadow-[#3E2723]/5 mb-8"
                    >
                        <img src={branding?.logo || "/cafe-logo.png"} alt="Cafe Logo" className="h-14 w-auto object-contain mx-auto" />
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-serif italic text-[#3E2723] leading-tight mb-2"
                    >
                        Good Evening ☕
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-medium italic text-lg"
                    >
                        What are you craving today?
                    </motion.p>
                </header>

                {/* 2. Primary Action */}
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                    className="w-full bg-[#3E2723] text-[#FFF8F2] py-8 rounded-[1.75rem] shadow-2xl shadow-[#3E2723]/20 flex items-center justify-center space-x-4 group overflow-hidden relative active:scale-95 transition-all"
                >
                    <span className="text-2xl font-serif italic relative z-10">Explore the Menu</span>
                    <ArrowUpRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>

                {/* 3. Quick Picks (Craving Chips) */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] px-2">Quick Picks</h3>
                    <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 no-scrollbar -mx-2 px-2">
                        {[
                            { label: 'Coffee', icon: '☕', color: 'bg-amber-50' },
                            { label: 'Burgers', icon: '🍔', color: 'bg-orange-50' },
                            { label: 'Snacks', icon: '🍟', color: 'bg-yellow-50' },
                            { label: 'Desserts', icon: '🍰', color: 'bg-rose-50' }
                        ].map((chip) => (
                            <button 
                                key={chip.label}
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant?cat=${chip.label}`)}
                                className={`flex-none px-8 py-4 rounded-full border border-[#3E2723]/5 shadow-sm active:scale-90 transition-all flex items-center space-x-3 group bg-white hover:bg-[#3E2723] hover:text-[#FFF8F2]`}
                            >
                                <span className="text-xl group-hover:scale-125 transition-transform">{chip.icon}</span>
                                <span className="font-bold text-sm uppercase tracking-widest">{chip.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Trending Now (Social Proof) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center">
                            🔥 Trending Now
                        </h3>
                    </div>

                    <motion.div 
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#3E2723]/5 border border-[#3E2723]/5 relative group cursor-pointer"
                    >
                        <div className="aspect-[4/3] overflow-hidden relative">
                            <img 
                                src="/artifacts/trending_combo_cafe.png" 
                                alt="Cold Coffee + Brownie Combo" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <h4 className="text-4xl font-serif italic mb-2 tracking-tight">The Midnight Combo</h4>
                                <p className="text-[#FFF8F2]/80 font-medium italic">Cold Coffee + Warm Brownie — the ultimate vibe.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
