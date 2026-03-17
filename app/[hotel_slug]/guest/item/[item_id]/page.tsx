"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Plus,
    Minus,
    Trash2,
    Sparkles,
    Clock3,
    Flame,
    BadgeCheck,
    Leaf,
    ShoppingBag,
    ChevronRight,
    Star,
    Utensils,
} from "lucide-react";
import { useHotelBranding, useSupabaseMenuItems, useCart, normalizeCategoryKey, formatCategoryName } from "@/utils/store";
import { CATEGORY_THEMES, useTheme } from "@/utils/themes";
import { BottomNav } from "@/components/BottomNav";
import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "@/components/AddEffect";
import { MenuCard } from "@/components/MenuCard";

export default function ItemPage() {
    const params = useParams();
    const router = useRouter();
    const hotelSlug = params?.hotel_slug as string;
    const itemId = params?.item_id as string;

    const { branding } = useHotelBranding(hotelSlug);
    const { menuItems, loading } = useSupabaseMenuItems(branding?.id);
    const { cart, updateQuantity, cartCount } = useCart(branding?.id);
    const globalTheme = useTheme(branding);
    const triggerFly = useAddEffectTrigger();

    const [isAdded, setIsAdded] = useState(false);

    const item = useMemo(() => menuItems.find((i) => i.id === itemId), [menuItems, itemId]);
    const availableMenuItems = useMemo(
        () => menuItems.filter((menuItem) => menuItem.is_available !== false),
        [menuItems]
    );
    const relatedItems = useMemo(
        () =>
            availableMenuItems
                .filter((menuItem) => menuItem.id !== item?.id && normalizeCategoryKey(menuItem.category) === normalizeCategoryKey(item?.category))
                .slice(0, 3),
        [availableMenuItems, item]
    );
    const pairing = useMemo(() => {
        if (!item || !item.upsell_items || item.upsell_items.length === 0) return null;
        return availableMenuItems.find((menuItem) => item.upsell_items?.includes(menuItem.id)) || null;
    }, [item, availableMenuItems]);

    const categoryKey = normalizeCategoryKey(item?.category || "all");
    const categoryTheme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.all;
    const currentQty = item ? cart[item.id] || 0 : 0;
    const total = item ? (item.price || 0) * currentQty : 0;

    const handleAdd = (e: React.MouseEvent) => {
        if (!item) return;
        if (item.is_available === false) return;
        if (item.image_url) triggerFly(item.id, item.image_url, e);
        updateQuantity(item.id, (cart[item.id] || 0) + 1);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1200);
    };

    const handleAddPairing = (e: React.MouseEvent) => {
        if (!pairing) return;
        if (pairing.is_available === false) return;
        if (pairing.image_url) triggerFly(pairing.id, pairing.image_url, e);
        updateQuantity(pairing.id, (cart[pairing.id] || 0) + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: globalTheme.background }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: globalTheme.primary }} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: globalTheme.primary }}>
                        Loading dish
                    </p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: globalTheme.background }}>
                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: `${globalTheme.primary}12`, color: globalTheme.primary }}>
                    <Utensils className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-3" style={{ color: globalTheme.primary }}>
                    Item not found
                </h2>
                <p className="text-slate-500 max-w-sm mb-8">
                    This dish may have been removed or is not available right now.
                </p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.28em] border shadow-sm"
                    style={{ color: globalTheme.primary, borderColor: `${globalTheme.primary}14`, backgroundColor: globalTheme.surface }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-32 w-full overflow-x-hidden"
            style={{
                backgroundColor: globalTheme.background,
                fontFamily: globalTheme.fontSans,
                color: globalTheme.text,
            }}
        >
            <div className="relative">
                <div className="absolute inset-0 -z-10">
                    <div
                        className="absolute inset-x-0 top-0 h-[52vh]"
                        style={{
                            background: `linear-gradient(180deg, ${globalTheme.primary}18 0%, transparent 65%)`,
                        }}
                    />
                    <div
                        className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-[120px] opacity-60"
                        style={{ backgroundColor: `${globalTheme.accent}22` }}
                    />
                </div>

                <div className="sticky top-0 z-40 px-4 pt-4 pb-3 backdrop-blur-xl" style={{ backgroundColor: `${globalTheme.background}dd` }}>
                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-black/5 active:scale-95 transition-all"
                            style={{ color: globalTheme.primary }}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-black/5">
                            <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: globalTheme.primary }}>
                                {formatCategoryName(item.category)}
                            </span>
                        </div>

                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/dashboard`)}
                            className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-black/5 active:scale-95 transition-all"
                            style={{ color: globalTheme.primary }}
                        >
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-4 pt-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="relative overflow-hidden rounded-[2.4rem] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] border"
                        style={{
                            borderColor: `${globalTheme.primary}12`,
                            backgroundColor: globalTheme.surface,
                        }}
                    >
                        <div className="relative aspect-[4/5]">
                            <img
                                src={getDirectImageUrl(item.image_url)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                                <div className="max-w-[70%]">
                                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10 mb-4">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.24em]">Chef's Pick</span>
                                    </div>
                                    <h1 className="text-[clamp(2.2rem,7vw,4rem)] leading-[0.92] font-black tracking-tight text-white">
                                        {item.title}
                                    </h1>
                                </div>
                                <div className="shrink-0 px-4 py-3 rounded-[1.2rem] bg-white text-slate-900 shadow-lg">
                                    <div className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400">Price</div>
                                    <div className="text-2xl font-black">₹{item.price}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="px-4 -mt-10 relative z-10 space-y-6">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="rounded-[2.2rem] bg-white shadow-[0_18px_60px_-22px_rgba(0,0,0,0.22)] border border-black/5 p-6"
                    >
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {item.is_popular && (
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.24em] bg-amber-50 text-amber-700">
                                    <Flame className="w-3.5 h-3.5" />
                                    Popular
                                </span>
                            )}
                            {item.is_recommended && (
                                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.24em] bg-emerald-50 text-emerald-700">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    Recommended
                                </span>
                            )}
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.24em] bg-slate-50 text-slate-500">
                                <Leaf className="w-3.5 h-3.5" />
                                Freshly prepared
                            </span>
                        </div>

                        {item.is_available === false && (
                            <div className="mb-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-red-700 font-black uppercase tracking-[0.22em] text-[9px]">
                                Sold out right now
                            </div>
                        )}

                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            {item.description || "A carefully built dish designed to feel like a restaurant recommendation, not a generic menu row."}
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-[1.4rem] bg-slate-50 p-4">
                                <Clock3 className="w-4 h-4 mb-2" style={{ color: globalTheme.primary }} />
                                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Prep</div>
                                <div className="text-sm font-black" style={{ color: globalTheme.primary }}>12-18 min</div>
                            </div>
                            <div className="rounded-[1.4rem] bg-slate-50 p-4">
                                <Sparkles className="w-4 h-4 mb-2" style={{ color: globalTheme.primary }} />
                                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Mood</div>
                                <div className="text-sm font-black" style={{ color: globalTheme.primary }}>{categoryTheme.emotion}</div>
                            </div>
                            <div className="rounded-[1.4rem] bg-slate-50 p-4">
                                <BadgeCheck className="w-4 h-4 mb-2" style={{ color: globalTheme.primary }} />
                                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">Status</div>
                                <div className="text-sm font-black" style={{ color: globalTheme.primary }}>{item.is_available ? "Available" : "Unavailable"}</div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 }}
                        className="rounded-[2.2rem] bg-white p-6 border border-black/5 shadow-[0_18px_60px_-22px_rgba(0,0,0,0.18)]"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">Your Bag</h3>
                                <p className="text-3xl font-black tracking-tight" style={{ color: globalTheme.primary }}>₹{total.toFixed(0)}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.24em]">
                                <ShoppingBag className="w-4 h-4" />
                                {currentQty > 0 ? `${currentQty} added` : "Ready to add"}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateQuantity(item.id, Math.max(0, (cart[item.id] || 0) - 1))}
                                disabled={item.is_available === false}
                                className="w-14 h-14 rounded-full flex items-center justify-center border border-slate-200 bg-white shadow-sm active:scale-95 transition-all"
                                style={{ color: globalTheme.primary }}
                            >
                                {(cart[item.id] || 0) <= 1 ? <Trash2 className="w-5 h-5 text-red-500" /> : <Minus className="w-5 h-5" />}
                            </button>

                            <div className="flex-1 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <span className="text-2xl font-black" style={{ color: globalTheme.primary }}>
                                    {currentQty || 0}
                                </span>
                            </div>

                            <button
                                onClick={(e) => handleAdd(e)}
                                disabled={item.is_available === false}
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
                                style={{ backgroundColor: globalTheme.primary }}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        <button
                            onClick={(e) => handleAdd(e)}
                            disabled={item.is_available === false}
                            className="mt-4 w-full py-4 rounded-[1.35rem] text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.99] transition-all"
                            style={{ backgroundColor: globalTheme.primary }}
                        >
                            {item.is_available === false ? "Sold Out" : (isAdded ? "Added to Bag" : "Add to Order")}
                        </button>
                    </motion.section>

                    {pairing && (
                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-[2.2rem] bg-white p-6 border border-black/5 shadow-[0_18px_60px_-22px_rgba(0,0,0,0.18)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">Pairs Well With</h3>
                                    <h4 className="text-2xl font-black tracking-tight" style={{ color: globalTheme.primary }}>
                                        {pairing.title}
                                    </h4>
                                </div>
                                <div className="px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-[0.24em]">
                                    Add-on
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shrink-0 shadow-lg">
                                    <img src={getDirectImageUrl(pairing.image_url)} alt={pairing.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                        This gives the order a more complete, restaurant-style feel.
                                    </p>
                                    <p className="mt-2 text-lg font-black" style={{ color: globalTheme.primary }}>
                                        ₹{pairing.price}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleAddPairing(e)}
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
                                    style={{ backgroundColor: globalTheme.primary }}
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.section>
                    )}

                    {relatedItems.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.26 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between px-1">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-2">More In This Section</h3>
                                    <p className="text-2xl font-black tracking-tight" style={{ color: globalTheme.primary }}>
                                        {formatCategoryName(item.category)}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-30" style={{ color: globalTheme.primary }} />
                            </div>

                            <div className="space-y-4">
                                {relatedItems.map((relatedItem) => (
                                    <MenuCard
                                        key={relatedItem.id}
                                        id={relatedItem.id}
                                        title={relatedItem.title}
                                        description={relatedItem.description || ""}
                                        price={relatedItem.price}
                                        image={relatedItem.image_url}
                                        isPopular={relatedItem.is_popular}
                                        isRecommended={relatedItem.is_recommended}
                                        theme={CATEGORY_THEMES[normalizeCategoryKey(relatedItem.category)] || CATEGORY_THEMES.all}
                                        onClick={() => router.push(`/${hotelSlug}/guest/item/${relatedItem.id}`)}
                                        quantity={cart[relatedItem.id] || 0}
                                        onAdd={() => updateQuantity(relatedItem.id, (cart[relatedItem.id] || 0) + 1)}
                                        onRemove={() => updateQuantity(relatedItem.id, (cart[relatedItem.id] || 0) - 1)}
                                    />
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
