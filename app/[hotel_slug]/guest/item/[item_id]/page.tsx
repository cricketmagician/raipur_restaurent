"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Trash2, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";
import { useHotelBranding, useSupabaseMenuItems, useCart } from "@/utils/store";
import { CATEGORY_THEMES } from "@/utils/themes";
import { BottomNav } from "@/components/BottomNav";
import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "@/components/AddEffect";

export default function ItemPage() {
    const params = useParams();
    const router = useRouter();
    const hotelSlug = params?.hotel_slug as string;
    const itemId = params?.item_id as string;

    const { branding } = useHotelBranding(hotelSlug);
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);
    const { cart, updateQuantity, cartCount } = useCart(branding?.id);

    const [isAdded, setIsAdded] = useState(false);
    const triggerFly = useAddEffectTrigger();

    const item = useMemo(() => menuItems.find(i => i.id === itemId), [menuItems, itemId]);
    
    const pairing = useMemo(() => {
        if (!item || !item.upsell_items || item.upsell_items.length === 0) return null;
        const ids = item.upsell_items;
        return menuItems.find(m => ids.includes(m.id) && m.is_available);
    }, [item, menuItems]);

    const theme = CATEGORY_THEMES[(item?.category || "all").toLowerCase()] || CATEGORY_THEMES.all;

    const handleAdd = (e: React.MouseEvent) => {
        if (!item) return;
        if (item.image_url) triggerFly(item.id, item.image_url, e);
        updateQuantity(item.id, (cart[item.id] || 0) + 1);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleAddPairing = (e: React.MouseEvent) => {
        if (!pairing) return;
        if (pairing.image_url) triggerFly(pairing.id, pairing.image_url, e);
        updateQuantity(pairing.id, (cart[pairing.id] || 0) + 1);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F2]">
            <div className="w-12 h-12 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F2] px-6 text-center">
            <h2 className="text-2xl font-serif italic text-slate-400 mb-6">Item not found</h2>
            <button onClick={() => router.back()} className="text-[#3E2723] font-bold uppercase tracking-widest text-xs flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F0EB] font-sans pb-40">
            {/* Header / Back Button */}
            <div className="fixed top-0 left-0 right-0 p-6 z-50 flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all text-[#1E3932]"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="px-6 py-2 bg-[#00704A] text-white rounded-full shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.category}</span>
                </div>
            </div>

            {/* Premium Product Presentation */}
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-white">
                <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    src={getDirectImageUrl(item.image_url)} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F2F0EB] via-transparent to-transparent opacity-60" />
            </div>

            {/* Content Section */}
            <div className="px-8 -mt-20 relative z-10">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#1E3932]/10"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        {item.is_popular && (
                            <div className="bg-[#D4E9E2] text-[#00704A] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center">
                                <Sparkles className="w-3 h-3 mr-2" /> Handcrafted
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl font-black text-[#1E3932] leading-tight mb-4 tracking-tighter">
                        {item.title}
                    </h1>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                        {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-10 pb-10 border-b border-[#00704A]/5">
                        <span className="text-4xl font-black text-[#1E3932]">₹{item.price}</span>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-[#00704A] uppercase tracking-widest">+ 45 STARS</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <AnimatePresence mode="wait">
                            {(cart[item.id] || 0) > 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full h-20 bg-[#F2F0EB] rounded-full flex items-center justify-between px-2 border border-[#00704A]/10 shadow-inner"
                                >
                                    <button
                                        onClick={() => updateQuantity(item.id, (cart[item.id] || 0) - 1)}
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-[#00704A] hover:bg-white transition-all active:scale-90"
                                    >
                                        {(cart[item.id] || 0) === 1 ? <Trash2 className="w-6 h-6 text-red-500" /> : <Minus className="w-6 h-6" />}
                                    </button>
                                    
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-black text-[#1E3932]">{cart[item.id]}</span>
                                        <span className="text-[8px] font-black text-[#00704A] uppercase tracking-widest">In Bag</span>
                                    </div>
                                    
                                    <button
                                        onClick={(e) => handleAdd(e)}
                                        className="w-16 h-16 rounded-full flex items-center justify-center bg-[#00704A] text-white shadow-lg active:scale-90 transition-all font-black text-2xl"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={(e) => handleAdd(e)}
                                    className={`w-full py-8 rounded-full flex items-center justify-center space-x-4 transition-all active:scale-95 shadow-xl relative overflow-hidden group ${
                                        isAdded ? 'bg-emerald-500 text-white' : 'bg-[#00704A] text-white'
                                    }`}
                                >
                                    <AnimatePresence mode="wait">
                                        {isAdded ? (
                                            <motion.span 
                                                key="added"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="text-lg font-black uppercase tracking-widest flex items-center"
                                            >
                                                Added to Bag ✨
                                            </motion.span>
                                        ) : (
                                            <motion.span 
                                                key="add"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                className="text-lg font-black uppercase tracking-widest flex items-center"
                                            >
                                                Add to Order
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* --- 🤤 Perfect Pairing (Smart Suggestion) --- */}
                {pairing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 space-y-8"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em]">Perfect Addition</h3>
                        </div>

                        <div className="w-full bg-white p-6 rounded-[2.5rem] border border-[#00704A]/5 shadow-xl shadow-[#00704A]/5 flex items-center justify-between group transition-all text-left">
                            <div className="flex items-center flex-1 min-w-0">
                                <div className="w-16 h-16 rounded-full overflow-hidden mr-5 shrink-0 shadow-lg">
                                    <img src={getDirectImageUrl(pairing.image_url)} alt={pairing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="min-w-0 mr-4">
                                    <h4 className="text-lg font-black text-[#1E3932] truncate">{pairing.title}</h4>
                                    <p className="text-[10px] text-[#00704A] font-black uppercase tracking-widest mt-1">₹{pairing.price} EACH</p>
                                </div>
                            </div>
                            
                            {(cart[pairing.id] || 0) > 0 ? (
                                <div className="flex items-center bg-[#F2F0EB] rounded-full p-1 border border-[#00704A]/10">
                                    <button 
                                        onClick={() => updateQuantity(pairing.id, (cart[pairing.id] || 0) - 1)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#00704A] hover:bg-white transition-all shadow-sm"
                                    >
                                        {(cart[pairing.id] || 0) === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                                    </button>
                                    <span className="w-8 text-center text-xs font-black text-[#1E3932]">{cart[pairing.id]}</span>
                                    <button 
                                        onClick={(e) => handleAddPairing(e)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00704A] text-white shadow-md"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => handleAddPairing(e)}
                                    className="w-12 h-12 bg-[#00704A] rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all font-black"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
