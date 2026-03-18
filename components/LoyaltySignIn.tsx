"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Phone, UserRound, X } from "lucide-react";

interface LoyaltySignInProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: (phone: string, name: string) => void | Promise<void>;
    guestName?: string;
    guestPhone?: string;
    lastVisitAt?: string | null;
}

const formatLastVisit = (value?: string | null) => {
    if (!value) return "First visit";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "First visit";

    return date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
};

export function LoyaltySignIn({
    isOpen,
    onClose,
    onSignIn,
    guestName = "",
    guestPhone = "",
    lastVisitAt,
}: LoyaltySignInProps) {
    const [name, setName] = React.useState(guestName);
    const [phone, setPhone] = React.useState(guestPhone);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        setName(guestName);
        setPhone(guestPhone);
    }, [guestName, guestPhone, isOpen]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedPhone || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSignIn(trimmedPhone, trimmedName);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[140] flex items-end justify-center p-3 sm:items-center sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white/96 p-5 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)]"
                    >
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-2">
                                    Guest Sign In
                                </p>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                    Save your details once
                                </h2>
                                <p className="text-sm font-medium text-slate-500 mt-2 max-w-[26ch]">
                                    Required for takeaway checkout and smoother repeat orders.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-11 h-11 shrink-0 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 mb-5">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">
                                <Clock3 className="w-3.5 h-3.5" />
                                Last Visit
                            </div>
                            <p className="text-sm font-bold text-slate-700">{formatLastVisit(lastVisitAt)}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                                    Your Name
                                </span>
                                <div className="relative">
                                    <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Rohan"
                                        className="w-full rounded-[1.3rem] border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-slate-900"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">
                                    Phone Number
                                </span>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="9876543210"
                                        inputMode="tel"
                                        className="w-full rounded-[1.3rem] border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-slate-900"
                                    />
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={isSubmitting || !name.trim() || !phone.trim()}
                                className="w-full rounded-full bg-slate-900 text-white py-4 text-[10px] font-black uppercase tracking-[0.24em] disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : "Continue"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
