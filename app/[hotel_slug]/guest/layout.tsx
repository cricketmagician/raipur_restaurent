"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AddEffect } from "@/components/AddEffect";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { useEffect } from "react";
import { initAudioContext } from "@/utils/audio";
import { GuestAuthWrapper } from "./GuestAuthWrapper";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useHotelBranding, useCart } from "@/utils/store";
import { ServiceHubOverlay } from "@/components/ServiceHubOverlay";
import { Toast } from "@/components/Toast";
import { useGuestRoom } from "./GuestAuthWrapper";

import { useTheme } from "@/utils/themes";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const isDashboard = pathname?.endsWith("/dashboard");
    const { cartCount } = useCart(branding?.id);
    const { roomNumber: tableNumber } = useGuestRoom();
    
    const [showServiceHub, setShowServiceHub] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    useEffect(() => {
        const handleOpenService = () => setShowServiceHub(true);
        const handleShowToast = (e: any) => {
            const { message, type } = e.detail;
            setToast({ message, type: type || 'success', isVisible: true });
        };
        window.addEventListener("guest_open_service_hub", handleOpenService);
        window.addEventListener("guest_show_toast", handleShowToast);
        return () => {
            window.removeEventListener("guest_open_service_hub", handleOpenService);
            window.removeEventListener("guest_show_toast", handleShowToast);
        };
    }, []);

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
        <div 
            className={`flex flex-col min-h-[100dvh] text-slate-900 antialiased pb-[70px] overflow-x-hidden pt-safe transition-colors duration-500`}
            style={{ backgroundColor: isDashboard ? 'transparent' : theme.background }}
        >
            <GuestAuthWrapper>
                <GlobalHeader />
                <AddEffect />
                <QuickActionFAB />

                {/* Ambient Background Gradient - Refined for Theme */}
                {!isDashboard && (
                    <div 
                        className="fixed inset-0 -z-10 opacity-30"
                        style={{ backgroundImage: `radial-gradient(circle at top right, ${theme.secondary}66, transparent 60%)` }}
                    ></div>
                )}

                <main className={`flex-1 w-full relative ${isDashboard ? 'pt-0' : 'pt-28'}`}>
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

                <ServiceHubOverlay 
                    isOpen={showServiceHub}
                    onClose={() => setShowServiceHub(false)}
                    branding={branding}
                    tableNumber={tableNumber}
                    cartCount={cartCount}
                    onShowBag={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                    setToast={setToast}
                />

                <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
            </GuestAuthWrapper>
        </div>
    );
}
