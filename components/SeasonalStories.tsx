"use client";

import React from "react";
import { motion } from "framer-motion";
import { SeasonalStory } from "@/utils/store";
import { getDirectImageUrl } from "@/utils/image";

interface SeasonalStoriesProps {
    stories: SeasonalStory[];
    onStoryClick: (story: SeasonalStory) => void;
    loading?: boolean;
}

export function SeasonalStories({ stories, onStoryClick, loading }: SeasonalStoriesProps) {
    if (loading) {
        return (
            <div className="space-y-4 py-4">
                <div className="px-4">
                    <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[220px] h-[250px] rounded-[1.8rem] bg-slate-200 animate-pulse shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    if (!stories || stories.length === 0) return null;

    return (
        <section className="space-y-4 py-4">
            <div className="flex items-end justify-between gap-3 px-4">
                <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] opacity-45 text-[#0F3D2E]">
                        Seasonal Stories
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-[#0F3D2E]">
                        Tap a story to open the feature.
                    </h3>
                </div>
                <span className="rounded-full border border-[#C8A96A]/20 bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-[#C8A96A] shadow-sm">
                    Live
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-1 snap-x snap-mandatory">
                {stories.map((story) => (
                    <button
                        key={story.id}
                        onClick={() => onStoryClick(story)}
                        className="min-w-[220px] snap-center overflow-hidden rounded-[1.8rem] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] border border-black/5 text-left group active:scale-[0.98] transition-transform"
                    >
                        <div className="relative h-[250px] overflow-hidden">
                            <img
                                src={getDirectImageUrl(story.image_url) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format"}
                                alt={story.label}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
                            <div className="absolute left-4 top-4 rounded-full bg-white/18 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-md">
                                {story.type || "Story"}
                            </div>
                            <div className="absolute inset-x-4 bottom-4 space-y-2 text-white">
                                <h4 className="text-[1.35rem] font-black tracking-tight leading-[1.02]">
                                    {story.label}
                                </h4>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/72">
                                        {story.price ? `₹${story.price}` : "Story highlight"}
                                    </span>
                                    <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#0F3D2E]">
                                        Open
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
