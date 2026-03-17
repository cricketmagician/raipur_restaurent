"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AddEffect } from "@/components/AddEffect";
import { useEffect } from "react";
import { initAudioContext } from "@/utils/audio";
import { GuestAuthWrapper } from "./GuestAuthWrapper";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    useEffect(() => {
        const unlock = () => {
            console.log("AudioContext unlocking...");
            initAudioContext();
        };
        window.addEventListener("click", unlock, { once: true });
        window.addEventListener("touchstart", unlock, { once: true });
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-[100dvh] bg-[#FAF7F2] text-slate-900 antialiased pb-24 overflow-x-hidden pt-safe">
            <GlobalHeader />
            <AddEffect />

            {/* Ambient Background Gradient - Refined for Warm Theme */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#B8860B08,_transparent_60%)]"></div>

            <GuestAuthWrapper>
                <main className="flex-1 w-full max-w-md mx-auto relative px-5 pt-32">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 10, scale: 0.99 }} // Horizontal slide for native feel
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.99 }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <BottomNav />
            </GuestAuthWrapper>
        </div>
    );
}
