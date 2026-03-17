"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
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
                        className="fixed inset-0 backdrop-blur-[4px] z-[100]"
                        style={{ backgroundColor: `${theme.primary}66` }}
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250 }}
                        className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white z-[101] p-10 pb-16 shadow-2xl border-t"
                        style={{ 
                            borderRadius: `${theme.radius} ${theme.radius} 0 0`,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        {/* Dismiss Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-sm border border-black/5"
                            style={{ color: theme.primary }}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Handle */}
                        <div className="w-12 h-1.5 opacity-10 rounded-full mx-auto mb-10" style={{ backgroundColor: theme.primary }} />

                        <div className="text-center mb-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center justify-center" style={{ color: theme.primary }}>
                                <Sparkles className="w-4 h-4 mr-2" /> Handcrafted Suggestion
                            </p>
                            <h3 className="text-3xl font-black tracking-tighter" style={{ color: theme.primary }}>Add a little extra?</h3>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-6 flex items-center mb-10 border shadow-sm" style={{ borderColor: `${theme.primary}10`, borderRadius: theme.radius }}>
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-5 shadow-xl shrink-0 border-2 border-white">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 mr-4 text-left">
                                <h4 className="text-lg font-black truncate" style={{ color: theme.primary }}>{item.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: theme.accent }}>₹{item.price.toFixed(0)}</p>
                            </div>
                            <button
                                onClick={onAdd}
                                className="text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                                style={{ backgroundColor: theme.primary }}
                            >
                                Add
                            </button>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-full py-2 font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
                            style={{ color: `${theme.primary}CC` }}
                        >
                            No thanks, I'm good
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
