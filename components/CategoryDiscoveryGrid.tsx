"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Flame, ArrowUpRight } from "lucide-react";
import type { DiscoveryMood } from "@/utils/guestDiscovery";
import { CATEGORY_THEMES } from "@/utils/themes";

interface Category {
    id: string;
    name: string;
    icon: string;
    imageUrl?: string;
    tagline?: string;
    itemCount?: number;
}

interface CategoryDiscoveryGridProps {
    categories: Category[];
    trendingCategory?: Category | null;
    onCategoryClick: (id: string) => void;
    activeCategory: string;
    theme: any;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    mood?: DiscoveryMood | null;
    onClearMood?: () => void;
}

export function CategoryDiscoveryGrid({
    categories,
    trendingCategory,
    onCategoryClick,
    activeCategory,
    theme,
    searchTerm,
    onSearchChange,
    mood,
    onClearMood,
}: CategoryDiscoveryGridProps) {
    const resolveFallbackImage = (categoryId?: string) =>
        CATEGORY_THEMES[categoryId || "all"]?.image || CATEGORY_THEMES.all.image || "/images/food/chocolate_cake.png";

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, categoryId?: string) => {
        const image = event.currentTarget;
        const finalFallback = "/images/food/chocolate_cake.png";
        const firstFallback = resolveFallbackImage(categoryId);

        if (image.dataset.fallbackApplied === "1") {
            image.src = finalFallback;
            return;
        }

        image.dataset.fallbackApplied = "1";
        image.src = firstFallback;
    };

    return (
        <div className="space-y-6 mt-6">
            {mood && (
                <section
                    className="rounded-[2rem] border bg-white/84 backdrop-blur-xl px-5 py-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.28)]"
                    style={{ borderColor: `${theme.primary}12` }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-40 mb-2" style={{ color: theme.primary }}>
                                Eat by mood
                            </p>
                            <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: theme.primary }}>
                                {mood.icon} {mood.label} picks
                            </h2>
                            <p className="text-sm font-medium leading-6 opacity-65" style={{ color: theme.primary }}>
                                {mood.guidance}
                            </p>
                        </div>
                        {onClearMood && (
                            <button
                                onClick={onClearMood}
                                className="shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all active:scale-95"
                                style={{ color: theme.primary, borderColor: `${theme.primary}12` }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <div className="px-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.26em] opacity-45" style={{ color: theme.primary }}>
                        What are you craving?
                    </p>
                </div>

                {/* Modern Category Quick Rail */}
                <div className="flex overflow-x-auto no-scrollbar gap-3 px-1 pb-2 pt-1 -mx-2 pl-2 snap-x">
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;
                        return (
                            <button
                                key={`rail-${category.id}`}
                                onClick={() => onCategoryClick(category.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap snap-start border shrink-0 transition-all active:scale-95 ${
                                    isActive 
                                    ? "shadow-md" 
                                    : "bg-white/60 hover:bg-white/90 backdrop-blur-md"
                                }`}
                                style={
                                    isActive 
                                        ? { backgroundColor: theme.primary, borderColor: theme.primary, color: theme.background } 
                                        : { color: theme.primary, borderColor: `${theme.primary}12` }
                                }
                            >
                                <span className="text-sm drop-shadow-sm">{category.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{category.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="relative rounded-[2rem] border bg-white/88 backdrop-blur-xl shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden"
                    style={{ borderColor: `${theme.primary}12` }}
                >
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 opacity-40" style={{ color: theme.primary }} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Try coffee, burger, pizza..."
                        className="w-full bg-transparent py-5 pl-14 pr-5 text-sm font-black tracking-[0.08em] focus:outline-none placeholder:font-bold"
                        style={{ color: theme.primary }}
                    />
                </div>
            </section>

            {trendingCategory && !searchTerm.trim() && (
                <motion.button
                    whileHover={{ scale: 1.01, y: -4 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onCategoryClick(trendingCategory.id)}
                    className="relative w-full min-h-[220px] rounded-[2.4rem] overflow-hidden text-left p-6 flex flex-col justify-between shadow-[0_32px_90px_-48px_rgba(15,23,42,0.55)]"
                >
                    <img
                        src={trendingCategory.imageUrl}
                        alt={trendingCategory.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(event) => handleImageError(event, trendingCategory.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl">
                            <Flame className="w-3.5 h-3.5 text-[#F59E0B] mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white">Trending Category</span>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-white/12 border border-white/15 flex items-center justify-center text-white backdrop-blur-xl">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/65 mb-3">
                            Fastest moving picks right now
                        </p>
                        <h2 className="text-4xl font-black tracking-tight leading-none text-white mb-3">
                            {trendingCategory.name}
                        </h2>
                        <p className="text-sm font-medium leading-6 text-white/78 max-w-[260px]">
                            {trendingCategory.tagline}
                        </p>
                    </div>
                </motion.button>
            )}

            {categories.length === 0 ? (
                <div
                    className="rounded-[2rem] border border-dashed bg-white/70 px-6 py-14 text-center"
                    style={{ borderColor: `${theme.primary}15` }}
                >
                    <p className="text-lg font-black tracking-tight mb-2" style={{ color: theme.primary }}>
                        No category match found
                    </p>
                    <p className="text-sm font-medium opacity-60" style={{ color: theme.primary }}>
                        Try searching for burgers, coffee, desserts or snacks.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((category, index) => {
                        const isActive = activeCategory === category.id;

                        return (
                            <motion.button
                                key={category.id}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.03, y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onCategoryClick(category.id)}
                                className="relative aspect-[0.86] rounded-[2rem] overflow-hidden text-left p-5 flex flex-col justify-end group shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)]"
                            >
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(event) => handleImageError(event, category.id)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
                                <div className="absolute top-4 right-4 text-2xl z-10 drop-shadow-lg">
                                    {category.icon}
                                </div>

                                {isActive && (
                                    <motion.div
                                        layoutId="menu-category-highlight"
                                        className="absolute inset-0 rounded-[2rem] border-2 border-white/90 z-20 pointer-events-none"
                                    />
                                )}

                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60 mb-2">
                                        {category.itemCount ? `${category.itemCount} picks` : "Curated"}
                                    </p>
                                    <h3 className="text-[1.45rem] font-black tracking-tight leading-none text-white mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs font-medium leading-5 text-white/76 line-clamp-2">
                                        {category.tagline}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
