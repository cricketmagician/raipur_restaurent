"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Sparkles, Search, ArrowUpRight, Receipt, ChevronRight, User } from "lucide-react";
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
import { getTimeTheme, CATEGORY_THEMES } from "@/utils/themes";
import { StoryOverlay } from "@/components/StoryOverlay";
import { GlobalHeader } from "@/components/GlobalHeader";


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

    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [hungerMode, setHungerMode] = useState(false);
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
        { id: "s1", image: "/images/menu_demo/dessert.png", label: "Choco Lava Delight", type: "Sweet", menuItemId: "d1137704-58a3-48b4-8395-8120387e7f6e", price: 219 },
        { id: "s2", image: "/images/menu_demo/fries.png", label: "Peri Peri Rush", type: "Viral", menuItemId: "f1137704-58a3-48b4-8395-8120387e7f6e", price: 159 },
        { id: "s3", image: "/images/menu_demo/burger.png", label: "Cheddar King", type: "Hot", menuItemId: "b1137704-58a3-48b4-8395-8120387e7f6e", price: 299 },
        { id: "s4", image: "/images/menu_demo/pizza.png", label: "Garden Special", type: "New", menuItemId: "a1137704-58a3-48b4-8395-8120387e7f6e", price: 349 },
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
        <div className="pb-40 px-6 pt-10 min-h-screen bg-[#F2F0EB] max-w-[500px] mx-auto overflow-x-hidden font-sans">
            {/* 1. Starbucks Style Greeting & Rewards */}
            <header className="mb-10">
                <div className="flex items-center justify-between mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-black text-[#1E3932] tracking-tighter">
                            {timeTheme.greeting.split(" ")[0]}, {tableNumber !== "Takeaway" ? `Table ${tableNumber}` : "Guest"}
                        </h1>
                        <p className="text-sm font-bold text-[#00704A] mt-1 italic italic">It's a beautiful day for coffee.</p>
                    </motion.div>
                </div>

                {/* Simulated Rewards Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1E3932] rounded-[2rem] p-8 text-white shadow-2xl shadow-[#1E3932]/20 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Guest Rewards</span>
                            <Sparkles className="w-5 h-5 text-[#D4E9E2]" />
                        </div>
                        <div className="flex items-baseline space-x-2 mb-2">
                            <span className="text-5xl font-black">120</span>
                            <span className="text-lg font-bold opacity-60 italic italic">vibe points</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '65%' }}
                                className="h-full bg-[#D4E9E2]" 
                            />
                        </div>
                        <p className="text-[10px] font-bold mt-4 opacity-70 tracking-widest text-[#D4E9E2]">30 POINTS UNTIL YOUR NEXT TREAT</p>
                    </div>
                    {/* Abstract Siren Shape Background */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </motion.div>
            </header>

            <div className="space-y-12">
                {/* 2. Primary Action */}
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                    className="w-full bg-[#00704A] text-white py-8 rounded-[1.75rem] shadow-2xl shadow-[#00704A]/20 flex items-center justify-between px-8 group overflow-hidden relative"
                >
                    <span className="text-2xl font-black tracking-tighter relative z-10">Order Your Favorites</span>
                    <ArrowUpRight className="w-8 h-8 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.button>

                {/* 3. 🔥 Seasonal Collection */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em]">
                            ✨ Seasonal Collection
                        </h3>
                    </div>

                    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
                        {stories.map((story, index) => (
                            <motion.div 
                                key={story.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStoryConfig({ isVisible: true, initialIndex: index })}
                                className="flex-none w-72 bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-[#00704A]/5 border border-[#00704A]/5 cursor-pointer group"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative">
                                    <img src={story.image} alt={story.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E3932]/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-[#D4E9E2] text-[#00704A] inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-3">
                                            {story.type}
                                        </div>
                                        <h4 className="text-2xl font-black text-white leading-tight">{story.label}</h4>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 4. ⚡ Quick Picks */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em] px-2">⚡ Quick Picks</h3>
                    <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 no-scrollbar -mx-2 px-2">
                        {[
                            { label: 'Coffee', icon: '☕' },
                            { label: 'Burgers', icon: '🍔' },
                            { label: 'Snacks', icon: '🍟' },
                            { label: 'Desserts', icon: '🍰' }
                        ].map((chip) => (
                            <button 
                                key={chip.label}
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant?cat=${chip.label.toLowerCase()}`)}
                                className="flex-none px-8 py-4 rounded-full border border-[#00704A]/10 shadow-sm active:scale-90 transition-all flex items-center space-x-3 bg-white hover:bg-[#D4E9E2] group"
                            >
                                <span className="text-xl group-hover:scale-125 transition-transform">{chip.icon}</span>
                                <span className="font-black text-xs uppercase tracking-widest text-[#1E3932]">{chip.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. Current Tab Summary */}
                <AnimatePresence>
                    {requests.some(r => (r.total || 0) > 0) && (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em] px-2">🧾 Current Tab</h3>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/bill`)}
                                className="w-full bg-[#D4E9E2]/30 rounded-[2rem] p-8 border border-[#00704A]/5 flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mr-6 shadow-sm">
                                        <Receipt className="w-6 h-6 text-[#00704A]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-[#00704A] uppercase tracking-[0.2em] mb-1">Total Bill</p>
                                        <span className="text-3xl font-black text-[#1E3932] tracking-tighter">
                                            ₹{requests.reduce((sum, r) => sum + (r.total || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-8 h-8 text-[#00704A]/30 group-hover:text-[#00704A] transition-all" />
                            </button>
                        </div>
                    )}
                </AnimatePresence>
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
