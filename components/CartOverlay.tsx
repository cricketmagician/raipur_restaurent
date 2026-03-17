"use client";

import React from "react";
import { Trash2, Plus, Minus, X, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartProgressBar } from "./CartProgressBar";
import { UpsellSection } from "./UpsellSection";
import { SHARED_MENU_ITEMS, SHARED_COMBOS } from "@/utils/constants";

interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cart: Record<string, number>;
    updateQuantity: (id: string, q: number) => void;
    cartTotal: number;
    isOrdering: boolean;
    onOrder: () => void;
    hotelId?: string;
}

export function CartOverlay({
    isOpen,
    onClose,
    cart,
    updateQuantity,
    cartTotal,
    isOrdering,
    onOrder,
    hotelId
}: CartOverlayProps) {
    
    const cartItems = Object.entries(cart).map(([id, q]) => {
        let item = SHARED_MENU_ITEMS.find(m => m.id === id);
        
        // Handle virtual combos
        if (!item && (id.includes("combo") || id === "king_size")) {
            const foundCombo = SHARED_COMBOS.find(c => c.id === id);
            if (foundCombo) {
                item = { ...foundCombo, category: "combos", description: "Special Combo Deal", image: "", isPopular: true, upsellIds: [] } as any;
            }
        }
        
        if (!item) return null;
        return { ...item, quantity: q };
    }).filter((item): item is (any & { quantity: number }) => item !== null);

    const addToCart = (item: any) => {
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#FAF7F2] rounded-t-[3rem] z-[130] shadow-[0_-20px_80px_rgba(0,0,0,0.15)] flex flex-col max-h-[92vh]"
                    >
                        {/* Native Handle Bar */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>

                        <div className="p-8 pt-4 overflow-y-auto no-scrollbar pb-safe">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-900 italic tracking-tighter leading-none">Your</h2>
                                    <h2 className="text-3xl font-serif text-[#722F37] italic tracking-tighter leading-none">Selection</h2>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </motion.button>
                            </div>

                        <div className="space-y-4 mb-10 overflow-hidden">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 group">
                                    <div>
                                        <p className="font-serif text-slate-900 italic text-xs capitalize">{item.quantity}x {item.title.toLowerCase()}</p>
                                        <p className="text-lg font-black text-[#B8860B] tracking-tight italic">₹{((item.price || 0) * item.quantity).toFixed(0)}</p>
                                    </div>
                                    <button
                                        onClick={() => updateQuantity(item.id || '', 0)}
                                        className="w-10 h-10 bg-red-50/50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-red-100/50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            <UpsellSection 
                                items={SHARED_MENU_ITEMS.filter(mi => !cartItems.some(ci => ci.id === mi.id)).slice(0, 3)} 
                                onAdd={(item) => addToCart(item)} 
                            />
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-10">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-50">
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Selection Total</span>
                                <span className="font-serif italic text-slate-900">₹{cartTotal.toFixed(0)}</span>
                            </div>
                            <div className="mt-12 p-8 rounded-[2rem] bg-[#FAF7F2] border border-[#8B0000]/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-16 h-16 text-[#8B0000]" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center">
                                        <Sparkles className="w-3 h-3 mr-2" /> Complete your experience
                                    </p>
                                    <h4 className="text-xl font-serif italic text-slate-900 mb-1">Chocolate Brownie</h4>
                                    <p className="text-slate-400 text-xs font-medium italic mb-6">“The perfect sweet finish to your meal.”</p>
                                    <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#8B0000] bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-all">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add for ₹129</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-10">
                                <span className="text-slate-400 font-serif italic text-xl">Total</span>
                                <span className="text-3xl font-serif italic text-slate-900">₹{cartTotal.toFixed(0)}</span>
                            </div>

                            <button
                                onClick={onOrder}
                                disabled={isOrdering}
                                className="w-full bg-[#8B0000] text-[#FAF7F2] py-8 rounded-[1.25rem] font-serif text-2xl italic shadow-2xl shadow-[#8B0000]/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center tracking-tighter"
                            >
                                {isOrdering ? <RefreshCw className="w-8 h-8 animate-spin" /> : "Confirm Experience"}
                            </button>
                        </div>
                    </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
