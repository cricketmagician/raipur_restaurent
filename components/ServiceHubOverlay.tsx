"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, UtensilsCrossed, ChevronRight, ShoppingBag } from "lucide-react";
import { addSupabaseRequest } from "@/utils/store";

interface ServiceHubOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    branding: any;
    tableNumber: string | null;
    cartCount: number;
    onShowBag: () => void;
    setToast: (toast: { message: string; type: "success" | "error"; isVisible: boolean }) => void;
}

export function ServiceHubOverlay({ 
    isOpen, 
    onClose, 
    branding, 
    tableNumber, 
    cartCount, 
    onShowBag,
    setToast 
}: ServiceHubOverlayProps) {
    const [serviceAction, setServiceAction] = useState<'water' | 'waiter' | null>(null);

    const handleAction = async (type: string) => {
        if (!branding?.id) return;
        
        try {
            await addSupabaseRequest(branding.id, {
                room: tableNumber || "N/A",
                type: type,
                status: 'Pending',
                notes: `Requested via Universal Service Hub`
            });
            setToast({ message: `${type} requested!`, type: 'success', isVisible: true });
            onClose();
            setServiceAction(null);
        } catch (error) {
            setToast({ message: "Failed to request service", type: 'error', isVisible: true });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10"
                >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-[#F5F1E8] rounded-t-[3rem] shadow-2xl overflow-hidden p-8 space-y-8 border-t border-white"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A] mb-1">Guest Assistance</p>
                                    <h3 className="text-2xl font-black italic tracking-tighter text-[#0F3D2E]">Service Hub</h3>
                                </div>
                                <button onClick={() => onClose()} className="p-3 bg-[#0F3D2E]/5 rounded-full text-[#0F3D2E]"><X className="w-5 h-5" /></button>
                            </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setServiceAction('water')}
                                className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${serviceAction === 'water' ? 'bg-[#0F3D2E] border-[#0F3D2E] text-white' : 'bg-white border-[#0F3D2E]/5 text-[#0F3D2E] hover:bg-[#0F3D2E]/5 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${serviceAction === 'water' ? 'bg-white/20' : 'bg-white/10'}`}>
                                        <Droplets className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black italic tracking-tighter">Order Mineral Water</h4>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${serviceAction === 'water' ? 'text-white/80' : 'text-white/40'}`}>Stay Hydrated • ₹45</p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${serviceAction === 'water' ? 'rotate-90' : ''}`} />
                            </button>

                            <button 
                                onClick={() => setServiceAction('waiter')}
                                className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${serviceAction === 'waiter' ? 'bg-[#0F3D2E] border-[#0F3D2E] text-white' : 'bg-white border-[#0F3D2E]/5 text-[#0F3D2E] hover:bg-[#0F3D2E]/5 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${serviceAction === 'waiter' ? 'bg-white/20' : 'bg-white/10'}`}>
                                        <UtensilsCrossed className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black italic tracking-tighter">Call Service Waiter</h4>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${serviceAction === 'waiter' ? 'text-white/80' : 'text-white/40'}`}>For help or payment</p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${serviceAction === 'waiter' ? 'rotate-90' : ''}`} />
                            </button>

                            <button 
                                onClick={() => { onClose(); onShowBag(); }}
                                className="p-6 bg-[#C8A96A] rounded-[2rem] text-white flex items-center justify-between group shadow-xl active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-2xl">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black italic tracking-tighter">View Your Bag</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{cartCount} items • Processed Now</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1" />
                            </button>
                        </div>

                        {/* Friction Confirmation Section */}
                        <AnimatePresence>
                            {serviceAction && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-6 border-t border-slate-100"
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 text-center">Slide to Confirm Service</p>
                                    <div className="relative h-16 bg-[#0F3D2E]/5 rounded-full p-1 border border-[#0F3D2E]/10 overflow-hidden text-[#0F3D2E]">
                                        <motion.div 
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 300 }}
                                            onDragEnd={async (_, info) => {
                                                if (info.offset.x > 200) {
                                                    const type = serviceAction === 'water' ? 'Mineral Water' : 'Waiter Call';
                                                    await handleAction(type);
                                                }
                                            }}
                                            className="absolute left-1 top-1 bottom-1 aspect-square bg-[#C8A96A] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-white shadow-lg"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </motion.div>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Confirm {serviceAction}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
