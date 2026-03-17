"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, User, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

interface LoyaltySignInProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: (phone: string, name: string) => void;
    lastVisitAt?: string | null;
    guestName?: string | null;
    guestPhone?: string | null;
}

const formatLastVisit = (value?: string | null) => {
    if (!value) return "No previous visits yet";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No previous visits yet";

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export function LoyaltySignIn({ isOpen, onClose, onSignIn, lastVisitAt, guestName, guestPhone }: LoyaltySignInProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);

    const [phone, setPhone] = useState(guestPhone || "");
    const [name, setName] = useState(guestName || "");
    const [step, setStep] = useState(1);

    React.useEffect(() => {
        if (!isOpen) return;
        setPhone(guestPhone || "");
        setName(guestName || "");
        setStep(guestPhone ? 2 : 1);
    }, [isOpen, guestPhone, guestName]);

    const handleContinue = () => {
        if (step === 1 && phone.length >= 10) {
            setStep(2);
        } else if (step === 2 && name.length > 2) {
            onSignIn(phone, name);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 backdrop-blur-xl z-[200]"
                        style={{ backgroundColor: `${theme.primary}44` }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-[calc(100%-48px)] max-w-[400px] h-fit bg-white z-[201] p-10 shadow-2xl border transition-all"
                        style={{ 
                            borderRadius: theme.radius,
                            backgroundColor: theme.surface,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all border"
                            style={{ backgroundColor: `${theme.primary}0a`, borderColor: `${theme.primary}10`, color: theme.primary }}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10">
                            <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl relative overflow-hidden" 
                                 style={{ backgroundColor: theme.primary }}>
                                <Sparkles className="w-10 h-10 text-white relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter mb-2" style={{ color: theme.primary }}>
                                {step === 1 ? "Experience the Vibe" : "Almost there!"}
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ color: theme.text }}>
                                {step === 1 ? "Enter phone to track rewards" : "Give your vibe a name"}
                            </p>
                            {lastVisitAt && (
                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/[0.03] border border-black/[0.04]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
                                        Last Visit
                                    </span>
                                    <span className="text-[10px] font-bold" style={{ color: theme.text }}>
                                        {formatLastVisit(lastVisitAt)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {step === 1 ? (
                                <div className="relative group">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-40" style={{ color: theme.primary }} />
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full border rounded-2xl py-6 pl-16 pr-6 focus:outline-none focus:ring-2 transition-all font-bold text-lg"
                                        style={{ 
                                            backgroundColor: `${theme.primary}05`,
                                            borderColor: `${theme.primary}10`,
                                            color: theme.text
                                        }}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative group"
                                >
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-40" style={{ color: theme.primary }} />
                                    <input
                                        type="text"
                                        placeholder="Your Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border rounded-2xl py-6 pl-16 pr-6 focus:outline-none focus:ring-2 transition-all font-bold text-lg"
                                        style={{ 
                                            backgroundColor: `${theme.primary}05`,
                                            borderColor: `${theme.primary}10`,
                                            color: theme.text
                                        }}
                                        autoFocus
                                    />
                                </motion.div>
                            )}

                            <button
                                onClick={handleContinue}
                                disabled={(step === 1 && phone.length < 10) || (step === 2 && name.length < 3)}
                                className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all text-white flex items-center justify-center space-x-3 disabled:opacity-40"
                                style={{ backgroundColor: theme.primary }}
                            >
                                <span>{step === 1 ? "Get Started" : "Enter the Lounge"}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            
                            <p className="text-[10px] text-center opacity-30 font-bold px-4 leading-relaxed" style={{ color: theme.text }}>
                                By continuing, you agree to receive digital invoices and rewards updates on this number.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
