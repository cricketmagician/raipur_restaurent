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
                    className="fixed bottom-[85px] left-0 right-0 z-[110] px-4"
                >
                    <button 
                        onClick={onClick}
                        className="w-full bg-[#C8A96A] rounded-[2rem] p-4 flex items-center justify-between shadow-[0_20px_40px_rgba(200,169,106,0.4)] active:scale-[0.98] transition-all border border-white/20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest leading-none mb-1">{count} Items Added</p>
                                <p className="text-white text-lg font-black tracking-tight leading-none">₹{total}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-black/10 px-6 py-3 rounded-full">
                            View Cart <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
