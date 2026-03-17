"use client";

import React from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
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
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] rounded-t-[3.5rem] p-10 pb-12 z-[130] shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-4xl font-serif text-slate-900 italic tracking-tighter leading-none">Your</h2>
                                <h2 className="text-4xl font-serif text-[#722F37] italic tracking-tighter leading-none">Selection</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
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
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Delivery Bag</span>
                                <span className="font-bold text-[#B8860B] uppercase text-[10px] tracking-[0.2em] italic">Complementary</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-900 font-serif text-2xl tracking-tighter italic leading-none">Final</span>
                                <span className="text-4xl text-slate-900 font-serif tracking-tighter italic leading-none ml-2">Experience</span>
                                <span className="flex-1" />
                                <span className="text-4xl text-slate-900 font-serif tracking-tighter italic leading-none">₹{cartTotal.toFixed(0)}</span>
                            </div>
                        </div>

                        <button
                            onClick={onOrder}
                            disabled={isOrdering}
                            className="w-full bg-[#722F37] text-white py-6 rounded-[2rem] font-serif text-xl uppercase italic shadow-2xl shadow-[#722F37]/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center tracking-tighter"
                        >
                            {isOrdering ? <RefreshCw className="w-8 h-8 animate-spin" /> : "Confirm Experience"}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
