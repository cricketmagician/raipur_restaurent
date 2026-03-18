"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MinimalMenuItemCard } from "@/components/MinimalMenuItemCard";

interface MoodItemsGridProps {
    items: any[];
    moodName: string;
    cart: Record<string, number>;
    onAdd: (item: any) => void;
    onRemove: (item: any) => void;
    onItemClick: (item: any) => void;
}

export function MoodItemsGrid({ items, moodName, cart, onAdd, onRemove, onItemClick }: MoodItemsGridProps) {
    if (!items?.length) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.section 
                key={moodName} // Re-animate when mood changes
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4 pt-2 pb-6"
            >
                <div className="flex items-center gap-2 px-1">
                    <h4 className="text-xl font-black tracking-tight text-[#0F3D2E]">{moodName} Picks</h4>
                    <div className="flex-1 h-[1px] bg-[#0F3D2E]/10 ml-4" />
                </div>
                
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MinimalMenuItemCard 
                                item={item} 
                                quantity={cart[item.id] || 0}
                                onAdd={() => onAdd(item)}
                                onRemove={() => onRemove(item)}
                                onClick={() => onItemClick(item)}
                            />
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </AnimatePresence>
    );
}
