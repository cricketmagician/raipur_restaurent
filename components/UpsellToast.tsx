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
                    <div className="bg-white rounded-[2rem] p-5 pr-8 flex items-center shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] border border-slate-50 relative overflow-hidden group">
                        <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden mr-5 shrink-0 shadow-sm border border-slate-50">
                            {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-[#8B0000]/20" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0 mr-4">
                            <p className="text-[#8B0000] text-[10px] font-bold uppercase tracking-[0.25em] mb-1.5 flex items-center">
                                <Sparkles className="w-3 h-3 mr-2" /> Pairs Beautifully
                            </p>
                            <h4 className="text-slate-900 font-serif text-xl leading-tight truncate italic">{item.title}</h4>
                            <p className="text-slate-400 text-xs font-medium italic mt-1">₹{item.price.toFixed(0)}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={onAdd}
                                className="bg-slate-900 text-[#FAF7F2] px-6 py-3.5 rounded-xl font-serif italic text-sm active:scale-95 transition-all shadow-lg shadow-slate-200"
                            >
                                Add
                            </button>
                            <button
                                onClick={onClose}
                                className="text-slate-300 p-2 hover:text-slate-900 transition-colors"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
