"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Clock3, LogOut, PencilLine, Phone, Sparkles, User, Utensils, Truck, CircleDollarSign, RefreshCw } from "lucide-react";
import { useHotelBranding, useGuestLoyalty, useCart, saveGuestLoyaltySession } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { useTheme } from "@/utils/themes";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";

type GuestProfile = {
    phone: string;
    name: string;
    lastVisitAt?: string | null;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "Not yet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not yet";
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function GuestProfilePage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const { roomNumber, orderMode, switchToDineIn, switchToTakeaway } = useGuestRoom();
    const { cartCount } = useCart(branding?.id);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [profile, setProfile] = useState<GuestProfile | null>(() => {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        return stored ? JSON.parse(stored) : null;
    });

    const { loyalty } = useGuestLoyalty(branding?.id, profile?.phone || null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        setProfile(stored ? JSON.parse(stored) : null);
    }, [hotelSlug]);

    const points = loyalty?.points || 0;
    const visits = loyalty?.last_visit_at || profile?.lastVisitAt || null;
    const lastOrder = loyalty?.last_order_at || null;
    const lastMode = loyalty?.last_order_mode || null;

    const loginHint = useMemo(() => {
        if (!profile?.phone) return "Sign in with your phone to sync identity across visits.";
        return `Synced for ${profile.name}`;
    }, [profile]);

    const handleSignIn = async (phone: string, name: string) => {
        const nextProfile = { phone, name, lastVisitAt: new Date().toISOString() };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(nextProfile));
        setProfile(nextProfile);

        if (branding?.id) {
            await saveGuestLoyaltySession(branding.id, phone, name, { lastVisitAt: nextProfile.lastVisitAt });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(`guest_loyalty_${hotelSlug}`);
        setProfile(null);
    };

    if (!branding) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
                <div className="text-center">
                    <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 opacity-30" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] opacity-40">Loading identity</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-32 pt-10 w-full max-w-[560px] mx-auto overflow-x-hidden"
            style={{ backgroundColor: theme.background, color: theme.text, fontFamily: theme.fontSans }}
        >
            <div className="flex items-center justify-between mb-8 px-4">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-black/5 shadow-sm active:scale-95 transition-all"
                    style={{ color: theme.primary }}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">My Identity</p>
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
                        Guest Profile
                    </h1>
                </div>
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-black/5 shadow-sm active:scale-95 transition-all"
                    style={{ color: theme.primary }}
                >
                    <PencilLine className="w-5 h-5" />
                </button>
            </div>

            <div className="px-4 space-y-5">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] p-6 shadow-[0_20px_70px_-24px_rgba(0,0,0,0.22)] border overflow-hidden relative"
                    style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}12` }}
                >
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${theme.secondary}55, transparent 55%)` }} />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${theme.primary}12`, color: theme.primary }}>
                                <User className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Logged In Guest</p>
                                <h2 className="text-2xl font-black tracking-tight mt-1" style={{ color: theme.primary }}>
                                    {profile?.name || "Guest Guest"}
                                </h2>
                                <p className="text-sm font-medium opacity-60 mt-1">{profile?.phone || "No phone linked yet"}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black/[0.03] border border-black/[0.04] mb-3">
                                <BadgeCheck className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    {profile ? "Synced" : "Not linked"}
                                </span>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{loginHint}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Room" value={roomNumber || "Takeaway"} subtitle={orderMode === "takeaway" ? "Takeaway mode" : "Dine-in mode"} theme={theme} icon={<Utensils className="w-5 h-5" />} />
                    <StatCard title="Cart" value={`${cartCount}`} subtitle="Items in bag" theme={theme} icon={<CircleDollarSign className="w-5 h-5" />} />
                    <StatCard title="Last Visit" value={formatDateTime(visits)} subtitle="Last time we saw you" theme={theme} icon={<Clock3 className="w-5 h-5" />} />
                    <StatCard title="Last Order" value={formatDateTime(lastOrder)} subtitle={lastMode ? `Last order: ${lastMode}` : "No order yet"} theme={theme} icon={<Truck className="w-5 h-5" />} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-[2.5rem] p-6 border shadow-[0_20px_70px_-24px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}12` }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Guest Mode</p>
                            <h3 className="text-xl font-black mt-1" style={{ color: theme.primary }}>
                                Switch seating mode
                            </h3>
                        </div>
                        <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={switchToDineIn}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] border transition-all ${orderMode === "dine-in" ? "bg-white text-slate-900 border-slate-200 shadow-sm" : "bg-transparent text-slate-400 border-slate-200"}`}
                        >
                            Dine-In
                        </button>
                        <button
                            onClick={switchToTakeaway}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] border transition-all ${orderMode === "takeaway" ? "bg-white text-slate-900 border-slate-200 shadow-sm" : "bg-transparent text-slate-400 border-slate-200"}`}
                        >
                            Takeaway
                        </button>
                    </div>

                    <p className="text-[10px] font-medium opacity-50 mt-4 leading-relaxed">
                        Takeaway orders will ask you to sign in if your guest identity is not saved yet.
                    </p>
                </motion.div>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                        className="flex-1 py-4 rounded-2xl bg-white border border-black/5 shadow-sm font-black text-[10px] uppercase tracking-[0.25em] active:scale-95 transition-all"
                        style={{ color: theme.primary }}
                    >
                        Open Menu
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 py-4 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm font-black text-[10px] uppercase tracking-[0.25em] active:scale-95 transition-all text-rose-600 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Clear Identity
                    </button>
                </div>
            </div>

            <LoyaltySignIn
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSignIn={handleSignIn}
                guestName={profile?.name || ""}
                guestPhone={profile?.phone || ""}
                lastVisitAt={loyalty?.last_visit_at || profile?.lastVisitAt || null}
            />
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    theme,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    theme: any;
}) {
    return (
        <div className="rounded-[2rem] p-4 border shadow-sm bg-white/80 backdrop-blur-sm" style={{ borderColor: `${theme.primary}10` }}>
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.primary}12`, color: theme.primary }}>
                    {icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.25em] opacity-30">{title}</span>
            </div>
            <div>
                <p className="text-lg font-black tracking-tight leading-tight" style={{ color: theme.primary }}>
                    {value}
                </p>
                <p className="text-[10px] font-medium opacity-50 mt-1">{subtitle}</p>
            </div>
        </div>
    );
}
