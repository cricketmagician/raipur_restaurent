"use client";

import React, { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils } from "lucide-react";
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
        <div className="pb-40 px-6 pt-10 min-h-screen bg-[#FDFDFD] text-slate-900">
            {/* Compact Sticky Header */}
            {/* Local header removed in favor of GlobalHeader */}


            {/* Promo */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden shadow-2xl shadow-slate-200"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F55D2C] opacity-20 blur-[60px] rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight mb-2">
                        I'm<br />Ordering<br />It!
                    </h2>
                    <p className="text-[#F55D2C] text-xs font-black uppercase tracking-widest mb-6">Chef's Special Mix</p>
                    <div className="h-1 w-12 bg-[#F55D2C] rounded-full"></div>
                </div>
            </motion.div>

            {/* Categories */}
            <div className="mb-10 px-0 overflow-x-auto no-scrollbar flex items-center space-x-3">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all flex items-center group ${isActive
                                ? 'bg-black text-[#D4AF37] shadow-xl shadow-black/10'
                                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200 shadow-sm'
                                }`}
                        >
                            <span className="mr-2 text-sm">{category.icon}</span>
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Psychological Menu Sections */}
            {activeCategory === "all" && (
                <div className="space-y-16 mb-16">
                    <section>
                        <div className="flex items-center space-x-4 mb-8">
                            <h2 className="font-serif text-3xl text-black">Most Popular</h2>
                            <div className="h-[1px] flex-1 bg-black/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {popularItems.map((item) => (
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAdd={() => addToCart(item)}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center space-x-4 mb-8">
                            <h2 className="font-serif text-3xl text-black">Chef Recommended</h2>
                            <div className="h-[1px] flex-1 bg-black/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {recommendedItems.map((item) => (
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAdd={() => addToCart(item)}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Categorized Menu Items (only if not 'all' or for the remaining items) */}
            <div className="space-y-12">
                <section>
                    <div className="flex items-center space-x-4 mb-8">
                        <h2 className="font-serif text-3xl text-black capitalize">
                            {activeCategory === 'all' ? 'The Menu' : categories.find(c => c.id === activeCategory)?.name}
                        </h2>
                        <div className="h-[1px] flex-1 bg-black/5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <Utensils className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold font-serif">Selection coming soon...</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <MenuCard
                                    key={item.id}
                                    {...item}
                                    onAdd={() => addToCart(item)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Floating Cart Entry */}
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
                            className="w-full bg-[#F55D2C] text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-[#F55D2C]/40 active:scale-95 transition-transform"
                        >
                            <div className="flex items-center">
                                <div className="bg-white/20 px-3 py-1.5 rounded-full mr-4 text-[11px] font-black border border-white/20">
                                    {cartCount} ITEMS
                                </div>
                                <span className="font-black text-sm uppercase tracking-[0.2em]">View Order</span>
                            </div>
                            <span className="font-black text-2xl tracking-tighter italic">₹{cartTotal.toFixed(2)}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shared Cart Overlay */}
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
