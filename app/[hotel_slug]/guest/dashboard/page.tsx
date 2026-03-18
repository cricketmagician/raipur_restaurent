"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    RefreshCw,
} from "lucide-react";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { SeasonalStories } from "@/components/SeasonalStories";
import { StoryOverlay } from "@/components/StoryOverlay";
import { ChefPicksSnapRail } from "@/components/ChefPicksSnapRail";
import { EatByMoodSection } from "@/components/EatByMoodSection";
import { Toast } from "@/components/Toast";
import {
    addLoyaltyPoints,
    addSupabaseRequest,
    buildStandaloneSeasonalStoryItems,
    getRoomAccessState,
    getSeasonalStoryCartItemId,
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
import { DISCOVERY_MOODS, categoryMatchesMood, getDiscoveryMood, textMatchesMood } from "@/utils/guestDiscovery";

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
    const sessionKey = `${roomNumber || "guest"}:${checkedInAt || "new"}`;
    const { branding, loading } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id, [], sessionKey);
    const { menuItems } = useSupabaseMenuItems(branding?.id);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);
    const { heroes } = useHeroes(branding?.id);
    const { stories, loading: storiesLoading } = useSeasonalStories(branding?.id);
    const { moods } = useMoods(branding?.id);

    const [isOrdering, setIsOrdering] = React.useState(false);
    const [orderComplete, setOrderComplete] = React.useState(false);
    const [isLoyaltyOpen, setIsLoyaltyOpen] = React.useState(false);
    const [activeMoodId, setActiveMoodId] = React.useState<string | null>(null);
    const [activeHeroIndex, setActiveHeroIndex] = React.useState(0);
    const [activeStoryIndex, setActiveStoryIndex] = React.useState(0);
    const [isStoryOverlayOpen, setIsStoryOverlayOpen] = React.useState(false);
    const moodPicksRef = React.useRef<HTMLDivElement>(null);
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
    const activeMood = React.useMemo(
        () => moods.find((mood) => mood.id === activeMoodId) || null,
        [activeMoodId, moods]
    );
    const activeStories = React.useMemo(
        () => stories.filter((story) => story.is_active !== false),
        [stories]
    );
    const standaloneStoryItems = React.useMemo(
        () => buildStandaloneSeasonalStoryItems(activeStories),
        [activeStories]
    );
    const cartCatalogItems = React.useMemo(
        () => [...menuItems, ...standaloneStoryItems],
        [menuItems, standaloneStoryItems]
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
                cta_text: branding.hero_cta || "Explore Menu",
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
    const moodPickItems = React.useMemo(() => {
        if (!activeMood) return [];

        return availableMenuItems
            .filter((item) =>
                categoryMatchesMood(`${item.category} ${item.title} ${item.description || ""}`, activeMood.id) ||
                textMatchesMood(`${item.category} ${item.title} ${item.description || ""}`, activeMood.id)
            )
            .slice(0, 6);
    }, [activeMood, availableMenuItems]);
    const moodPicksLabel = activeMood ? (getDiscoveryMood(activeMood.id)?.label || activeMood.name) : null;

    React.useEffect(() => {
        if (activeHeroes.length <= 1) {
            setActiveHeroIndex(0);
            return;
        }

        const interval = window.setInterval(() => {
            setActiveHeroIndex((current) => (current + 1) % activeHeroes.length);
        }, 5000);

        return () => window.clearInterval(interval);
    }, [activeHeroes.length]);

    React.useEffect(() => {
        if (!menuItems.length) return;

        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        soldOutIds.forEach((id) => updateQuantity(id, 0));
    }, [menuItems, cart, updateQuantity]);

    React.useEffect(() => {
        if (!activeMoodId || !moodPicksRef.current) return;

        requestAnimationFrame(() => {
            moodPicksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [activeMoodId, moodPickItems.length]);

    const handleLoyaltySignIn = async (phone: string, name: string) => {
        const profile = { phone, name, lastVisitAt: new Date().toISOString() };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(profile));
        setLoyaltyProfile(profile);

        if (branding?.id) {
            await saveGuestLoyaltySession(branding.id, phone, name, { lastVisitAt: profile.lastVisitAt });
        }
    };

    const cartTotal = Object.entries(cart).reduce((sum, [id, quantity]) => {
        const item = cartCatalogItems.find((menuItem) => menuItem.id === id);
        return sum + ((item?.price || 0) * quantity);
    }, 0);

    const liveBillTotal = requests
        .filter((request) => (request.total || 0) > 0 && !request.is_paid)
        .reduce((sum, request) => sum + (request.total || 0), 0);

    const openOrderCount = requests.filter((request) => request.status !== "Completed").length;
    const completedOrderCount = requests.filter((request) => request.status === "Completed").length;
    const lastVisit = realLoyalty?.last_visit_at || loyaltyProfile?.lastVisitAt || null;
    const currentHero = activeHeroes[activeHeroIndex] || activeHeroes[0];

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
            const item = cartCatalogItems.find((menuItem) => menuItem.id === id);
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
        setOrderComplete(true);
        setToast({ message: "Order placed successfully.", type: "success", isVisible: true });
    };

    const handleStoryPrimaryAction = (story: (typeof activeStories)[number], event: React.MouseEvent) => {
        event.stopPropagation();

        const linkedItem = story.menu_item_id
            ? menuItems.find((item) => item.id === story.menu_item_id)
            : null;

        if (linkedItem) {
            if (linkedItem.is_available === false) {
                setToast({
                    message: `${linkedItem.title} is sold out right now.`,
                    type: "error",
                    isVisible: true,
                });
                return;
            }

            updateQuantity(linkedItem.id, (cart[linkedItem.id] || 0) + 1);
            setToast({
                message: `${linkedItem.title} added to your bag.`,
                type: "success",
                isVisible: true,
            });
            setIsStoryOverlayOpen(false);
            return;
        }

        const standaloneId = getSeasonalStoryCartItemId(story.id);
        const standaloneItem = standaloneStoryItems.find((item) => item.id === standaloneId);

        if (standaloneItem) {
            updateQuantity(standaloneItem.id, (cart[standaloneItem.id] || 0) + 1);
            setToast({
                message: `${standaloneItem.title} added to your bag.`,
                type: "success",
                isVisible: true,
            });
            setIsStoryOverlayOpen(false);
            return;
        }

        setIsStoryOverlayOpen(false);
        router.push(`/${hotelSlug}/guest/restaurant`);
    };

    if (loading || !branding) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-32 w-full max-w-[460px] mx-auto relative overflow-x-hidden"
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

            <div className="space-y-0">
                {activeHeroes.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 }}
                        className="relative overflow-hidden"
                    >
                        <div className="relative min-h-[70svh]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentHero?.id || activeHeroIndex}
                                    initial={{ x: "100%", opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: "-100%", opacity: 0 }}
                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={getDirectImageUrl(currentHero?.image_url) || getDirectImageUrl(branding.heroImage)}
                                        alt={currentHero?.title || branding.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/80" />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-9 pt-24">
                                <h1 className="max-w-[11ch] text-[2rem] font-semibold tracking-[-0.05em] leading-[0.96] text-white sm:text-[2.35rem]">
                                    {currentHero?.title || `${branding.name} Specials`}
                                </h1>
                                <p className="mt-3 max-w-[30ch] text-sm font-medium leading-6 text-white/78">
                                    {currentHero?.subtext || "Fresh picks curated today."}
                                </p>
                                <button
                                    onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all active:scale-95"
                                >
                                    {currentHero?.cta_text || "Explore Menu"}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {activeHeroes.length > 1 && (
                                <div className="absolute bottom-10 right-5 z-10 flex items-center gap-1.5">
                                    {activeHeroes.map((hero, index) => (
                                        <button
                                            key={hero.id}
                                            onClick={() => setActiveHeroIndex(index)}
                                            className={`h-2 rounded-full transition-all ${index === activeHeroIndex ? "w-6 bg-white/90" : "w-2 bg-white/40"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}

                <div className="space-y-8 px-3.5 pt-5">
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 }}
                        className="pt-1"
                    >
                        <SeasonalStories
                            stories={activeStories}
                            loading={storiesLoading}
                            onStoryClick={(story) => {
                                const nextIndex = activeStories.findIndex((entry) => entry.id === story.id);
                                setActiveStoryIndex(nextIndex >= 0 ? nextIndex : 0);
                                setIsStoryOverlayOpen(true);
                            }}
                        />
                        {!storiesLoading && activeStories.length === 0 && (
                            <div className="px-4 text-sm font-semibold opacity-60" style={{ color: theme.primary }}>
                                No seasonal stories added yet from admin.
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="pt-1"
                    >
                        <ChefPicksSnapRail
                            items={chefPickItems}
                            cart={cart}
                            onAdd={(item) => updateQuantity(item.id, (cart[item.id] || 0) + 1)}
                            onRemove={(item) => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                            onItemClick={(item) => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                        />
                        {chefPickItems.length === 0 && (
                            <div className="px-4 text-sm font-semibold opacity-60" style={{ color: theme.primary }}>
                                Add recommended or popular menu items in admin to power this section.
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="px-1"
                    >
                        <EatByMoodSection
                            moods={moods.filter((mood) => mood.is_active !== false)}
                            activeMoodId={activeMoodId}
                            onMoodSelect={(moodId) => {
                                setActiveMoodId(moodId);
                                const selectedMood = moods.find((mood) => mood.id === moodId);
                                window.dispatchEvent(new CustomEvent("guest_show_toast", {
                                    detail: {
                                        type: "success",
                                        message: `${selectedMood?.name || "Mood"} picks ready.`,
                                    },
                                }));
                            }}
                        />
                        {moods.filter((mood) => mood.is_active !== false).length === 0 && (
                            <div className="grid grid-cols-2 gap-3 px-4">
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
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: `${theme.secondary}45` }}>
                                                {mood.icon}
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-35" style={{ color: theme.primary }} />
                                        </div>
                                        <p className="mb-1 text-base font-black tracking-tight" style={{ color: theme.primary }}>
                                            {mood.label}
                                        </p>
                                        <p className="text-[11px] font-semibold leading-5 opacity-60" style={{ color: theme.primary }}>
                                            {mood.guidance}
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {activeMood && moodPickItems.length > 0 && (
                            <motion.div
                                ref={moodPicksRef}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                                className="mt-4 rounded-[1.6rem] border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
                                style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                            >
                                <div className="mb-3 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] opacity-45" style={{ color: theme.primary }}>
                                            {moodPicksLabel} picks
                                        </p>
                                        <h4 className="text-lg font-black tracking-tight" style={{ color: theme.primary }}>
                                            What fits your vibe best.
                                        </h4>
                                    </div>
                                    <span className="rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primary, borderColor: `${theme.primary}12` }}>
                                        Now showing
                                    </span>
                                </div>

                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                    {moodPickItems.map((item) => (
                                        <motion.button
                                            key={item.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                            className="min-w-[168px] overflow-hidden rounded-[1.2rem] border text-left shadow-[0_14px_30px_rgba(0,0,0,0.08)]"
                                            style={{ backgroundColor: "rgba(255,255,255,0.75)", borderColor: `${theme.primary}08` }}
                                        >
                                            <div className="h-28 overflow-hidden">
                                                <img
                                                    src={getDirectImageUrl(item.image_url)}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="space-y-1 p-3">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-45" style={{ color: theme.primary }}>
                                                    {item.category}
                                                </p>
                                                <h5 className="line-clamp-1 text-[13px] font-black tracking-tight" style={{ color: theme.primary }}>
                                                    {item.title}
                                                </h5>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-black" style={{ color: theme.primary }}>
                                                        ₹{item.price}
                                                    </span>
                                                    <span className="rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-white" style={{ backgroundColor: "#F59E0B" }}>
                                                        View
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.section>

                    {cartCount > 0 ? (
                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="rounded-[1.35rem] border p-4 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.22)]"
                            style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] opacity-35" style={{ color: theme.primary }}>
                                        In your bag
                                    </p>
                                    <h3 className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
                                        Rs {cartTotal.toFixed(0)}
                                    </h3>
                                    <p className="mt-1 text-sm font-medium opacity-60">
                                        {cartCount} item{cartCount === 1 ? "" : "s"} ready for checkout.
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent("open_cart"))}
                                    className="flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-lg transition-all active:scale-95"
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
                            className="rounded-[2rem] border p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]"
                            style={{ backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] opacity-35" style={{ color: theme.primary }}>
                                        Start ordering
                                    </p>
                                    <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                                        Open the menu and place your next order.
                                    </h3>
                                </div>

                                <button
                                    onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                    className="shrink-0 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-lg transition-all active:scale-95"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    Menu
                                </button>
                            </div>
                        </motion.section>
                    )}
                </div>
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

            <StoryOverlay
                stories={activeStories}
                initialIndex={activeStoryIndex}
                isVisible={isStoryOverlayOpen}
                onClose={() => setIsStoryOverlayOpen(false)}
                onOrder={handleStoryPrimaryAction}
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
