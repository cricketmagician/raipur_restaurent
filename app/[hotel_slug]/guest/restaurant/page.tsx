"use client";

import React, { useState } from "react";
import { MenuCard } from "@/components/MenuCard";
import { ShoppingCart, CheckCircle, ArrowLeft, Trash2, Plus, RefreshCw, Utensils } from "lucide-react";
import { addSupabaseRequest, useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();

    const [cart, setCart] = useState<{ id: string; title: string; price: number }[]>([]);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const [activeCategory, setActiveCategory] = useState<string>("all");

    const categories = [
        { id: "all", name: "All", icon: "🍱" },
        { id: "burgers", name: "Burgers", icon: "🍔" },
        { id: "fries", name: "Fries", icon: "🍟" },
        { id: "sides", name: "Sides", icon: "🥗" },
        { id: "drinks", name: "Drinks", icon: "🥤" },
        { id: "desserts", name: "Desserts", icon: "🍰" },
    ];

    const menuItems = [
        { id: "m1", category: "burgers", title: "Crispy Buttermilk Chicken Burger", description: "Ultra-crispy hand-breaded chicken, spicy jalapeños, and smoky chipotle mayo.", price: 180, image: "/images/menu/buttermilk_chicken_burger_1773233570467.png" },
        { id: "m2", category: "burgers", title: "Gourmet Garden Burger", description: "Hand-crafted veggie patty with melted cheddar and fresh arugula.", price: 160, image: "/images/menu/veggie_burger_1773233586101.png" },
        { id: "m3", category: "fries", title: "Loaded Peri-Peri Fries", description: "Crispy thin-cut fries topped with liquid cheese and jalapeños.", price: 140, image: "/images/menu/loaded_fries_hero_1773232655179.png" },
        { id: "m4", category: "fries", title: "Golden Classic Fries", description: "Lightly salted, thin-cut fries, served golden brown.", price: 90, image: "/images/menu/classic_fries_1773233603370.png" },
        { id: "m5", category: "sides", title: "Cheesy Garlic Bread", description: "Toasted brioche slices with garlic butter and mozzarella.", price: 120, image: "/images/menu/garlic_bread_1773233624069.png" },
        { id: "m6", category: "sides", title: "Premium Caesar Salad", description: "Crisp romaine, croutons, and parmesan shavings.", price: 210, image: "/images/menu/caesar_salad_1773233640332.png" },
        { id: "m7", category: "drinks", title: "Iced Whipped Coffee", description: "Velvety smooth cold brew with whipped cream.", price: 130, image: "/images/menu/cold_coffee_premium_1773233658375.png" },
        { id: "m8", category: "desserts", title: "Molten Lava Cake", description: "Warm chocolate cake with a gooey center and vanilla ice cream.", price: 190, image: "/images/menu/choco_lava_cake_1773233674857.png" },
    ];

    const filteredItems = activeCategory === "all" ? menuItems : menuItems.filter(i => i.category === activeCategory);

    const addToCart = (item: any) => {
        setCart([...cart, { id: item.id, title: item.title, price: item.price }]);
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
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
            alert(`Order Failed: ${error.message || 'Please try again.'}`);
        } else {
            setOrderComplete(true);
            setCart([]);
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
            <div className="mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar flex items-center space-x-4">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center group ${isActive
                                ? 'bg-[#F55D2C] text-white shadow-2xl shadow-[#F55D2C]/20 scale-105'
                                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200 shadow-sm'
                                }`}
                        >
                            <span className="mr-2 text-base">{category.icon}</span>
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Menu Items */}
            <div className="space-y-12">
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">
                                {categories.find(c => c.id === activeCategory)?.name}
                            </h2>
                            <div className="h-1.5 w-12 bg-[#F55D2C] rounded-full mt-1"></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <Utensils className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">No items found.</p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <MenuCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description || ""}
                                    price={item.price}
                                    image={item.image}
                                    onAdd={() => addToCart(item)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Floating Cart Entry */}
            <AnimatePresence>
                {cart.length > 0 && !showCart && (
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
                                    {cart.length} ITEMS
                                </div>
                                <span className="font-black text-sm uppercase tracking-[0.2em]">View Order</span>
                            </div>
                            <span className="font-black text-2xl tracking-tighter italic">₹{cartTotal.toFixed(2)}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Overlay */}
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
                                    <h2 className="text-4xl font-black text-[#F55D2C] uppercase tracking-tighter italic leading-none">Bucket</h2>
                                </div>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-10 overflow-hidden">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 group">
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tighter">{item.title}</p>
                                            <p className="text-lg font-black text-[#F55D2C] tracking-tight italic">₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                            className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center active:scale-90 transition-all"
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
                                    <span className="font-black text-[#F55D2C] uppercase text-[11px] tracking-widest italic">Free</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-900 font-black uppercase text-2xl tracking-tighter italic">Total</span>
                                    <span className="text-4xl text-slate-900 font-black tracking-tighter italic">₹{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                disabled={isOrdering}
                                className="w-full bg-[#F55D2C] text-white py-6 rounded-[2rem] font-black text-xl uppercase italic shadow-2xl shadow-[#F55D2C]/40 orange-glow disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center tracking-tighter"
                            >
                                {isOrdering ? <RefreshCw className="w-8 h-8 animate-spin" /> : "Confirm & Order"}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <BottomNav />
        </div>
    );
}
