"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";
import { getDirectImageUrl } from "@/utils/image";

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
                        className="fixed inset-0 backdrop-blur-xl z-[180]"
                        style={{ backgroundColor: "rgba(22, 16, 12, 0.68)" }}
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0.9 }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%", opacity: 0.9 }}
                        transition={{ type: "spring", damping: 28, stiffness: 260 }}
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[520px] max-h-[calc(100dvh-2rem)] overflow-hidden bg-white z-[190] shadow-[0_30px_120px_-30px_rgba(0,0,0,0.55)] border"
                        style={{ 
                            borderRadius: `calc(${theme.radius} * 1.1)`,
                            borderColor: `${theme.primary}18`
                        }}
                    >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 top-0 h-28 opacity-60 pointer-events-none" style={{ background: `linear-gradient(180deg, ${theme.primary}14, transparent)` }} />

                        <div className="p-5 sm:p-6 pb-5 overflow-y-auto max-h-[calc(100dvh-2rem)]">
                            <div className="flex items-center justify-between mb-5">
                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/[0.03] border border-black/[0.04]">
                                    <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: theme.primary }}>
                                        Handcrafted Suggestion
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-11 h-11 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-md border border-black/5"
                                    style={{ color: theme.primary }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-5">
                                <h3 className="text-[clamp(1.75rem,4vw,2.6rem)] leading-[0.95] font-black tracking-tight" style={{ color: theme.primary }}>
                                    Add a little extra?
                                </h3>
                                <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                                    This pair works well with what you just picked. One tap adds it to your bag.
                                </p>
                            </div>

                            <div className="rounded-[2rem] overflow-hidden border shadow-sm mb-5" style={{ borderColor: `${theme.primary}14` }}>
                                <div className="relative aspect-[16/10] bg-slate-100">
                                    <img
                                        src={getDirectImageUrl(item.image_url)}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                                    <div className="absolute left-4 bottom-4 right-4 flex items-end justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/80">Suggested add-on</p>
                                            <h4 className="text-2xl font-black text-white truncate">{item.title}</h4>
                                        </div>
                                        <div className="shrink-0 px-4 py-2 rounded-full bg-white text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
                                            ₹{item.price.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="rounded-[1.5rem] p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">Why it fits</p>
                                    <p className="text-sm font-semibold leading-relaxed text-slate-700">
                                        Adds balance and keeps the order feeling complete.
                                    </p>
                                </div>
                                <div className="rounded-[1.5rem] p-4 bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">Tap to add</p>
                                    <p className="text-sm font-semibold leading-relaxed text-slate-700">
                                        It will appear instantly in your cart.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-[1.25rem] border border-slate-200 bg-white text-slate-500 font-black text-[10px] uppercase tracking-[0.28em]"
                                >
                                    Not now
                                </button>
                                <button
                                    onClick={onAdd}
                                    className="flex-[1.4] py-4 rounded-[1.25rem] text-white font-black text-[10px] uppercase tracking-[0.28em] shadow-lg active:scale-[0.98] transition-all"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    Add to Bag
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
