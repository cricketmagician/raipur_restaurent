"use client";

import React, { useState } from "react";
import { ArrowLeft, Receipt, CreditCard, CheckCircle, ChevronRight, Download } from "lucide-react";
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
    const roomRequests = checkedInAt ? requests.filter(r =>
        r.room === roomNumber &&
        (r.price || 0) > 0 &&
        r.timestamp >= checkedInAt &&
        r.type !== "Checkout Requested"
    ) : [];
    const unpaidRequests = roomRequests.filter(r => !r.is_paid);
    const totalAmount = roomRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    const amountDue = unpaidRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    
    const taxAmount = amountDue * 0.12; // 12% mock tax
    const grandTotal = amountDue + taxAmount;

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
            notes: `Guest finalized bill: $${grandTotal.toFixed(2)}`,
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
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100/50">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Process Started</h2>
                <p className="text-slate-500 font-medium mb-8">Your checkout request has been sent to the front desk. You can proceed to the lobby.</p>
                <button
                    onClick={() => router.push(`/${hotelSlug}/guest/dashboard`)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
                    style={{ backgroundColor: branding?.primaryColor }}
                >
                    Back to Home
                </button>
            </motion.div>
        );
    }

    return (
        <div className="pb-32">
            <div className="flex items-center justify-between mb-8 no-print">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                </button>
                <h1 className="text-xl font-black text-slate-900">Room Invoice</h1>
                <button
                    onClick={handlePrint}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors no-print"
                >
                    <Download className="w-5 h-5" />
                </button>
            </div>

            <div className="print-area">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1F2937] rounded-[2.5rem] p-8 text-white mb-10 relative overflow-hidden shadow-2xl shadow-slate-200"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Current Spend</p>
                        <h2 className="text-5xl font-black tracking-tighter mb-6 flex items-center justify-center">
                            <span className="text-2xl mr-1 text-slate-400">₹</span>
                            {grandTotal.toLocaleString()}
                        </h2>
                        <div className="flex items-center justify-center space-x-3 pt-6 border-t border-white/5">
                            <div className="flex items-center">
                                <Receipt className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Table {roomNumber}</span>
                            </div>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            {isFullyPaid ? (
                                <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest">Payment Successful</span>
                            ) : (
                                <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">Live Billing</span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2 italic">Real-time Order History</h3>

                <div className="space-y-3 mb-10">
                    {roomRequests.length > 0 ? (
                        roomRequests.map((req, index) => {
                            const itemRating = ratings[req.id];
                            
                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white p-5 rounded-3xl border transition-all duration-500 overflow-hidden ${itemRating ? 'border-green-200 bg-green-50/20' : 'border-slate-50'}`}
                                >
                                    <div className="flex items-center justify-between group mb-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                                <Receipt className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-[13px] flex items-center">
                                                    {req.type}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{req.time}</p>
                                                {req.notes && (
                                                    <p className="text-[9px] text-blue-500 font-bold mt-1.5 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                                                        {req.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-slate-900 text-sm">₹{req.total?.toLocaleString() || "0"}</div>
                                            {req.is_paid && (
                                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">PAID</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Frictionless One-Tap Rating */}
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Rate this?</span>
                                        <div className="flex space-x-2">
                                            {["😞", "😐", "😊", "😋", "🤩"].map((emoji, i) => (
                                                <motion.button
                                                    key={i}
                                                    whileTap={{ scale: 1.4 }}
                                                    onClick={() => handleRate(req.id, i + 1, req.type)}
                                                    className={`text-xl grayscale transition-all duration-300 ${itemRating === i + 1 ? 'grayscale-0 scale-125' : 'hover:grayscale-0 opacity-40 hover:opacity-100'}`}
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
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                            <p className="text-slate-400 font-bold italic text-sm">No billable services yet.</p>
                            <button 
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-widest"
                            >
                                Start Ordering →
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-4 mb-10 border border-slate-100">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Order Subtotal</span>
                        <span className="text-slate-900 text-xs">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">VAT & Taxes (12%)</span>
                        <span className="text-slate-900 text-xs">₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200/50 flex justify-between items-center">
                        <span className="text-[13px] font-black uppercase tracking-widest text-slate-900">{isFullyPaid ? "Total Balance" : "Final Total"}</span>
                        <span className={`text-2xl font-black ${isFullyPaid ? 'text-emerald-500' : 'text-blue-600'}`}>₹{grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={isCheckingOut || grandTotal === 0 || isFullyPaid}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 no-print"
                style={{ backgroundColor: isFullyPaid ? '#10b981' : (branding?.primaryColor || '#1f2937') }}
            >
                {isCheckingOut ? (
                    <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mr-3"><CheckCircle className="w-5 h-5" /></motion.div>
                        Processing...
                    </span>
                ) : isFullyPaid ? (
                    <span className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3" /> Visit Completed
                    </span>
                ) : (
                    <span className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3" /> Request Checkout
                    </span>
                )}
            </button>
        </div>
    );
}
