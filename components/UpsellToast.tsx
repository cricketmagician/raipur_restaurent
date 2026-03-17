"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

interface UpsellToastProps {
    item: {
        id: string;
        title: string;
        price: number;
        image?: string;
    } | null;
    isVisible: boolean;
    onAdd: () => void;
    onClose: () => void;
}

export function UpsellToast({ item, isVisible, onAdd, onClose }: UpsellToastProps) {
    return (
        <AnimatePresence>
            {isVisible && item && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    className="fixed bottom-32 left-6 right-6 z-[60]"
                >
                    <div className="bg-slate-900 rounded-[2rem] p-4 pr-6 flex items-center shadow-2xl shadow-black/40 border border-white/10">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 shrink-0 border border-white/5">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0 mr-4">
                            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-1 flex items-center">
                                <Sparkles className="w-3 h-3 mr-1" /> Pairs Beautifully
                            </p>
                            <h4 className="text-white font-serif text-lg leading-tight truncate">{item.title}</h4>
                            <p className="text-slate-400 text-xs font-medium">Add to experience · ₹{item.price.toFixed(0)}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={onAdd}
                                className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                            >
                                Add
                            </button>
                            <button
                                onClick={onClose}
                                className="text-slate-500 p-2 hover:text-white transition-colors"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
