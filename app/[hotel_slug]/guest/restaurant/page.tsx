"use client";

import React, { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Sparkles, Search } from "lucide-react";
import { addSupabaseRequest, useHotelBranding, useCart, useSupabaseMenuItems } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { CartOverlay } from "@/components/CartOverlay";
import { UpsellToast } from "@/components/UpsellToast";
import { SHARED_MENU_ITEMS, SHARED_COMBOS } from "@/utils/constants";
import { CATEGORY_THEMES } from "@/utils/themes";
import { ImpulseBottomSheet } from "@/components/ImpulseBottomSheet";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    const { cart, updateQuantity, clearCart } = useCart(branding?.id);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showCart, setShowCart] = useState(false);

    // Upsell State
    const [upsellItem, setUpsellItem] = useState<any>(null);
    const [showUpsell, setShowUpsell] = useState(false);
    const [suggestedIds, setSuggestedIds] = useState<string[]>([]);

    const [activeCategory, setActiveCategory] = useState<string>("all");

    const categories = [
        { id: "all", name: "All", icon: "🍱" },
        { id: "pizzas", name: "Pizzas", icon: "🍕" },
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "fries", name: "Fries", icon: "🍟" },
        { id: "sides", name: "Sides", icon: "🥗" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
    ];

    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);

    const currentTheme = CATEGORY_THEMES[activeCategory] || CATEGORY_THEMES.all;

    const filteredItems = activeCategory === "all" ? menuItems : menuItems.filter(i => i.category === activeCategory);
    
    // Revenue Logic
    const popularItems = menuItems.filter(i => i.is_popular);
    const recommendedItems = menuItems.filter(i => i.is_recommended);

    const addToCart = (item: any, isUpsell = false) => {
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);

        if (isUpsell) {
            setShowUpsell(false);
            return;
        }

        // --- Smart Pairing Logic (Blueprint Phase) ---
        if (item.upsell_items && item.upsell_items.length > 0) {
            const potentialUpsell = menuItems.find(m => 
                item.upsell_items.includes(m.id) && 
                !cart[m.id] && 
                !suggestedIds.includes(m.id)
            );

            if (potentialUpsell) {
                // 0.5s delay as per blueprint
                setTimeout(() => {
                    setUpsellItem(potentialUpsell);
                    setShowUpsell(true);
                    setSuggestedIds(prev => [...prev, potentialUpsell.id]);
                }, 500);
            }
        }
    };

    const cartItems = Object.entries(cart).map(([id, q]) => {
        let item = menuItems.find(m => m.id === id);
        
        // Handle virtual combos that exist on the dashboard
        if (!item && (id.includes("combo") || id === "king_size")) {
            const combos = [
                { id: "monster_combo", title: "Monster Combo Burger", price: 199 },
                { id: "king_size", title: "King Size Platter", price: 299 }
            ];
            const foundCombo = combos.find(c => c.id === id);
            if (foundCombo) {
                item = { ...foundCombo, category: "combos", description: "Special Combo Deal", image: "", isPopular: true, upsellIds: [] } as any;
            }
        }
        
        if (!item) return null;
        return { ...item, quantity: q };
    }).filter((item): item is (typeof menuItems[0] & { quantity: number }) => item !== null);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cartItemsData = Object.entries(cart)
            .map(([id, q]) => {
                const item = SHARED_MENU_ITEMS.find(m => m.id === id) || SHARED_COMBOS.find(c => c.id === id);
                return {
                    id,
                    title: item?.title || 'Unknown Item',
                    quantity: q,
                    price: item?.price || 0,
                    total: (item?.price || 0) * q
                };
            });

        const cartItemsString = cartItemsData.map(item => `${item.title} x${item.quantity}`).join(", ");

        const { error } = await addSupabaseRequest(branding.id, {
            room: searchParams.get('room') || roomNumber || 'Unknown',
            type: "Dining Order",
            notes: cartItemsString,
            total: cartTotal,
            price: cartTotal,
            items: cartItemsData
        });

        setIsOrdering(false);

        if (error) {
            alert(`Order Failed: ${error.message || 'Please try again.'}`);
        } else {
            setOrderComplete(true);
            clearCart();
            setShowCart(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-20 text-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/5 mx-auto">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-serif italic text-[#3E2723] mb-2 tracking-tight">Order Received!</h2>
                    <p className="text-slate-400 font-medium italic mb-12">“Chef is starting your meal right now.”</p>
                    
                    {/* Final Impulse: Dessert for later */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#3E2723] rounded-[2rem] p-8 mb-10 text-left relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles className="w-16 h-16 text-white" />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-[0.3em] mb-3 block">Craving something sweet?</span>
                            <h4 className="text-xl font-serif italic text-white mb-6 leading-tight">Dessert for later? <br/>We can schedule it.</h4>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant?cat=desserts`)}
                                className="bg-white text-[#3E2723] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                Browse Sweets
                            </button>
                        </div>
                    </motion.div>

                    <button 
                        onClick={() => router.push(`/${hotelSlug}/guest/status`)} 
                        className="w-full bg-slate-900/5 text-[#3E2723] py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all border border-[#3E2723]/5"
                    >
                        View Order Progress
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            animate={{ 
                background: currentTheme.id === 'all' 
                    ? 'linear-gradient(to bottom, #FDFCFB, #E2D1C3)' 
                    : `linear-gradient(to bottom, ${currentTheme.gradient.split(' ')[1]}, ${currentTheme.gradient.split(' ')[3]})` 
            }}
            transition={{ duration: 1 }}
            className="pb-40 px-6 pt-10 min-h-screen bg-noise text-[#3E2723] max-w-[500px] mx-auto overflow-x-hidden font-sans selection:bg-[#F59E0B]/30 relative"
        >
            {/* Dynamic Emotion Overlay */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay"
                    style={{ 
                        backgroundImage: currentTheme.id === 'pizzas' ? "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" : 'none'
                    }}
                />
            </AnimatePresence>

            <div className="relative z-10 block">
            {/* 1. Integrated Search & Categories */}
            <div className="space-y-8 mb-12">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#F59E0B] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search: Coffee, burger..." 
                        className="w-full bg-white border border-[#3E2723]/5 rounded-full py-6 pl-16 pr-6 shadow-xl shadow-[#3E2723]/5 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium italic text-lg"
                    />
                </div>

                <div className="overflow-x-auto no-scrollbar flex items-center space-x-4 -mx-2 px-2 pb-2">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;
                        const catTheme = CATEGORY_THEMES[category.id] || CATEGORY_THEMES.all;
                        
                        return (
                            <motion.button
                                key={category.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(category.id)}
                                className={`flex-none px-6 py-4 rounded-full border transition-all flex items-center space-x-3 shadow-sm ${
                                    isActive 
                                    ? 'bg-[#3E2723] text-[#FFF8F2] border-[#3E2723] shadow-lg shadow-[#3E2723]/10' 
                                    : 'bg-white text-slate-400 border-[#3E2723]/5 hover:border-[#3E2723]/20'
                                }`}
                                style={isActive ? { backgroundColor: catTheme.textColor, color: catTheme.accent === '#3E2723' ? '#FFF8F2' : catTheme.accent } : {}}
                            >
                                <span className={`text-xl ${isActive ? 'scale-110' : ''}`}>{category.icon}</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em]`}>
                                    {category.name}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Most Loved (Social Proof Hero) */}
            {activeCategory === 'all' && (
                <div className="mb-16">
                    <div className="flex items-center space-x-3 mb-6 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Most Loved</span>
                        <div className="h-[1px] flex-1 bg-slate-100/50" />
                    </div>
                    {menuItems.filter(i => i.is_popular).slice(0, 1).map((item) => (
                        <MenuCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description || ""}
                            price={item.price}
                            image={item.image_url}
                            isPopular={item.is_popular}
                            isRecommended={item.is_recommended}
                            theme={CATEGORY_THEMES[item.category.toLowerCase()] || CATEGORY_THEMES.all}
                            onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                            onAdd={() => addToCart(item)}
                        />
                    ))}
                </div>
            )}

            {/* 3. The Cravings List */}
            <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-8 px-1">
                    <span 
                        className="text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                        style={{ color: currentTheme.textColor }}
                    >
                        {activeCategory === 'all' ? 'All Cravings' : `${activeCategory} Cravings`}
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-100/50" />
                </div>
                
                <motion.div 
                    layout
                    className="grid grid-cols-1 gap-10 pb-20"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems
                            .filter(i => !(activeCategory === 'all' && i.is_popular && menuItems.filter(m => m.is_popular).slice(0, 1).find(m => m.id === i.id)))
                            .map((item) => (
                                <MenuCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description || ""}
                                    price={item.price}
                                    image={item.image_url}
                                    isPopular={item.is_popular}
                                    isRecommended={item.is_recommended}
                                    theme={CATEGORY_THEMES[item.category.toLowerCase()] || CATEGORY_THEMES.all}
                                    onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                    onAdd={() => addToCart(item)}
                                />
                            ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Floating Selection Preview (Mini Cart) */}
            <AnimatePresence>
                {cartCount > 0 && !showCart && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-32 left-0 right-0 px-6 z-40"
                    >
                        <button
                            onClick={() => setShowCart(true)}
                            style={{ backgroundColor: currentTheme.textColor }}
                            className="w-full text-[#FFF8F2] p-6 rounded-[2rem] flex items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-[#FFF8F2]/10"
                        >
                            <div className="flex items-center space-x-4">
                                <div 
                                    style={{ backgroundColor: currentTheme.accent, color: currentTheme.textColor }}
                                    className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest"
                                >
                                    {cartCount} ITEMS
                                </div>
                                <span className="text-sm font-serif italic tracking-tight">Your Cravings Bag</span>
                            </div>
                            <span className="text-2xl font-serif italic">₹{cartTotal.toFixed(0)}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlays */}
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
            <ImpulseBottomSheet 
                item={upsellItem as any}
                isVisible={showUpsell}
                onAdd={() => addToCart(upsellItem, true)}
                onClose={() => setShowUpsell(false)}
            />
            <BottomNav />
            </div>
        </motion.div>
    );
}
