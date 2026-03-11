"use client";

import React, { useState, useMemo } from "react";
import { MenuCard } from "@/components/MenuCard";
import { ShoppingCart, CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils } from "lucide-react";
import { addSupabaseRequest, useHotelBranding, useSupabaseMenuItems } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);

    const [cart, setCart] = useState<{ id: string; title: string; price: number }[]>([]);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string>("All Day Snacks");

    const categories = ["Breakfast", "Lunch", "Dinner", "All Day Snacks"];

    const menuCategories = useMemo(() => {
        return categories.map(cat => ({
            name: cat,
            items: menuItems.filter(item => item.category === cat && item.is_available)
        }));
    }, [menuItems]);

    const isCategoryActive = (category: string) => {
        if (category === "All Day Snacks") return { active: true };
        if (!branding) return { active: true };

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        let start = "00:00", end = "23:59";
        if (category === "Breakfast") {
            start = branding.breakfastStart || "07:00";
            end = branding.breakfastEnd || "10:30";
        } else if (category === "Lunch") {
            start = branding.lunchStart || "12:30";
            end = branding.lunchEnd || "15:30";
        } else if (category === "Dinner") {
            start = branding.dinnerStart || "19:00";
            end = branding.dinnerEnd || "22:30";
        }

        const isActive = currentTime >= start && currentTime <= end;
        return { active: isActive, start, end };
    };

    // Set default category based on current time
    React.useEffect(() => {
        const checkCategories = ["Breakfast", "Lunch", "Dinner"];
        for (const cat of checkCategories) {
            if (isCategoryActive(cat).active) {
                setActiveCategory(cat);
                return;
            }
        }
        setActiveCategory("All Day Snacks");
    }, [branding]);

    const addToCart = (item: any) => {
        setCart([...cart, item]);
    };

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: `Dining Order (${cart.length} items)`,
            notes: cart.map(item => item.title).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal
        });

        setIsOrdering(false);

        if (error) {
            alert(`Order Failed: ${error.message || 'Please try again or contact the front desk.'}`);
        } else {
            setOrderComplete(true);
            setCart([]);
            setShowCart(false); // Close cart after successful order
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    if (orderComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-2">Order Received!</h2>
                <p className="text-foreground/60 font-medium mb-8">Chef is starting your meal right now.</p>
                <button onClick={() => router.push(`/${hotelSlug}/guest/status`)} className="w-full bg-white text-black py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-xl shadow-black/20">
                    View Progress
                </button>
            </motion.div>
        );
    }

    const currentCategoryData = menuCategories.find(c => c.name === activeCategory);
    const { active, start } = isCategoryActive(activeCategory);

    return (
        <div className="pb-40 section-padding pt-10 min-h-screen bg-[#FDFDFD] text-slate-900">
            {/* Header Redesign */}
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 active:scale-90 transition-transform">
                    <ArrowLeft className="w-6 h-6 text-slate-900" />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-black italic tracking-tighter text-[#E31837] uppercase leading-none">
                        Fast<span className="text-[#FFBC0D]">&</span>Fresh
                    </h1>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                        {branding?.name || "Premium Dining"}
                    </p>
                </div>
                <button
                    onClick={() => setShowCart(!showCart)}
                    className="relative w-14 h-14 rounded-2xl bg-[#FFBC0D] text-slate-900 flex items-center justify-center shadow-xl shadow-amber-100 active:scale-90 transition-transform"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-[#E31837] text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#FDFDFD] shadow-lg"
                        >
                            {cart.length}
                        </motion.span>
                    )}
                </button>
            </div>

            {/* Impactful Promo Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden shadow-2xl shadow-slate-200"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#E31837] opacity-20 blur-[60px] rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight mb-2">
                        I'm<br />Ordering<br />It!
                    </h2>
                    <p className="text-[#FFBC0D] text-xs font-black uppercase tracking-widest mb-6">Chef's Special Mix</p>
                    <div className="h-1 w-12 bg-[#E31837] rounded-full"></div>
                </div>
            </motion.div>

            {/* Horizontal Category Navigation Redesign */}
            <div className="mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar flex items-center space-x-4">
                {menuCategories.map((category) => {
                    const isActive = activeCategory === category.name;
                    const { active: isServeActive } = isCategoryActive(category.name);

                    return (
                        <button
                            key={category.name}
                            onClick={() => setActiveCategory(category.name)}
                            className={`px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center group ${isActive
                                ? 'bg-[#E31837] text-white shadow-2xl shadow-red-200 scale-105'
                                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200 shadow-sm'
                                } ${!isServeActive ? 'opacity-50 grayscale' : ''}`}
                        >
                            <span className={`w-3 h-3 rounded-full mr-3 ${category.name === "Breakfast" ? "bg-amber-400" :
                                category.name === "Lunch" ? "bg-emerald-400" :
                                    category.name === "Dinner" ? "bg-indigo-400" : "bg-slate-900"
                                }`} />
                            {category.name}
                            {!isServeActive && isActive && (
                                <span className="ml-2 text-[9px] opacity-70">(Closed)</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-12">
                <section className={!active ? "opacity-50 grayscale pointer-events-none" : ""}>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">{activeCategory}</h2>
                            <div className="h-1.5 w-12 bg-[#FFBC0D] rounded-full mt-1"></div>
                        </div>
                        {!active && (
                            <div className="flex items-center text-[11px] font-black bg-red-50 text-[#E31837] px-4 py-2 rounded-2xl uppercase tracking-tighter border border-red-100">
                                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                                Opens at {start}
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-[#FFBC0D] mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Gastronomy...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {currentCategoryData?.items.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <Utensils className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">No creations available in this category yet.</p>
                                </div>
                            ) : (
                                currentCategoryData?.items.map((item) => (
                                    <MenuCard
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        description={item.description || ""}
                                        price={item.price}
                                        image={item.image_url}
                                        onAdd={() => addToCart(item)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Cart Button Fixed Redesign */}
            <AnimatePresence>
                {cart.length > 0 && !showCart && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-32 left-0 right-0 px-5 z-40"
                    >
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full bg-[#E31837] text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(227,24,55,0.3)] active:scale-95 transition-transform"
                        >
                            <div className="flex items-center">
                                <div className="bg-white/20 px-3 py-1.5 rounded-full mr-4 text-[11px] font-black border border-white/20">
                                    {cart.length} ITEMS
                                </div>
                                <span className="font-black text-sm uppercase tracking-[0.2em]">View Order</span>
                            </div>
                            <span className="font-black text-2xl tracking-tighter italic">₹{cartTotal.toFixed(2)}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Panel Redesign */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] rounded-t-[3.5rem] p-10 pb-12 z-[70] shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Your</h2>
                                    <h2 className="text-4xl font-black text-[#E31837] uppercase tracking-tighter italic leading-none">Bucket</h2>
                                </div>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-10 min-h-[100px]">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 group">
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tighter">{item.title}</p>
                                            <p className="text-lg font-black text-[#E31837] tracking-tight italic">₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                            className="w-10 h-10 bg-red-50 text-[#E31837] rounded-xl flex items-center justify-center active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-10">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
                                    <span className="text-slate-400 font-black uppercase text-[11px] tracking-widest">Subtotal</span>
                                    <span className="font-black text-slate-900">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-slate-400 font-black uppercase text-[11px] tracking-widest">Delivery Bag</span>
                                    <span className="font-black text-[#E31837] uppercase text-[11px] tracking-widest italic">Free</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-900 font-black uppercase text-2xl tracking-tighter italic">Total</span>
                                    <span className="text-4xl text-slate-900 font-black tracking-tighter italic">₹{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                disabled={isOrdering}
                                className="w-full bg-[#E31837] text-white py-6 rounded-[2rem] font-black text-xl uppercase italic shadow-[0_20px_50px_rgba(227,24,55,0.3)] disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center tracking-tighter"
                            >
                                {isOrdering ? (
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                ) : (
                                    "Confirm & Order"
                                )}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
