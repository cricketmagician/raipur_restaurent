"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDirectImageUrl } from "@/utils/image";

interface FlyItem {
    id: string;
    imageUrl: string;
    startX: number;
    startY: number;
}

export function AddEffect() {
    const [items, setItems] = useState<FlyItem[]>([]);

    const triggerFly = useCallback((detail: any) => {
        const { id, imageUrl, x, y } = detail;
        const newItem = {
            id: `${id}-${Date.now()}`,
            imageUrl: getDirectImageUrl(imageUrl),
            startX: x,
            startY: y
        };
        setItems(prev => [...prev, newItem]);
    }, []);

    useEffect(() => {
        window.addEventListener("trigger_fly", (e: any) => triggerFly(e.detail));
        return () => window.removeEventListener("trigger_fly", (e: any) => triggerFly(e.detail));
    }, [triggerFly]);

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            <AnimatePresence>
                {items.map((item) => (
                    <FlyThumbnail 
                        key={item.id} 
                        item={item} 
                        onComplete={() => removeItem(item.id)} 
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function FlyThumbnail({ item, onComplete }: { item: FlyItem, onComplete: () => void }) {
    // Target is the cart button in GlobalHeader
    // We'll estimate or try to find its position. Usually it's top right.
    // In our GlobalHeader max-width is 520px centered.
    
    const [targetPos, setTargetPos] = useState({ x: window.innerWidth / 2 + 200, y: 40 });

    useEffect(() => {
        const cartBtn = document.getElementById("header-cart-button");
        if (cartBtn) {
            const rect = cartBtn.getBoundingClientRect();
            setTargetPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }
    }, []);

    return (
        <motion.div
            initial={{ 
                x: item.startX - 30, // Offset to center from click
                y: item.startY - 30,
                scale: 0.5,
                opacity: 0 
            }}
            animate={{ 
                x: [item.startX - 30, item.startX - 100, targetPos.x - 20],
                y: [item.startY - 30, item.startY - 200, targetPos.y - 20],
                scale: [0.5, 1.2, 0.2],
                opacity: [0, 1, 1, 0.5],
                rotate: [0, -10, 20]
            }}
            transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for snappy feel
                times: [0, 0.4, 1]
            }}
            onAnimationComplete={onComplete}
            className="fixed w-10 h-10 rounded-full overflow-hidden shadow-2xl border-2 border-white z-[200] bg-white"
        >
            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
        </motion.div>
    );
}

// Helper hook to trigger the effect
export function useAddEffectTrigger() {
    return useCallback((id: string, imageUrl: string, event: React.MouseEvent | MouseEvent | any) => {
        const x = event.clientX || (event.touches ? event.touches[0].clientX : 0);
        const y = event.clientY || (event.touches ? event.touches[0].clientY : 0);
        
        window.dispatchEvent(new CustomEvent("trigger_fly", {
            detail: { id, imageUrl, x, y }
        }));
    }, []);
}
