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
    ShoppingBag
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";
import { ComboCard } from "@/components/ComboCard";
import { CategoryScroll } from "@/components/CategoryScroll";
import { MenuListItem } from "@/components/MenuListItem";
import { BottomNav } from "@/components/BottomNav";
import { FoodStory } from "@/components/FoodStory";

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
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);

    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [cart, setCart] = useState<Record<string, number>>({});
    const [hungerMode, setHungerMode] = useState(false);
    const [upsellItem, setUpsellItem] = useState<{ id: string; title: string } | null>(null);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
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

    const menuItems = [
        { 
            id: "m1", 
            category: "burgers", 
            title: "Ultra Crispy Buttermilk Chicken Burger", 
            description: "Ultra-crispy hand-breaded chicken, spicy jalapeños, and smoky chipotle mayo on a toasted brioche bun.", 
            price: 180, 
            rating: 4.8, 
            reviews: 156, 
            image: "/images/menu/buttermilk_chicken_burger_1773233570467.png", 
            isBestseller: true 
        },
        { 
            id: "m2", 
            category: "burgers", 
            title: "Gourmet Garden Burger", 
            description: "Hand-crafted veggie patty with melted cheddar, fresh arugula, and herb aioli.", 
            price: 160, 
            rating: 4.5, 
            reviews: 92, 
            image: "/images/menu/veggie_burger_1773233586101.png" 
        },
        { 
            id: "m3", 
            category: "fries", 
            title: "Loaded Peri-Peri Fries", 
            description: "Crispy thin-cut fries topped with liquid cheese, peri-peri seasoning, and spring onions.", 
            price: 140, 
            rating: 4.9, 
            reviews: 210, 
            image: "/images/menu/loaded_fries_hero_1773232655179.png", 
            isBestseller: true 
        },
        { 
            id: "m4", 
            category: "fries", 
            title: "Golden Classic Salted Fries", 
            description: "Lightly salted, thin-cut fries, served golden brown and crispy.", 
            price: 90, 
            rating: 4.4, 
            reviews: 320, 
            image: "/images/menu/classic_fries_1773233603370.png" 
        },
        { 
            id: "m5", 
            category: "sides", 
            title: "Cheesy Garlic Bread", 
            description: "Toasted brioche slices infused with garlic butter, parsley, and melted mozzarella.", 
            price: 120, 
            rating: 4.7, 
            reviews: 110, 
            image: "/images/menu/garlic_bread_1773233624069.png" 
        },
        { 
            id: "m6", 
            category: "sides", 
            title: "Premium Caesar Salad", 
            description: "Crisp romaine, crunchy croutons, and parmesan shavings with a creamy Caesar dressing.", 
            price: 210, 
            rating: 4.3, 
            reviews: 85, 
            image: "/images/menu/caesar_salad_1773233640332.png" 
        },
        { 
            id: "m7", 
            category: "drinks", 
            title: "Iced Whipped Coffee", 
            description: "Velvety smooth cold brew topped with thick whipped cream and chocolate drizzle.", 
            price: 130, 
            rating: 4.8, 
            reviews: 240, 
            image: "/images/menu/cold_coffee_premium_1773233658375.png", 
            isBestseller: true 
        },
        { 
            id: "m8", 
            category: "desserts", 
            title: "Molten Lava Cake", 
            description: "Warm chocolate cake with a gooey center, served with premium vanilla bean ice cream.", 
            price: 190, 
            rating: 4.9, 
            reviews: 380, 
            image: "/images/menu/choco_lava_cake_1773233674857.png", 
            isBestseller: true 
        },
    ];


    const stories = [
        { id: "s1", image: "/images/menu/choco_lava_cake_1773233674857.png", label: "New Dessert", type: "Sweet" },
        { id: "s2", image: "/images/menu/loaded_fries_hero_1773232655179.png", label: "Must Try", type: "Viral" },
        { id: "s3", image: "/images/menu/buttermilk_chicken_burger_1773233570467.png", label: "Chef Pick", type: "Hot" },
        { id: "s4", image: "/images/menu/garlic_bread_1773233624069.png", label: "Special", type: "New" },
    ];

    const updateQuantity = (id: string, q: number) => {
        const isNewItem = q > (cart[id] || 0) && q === 1;
        setCart(prev => ({
            ...prev,
            [id]: Math.max(0, q)
        }));

        // Trigger upsell only for individual items, not combos
        if (isNewItem && !id.includes("combo")) {
            const item = menuItems.find(m => m.id === id);
            if (item) setUpsellItem({ id: item.id, title: item.title });
        }
    };

    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = menuItems.find(m => m.id === id);
        return sum + (item?.price || 0) * q;
    }, 0);
    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
    
    // Calculate REAL sales data from requests
    const menuItemsWithSales = React.useMemo(() => {
        const salesMap: Record<string, number> = {};
        
        // Parse "Dining Order" notes to count item sales
        requests.forEach(req => {
            if (req.type === "Dining Order" && req.notes) {
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
            // Dynamically mark as bestseller if it has at least 5 sales (mock threshold for demo)
            // or if it's in the top 20% of sales
            isBestseller: (salesMap[item.title] || 0) >= 5 
        }));

        return enriched;
    }, [requests]);

    const filteredItems = (activeCategory === "all" ? menuItemsWithSales : menuItemsWithSales.filter(i => i.category === activeCategory))
        .filter(item => !hungerMode || item.price > 150);

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

    return (
        <div className="pb-40 px-5 pt-6 min-h-screen bg-noise max-w-[520px] mx-auto overflow-x-hidden font-sans">
            {/* Header is handled by GlobalHeader in GuestLayout */}

            <div className="h-[120px]"></div>

            {/* 2. Dramatic Headline */}
            <section className="mb-8 pt-10 relative">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-5xl font-serif font-black text-slate-900 leading-[0.9] tracking-tighter italic">
                            Craving<br />Something?
                        </h2>
                        <p className="text-sm font-bold text-slate-400 mt-3 italic">Chef-picked combos guests love tonight</p>
                    </div>
                    {tableNumber && (
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-slate-200">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dining At</span>
                            <span className="text-xl font-black italic">Table {tableNumber}</span>
                        </div>
                    )}
                </div>
                <div className="h-1.5 w-12 bg-[#F55D2C] rounded-full mt-4"></div>
            </section>

            {/* 3. Hero Slider (Highest Rated Combos) */}
            <section className="mb-12 -mx-5 px-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Trending Tonight</span>
                        </div>
                        <h3 className="text-xl font-serif font-black text-slate-900 italic">🔥 Best Combos</h3>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/30">
                        8 guests ordering
                    </div>
                </div>
                <div className="flex overflow-x-auto space-x-6 pb-6 no-scrollbar snap-x">
                    <div className="flex space-x-6">
                        <ComboCard 
                            title="Monster Combo Burger"
                            items={["2x Double Burger", "Fries", "Coke"]}
                            price={199}
                            originalPrice={349}
                            trendingCount={47}
                            image="/images/menu/monster_combo_hero_1773232637404.png"
                            quantity={cart["monster_combo"] || 0}
                            onUpdateQuantity={(q) => updateQuantity("monster_combo", q)}
                        />
                        <ComboCard 
                            title="King Size Platter"
                            items={["Cheese Burger", "Fries", "Coke", "Brownie"]}
                            price={299}
                            originalPrice={449}
                            trendingCount={32}
                            image="https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f1?q=80&w=800"
                            quantity={cart["king_size"] || 0}
                            onUpdateQuantity={(q) => updateQuantity("king_size", q)}
                        />
                    </div>
                </div>
            </section>

            {/* 3. Food Categories (Tactile Row) */}
            <section className="mb-12">
                <CategoryScroll 
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </section>

            {/* 4. Hungry Mode Filter (Emotional UI) */}
            <section className="mb-12 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-serif font-black text-slate-900 leading-none mb-1">😋 I'm Very Hungry</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Show big meals & combos</p>
                    </div>
                    <button 
                        onClick={() => setHungerMode(!hungerMode)}
                        className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center px-1 ${hungerMode ? 'bg-[#F55D2C]' : 'bg-slate-200'}`}
                    >
                        <motion.div 
                            animate={{ x: hungerMode ? 24 : 0 }}
                            className="w-6 h-6 bg-white rounded-full shadow-md"
                        />
                    </button>
                </div>
            </section>

            {/* 5. Food Stories */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-black text-slate-900 italic tracking-tight">Today's Special</h3>
                    <div className="h-[1px] flex-1 bg-slate-100 mx-4"></div>
                    <div className="text-[10px] font-black text-[#F55D2C] uppercase tracking-widest">Live Now</div>
                </div>
                <FoodStory stories={stories} />
            </section>

            {/* 6. Popular Right Now (Modern Grid) */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-black text-slate-900">🔥 Trending in your area</h3>
                </div>
                <motion.div 
                    initial="hidden"
                    animate="show"
                    variants={{
                        show: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-2 gap-4"
                >
                    {[...filteredItems]
                        .sort((a, b) => {
                            // Primary sort: Sales Volume
                            if ((b.salesCount || 0) !== (a.salesCount || 0)) {
                                return (b.salesCount || 0) - (a.salesCount || 0);
                            }
                            // Secondary sort: High Rating
                            return (b.rating || 0) - (a.rating || 0);
                        })
                        .slice(0, 4)
                        .map((item) => (
                            <MenuListItem 
                                key={item.id}
                                {...item}
                                trendingCount={(item.salesCount || 0)}
                                quantity={cart[item.id] || 0}
                                onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                            />
                        ))}
                </motion.div>
            </section>

            {/* 7. Full Menu Section (Compact Grid) */}
            <section className="space-y-6 mb-20 px-1 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-black text-slate-900">⭐ Loved by diners</h3>
                </div>
                <motion.div 
                    initial="hidden"
                    animate="show"
                    variants={{
                        show: {
                            transition: {
                                staggerChildren: 0.05
                            }
                        }
                    }}
                    className="grid grid-cols-2 gap-4"
                >
                    {filteredItems.map((item) => (
                        <MenuListItem 
                            key={item.id}
                            {...item}
                            quantity={cart[item.id] || 0}
                            onUpdateQuantity={(q) => updateQuantity(item.id, q)}
                        />
                    ))}
                </motion.div>
            </section>

            {/* Assistant section removed - actions are now in global header */}

            {/* Upsell Modal */}
            <AnimatePresence>
                {upsellItem && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-[400px] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setUpsellItem(null)}
                                className="absolute top-6 right-8 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <Zap className="w-5 h-5 rotate-45" />
                            </button>
                            
                            <div className="flex flex-col items-center text-center">
                                <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner">🍟</div>
                                <h4 className="text-2xl font-serif font-black text-slate-900 leading-tight mb-2">Make it a Combo?</h4>
                                <p className="text-sm font-bold text-slate-400 mb-6 italic">Add Medium Fries + Coke</p>
                                <div className="bg-[#F55D2C]/10 px-4 py-2 rounded-full mb-10">
                                    <p className="text-xl font-black text-[#F55D2C]">Only ₹59 extra</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setUpsellItem(null)}
                                    className="p-4 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400"
                                >
                                    No, Thanks
                                </button>
                                <button 
                                    onClick={() => {
                                        updateQuantity("monster_combo", (cart["monster_combo"] || 0) + 1);
                                        setUpsellItem(null);
                                    }}
                                    className="p-4 rounded-2xl bg-[#F55D2C] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#F55D2C]/30"
                                >
                                    Yes, Upgrade!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 8. Sticky Cart Bar (With Psychology Hint) */}
            <AnimatePresence>
                {cartCount > 0 && !upsellItem && (
                    <motion.div 
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="fixed bottom-28 left-6 right-6 z-[150] pointer-events-auto"
                    >
                        {/* Acknowledge Psychology: Floating Hint */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 15 }}
                            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 whitespace-nowrap border border-white/10"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Add ₹120 more for FREE fries 🍟</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                        </motion.div>

                        <button 
                            onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                            className="w-full bg-[#F55D2C] text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(245,93,44,0.3)] relative z-10 group overflow-hidden active:scale-95 transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <div className="flex items-center space-x-3 relative z-10">
                                <div className="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black border border-white/10">
                                    {cartCount} ITEMS
                                </div>
                                <span className="font-black text-sm uppercase tracking-widest shadow-sm italic">View Bucket</span>
                            </div>
                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/50 uppercase leading-none mb-1">Total</p>
                                    <p className="text-2xl font-serif font-black italic tracking-tighter shadow-sm">₹{cartTotal}</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-white/50" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Debug Status Overlay */}
            <div className="fixed top-4 right-4 z-[9999] opacity-20 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
                <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${branding?.id?.toString().startsWith('demo-') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                            {branding?.id?.toString().startsWith('demo-') ? 'Mode: DEMO' : 'Mode: PROD'}
                        </span>
                    </div>
                </div>
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
