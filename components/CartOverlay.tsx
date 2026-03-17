"use client";

import React from "react";
import { Trash2, Plus, Minus, X, RefreshCw, ShoppingBag, Sparkles, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartProgressBar } from "./CartProgressBar";
import { UpsellSection } from "./UpsellSection";
import { SHARED_MENU_ITEMS, SHARED_COMBOS } from "@/utils/constants";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cart: Record<string, number>;
    updateQuantity: (id: string, q: number) => void;
    cartTotal: number;
    isOrdering: boolean;
    onOrder: () => void;
    hotelId?: string;
    menuItems: any[];
}

export function CartOverlay({
    isOpen,
    onClose,
    cart,
    updateQuantity,
    cartTotal,
    isOrdering,
    onOrder,
    hotelId,
    menuItems
}: CartOverlayProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    
    const cartItems = Object.entries(cart).map(([id, q]) => {
        const item = menuItems.find(m => m.id === id);
        
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
                        className="fixed inset-0 backdrop-blur-md z-[120]"
                        style={{ backgroundColor: `${theme.primary}CC` }}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 35, stiffness: 350, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 z-[130] flex flex-col max-h-[95vh] border-t shadow-2xl"
                        style={{ 
                            backgroundColor: theme.background,
                            borderRadius: `${theme.radius} ${theme.radius} 0 0`,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        {/* Native Handle Bar */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-16 h-1.5 opacity-10 rounded-full" style={{ backgroundColor: theme.primary }} />
                        </div>

                        <div className="p-8 pt-6 overflow-y-auto no-scrollbar pb-safe">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Your Bag</h2>
                                    <h2 className="text-4xl font-black italic tracking-tighter leading-none" style={{ color: theme.primary }}>Cravings</h2>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border"
                                    style={{ 
                                        backgroundColor: theme.surface,
                                        color: theme.primary, 
                                        borderRadius: `calc(${theme.radius} * 0.5)`,
                                        borderColor: `${theme.primary}10`
                                    }}
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>
                            </div>

                            <div className="space-y-4 mb-12">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className="flex items-center justify-between p-6 shadow-xl border group transition-all" 
                                            style={{ 
                                                borderRadius: theme.radius,
                                                backgroundColor: theme.surface,
                                                borderColor: `${theme.primary}10`
                                            }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}>
                                                    {item.quantity}×
                                                </div>
                                                <div>
                                                    <p className="font-black italic text-lg" style={{ color: theme.text }}>{item.title}</p>
                                                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>₹{((item.price || 0) * item.quantity).toFixed(0)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all border"
                                                    style={{ backgroundColor: `${theme.text}0a`, borderColor: `${theme.text}10`, color: theme.text }}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all border"
                                                    style={{ backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}20`, color: theme.primary }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${theme.primary}0a` }}>
                                            <ShoppingBag className="w-8 h-8 opacity-20" style={{ color: theme.primary }} />
                                        </div>
                                        <p className="font-serif italic text-xl opacity-40" style={{ color: theme.text }}>Your bag is empty</p>
                                    </div>
                                )}
                            </div>

                            {/* 4. Complete your Order (Final Impulse) */}
                            {cartItems.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center space-x-3 mb-6 px-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.accent }}>Complete your Order</span>
                                        <div className="h-[1px] flex-1 opacity-10" style={{ backgroundColor: theme.accent }} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {(() => {
                                            // Suggest a dessert if not already in cart, otherwise suggest a drink/side
                                            const suggestion = menuItems.find(m => 
                                                (m.category.toLowerCase() === 'desserts' || m.category.toLowerCase() === 'drinks') && 
                                                !cart[m.id]
                                            );
                                            
                                            if (!suggestion) return null;

                                            return (
                                                <motion.div 
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => addToCart(suggestion)}
                                                    className="rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group border border-white/10"
                                                    style={{ 
                                                        backgroundColor: theme.primary,
                                                        borderRadius: theme.radius
                                                    }}
                                                >
                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-white">
                                                        <Sparkles className="w-20 h-20" />
                                                    </div>
                                                    <div className="relative z-10 text-left">
                                                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: theme.secondary }}>
                                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.secondary }} />
                                                            <span>Chef's Final Touch</span>
                                                        </div>
                                                        <h4 className="text-2xl font-black italic text-white mb-1">“Add a {suggestion.title}?” 🍰</h4>
                                                        <p className="text-white/60 text-sm font-medium italic mb-6">End your experience on a perfect note.</p>
                                                        <button 
                                                            className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl shadow-lg active:scale-95 transition-all text-white"
                                                            style={{ backgroundColor: theme.accent }}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span>Add for ₹{suggestion.price}</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* 5. Checkout Action */}
                            <div className="rounded-[2.5rem] p-8 shadow-2xl border" style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-black uppercase text-[10px] tracking-widest opacity-40" style={{ color: theme.text }}>Grand Total</span>
                                    <span className="text-4xl font-black italic" style={{ color: theme.text }}>₹{cartTotal.toFixed(0)}</span>
                                </div>
                                <button
                                    onClick={onOrder}
                                    disabled={isOrdering || cartItems.length === 0}
                                    className="w-full py-8 font-black text-2xl italic shadow-2xl disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center text-white"
                                    style={{ 
                                        backgroundColor: theme.primary,
                                        borderRadius: `calc(${theme.radius} * 0.75)`
                                    }}
                                >
                                    {isOrdering ? (
                                        <RefreshCw className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <span className="flex items-center space-x-3">
                                            <span>Place Order</span>
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
