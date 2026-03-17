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
    RefreshCw
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers, useCart } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";
import { ComboCard } from "@/components/ComboCard";
import { CategoryScroll } from "@/components/CategoryScroll";
import { MenuListItem } from "@/components/MenuListItem";
import { BottomNav } from "@/components/BottomNav";
import { FoodStory } from "@/components/FoodStory";
import { CartOverlay } from "@/components/CartOverlay";
import { SHARED_MENU_ITEMS, SHARED_COMBOS } from "@/utils/constants";

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

    const menuItems = SHARED_MENU_ITEMS;


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
            isBestseller: (salesMap[item.title] || 0) >= 5 || !!item.isPopular
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
        <div className="pb-40 px-5 pt-6 min-h-screen bg-noise max-w-[520px] mx-auto overflow-x-hidden font-sans">
            {/* Header is handled by GlobalHeader in GuestLayout */}

            <div className="space-y-12 py-10">
                {/* 1. The Entrance Header (Luxury Centered Spec) */}
                <div className="flex flex-col items-center text-center space-y-6">
                    {branding?.logoImage || branding?.logo ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-20 h-20 rounded-[1.25rem] overflow-hidden shadow-2xl border border-white p-1 bg-white"
                        >
                            <img src={branding.logoImage || branding.logo} alt="Hotel Logo" className="w-full h-full object-cover rounded-[1rem]" />
                        </motion.div>
                    ) : (
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                            <Utensils className="text-[#FAF7F2] w-8 h-8" />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-serif text-slate-900 italic tracking-tighter"
                        >
                            Good Evening, {tableNumberDisplay === 'Takeaway' ? 'Guest' : (tableNumberDisplay || 'Guest')}
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 font-sans tracking-[0.2em] uppercase text-[10px] font-bold"
                        >
                            Ready for a delightful dining experience?
                        </motion.p>
                    </div>
                </div>

                {/* 2. The Primary CTA (BIG BUTTON) */}
                <motion.div 
                    whileTap={{ scale: 0.98 }}
                    className="px-2"
                >
                    <button 
                        onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                        className="w-full bg-[#8B0000] text-[#FAF7F2] py-8 rounded-[1.25rem] shadow-2xl shadow-[#8B0000]/20 flex items-center justify-center space-x-4 group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Utensils className="w-6 h-6" />
                        <span className="text-2xl font-serif italic tracking-tight">Explore Menu</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

                {/* 3. Curated Selection (Luxury Spec) */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-serif italic text-slate-900 tracking-tight">✨ Curated for You</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {menuItems.slice(0, 2).map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-slate-50 relative group"
                            >
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-2xl font-serif italic text-slate-900">{item.title}</h4>
                                        <p className="text-xl font-serif text-[#8B0000]">₹{item.price}</p>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium line-clamp-1 italic">
                                        “{item.description || 'A timeless culinary masterpiece prepared with love.'}”
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 4. Secondary Actions */}
                <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                    className="w-full py-6 rounded-[1.25rem] border border-slate-200 text-slate-500 font-serif italic text-lg hover:bg-white transition-colors"
                >
                    View My Orders
                </motion.button>
            </div>
            <BottomNav />
        </div>
    );
}
