"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";

interface ImpulseBottomSheetProps {
    item: {
        id: string;
        title: string;
        price: number;
        image_url?: string;
    } | null;
    isVisible: boolean;
    onAdd: () => void;
    onClose: () => void;
}

export function ImpulseBottomSheet({ item, isVisible, onAdd, onClose }: ImpulseBottomSheetProps) {
    return (
        <AnimatePresence>
            {isVisible && item && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white rounded-t-[3rem] z-[101] p-10 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                    >
                        {/* Handle */}
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />

                        <div className="text-center mb-8">
                            <p className="text-[#F59E0B] text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 mr-2" /> Make it better?
                            </p>
                            <h3 className="text-3xl font-serif italic text-[#3E2723]">Add a little extra vibe?</h3>
                        </div>

                        <div className="bg-[#FFF8F2] rounded-[2rem] p-6 flex items-center mb-8 border border-[#3E2723]/5">
                            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mr-5 shadow-lg shrink-0">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 mr-4 text-left">
                                <h4 className="text-xl font-serif italic text-[#3E2723] truncate">{item.title}</h4>
                                <p className="text-slate-400 text-xs font-medium italic mt-1">₹{item.price.toFixed(0)}</p>
                            </div>
                            <button
                                onClick={onAdd}
                                className="bg-[#3E2723] text-white px-8 py-4 rounded-2xl font-serif italic text-sm active:scale-95 transition-all shadow-xl shadow-[#3E2723]/10"
                            >
                                Add
                            </button>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-[#3E2723] transition-colors"
                        >
                            No thanks, I'm good
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
