"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { formatCategoryName, useHotelBranding } from "@/utils/store";
import { useTheme } from "@/utils/themes";
import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "./AddEffect";

interface InlineUpsellItem {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    category: string;
}

interface InlineUpsellRailProps {
    title: string;
    subtitle: string;
    items: InlineUpsellItem[];
    cart: Record<string, number>;
    onAdd: (item: InlineUpsellItem) => void;
    onRemove: (item: InlineUpsellItem) => void;
    browseLabel?: string;
    onBrowse?: () => void;
}

export function InlineUpsellRail({
    title,
    subtitle,
    items,
    cart,
    onAdd,
    onRemove,
    browseLabel,
    onBrowse,
}: InlineUpsellRailProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const triggerFly = useAddEffectTrigger();

    if (!items.length) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border p-5 sm:p-6 shadow-[0_24px_80px_-35px_rgba(0,0,0,0.28)] overflow-hidden"
            style={{
                background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%)`,
                borderColor: `${theme.primary}16`,
            }}
        >
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full border mb-3"
                        style={{ backgroundColor: `${theme.primary}08`, borderColor: `${theme.primary}12` }}
                    >
                        <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: theme.primary }}>
                            Complete Your Order
                        </span>
                    </div>
                    <h3 className="text-[clamp(1.45rem,3vw,2.1rem)] font-black tracking-tight leading-none mb-2" style={{ color: theme.primary }}>
                        {title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-xl">
                        {subtitle}
                    </p>
                </div>

                {onBrowse && browseLabel ? (
                    <button
                        onClick={onBrowse}
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-full border text-[10px] font-black uppercase tracking-[0.24em] bg-white shadow-sm active:scale-95 transition-all"
                        style={{ color: theme.primary, borderColor: `${theme.primary}14` }}
                    >
                        {browseLabel}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : null}
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
                {items.map((item) => {
                    const quantity = cart[item.id] || 0;

                    return (
                        <motion.article
                            key={item.id}
                            whileHover={{ y: -3 }}
                            className="flex-none w-[240px] rounded-[1.7rem] overflow-hidden border bg-white shadow-[0_18px_50px_-28px_rgba(0,0,0,0.32)]"
                            style={{ borderColor: `${theme.primary}10` }}
                        >
                            <div className="relative aspect-[4/3] bg-slate-100">
                                <img
                                    src={getDirectImageUrl(item.image_url)}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.24em] bg-white/90 text-slate-900">
                                    {formatCategoryName(item.category)}
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/70 mb-1">
                                        Smart add-on
                                    </p>
                                    <h4 className="text-xl font-black leading-tight text-white line-clamp-2">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-sm font-medium text-slate-500 leading-relaxed min-h-[44px] line-clamp-2">
                                    {item.description || "Quick add-on that pairs well with your current pick."}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400 mb-1">
                                            Add with one tap
                                        </p>
                                        <p className="text-2xl font-black tracking-tight" style={{ color: theme.primary }}>
                                            Rs {item.price.toFixed(0)}
                                        </p>
                                    </div>

                                    {quantity > 0 ? (
                                        <div
                                            className="flex items-center rounded-full p-1 border bg-slate-50"
                                            style={{ borderColor: `${theme.primary}16` }}
                                        >
                                            <button
                                                onClick={() => onRemove(item)}
                                                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all"
                                                style={{ color: theme.primary }}
                                            >
                                                {quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                                            </button>
                                            <span className="w-8 text-center text-sm font-black" style={{ color: theme.primary }}>
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={(event) => {
                                                    if (item.image_url) {
                                                        triggerFly(item.id, item.image_url, event);
                                                    }
                                                    onAdd(item);
                                                }}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-md"
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(event) => {
                                                if (item.image_url) {
                                                    triggerFly(item.id, item.image_url, event);
                                                }
                                                onAdd(item);
                                            }}
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-[0.24em] shadow-lg active:scale-95 transition-all"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </motion.section>
    );
}
