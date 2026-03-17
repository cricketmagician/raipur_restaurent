"use client";

import React, { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils, Sparkles } from "lucide-react";
import { addSupabaseRequest, useHotelBranding, useCart } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { CartOverlay } from "@/components/CartOverlay";
import { UpsellToast } from "@/components/UpsellToast";
import { SHARED_MENU_ITEMS, SHARED_COMBOS } from "@/utils/constants";

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
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "fries", name: "Fries", icon: "🍟" },
        { id: "sides", name: "Sides", icon: "🥗" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
    ];

    const menuItems = SHARED_MENU_ITEMS;

    const filteredItems = activeCategory === "all" ? menuItems : menuItems.filter(i => i.category === activeCategory);
    
    // Revenue Logic
    const popularItems = menuItems.filter(i => i.isPopular);
    const recommendedItems = menuItems.filter(i => i.isRecommended);

    const addToCart = (item: any, isUpsell = false) => {
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);

        if (isUpsell) {
            setShowUpsell(false);
            return;
        }

        // --- Smart Pairing Logic (Premium Philosophy) ---
        if (item.upsellIds && item.upsellIds.length > 0) {
            // Find a pairing that isn't already in cart and hasn't been suggested in this session
             const potentialUpsell = SHARED_MENU_ITEMS.find(m => 
                item.upsellIds.includes(m.id) && 
                !cart[m.id] && 
                !suggestedIds.includes(m.id)
            );

            if (potentialUpsell) {
                setUpsellItem(potentialUpsell);
                setSuggestedIds(prev => [...prev, potentialUpsell.id]);
                
                // Slightly delay for premium feel (Progressive Disclosure)
                setTimeout(() => {
                    setShowUpsell(true);
                    // Hide after 6 seconds if no interaction
                    setTimeout(() => setShowUpsell(false), 6000);
                }, 800);
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
                    <div className="w-24 h-24 bg-[#F55D2C]/10 text-[#F55D2C] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#F55D2C]/10 mx-auto">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Order Received!</h2>
                    <p className="text-slate-500 font-medium mb-8">Chef is starting your meal right now.</p>
                    <button 
                        onClick={() => router.push(`/${hotelSlug}/guest/status`)} 
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-xl shadow-black/20 px-10"
                    >
                        View Progress
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pb-40 px-5 pt-safe min-h-screen bg-[#FAF7F2] text-slate-900">
            {/* 1. Refined Categories (Luxury Spec) */}
            <div className="mb-12 pt-8 overflow-x-auto no-scrollbar flex items-center space-x-6">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <motion.button
                            key={category.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(category.id)}
                            className="flex flex-col items-center space-y-3 min-w-[70px]"
                        >
                            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm ${
                                isActive 
                                ? 'bg-[#8B0000] text-[#FAF7F2] shadow-xl shadow-[#8B0000]/20' 
                                : 'bg-white text-slate-400 border border-slate-100'
                            }`}>
                                <span className="text-2xl">{category.icon}</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-[#8B0000]' : 'text-slate-400'}`}>
                                {category.name}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* 2. Anchoring Effect (BIG CARD for Featured Item) */}
            {activeCategory === 'all' && (
                <div className="mb-14">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-6 px-1">Chef's Selection</h2>
                    {menuItems.slice(0, 1).map((item) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(item)}
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 relative group"
                        >
                            <div className="aspect-[16/10] overflow-hidden relative">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md text-[#FAF7F2] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
                                    <Sparkles className="w-3 h-3 mr-2 text-amber-400" />
                                    Chef's Signature
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-3xl font-serif italic text-slate-900">{item.title}</h3>
                                    <p className="text-2xl font-serif text-[#8B0000]">₹{item.price}</p>
                                </div>
                                <p className="text-slate-400 text-sm font-medium italic mb-6 leading-relaxed">
                                    “{item.description || 'A timeless culinary masterpiece prepared with love.'}”
                                </p>
                                <button className="w-full py-5 rounded-[1.25rem] bg-slate-900 text-[#FAF7F2] font-serif italic text-lg shadow-xl shadow-slate-200">
                                    Add to your table
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 3. The Selection (Main List) */}
            <div className="space-y-10">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-8 px-1">All Items</h2>
                <div className="space-y-8 pb-20">
                    {filteredItems.slice(activeCategory === 'all' ? 1 : 0).map((item) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(item)}
                            className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 flex items-center space-x-6 relative group"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-50">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className="text-xl font-serif italic text-slate-900 truncate mb-1">{item.title}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">₹{item.price}</p>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-[#8B0000] border-b border-[#8B0000]/20 pb-0.5">
                                    Add to table
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Floating Selection Preview */}
            <AnimatePresence>
                {cartCount > 0 && !showCart && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-32 left-0 right-0 px-6 z-40"
                    >
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full bg-slate-900 text-[#FAF7F2] p-6 rounded-[1.5rem] flex items-center justify-between shadow-2xl shadow-black/20"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold">
                                    {cartCount} JOURNEYS
                                </div>
                                <span className="text-sm font-serif italic tracking-tight">View Your Selection</span>
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
            />
            <UpsellToast 
                item={upsellItem}
                isVisible={showUpsell}
                onAdd={() => addToCart(upsellItem, true)}
                onClose={() => setShowUpsell(false)}
            />
            <BottomNav />
        </div>
    );
}
