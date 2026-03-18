"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface FloatingCartBarProps {
    count: number;
    total: number;
    onClick: () => void;
    isVisible: boolean;
}

export function FloatingCartBar({ count, total, onClick, isVisible }: FloatingCartBarProps) {
    return (
        <AnimatePresence>
            {isVisible && count > 0 && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-[100px] left-4 right-4 z-[110]"
                >
                    <button 
                        onClick={onClick}
                        className="w-full h-16 bg-[#C8A96A] rounded-2xl px-4 flex items-center justify-between shadow-[0_15px_30px_rgba(200,169,106,0.3)] active:scale-[0.98] transition-all border border-white/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-white text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-80">{count} Items Added</p>
                                <p className="text-white text-base font-black tracking-tight leading-none">₹{total}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-white font-black text-[9px] uppercase tracking-widest bg-black/10 px-4 py-2.5 rounded-xl">
                            View Cart <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
