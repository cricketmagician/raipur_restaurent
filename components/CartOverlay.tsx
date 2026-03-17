"use client";

import React from "react";
import { Trash2, Plus, Minus, X, RefreshCw, ShoppingBag, Sparkles, ArrowUpRight } from "lucide-react";
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
                        className="fixed inset-0 bg-[#3E2723]/80 backdrop-blur-md z-[120]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 35, stiffness: 350, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#FFF8F2] rounded-t-[3rem] z-[130] shadow-[0_-20px_80px_rgba(62,39,35,0.2)] flex flex-col max-h-[95vh] border-t border-[#3E2723]/5 shadow-2xl"
                    >
                        {/* Native Handle Bar */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-16 h-1.5 bg-[#3E2723]/10 rounded-full" />
                        </div>

                        <div className="p-8 pt-6 overflow-y-auto no-scrollbar pb-safe">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Your Bag</h2>
                                    <h2 className="text-4xl font-serif text-[#3E2723] italic tracking-tighter leading-none">Cravings</h2>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#3E2723] shadow-xl shadow-[#3E2723]/5 border border-[#3E2723]/5"
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            <div className="space-y-4 mb-12">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-xl shadow-[#3E2723]/5 border border-[#3E2723]/5 group">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-[#3E2723]/5 rounded-xl flex items-center justify-center font-bold text-[#3E2723]">
                                                    {item.quantity}×
                                                </div>
                                                <div>
                                                    <p className="font-serif text-[#3E2723] italic text-lg">{item.title}</p>
                                                    <p className="text-xs font-bold text-[#F59E0B] tracking-widest uppercase">₹{((item.price || 0) * item.quantity).toFixed(0)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-slate-100"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 bg-[#3E2723]/5 text-[#3E2723] rounded-xl flex items-center justify-center active:scale-90 transition-all border border-[#3E2723]/10"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <ShoppingBag className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-serif italic text-xl">Your bag is empty</p>
                                    </div>
                                )}
                            </div>

                            {/* 4. Make it Better (Impulse Section) */}
                            {cartItems.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center space-x-3 mb-6 px-1">
                                        <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-[0.3em]">Make it better?</span>
                                        <div className="h-[1px] flex-1 bg-orange-100" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <motion.div 
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                const brownie = SHARED_MENU_ITEMS.find(i => i.id === 'brownie') || { id: 'brownie', title: 'Warm Brownie', price: 129 };
                                                addToCart(brownie);
                                            }}
                                            className="bg-[#3E2723] rounded-[2rem] p-8 shadow-2xl shadow-[#3E2723]/20 relative overflow-hidden group border border-white/10"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <Sparkles className="w-20 h-20 text-white" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center space-x-2 text-[#F59E0B] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                                    <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse" />
                                                    <span>Perfect Pairing</span>
                                                </div>
                                                <h4 className="text-2xl font-serif italic text-white mb-1">Fries go best with this 🍟</h4>
                                                <p className="text-white/60 text-sm font-medium italic mb-6">“Add a salty crunch to your experience.”</p>
                                                <button className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-[#3E2723] bg-[#F59E0B] px-6 py-4 rounded-xl shadow-lg active:scale-95 transition-all">
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add for ₹99</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {/* 5. Checkout Action */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#3E2723]/5 border border-[#3E2723]/5">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Grand Total</span>
                                    <span className="text-4xl font-serif italic text-[#3E2723]">₹{cartTotal.toFixed(0)}</span>
                                </div>
                                <button
                                    onClick={onOrder}
                                    disabled={isOrdering || cartItems.length === 0}
                                    className="w-full bg-[#3E2723] text-[#FFF8F2] py-8 rounded-[1.75rem] font-serif text-2xl italic shadow-2xl shadow-[#3E2723]/20 disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    {isOrdering ? (
                                        <RefreshCw className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <span className="flex items-center space-x-3">
                                            <span>Start the Vibe</span>
                                            <ArrowUpRight className="w-6 h-6 mt-1" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
