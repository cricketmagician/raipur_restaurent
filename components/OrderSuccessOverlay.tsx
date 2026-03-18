"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface OrderSuccessOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

export function OrderSuccessOverlay({ isVisible, onClose }: OrderSuccessOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F3D2E] px-8"
                >
                    <motion.div 
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="text-center space-y-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-[#C8A96A] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(200,169,106,0.3)]">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black italic text-white tracking-tighter">Handcrafted with Love.</h1>
                            <p className="text-[#C8A96A] text-sm font-black uppercase tracking-[0.3em]">Order Placed Successfully</p>
                        </div>
                        <p className="text-white/40 text-xs italic font-medium leading-relaxed">
                            "Your journey of flavors begins now. Sit back and enjoy the anticipation."
                        </p>
                        <button 
                            onClick={onClose} 
                            className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] pt-8 active:scale-95 transition-all"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
