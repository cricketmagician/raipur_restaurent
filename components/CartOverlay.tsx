"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, X, RefreshCw, ShoppingBag, Sparkles, ArrowUpRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";
import { getDirectImageUrl } from "@/utils/image";

interface CartOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    cart: Record<string, number>;
    updateQuantity: (id: string, q: number) => void;
    cartTotal: number;
    isOrdering: boolean;
    onOrder: (details: { name: string; phone: string; table: string; mode: string }) => void;
    hotelId?: string;
    menuItems: any[];
    defaultTable?: string;
    defaultMode?: string;
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
    menuItems,
    defaultTable = "",
    defaultMode = "dine-in"
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

    const [isConfirming, setIsConfirming] = useState(false);
    const [step, setStep] = useState<1 | 2>(1); // 1: Cart, 2: Details Form
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [tableInput, setTableInput] = useState(defaultTable);
    const [orderModeInput, setOrderModeInput] = useState(defaultMode);

    // Reset state when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setIsConfirming(false);
            setStep(1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (defaultTable) setTableInput(defaultTable);
    }, [defaultTable]);

    const isFormValid = guestName.trim() !== "" && guestPhone.trim() !== "" && tableInput.trim() !== "";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[120] bg-[#0F3D2E]/80"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 40, stiffness: 400, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 z-[130] flex flex-col max-h-[95vh] border-t shadow-[0_-20px_80px_rgba(0,0,0,0.15)] bg-[#F5F1E8]"
                        style={{ 
                            borderRadius: `3rem 3rem 0 0`,
                            borderColor: `rgba(15, 61, 46, 0.05)`
                        }}
                    >
                        {/* Native Handle Bar */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-16 h-1.5 bg-[#0F3D2E]/10 rounded-full" />
                        </div>

                        <div className="p-8 pt-4 overflow-y-auto no-scrollbar pb-safe">
                            <div className="flex items-center justify-between mb-10 gap-4">
                                <div>
                                    <h2 className="text-[10px] font-black text-[#0F3D2E]/40 uppercase tracking-[0.4em] mb-2">
                                        {step === 2 ? (isConfirming ? "Final Check" : "Guest Details") : "Your Selection"}
                                    </h2>
                                    <h2 className="text-3xl font-black italic tracking-tighter leading-none text-[#0F3D2E]">
                                        {step === 2 ? (isConfirming ? "Order Summary" : "Details") : "Premium Bag"}
                                    </h2>
                                    <p className="mt-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#C8A96A]">
                                        {step === 2 ? "Ready for your experience?" : `${cartItems.length} curated item${cartItems.length === 1 ? "" : "s"}`}
                                    </p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={isConfirming ? () => setIsConfirming(false) : (step === 2 ? () => setStep(1) : onClose)}
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border shrink-0 bg-white border-black/5 text-[#0F3D2E]"
                                >
                                    {isConfirming || step === 2 ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                </motion.button>
                            </div>

                            {step === 1 && (
                                <>
                                    <div className="space-y-4 mb-10">
                                        {cartItems.length > 0 ? (
                                            cartItems.map((item) => (
                                                <div
                                                    key={item.id} 
                                                    className="flex items-center justify-between p-5 shadow-sm border border-black/5 bg-white rounded-[2rem] gap-4"
                                                >
                                                    <div className="flex items-center space-x-4 min-w-0">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-black/5 shrink-0">
                                                            {item.image_url ? (
                                                                <img src={getDirectImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-bold bg-[#0F3D2E]/5 text-[#0F3D2E]">
                                                                    {item.quantity}x
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-black italic text-lg tracking-tight text-[#0F3D2E] truncate">{item.title}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-xs font-black tracking-widest uppercase text-[#C8A96A]">
                                                                    ₹{((item.price || 0) * item.quantity).toFixed(0)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 shrink-0">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all border border-black/5 bg-[#F5F1E8] text-[#0F3D2E]"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-sm font-black w-4 text-center text-[#0F3D2E]">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all bg-[#0F3D2E] text-white shadow-lg shadow-[#0F3D2E]/20"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-24 text-center space-y-4">
                                                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-[#0F3D2E]/5">
                                                    <ShoppingBag className="w-10 h-10 text-[#0F3D2E] opacity-20" />
                                                </div>
                                                <p className="italic text-xl font-medium text-[#0F3D2E]/40">Your bag is empty</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Impulse Suggestions */}
                                    {cartItems.length > 0 && (
                                        <div className="mb-12">
                                            <div className="flex items-center space-x-3 mb-8 px-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Taste More</span>
                                                <div className="h-[1px] flex-1 bg-[#C8A96A]/20" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-6">
                                                {(() => {
                                                    const suggestion = menuItems.find(m => m.is_recommended && !cart[m.id]) || menuItems.find(m => 
                                                        (m.category.toLowerCase() === 'desserts' || m.category.toLowerCase() === 'drinks') && 
                                                        !cart[m.id]
                                                    );
                                                    
                                                    if (!suggestion) return null;

                                                    return (
                                                        <motion.div 
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => addToCart(suggestion)}
                                                            className="rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group bg-[#0F3D2E]"
                                                        >
                                                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform text-white">
                                                                <Sparkles className="w-24 h-24" />
                                                            </div>
                                                            <div className="relative z-10 text-left space-y-4">
                                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] animate-pulse" />
                                                                    <span>Chef's Choice</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-2xl font-black italic text-white leading-tight">“Add a {suggestion.title}?”</h4>
                                                                    <p className="text-white/60 text-sm font-medium italic mt-1">The perfect finale to your journey.</p>
                                                                </div>
                                                                <button 
                                                                    className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest px-8 py-5 rounded-2xl shadow-2xl active:scale-95 transition-all text-white bg-[#C8A96A]"
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
                                </>
                            )}

                            {step === 2 && !isConfirming && (
                                <div className="space-y-8 mb-12">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40 ml-2">How should we address you?</label>
                                            <input 
                                                type="text"
                                                placeholder="Enter your name"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                className="w-full bg-white border border-[#0F3D2E]/5 rounded-[1.5rem] px-6 py-5 font-black text-sm text-[#0F3D2E] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/20 transition-all placeholder:text-[#0F3D2E]/20"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40 ml-2">Phone for updates</label>
                                            <input 
                                                type="tel"
                                                placeholder="Enter mobile number"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                className="w-full bg-white border border-[#0F3D2E]/5 rounded-[1.5rem] px-6 py-5 font-black text-sm text-[#0F3D2E] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/20 transition-all placeholder:text-[#0F3D2E]/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40 ml-2">Table / Spot</label>
                                                <input 
                                                    type="text"
                                                    placeholder="e.g., T-12"
                                                    value={tableInput}
                                                    onChange={(e) => setTableInput(e.target.value)}
                                                    className="w-full bg-white border border-[#0F3D2E]/5 rounded-[1.5rem] px-6 py-5 font-black text-sm text-[#0F3D2E] focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/20 transition-all placeholder:text-[#0F3D2E]/20"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40 ml-2">Order Type</label>
                                                <div className="flex bg-white border border-[#0F3D2E]/5 rounded-[1.5rem] p-1.5 h-[62px]">
                                                    <button 
                                                        onClick={() => setOrderModeInput("dine-in")}
                                                        className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${orderModeInput === "dine-in" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-[#0F3D2E]/40'}`}
                                                    >
                                                        Dine-In
                                                    </button>
                                                    <button 
                                                        onClick={() => setOrderModeInput("takeaway")}
                                                        className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${orderModeInput === "takeaway" ? 'bg-[#0F3D2E] text-white shadow-lg' : 'text-[#0F3D2E]/40'}`}
                                                    >
                                                        Takeaway
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-[#0F3D2E]/5 space-y-2">
                                        <p className="text-[9px] font-bold text-[#0F3D2E]/40 uppercase tracking-[0.2em] leading-relaxed">
                                            Your order will be prepared as <span className="text-[#C8A96A]">{orderModeInput.replace('-', ' ')}</span> at {tableInput || 'your location'}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isConfirming && (
                                <div className="mb-12 p-8 rounded-[2.5rem] bg-white border border-[#0F3D2E]/5 shadow-sm">
                                    <div className="space-y-6">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-[#0F3D2E] tracking-tight">{item.quantity}x {item.title}</span>
                                                    <span className="text-[10px] font-black text-[#0F3D2E]/40 uppercase tracking-widest">₹{item.price} each</span>
                                                </div>
                                                <span className="text-base font-black text-[#0F3D2E]">₹{(item.price * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                        <div className="h-[1px] bg-[#0F3D2E]/5 mt-4" />
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F3D2E]/40">Order Value</span>
                                            <span className="text-2xl font-black italic text-[#0F3D2E]">₹{cartTotal.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checkout Action Area */}
                            <div className="rounded-[3rem] p-8 shadow-2xl border bg-white border-[#0F3D2E]/5">
                                {!isConfirming && (
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="font-black uppercase text-[10px] tracking-[0.4em] text-[#0F3D2E]/40">Total</span>
                                        <span className="text-4xl font-black italic text-[#0F3D2E]">₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        if (step === 1) setStep(2);
                                        else if (step === 2 && !isConfirming) setIsConfirming(true);
                                        else onOrder({ name: guestName, phone: guestPhone, table: tableInput, mode: orderModeInput });
                                    }}
                                    disabled={isOrdering || cartItems.length === 0 || (step === 2 && !isFormValid)}
                                    className="w-full py-6 font-black text-xs uppercase tracking-[0.3em] shadow-2xl disabled:opacity-40 active:scale-[0.98] transition-all flex items-center justify-center text-white bg-[#0F3D2E] rounded-[2rem]"
                                >
                                    {isOrdering ? (
                                        <RefreshCw className="w-6 h-6 animate-spin text-[#C8A96A]" />
                                    ) : (
                                        <span className="flex items-center space-x-3">
                                            <span>
                                                {step === 1 ? "Proceed to Details" : (isConfirming ? "Initiate Experience" : "Review & Confirm")}
                                            </span>
                                            <ArrowUpRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </button>
                                {isConfirming && (
                                    <p className="text-center mt-6 text-[10px] font-black text-[#0F3D2E]/30 uppercase tracking-[0.2em] leading-relaxed">
                                        Your selection is about to be handcrafted with care
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
