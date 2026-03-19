"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    RefreshCw,
    Leaf,
    ChefHat,
    ShieldCheck
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
    const [activeStoryIndex, setActiveStoryIndex] = React.useState(0);
    const [isStoryOverlayOpen, setIsStoryOverlayOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showUtilityMenu, setShowUtilityMenu] = React.useState(false);

    // Hero Slideshow State
    const [activeHeroIndex, setActiveHeroIndex] = React.useState(0);
    const heroScrollRef = React.useRef<HTMLDivElement>(null);

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
                image_url: branding.heroImage || (hotelSlug === 'hutgood' ? '/images/hutgood_hero.png' : ""),
                cta_text: branding.hero_cta || "Explore Menu",
                is_active: true,
            },
        ];
    }, [heroes, branding, hotelSlug]);
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

        const interval = setInterval(() => {
            setActiveHeroIndex(prev => {
                const next = (prev + 1) % activeHeroes.length;
                if (heroScrollRef.current) {
                    heroScrollRef.current.scrollTo({
                        left: heroScrollRef.current.clientWidth * next,
                        behavior: 'smooth'
                    });
                }
                return next;
            });
        }, 4500);
        return () => clearInterval(interval);
    }, [activeHeroes.length]);

    const handleHeroScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const clientWidth = e.currentTarget.clientWidth;
        const scrollLeft = e.currentTarget.scrollLeft;
        if (clientWidth === 0) return;
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== activeHeroIndex && index >= 0 && index < activeHeroes.length) {
            setActiveHeroIndex(index);
        }
    };

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
                {getDirectImageUrl(branding.heroImage) ? (
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
                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 }}
                    className="relative overflow-hidden"
                >
                    <div 
                        ref={heroScrollRef}
                        onScroll={handleHeroScroll}
                        className="relative h-[60svh] w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex"
                    >
                        {activeHeroes.length === 0 ? (
                            <div className="min-w-full h-full relative snap-start shrink-0 flex items-center justify-center bg-[#0F3D2E]/5">
                                <span className="animate-pulse w-8 h-8 rounded-full bg-[#0F3D2E]/20" />
                            </div>
                        ) : activeHeroes.map((hero, index) => (
                                <div 
                                    key={hero.id} 
                                    className="min-w-full h-full relative snap-start shrink-0"
                                >
                                    <div className="absolute inset-0">
                                        {(getDirectImageUrl(hero.image_url) || getDirectImageUrl(branding?.heroImage) || (hotelSlug === 'hutgood' ? '/images/hutgood_hero.png' : '')) ? (
                                            <img
                                                src={getDirectImageUrl(hero.image_url) || getDirectImageUrl(branding?.heroImage) || (hotelSlug === 'hutgood' ? '/images/hutgood_hero.png' : '')}
                                                alt={hero.title || branding?.name || 'Hero Image'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-[#0F3D2E] to-black relative overflow-hidden">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] bg-[#C8A96A]/20"></div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
                                    </div>
                                    
                                    <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 pt-28">
                                        <h1 className="max-w-[12ch] text-[2.2rem] font-bold tracking-[-0.04em] leading-[0.94] text-white sm:text-[2.6rem]">
                                            {hero.title || `${branding.name} Specials`}
                                        </h1>
                                        <p className="mt-4 max-w-[32ch] text-[15px] font-medium leading-relaxed text-white/85">
                                            {hero.subtext || "Fresh picks curated today."}
                                        </p>
                                        <button
                                            onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                                            className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-xl shadow-2xl transition-all active:scale-95"
                                        >
                                            {hero.cta_text || "Explore Menu"}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Pagination Dots */}
                    {activeHeroes.length > 1 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-none">
                            {activeHeroes.map((_, index) => (
                                <div 
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${index === activeHeroIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                                />
                            ))}
                        </div>
                    )}
                </motion.section>

                <div className="space-y-12">
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 }}
                        className="pt-1"
                    >
                        <div className="px-4 mb-2 flex items-baseline justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Highlights</h2>
                        </div>
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

                    {/* Restaurant Trust / Standards Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="py-4"
                    >
                        <div className="px-3 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-40 mb-1" style={{ color: theme.primary }}>
                                Inside our kitchen
                            </p>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: theme.primary }}>
                                Made with passion.
                            </h3>
                        </div>

                        <div className="flex overflow-x-auto no-scrollbar gap-3 px-3 pb-2 -mx-2 pl-2 snap-x">
                            {/* Badge 1 */}
                            <div 
                                className="min-w-[140px] snap-start rounded-[1.4rem] p-4 border bg-white/70 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                                style={{ borderColor: `${theme.primary}10` }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.secondary}40`, color: theme.primary }}>
                                    <Leaf className="w-5 h-5" />
                                </div>
                                <h4 className="text-[13px] font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                    Fresh Supplies
                                </h4>
                                <p className="text-[10px] font-medium leading-4 opacity-65" style={{ color: theme.primary }}>
                                    Daily sourced local ingredients for peak flavor.
                                </p>
                            </div>

                            {/* Badge 2 */}
                            <div 
                                className="min-w-[140px] snap-start rounded-[1.4rem] p-4 border bg-white/70 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                                style={{ borderColor: `${theme.primary}10` }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.secondary}40`, color: theme.primary }}>
                                    <ChefHat className="w-5 h-5" />
                                </div>
                                <h4 className="text-[13px] font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                    Chef Crafted
                                </h4>
                                <p className="text-[10px] font-medium leading-4 opacity-65" style={{ color: theme.primary }}>
                                    Prepared meticulously by culinary experts.
                                </p>
                            </div>

                            {/* Badge 3 */}
                            <div 
                                className="min-w-[140px] snap-start rounded-[1.4rem] p-4 border bg-white/70 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                                style={{ borderColor: `${theme.primary}10` }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${theme.secondary}40`, color: theme.primary }}>
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h4 className="text-[13px] font-black tracking-tight mb-1" style={{ color: theme.primary }}>
                                    Hygienic Prep
                                </h4>
                                <p className="text-[10px] font-medium leading-4 opacity-65" style={{ color: theme.primary }}>
                                    Strict safety and cleaning protocols in place.
                                </p>
                            </div>
                        </div>
                    </motion.section>
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
