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
                        className="fixed inset-0 bg-[#1E3932]/40 backdrop-blur-[4px] z-[100]"
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250 }}
                        className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white rounded-t-[3rem] z-[101] p-10 pb-16 shadow-[0_-20px_80px_rgba(0,33,30,0.2)] border-t border-[#00704A]/5"
                    >
                        {/* Dismiss Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 w-10 h-10 bg-[#F2F0EB] rounded-full flex items-center justify-center text-[#00704A] active:scale-90 transition-all shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Handle */}
                        <div className="w-12 h-1.5 bg-[#D4E9E2] rounded-full mx-auto mb-10" />

                        <div className="text-center mb-10">
                            <p className="text-[#00704A] text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 mr-2" /> Handcrafted Suggestion
                            </p>
                            <h3 className="text-3xl font-black text-[#1E3932] tracking-tighter">Add a little extra?</h3>
                        </div>

                        <div className="bg-[#F2F0EB] rounded-[2.5rem] p-6 flex items-center mb-10 border border-[#00704A]/5 shadow-sm">
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-5 shadow-xl shrink-0 border-2 border-white">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 mr-4 text-left">
                                <h4 className="text-lg font-black text-[#1E3932] truncate">{item.title}</h4>
                                <p className="text-[#00704A] text-[10px] font-black uppercase tracking-widest mt-1">₹{item.price.toFixed(0)}</p>
                            </div>
                            <button
                                onClick={onAdd}
                                className="bg-[#00704A] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#00704A]/20"
                            >
                                Add
                            </button>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full py-2 text-[#00704A]/60 font-black uppercase tracking-[0.2em] text-[10px] hover:text-[#00704A] transition-colors"
                        >
                            No thanks, I'm good
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
