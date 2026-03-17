"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Clock3, LogOut, PencilLine, Sparkles, User, Utensils, Truck, CircleDollarSign, RefreshCw } from "lucide-react";
import { useHotelBranding, useGuestLoyalty, useCart, saveGuestLoyaltySession } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { useTheme } from "@/utils/themes";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { getDirectImageUrl } from "@/utils/image";

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
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
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
        if (!profile?.phone) return "Sync once for takeaway and repeat visits.";
        return `Saved for ${profile.name}`;
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
            className="min-h-screen pb-28 pt-5 w-full max-w-[460px] mx-auto overflow-x-hidden px-3.5 relative"
            style={{ backgroundColor: theme.background, color: theme.text, fontFamily: theme.fontSans }}
        >
            <div className="absolute inset-0 -z-20 pointer-events-none">
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.background} 0%, ${theme.surface} 100%)` }} />
                {branding.heroImage ? (
                    <img
                        src={getDirectImageUrl(branding.heroImage)}
                        alt={branding.name}
                        className="absolute inset-x-0 top-0 h-[320px] w-full object-cover opacity-20 blur-[2px] scale-105"
                    />
                ) : null}
                <div className="absolute -top-10 right-0 h-56 w-56 rounded-full blur-[100px]" style={{ backgroundColor: `${theme.secondary}88` }} />
                <div className="absolute top-40 -left-10 h-44 w-44 rounded-full blur-[100px]" style={{ backgroundColor: `${theme.primary}22` }} />
            </div>

            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-full flex items-center justify-center border shadow-[0_10px_30px_-16px_rgba(0,0,0,0.28)] active:scale-95 transition-all backdrop-blur-xl"
                    style={{ color: theme.primary, backgroundColor: "rgba(255,255,255,0.64)", borderColor: "rgba(255,255,255,0.58)" }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.34em] opacity-40">My Identity</p>
                    <h1 className="text-lg font-black tracking-tight mt-1" style={{ color: theme.primary }}>
                        Guest Card
                    </h1>
                </div>
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center border shadow-[0_10px_30px_-16px_rgba(0,0,0,0.28)] active:scale-95 transition-all backdrop-blur-xl"
                    style={{ color: theme.primary, backgroundColor: "rgba(255,255,255,0.64)", borderColor: "rgba(255,255,255,0.58)" }}
                >
                    <PencilLine className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3.5">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.35rem] p-5 border overflow-hidden relative shadow-[0_30px_90px_-34px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.18) 100%)",
                        borderColor: "rgba(255,255,255,0.42)",
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none opacity-70" style={{ background: `radial-gradient(circle at top right, ${theme.secondary}66, transparent 48%)` }} />
                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-lg shrink-0" style={{ backgroundColor: `${theme.primary}16`, color: theme.primary }}>
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border mb-3 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.42)", borderColor: "rgba(255,255,255,0.42)" }}>
                                        <BadgeCheck className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: theme.primary }}>
                                            {profile ? "Synced" : "Guest mode"}
                                        </span>
                                    </div>
                                    <h2 className="text-[clamp(1.45rem,6vw,2.15rem)] font-black tracking-tight leading-none line-clamp-2" style={{ color: theme.primary }}>
                                        {profile?.name || "Guest"}
                                    </h2>
                                    <p className="mt-1.5 text-sm font-semibold opacity-65 truncate">
                                        {profile?.phone || "Phone not linked yet"}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[1.35rem] px-4 py-3 border backdrop-blur-md self-start sm:self-auto" style={{ backgroundColor: "rgba(255,255,255,0.34)", borderColor: "rgba(255,255,255,0.38)" }}>
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] opacity-35 mb-1">Rewards</p>
                                <p className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
                                    {points}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <MiniStat
                                label="Mode"
                                value={orderMode === "takeaway" ? "Takeaway" : (roomNumber || "Dine-In")}
                                theme={theme}
                                icon={<Utensils className="w-4 h-4" />}
                            />
                            <MiniStat
                                label="Bag"
                                value={`${cartCount} items`}
                                theme={theme}
                                icon={<CircleDollarSign className="w-4 h-4" />}
                            />
                            <MiniStat
                                label="Last Visit"
                                value={formatDateTime(visits)}
                                theme={theme}
                                icon={<Clock3 className="w-4 h-4" />}
                            />
                            <MiniStat
                                label="Last Order"
                                value={lastOrder ? `${formatDateTime(lastOrder)}${lastMode ? ` • ${lastMode}` : ""}` : "Not yet"}
                                theme={theme}
                                icon={<Truck className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="rounded-[2rem] p-[18px] border shadow-[0_24px_70px_-28px_rgba(0,0,0,0.2)] backdrop-blur-2xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.22) 100%)",
                        borderColor: "rgba(255,255,255,0.42)",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-35">Order Mode</p>
                            <h3 className="text-base font-black mt-1" style={{ color: theme.primary }}>
                                {loginHint}
                            </h3>
                        </div>
                        <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={switchToDineIn}
                            className={`py-4 rounded-[1.4rem] font-black text-[10px] uppercase tracking-[0.28em] border transition-all ${orderMode === "dine-in" ? "text-slate-900 shadow-sm" : "text-slate-400"}`}
                            style={{
                                backgroundColor: orderMode === "dine-in" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.18)",
                                borderColor: orderMode === "dine-in" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.36)",
                            }}
                        >
                            Dine-In
                        </button>
                        <button
                            onClick={switchToTakeaway}
                            className={`py-4 rounded-[1.4rem] font-black text-[10px] uppercase tracking-[0.28em] border transition-all ${orderMode === "takeaway" ? "text-slate-900 shadow-sm" : "text-slate-400"}`}
                            style={{
                                backgroundColor: orderMode === "takeaway" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.18)",
                                borderColor: orderMode === "takeaway" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.36)",
                            }}
                        >
                            Takeaway
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <button
                        onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                        className="py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.28em] active:scale-95 transition-all border shadow-[0_18px_50px_-24px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                        style={{ color: theme.primary, backgroundColor: "rgba(255,255,255,0.56)", borderColor: "rgba(255,255,255,0.48)" }}
                    >
                        Open Menu
                    </button>
                    <button
                        onClick={handleLogout}
                        className="py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.28em] active:scale-95 transition-all border shadow-[0_18px_50px_-24px_rgba(0,0,0,0.18)] backdrop-blur-xl text-rose-600 flex items-center justify-center gap-2"
                        style={{ backgroundColor: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.48)" }}
                    >
                        <LogOut className="w-4 h-4" />
                        Clear
                    </button>
                </motion.div>
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

function MiniStat({
    label,
    value,
    icon,
    theme,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    theme: any;
}) {
    return (
        <div
            className="rounded-[1.35rem] p-3.5 border backdrop-blur-xl min-h-[102px]"
            style={{
                backgroundColor: "rgba(255,255,255,0.34)",
                borderColor: "rgba(255,255,255,0.4)",
            }}
        >
            <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-[0.9rem] flex items-center justify-center" style={{ backgroundColor: `${theme.primary}14`, color: theme.primary }}>
                    {icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.25em] opacity-30">{label}</span>
            </div>
            <p className="text-[13px] font-black tracking-tight leading-snug" style={{ color: theme.primary }}>
                {value}
            </p>
        </div>
    );
}
