"use client";

import React, { useState } from "react";
import { Plus, Bell, Droplets, X, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, addSupabaseRequest } from "@/utils/store";
import { useParams } from "next/navigation";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";
import { Toast } from "./Toast";

export function QuickActionFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirming, setConfirming] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber } = useGuestRoom();

    const actions = [
        { 
            id: "water", 
            label: "Mineral Water", 
            detail: "Bring fresh water to my table",
            icon: Droplets, 
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            type: "Mineral Water",
            notes: "Quick request: Mineral Water"
        },
        { 
            id: "waiter", 
            label: "Call Attendant", 
            detail: "I need assistance from the staff",
            icon: Bell, 
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            type: "Waiter Call",
            notes: "Quick request: Attendant needed"
        }
    ];

    const { branding } = useHotelBranding(hotelSlug);

    const handleAction = async (action: typeof actions[0]) => {
        if (confirming !== action.id) {
            setConfirming(action.id);
            return;
        }

        if (isSubmitting || !branding?.id || !roomNumber) return;
        
        setIsSubmitting(action.id);
        
        try {
            const { error } = await addSupabaseRequest(branding.id, {
                room: roomNumber,
                type: action.type,
                notes: action.notes,
                status: "Pending"
            });

            if (error) throw error;

            setToast({ message: `${action.label} Requested!`, type: "success", isVisible: true });
            setIsOpen(false);
            setConfirming(null);
        } catch (error) {
            setToast({ message: "Request failed. Try again.", type: "error", isVisible: true });
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <>
            <div className="fixed bottom-32 right-6 z-[110] flex flex-col items-end w-[calc(100%-3rem)] max-w-[320px] pointer-events-none">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="flex flex-col items-end space-y-4 mb-6 w-full pointer-events-auto"
                        >
                            {actions.map((action, index) => (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ 
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25
                                    }}
                                    className="w-full"
                                >
                                    <button
                                        onClick={() => handleAction(action)}
                                        className={`w-full p-4 rounded-3xl backdrop-blur-2xl border flex items-center justify-between group transition-all duration-500 shadow-2xl ${
                                            confirming === action.id 
                                                ? 'bg-slate-900 border-slate-800' 
                                                : 'bg-white/80 border-white/50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 ${
                                                confirming === action.id ? 'bg-white/10 scale-90' : action.bg
                                            }`}>
                                                <action.icon className={`w-6 h-6 ${confirming === action.id ? 'text-white' : action.color}`} />
                                            </div>
                                            <div className="text-left">
                                                <AnimatePresence mode="wait">
                                                    {confirming === action.id ? (
                                                        <motion.div
                                                            key="confirm"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex flex-col"
                                                        >
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F55D2C]">Tap again to call</span>
                                                            <span className="text-sm font-black text-white">Confirm?</span>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="label"
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex flex-col"
                                                        >
                                                            <span className="text-sm font-black text-slate-900 leading-none">{action.label}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{action.detail}</span>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            confirming === action.id ? 'bg-[#F55D2C] text-white shadow-[0_0_15px_rgba(245,93,44,0.4)]' : 'bg-slate-50 text-slate-300'
                                        }`}>
                                            {isSubmitting === action.id ? (
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </motion.div>
                                            ) : (
                                                <ChevronRight className={`w-4 h-4 ${confirming === action.id ? 'animate-pulse' : ''}`} />
                                            )}
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setConfirming(null);
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden relative ${
                        isOpen 
                            ? 'bg-slate-900 border-slate-800' 
                            : 'bg-[#F55D2C] border-[#F55D2C] shadow-[#F55D2C]/30'
                    } border-4 text-white hover:scale-105 active:scale-95 pointer-events-auto`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <X className="w-8 h-8" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="plus"
                                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                <Zap className="w-8 h-8 fill-current" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Subtle pulse animation when closed */}
                    {!isOpen && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-white rounded-full"
                        />
                    )}
                </motion.button>
            </div>

            {/* Backdrop when open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setIsOpen(false);
                            setConfirming(null);
                        }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[4px] z-[105]"
                    />
                )}
            </AnimatePresence>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </>
    );
}
