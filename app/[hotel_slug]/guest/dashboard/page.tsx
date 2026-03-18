"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    ClipboardList,
    Flame,
    PlayCircle,
    Receipt,
    RefreshCw,
    ShoppingBag,
    Sparkles,
    UserRound,
} from "lucide-react";
import { CartOverlay } from "@/components/CartOverlay";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { SeasonalStories } from "@/components/SeasonalStories";
import { ChefPicksSnapRail } from "@/components/ChefPicksSnapRail";
import { EatByMoodSection } from "@/components/EatByMoodSection";
import { Toast } from "@/components/Toast";
import {
    addLoyaltyPoints,
    addSupabaseRequest,
    getRoomAccessState,
    saveGuestLoyaltySession,
    useHeroes,
    useCart,
    useGuestLoyalty,
    useHotelBranding,
    useMoods,
    useSeasonalStories,
    useSupabaseMenuItems,
    useSupabaseRequests,
} from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { useTheme } from "@/utils/themes";
import { getDirectImageUrl } from "@/utils/image";
import { DISCOVERY_MOODS } from "@/utils/guestDiscovery";

type LoyaltyProfile = {
    phone: string;
    name: string;
    lastVisitAt?: string | null;
};

const formatDateTime = (value?: string | null) => {
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

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt, orderMode } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id);
    const { menuItems } = useSupabaseMenuItems(branding?.id);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);
    const { heroes } = useHeroes(branding?.id);
    const { stories, loading: storiesLoading } = useSeasonalStories(branding?.id);
    const { moods } = useMoods(branding?.id);

    const [showCart, setShowCart] = React.useState(false);
    const [isOrdering, setIsOrdering] = React.useState(false);
    const [orderComplete, setOrderComplete] = React.useState(false);
    const [isLoyaltyOpen, setIsLoyaltyOpen] = React.useState(false);
    const [activeMoodId, setActiveMoodId] = React.useState<string | null>(null);
    const [activeHeroIndex, setActiveHeroIndex] = React.useState(0);
    const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false,
    });
    const [loyaltyProfile, setLoyaltyProfile] = React.useState<LoyaltyProfile | null>(() => {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        return stored ? JSON.parse(stored) : null;
    });

    const { loyalty: realLoyalty } = useGuestLoyalty(branding?.id, loyaltyProfile?.phone || null);
    const availableMenuItems = React.useMemo(
        () => menuItems.filter((item) => item.is_available !== false),
        [menuItems]
    );
    const activeStories = React.useMemo(
        () => stories.filter((story) => story.is_active !== false),
        [stories]
    );
    const activeHeroes = React.useMemo(() => {
        const heroRecords = heroes.filter((hero) => hero.is_active !== false);
        if (heroRecords.length > 0) {
            return heroRecords;
        }

        if (!branding) {
            return [];
        }

        return [
            {
                id: "fallback-hero",
                title: `${branding.name} Specials`,
                subtext: "Fresh picks curated by the kitchen today.",
                image_url: branding.heroImage || "",
                is_active: true,
            },
        ];
    }, [heroes, branding]);
    const chefPickItems = React.useMemo(
        () =>
            availableMenuItems
                .filter((item) => item.is_recommended || item.is_popular)
                .slice(0, 8),
        [availableMenuItems]
    );

    const resolveMoodForMenu = React.useCallback((moodName?: string, tagLinked?: string) => {
        const source = `${moodName || ""} ${tagLinked || ""}`.toLowerCase();
        if (source.includes("sweet") || source.includes("dessert") || source.includes("choco")) return "sweet";
        if (source.includes("spicy") || source.includes("hot") || source.includes("peri") || source.includes("masala")) return "spicy";
        if (source.includes("light") || source.includes("fresh") || source.includes("salad") || source.includes("healthy")) return "light";
        return "filling";
    }, []);

    React.useEffect(() => {
        const handleOpenCart = () => setShowCart(true);
        window.addEventListener("open_cart", handleOpenCart);
        return () => window.removeEventListener("open_cart", handleOpenCart);
    }, []);

    React.useEffect(() => {
        if (activeHeroes.length <= 1) {
            setActiveHeroIndex(0);
            return;
        }

        const interval = window.setInterval(() => {
            setActiveHeroIndex((current) => (current + 1) % activeHeroes.length);
        }, 4200);

        return () => window.clearInterval(interval);
    }, [activeHeroes.length]);

    React.useEffect(() => {
        if (!menuItems.length) return;

        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        soldOutIds.forEach((id) => updateQuantity(id, 0));
    }, [menuItems, cart, updateQuantity]);

    const handleLoyaltySignIn = async (phone: string, name: string) => {
        const profile = { phone, name, lastVisitAt: new Date().toISOString() };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(profile));
        setLoyaltyProfile(profile);

        if (branding?.id) {
            await saveGuestLoyaltySession(branding.id, phone, name, { lastVisitAt: profile.lastVisitAt });
        }
    };

    const cartTotal = Object.entries(cart).reduce((sum, [id, quantity]) => {
        const item = availableMenuItems.find((menuItem) => menuItem.id === id);
        return sum + ((item?.price || 0) * quantity);
    }, 0);

    const liveBillTotal = requests
        .filter((request) => (request.total || 0) > 0 && !request.is_paid)
        .reduce((sum, request) => sum + (request.total || 0), 0);

    const openOrderCount = requests.filter((request) => request.status !== "Completed").length;
    const completedOrderCount = requests.filter((request) => request.status === "Completed").length;
    const lastVisit = realLoyalty?.last_visit_at || loyaltyProfile?.lastVisitAt || null;
    const lastOrder = realLoyalty?.last_order_at || null;

    const handleOrder = async () => {
        if (!branding?.id) return;

        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        if (soldOutIds.length > 0) {
            soldOutIds.forEach((id) => updateQuantity(id, 0));
            setToast({
                message: "Some sold out items were removed from your bag. Please review your cart.",
                type: "error",
                isVisible: true,
            });
            return;
        }

        if (!loyaltyProfile) {
            setIsLoyaltyOpen(true);
            return;
        }

        if (orderMode !== "takeaway") {
            const accessState = await getRoomAccessState(branding.id, roomNumber);
            if (!accessState.active) {
                setToast({
                    message: "This table is not active right now. Ask staff to activate the table before placing an order.",
                    type: "error",
                    isVisible: true,
                });
                return;
            }
        }

        const now = new Date().toISOString();
        await saveGuestLoyaltySession(branding.id, loyaltyProfile.phone, loyaltyProfile.name, {
            lastVisitAt: loyaltyProfile.lastVisitAt || now,
            lastOrderAt: now,
            lastOrderMode: orderMode,
        });

        setIsOrdering(true);

        const cartItemsData = Object.entries(cart).map(([id, quantity]) => {
            const item = availableMenuItems.find((menuItem) => menuItem.id === id);
            return {
                id,
                title: item?.title || "Unknown Item",
                quantity,
                price: item?.price || 0,
                total: (item?.price || 0) * quantity,
            };
        });

        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber || "Unknown",
            type: "Dining Order",
            notes: cartItemsData.map((item) => `${item.quantity}x ${item.title}`).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal,
            items: cartItemsData,
        });

        setIsOrdering(false);

        if (error) {
            setToast({ message: `Order failed: ${error.message}`, type: "error", isVisible: true });
            return;
        }

        if (cartTotal > 0) {
            await addLoyaltyPoints(branding.id, loyaltyProfile.phone, Math.floor(cartTotal / 10));
        }

        clearCart();
        setShowCart(false);
        setOrderComplete(true);
        setToast({ message: "Order placed successfully.", type: "success", isVisible: true });
    };

    if (loading || !branding) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        );
    }

    const actionCards = [
        {
            id: "menu",
            label: "Menu",
            value: `${availableMenuItems.length} items`,
            description: "Browse the full menu and place a new order.",
            icon: ShoppingBag,
            onClick: () => router.push(`/${hotelSlug}/guest/restaurant`),
        },
        {
            id: "orders",
            label: "Orders",
            value: `${openOrderCount} live`,
            description: "Track open kitchen and service requests.",
            icon: ClipboardList,
            onClick: () => router.push(`/${hotelSlug}/guest/status`),
        },
        {
            id: "bill",
            label: "Live Bill",
            value: `Rs ${liveBillTotal.toFixed(0)}`,
            description: "See running charges and request the bill when ready.",
            icon: Receipt,
            onClick: () => router.push(`/${hotelSlug}/guest/bill`),
        },
        {
            id: "identity",
            label: loyaltyProfile ? "Known Guest" : "Guest Identity",
            value: loyaltyProfile ? loyaltyProfile.name : "Save details",
            description: loyaltyProfile
                ? `Last visit ${formatDateTime(lastVisit)}`
                : "Keep takeaway and repeat visits smooth.",
            icon: UserRound,
            onClick: () => (loyaltyProfile ? router.push(`/${hotelSlug}/guest/profile`) : setIsLoyaltyOpen(true)),
        },
    ];

    return (
        <div
            className="min-h-screen pb-32 pt-6 w-full max-w-[460px] mx-auto px-3.5 relative"
            style={{ backgroundColor: theme.background, color: theme.text, fontFamily: theme.fontSans }}
        >
            <div className="absolute inset-0 -z-20 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(180deg, ${theme.background} 0%, ${theme.surface} 100%)` }}
                />
                {branding.heroImage ? (
                    <img
                        src={getDirectImageUrl(branding.heroImage)}
                        alt={branding.name}
                        className="absolute inset-x-0 top-0 h-[280px] w-full object-cover opacity-12 blur-[2px] scale-105"
                    />
                ) : null}
                <div className="absolute -top-12 right-0 h-52 w-52 rounded-full blur-[90px]" style={{ backgroundColor: `${theme.secondary}55` }} />
                <div className="absolute top-44 -left-10 h-44 w-44 rounded-full blur-[90px]" style={{ backgroundColor: `${theme.primary}18` }} />
            </div>

            <div className="space-y-4">
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.25rem] border p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.28)] backdrop-blur-2xl overflow-hidden relative"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.22) 100%)",
                        borderColor: "rgba(255,255,255,0.46)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-70 pointer-events-none"
                        style={{ background: `radial-gradient(circle at top right, ${theme.secondary}66, transparent 46%)` }}
                    />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 mb-4 backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.4)", borderColor: "rgba(255,255,255,0.42)" }}>
                            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                            <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: theme.primary }}>
                                {orderMode === "takeaway" ? "Takeaway Session" : "Table Session"}
                            </span>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h1 className="text-[clamp(1.7rem,7vw,2.4rem)] font-black tracking-tight leading-none" style={{ color: theme.primary }}>
                                    {orderMode === "takeaway" ? "Ready for pickup" : roomNumber ? `Table ${roomNumber}` : "Ready to order"}
                                </h1>
                                <p className="mt-2 text-sm font-semibold opacity-65 max-w-[26ch]">
                                    Clean ordering, live status, and one place to track the bill.
                                </p>
                            </div>

                            <div className="rounded-[1.3rem] px-4 py-3 border backdrop-blur-md shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.36)", borderColor: "rgba(255,255,255,0.38)" }}>
                                <p className="text-[8px] font-black uppercase tracking-[0.26em] opacity-35 mb-1">Known Guest</p>
                                <p className="text-sm font-black" style={{ color: theme.primary }}>
                                    {loyaltyProfile ? loyaltyProfile.name : "Not synced"}
                                </p>
                                <p className="text-[10px] font-bold opacity-50 mt-1">{formatDateTime(lastVisit)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-5">
                            <MiniStat label="Bag" value={`${cartCount}`} theme={theme} />
                            <MiniStat label="Open" value={`${openOrderCount}`} theme={theme} />
                            <MiniStat label="Done" value={`${completedOrderCount}`} theme={theme} />
                        </div>
                    </div>
                </motion.section>

                {activeHeroes.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 }}
                        className="rounded-[2rem] border overflow-hidden shadow-[0_22px_70px_-34px_rgba(0,0,0,0.25)]"
                        style={{ borderColor: `${theme.primary}10` }}
                    >
                        <div className="relative aspect-[16/8]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeHeroes[activeHeroIndex]?.id || activeHeroIndex}
                                    initial={{ opacity: 0.2, scale: 1.03 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0.2, scale: 1.03 }}
                                    transition={{ duration: 0.45 }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={getDirectImageUrl(activeHeroes[activeHeroIndex]?.image_url) || getDirectImageUrl(branding.heroImage)}
                                        alt={activeHeroes[activeHeroIndex]?.title || branding.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute left-4 right-4 bottom-4 z-10">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 mb-3">
                                    <PlayCircle className="w-3.5 h-3.5 text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/95">Live Ads</span>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-white leading-none">
                                    {activeHeroes[activeHeroIndex]?.title || `${branding.name} Specials`}
                                </h3>
                                <p className="text-xs font-semibold text-white/80 mt-2 max-w-[30ch]">
                                    {activeHeroes[activeHeroIndex]?.subtext || "New recommendations from the kitchen this hour."}
                                </p>
                            </div>

                            {activeHeroes.length > 1 && (
                                <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
                                    {activeHeroes.map((hero, index) => (
                                        <button
                                            key={hero.id}
                                            onClick={() => setActiveHeroIndex(index)}
                                            className={`h-2 rounded-full transition-all ${index === activeHeroIndex ? "w-6 bg-white" : "w-2 bg-white/45"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="rounded-[2rem] border bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)] overflow-hidden"
                    style={{ borderColor: `${theme.primary}10` }}
                >
                    <div className="px-5 pt-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-35 mb-2" style={{ color: theme.primary }}>
                            Status Stories
                        </p>
                        <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                            Updates set from admin seasonal stories
                        </h3>
                    </div>
                    <SeasonalStories
                        stories={activeStories}
                        loading={storiesLoading}
                        onStoryClick={(story) => {
                            if (story.menu_item_id) {
                                router.push(`/${hotelSlug}/guest/item/${story.menu_item_id}`);
                                return;
                            }
                            router.push(`/${hotelSlug}/guest/restaurant`);
                        }}
                    />
                    {!storiesLoading && activeStories.length === 0 && (
                        <div className="px-5 pb-5 text-sm font-semibold opacity-60" style={{ color: theme.primary }}>
                            No seasonal stories added yet from admin.
                        </div>
                    )}
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-[2rem] border bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)] overflow-hidden"
                    style={{ borderColor: `${theme.primary}10` }}
                >
                    <div className="px-5 pt-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-35 mb-2" style={{ color: theme.primary }}>
                            Chef Pick
                        </p>
                        <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                            Kitchen favourites you can add in one tap
                        </h3>
                    </div>
                    <ChefPicksSnapRail
                        items={chefPickItems}
                        cart={cart}
                        onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)}
                        onRemove={(item) => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                    />
                    {chefPickItems.length === 0 && (
                        <div className="px-5 pb-5 text-sm font-semibold opacity-60" style={{ color: theme.primary }}>
                            Add recommended or popular menu items in admin to power this section.
                        </div>
                    )}
                </motion.section>

                <section className="grid grid-cols-2 gap-3">
                    {actionCards.map((card, index) => (
                        <motion.button
                            key={card.id}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * index }}
                            onClick={card.onClick}
                            className="rounded-[1.8rem] border bg-white/82 backdrop-blur-xl p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.secondary}55`, color: theme.primary }}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2" style={{ color: theme.primary }}>
                                {card.label}
                            </p>
                            <h2 className="text-lg font-black tracking-tight mb-1 line-clamp-2" style={{ color: theme.primary }}>
                                {card.value}
                            </h2>
                            <p className="text-[11px] font-medium leading-5 opacity-60" style={{ color: theme.primary }}>
                                {card.description}
                            </p>
                        </motion.button>
                    ))}
                </section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-[2rem] p-5 border shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]"
                    style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                >
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-35 mb-2" style={{ color: theme.primary }}>
                                Eat by mood
                            </p>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                                Start with how you feel, not the full menu.
                            </h3>
                        </div>
                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                            className="shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.24em] transition-all active:scale-95"
                            style={{ color: theme.primary, borderColor: `${theme.primary}12`, backgroundColor: "rgba(255,255,255,0.7)" }}
                        >
                            Open Menu
                        </button>
                    </div>

                    <EatByMoodSection
                        moods={moods.filter((mood) => mood.is_active !== false)}
                        activeMoodId={activeMoodId}
                        onMoodSelect={(moodId) => {
                            setActiveMoodId(moodId);
                            const selectedMood = moods.find((mood) => mood.id === moodId);
                            const normalizedMood = resolveMoodForMenu(selectedMood?.name, selectedMood?.tag_linked);
                            router.push(`/${hotelSlug}/guest/restaurant?mood=${normalizedMood}`);
                        }}
                    />
                    {moods.filter((mood) => mood.is_active !== false).length === 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {DISCOVERY_MOODS.map((mood, index) => (
                                <motion.button
                                    key={mood.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.04 }}
                                    onClick={() => router.push(`/${hotelSlug}/guest/restaurant?mood=${mood.id}`)}
                                    className="rounded-[1.7rem] border p-4 text-left bg-white/82 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all"
                                    style={{ borderColor: `${theme.primary}10` }}
                                >
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${theme.secondary}45` }}>
                                            {mood.icon}
                                        </div>
                                        <ArrowRight className="w-4 h-4 opacity-35" style={{ color: theme.primary }} />
                                    </div>
                                    <p className="text-base font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                        {mood.label}
                                    </p>
                                    <p className="text-[11px] font-semibold opacity-60 leading-5" style={{ color: theme.primary }}>
                                        {mood.guidance}
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.section>

                {cartCount > 0 ? (
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="rounded-[2rem] p-5 border shadow-[0_20px_60px_-30px_rgba(0,0,0,0.22)]"
                        style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-35 mb-2" style={{ color: theme.primary }}>
                                    In your bag
                                </p>
                                <h3 className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
                                    Rs {cartTotal.toFixed(0)}
                                </h3>
                                <p className="text-sm font-medium opacity-60 mt-1">
                                    {cartCount} item{cartCount === 1 ? "" : "s"} ready for checkout.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCart(true)}
                                className="rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
                                style={{ backgroundColor: theme.primary }}
                            >
                                Open Bag
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="rounded-[2rem] p-5 border shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]"
                        style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-35 mb-2" style={{ color: theme.primary }}>
                                    Start ordering
                                </p>
                                <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                                    Open the menu and place your next order.
                                </h3>
                            </div>

                            <button
                                onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                className="rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 shrink-0"
                                style={{ backgroundColor: theme.primary }}
                            >
                                Menu
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.section>
                )}
            </div>

            {orderComplete && (
                <div className="fixed inset-0 z-[150] bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl border border-white/80">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500 mb-2">Order placed</p>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Kitchen has your order</h2>
                        <p className="text-sm text-slate-500 mb-6">You can track progress from the orders page.</p>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => router.push(`/${hotelSlug}/guest/status`)}
                                className="rounded-full bg-slate-900 text-white py-3.5 text-[10px] font-black uppercase tracking-[0.24em]"
                            >
                                View Orders
                            </button>
                            <button
                                onClick={() => {
                                    setOrderComplete(false);
                                    router.push(`/${hotelSlug}/guest/restaurant`);
                                }}
                                className="rounded-full border border-slate-200 py-3.5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-700"
                            >
                                Order More
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LoyaltySignIn
                isOpen={isLoyaltyOpen}
                onClose={() => setIsLoyaltyOpen(false)}
                onSignIn={handleLoyaltySignIn}
                guestName={loyaltyProfile?.name || ""}
                guestPhone={loyaltyProfile?.phone || ""}
                lastVisitAt={lastVisit}
            />

            <CartOverlay
                isOpen={showCart}
                onClose={() => setShowCart(false)}
                cart={cart}
                updateQuantity={updateQuantity}
                cartTotal={cartTotal}
                isOrdering={isOrdering}
                onOrder={handleOrder}
                hotelId={branding.id}
                menuItems={menuItems}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

function MiniStat({
    label,
    value,
    theme,
}: {
    label: string;
    value: string;
    theme: ReturnType<typeof useTheme>;
}) {
    return (
        <div
            className="rounded-[1.25rem] border px-4 py-3 backdrop-blur-md"
            style={{ backgroundColor: "rgba(255,255,255,0.34)", borderColor: "rgba(255,255,255,0.38)" }}
        >
            <p className="text-[8px] font-black uppercase tracking-[0.26em] opacity-35 mb-1">{label}</p>
            <p className="text-lg font-black tracking-tight" style={{ color: theme.primary }}>
                {value}
            </p>
        </div>
    );
}
