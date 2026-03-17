"use client";

import React, { useState } from "react";
import { ArrowLeft, Receipt, CreditCard, CheckCircle, ChevronRight, Download, RefreshCw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseRequests, addSupabaseRequest, useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";

export default function BillPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt } = useGuestRoom();
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [ratings, setRatings] = useState<Record<string, number>>({});

    const handleRate = (reqId: string, rating: number, type: string) => {
        setRatings(prev => ({ ...prev, [reqId]: rating }));
        console.log(`Rated ${type}: ${rating}/5`);
    };

    const handlePrint = () => {
        console.log("Printing invoice...");
        window.print();
    };

    // All requests for the current room and session
    // Relaxed filtering: If checkedInAt is missing, show everything for this room
    const roomRequests = requests.filter(r => {
        const isCorrectRoom = r.room === roomNumber;
        const hasPrice = (r.price || 0) > 0;
        const isNotCheckoutAction = r.type !== "Checkout Requested";
        
        // If we have a timestamp, use it for security/session split
        // If not, allow showing items for this room (common for quick-entry tables)
        const isCurrentSession = !checkedInAt || r.timestamp >= checkedInAt;
        
        return isCorrectRoom && hasPrice && isNotCheckoutAction && isCurrentSession;
    });
    const unpaidRequests = roomRequests.filter(r => !r.is_paid);
    const totalAmount = roomRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    const amountDue = unpaidRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    
    // Realistic Luxury Calculations
    const serviceCharge = amountDue * 0.05; // 5% Service Charge
    const vatAmount = (amountDue + serviceCharge) * 0.12; // 12% VAT
    const grandTotal = amountDue + serviceCharge + vatAmount;

    // Check if the guest has already paid (all requests are is_paid: true)
    const isFullyPaid = roomRequests.length > 0 && roomRequests.every(r => r.is_paid);

    const handleCheckout = async () => {
        if (!branding?.id) return;
        setIsCheckingOut(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Add a "Checkout Requested" signal to admin
        await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: "Checkout Requested",
            notes: `Guest finalized bill: ₹${grandTotal.toFixed(0)}`,
            status: "Pending",
            price: grandTotal,
            total: grandTotal
        });

        setIsCheckingOut(false);
        setCheckoutComplete(true);
    };

    if (checkoutComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center px-10 min-h-screen bg-noise"
            >
                <div className="w-24 h-24 bg-orange-50 text-[#F59E0B] rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-[#F59E0B]/10">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-serif italic text-[#3E2723] mb-4">Vibe Settled ☕</h2>
                <p className="text-slate-500 font-medium italic mb-12">Your order has been settled. We hope your cravings were satisfied.</p>
                <button
                    onClick={() => router.push(`/${hotelSlug}/guest/dashboard`)}
                    className="w-full bg-[#3E2723] text-[#FFF8F2] py-6 rounded-[1.75rem] font-serif italic text-xl active:scale-95 transition-all shadow-xl shadow-[#3E2723]/20"
                >
                    Return to Cravings
                </button>
            </motion.div>
        );
    }

    return (
        <div className="pb-40 pt-10 px-6 max-w-[500px] mx-auto bg-noise min-h-screen text-[#3E2723]">
            <div className="flex items-center justify-between mb-12 no-print">
                <button 
                    onClick={() => router.back()} 
                    className="w-12 h-12 rounded-full bg-white border border-[#3E2723]/5 flex items-center justify-center shadow-xl shadow-[#3E2723]/5 active:scale-90 transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-[#3E2723]" />
                </button>
                <h1 className="text-2xl font-serif italic text-[#3E2723]">Cravings Receipt</h1>
                <button
                    onClick={handlePrint}
                    className="w-12 h-12 rounded-full bg-white border border-[#3E2723]/5 flex items-center justify-center text-slate-400 hover:text-[#3E2723] transition-all no-print shadow-sm"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            <div className="print-area">
                {/* 1. Café Spend Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#3E2723] rounded-[2.5rem] p-10 text-[#FFF8F2] mb-12 relative overflow-hidden shadow-2xl shadow-[#3E2723]/30 border border-white/5"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFF8F2]/40 mb-4">Total Craving Spent</p>
                        <h2 className="text-6xl font-serif italic tracking-tighter mb-10 flex items-center justify-center">
                            <span className="text-2xl mr-2 text-[#FFF8F2]/30 not-italic">₹</span>
                            {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h2>
                        <div className="flex items-center justify-center space-x-4 pt-8 border-t border-white/5">
                            <div className="flex items-center">
                                <Receipt className="w-4 h-4 mr-2 text-[#FFF8F2]/30" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF8F2]/60">Order {roomNumber}</span>
                            </div>
                            <div className="w-1 h-1 bg-white/10 rounded-full" />
                            <div className="flex items-center">
                                <motion.div 
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2 shadow-[0_0_8px_#F59E0B]" 
                                />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#F59E0B]">Live Ledger</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-xl font-serif italic text-[#3E2723]">Cravings History</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-[0.2em]">{roomRequests.length} Experiences</span>
                </div>

                <div className="space-y-4 mb-12">
                    {roomRequests.length > 0 ? (
                        roomRequests.map((req, index) => {
                            const itemRating = ratings[req.id];
                            
                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-6 rounded-[2rem] border border-[#3E2723]/5 shadow-xl shadow-[#3E2723]/5 relative overflow-hidden group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h4 className="font-serif italic text-[#3E2723] text-lg truncate">
                                                    {req.type}
                                                </h4>
                                                {req.is_paid && (
                                                    <span className="text-[8px] font-black text-[#F59E0B] bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-widest">Settled</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.time}</p>
                                            {req.notes && (
                                                <p className="text-[11px] text-[#F59E0B] font-medium italic mt-2 opacity-80 decoration-[#F59E0B]/30 underline-offset-4 underline">
                                                    “{req.notes}”
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="font-serif text-[#3E2723] text-lg">₹{req.total?.toLocaleString() || "0"}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Frictionless One-Tap Rating */}
                                    <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic tracking-[0.1em]">Craving Satisfaction</span>
                                        <div className="flex space-x-3">
                                            {["😒", "😐", "🙂", "😋", "🔥"].map((emoji, i) => (
                                                <motion.button
                                                    key={i}
                                                    whileTap={{ scale: 1.5 }}
                                                    onClick={() => handleRate(req.id, i + 1, req.type)}
                                                    className={`text-2xl grayscale transition-all duration-300 ${itemRating === i + 1 ? 'grayscale-0 scale-125 hover:rotate-12' : 'hover:grayscale-0 opacity-20 hover:opacity-100'}`}
                                                >
                                                    {emoji}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="py-24 text-center border-2 border-dashed border-[#3E2723]/10 rounded-[3rem] bg-white/50">
                            <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-serif italic text-lg">Your cravings list is empty</p>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="mt-6 text-[10px] font-black text-[#F59E0B] uppercase tracking-[0.2em] border-b-2 border-[#F59E0B]/20 pb-1 active:translate-y-0.5 transition-all"
                            >
                                Start Craving →
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 space-y-5 mb-14 border border-[#3E2723]/5 shadow-2xl shadow-[#3E2723]/5">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest tracking-[0.1em]">Net Cravings</span>
                        <span className="text-[#3E2723] italic font-serif text-lg">₹{amountDue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest tracking-[0.1em]">Service Vibe (5%)</span>
                        <span className="text-[#3E2723] italic font-serif text-lg">₹{serviceCharge.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest tracking-[0.1em]">Crave Tax (12%)</span>
                        <span className="text-[#3E2723] italic font-serif text-lg">₹{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-[0.3em] text-[#3E2723] leading-none">Total Vibe</span>
                        <span className="text-4xl font-serif italic text-[#F59E0B] tracking-tighter leading-none">₹{grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={isCheckingOut || grandTotal === 0 || isFullyPaid}
                className="w-full bg-[#3E2723] text-[#FFF8F2] py-8 rounded-[1.75rem] font-serif italic text-2xl shadow-2xl shadow-[#3E2723]/30 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:active:scale-100 no-print"
            >
                {isCheckingOut ? (
                    <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mr-3">
                            <RefreshCw className="w-7 h-7" />
                        </motion.div>
                        Settling Cravings...
                    </span>
                ) : isFullyPaid ? (
                    <span className="flex items-center">
                        <CheckCircle className="w-7 h-7 mr-4 text-[#F59E0B]" /> All Settled
                    </span>
                ) : (
                    <span className="flex items-center">
                        <CreditCard className="w-7 h-7 mr-4 opacity-40" /> Settle & Vibe Out
                    </span>
                )}
            </button>
        </div>
    );
}
