"use client";

import React from "react";
import { Home, Utensils, ClipboardList, Receipt, Bell } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useHotelBranding } from "@/utils/store";

export function BottomNav() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const [isHidden, setIsHidden] = React.useState(false);
    const dockTone = "rgba(15,61,46,0.96)";
    const highlightTone = "#F59E0B";

    const isHiddenPath = pathname?.includes('/guest/item/') || pathname?.endsWith('/guest/checkout');

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: `/${hotelSlug}/guest/dashboard` },
        { id: "menu", label: "Menu", icon: Utensils, path: `/${hotelSlug}/guest/restaurant` },
        { id: "service", label: "Service", icon: Bell, path: "#", onClick: () => window.dispatchEvent(new CustomEvent("guest_open_service_hub")) },
        { id: "status", label: "Status", icon: ClipboardList, path: `/${hotelSlug}/guest/status` },
        { id: "bill", label: "Bill", icon: Receipt, path: `/${hotelSlug}/guest/bill` },
    ];

    React.useEffect(() => {
        const handleVisibility = (event: Event) => {
            const customEvent = event as CustomEvent<{ hidden?: boolean }>;
            setIsHidden(!!customEvent.detail?.hidden);
        };

        window.addEventListener("guest_footer_visibility", handleVisibility as EventListener);
        return () => window.removeEventListener("guest_footer_visibility", handleVisibility as EventListener);
    }, []);

    return (
        <div className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ${(isHidden || isHiddenPath) ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"} pointer-events-none flex justify-center`}>
            <div className="w-full max-w-[480px] relative pb-[env(safe-area-inset-bottom)] pt-8">
                
                {/* Background with Cutout */}
                <div 
                    className="absolute inset-x-0 bottom-[env(safe-area-inset-bottom)] top-8 z-0 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.18)]"
                    style={{
                        backgroundColor: dockTone,
                        borderTopLeftRadius: "1.8rem",
                        borderTopRightRadius: "1.8rem",
                        WebkitMaskImage: `radial-gradient(circle 42px at 50% 4px, transparent 42px, black 42.5px)`,
                        maskImage: `radial-gradient(circle 42px at 50% 4px, transparent 42px, black 42.5px)`,
                    }}
                >
                    {/* Subtle top border reflection */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
                </div>

                {/* Nav Items (Overlayed) */}
                <div className="relative z-10 pointer-events-auto flex items-end justify-between px-2 h-[72px]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const isService = item.id === 'service';
                        
                        return (
                            <div key={item.id} className="flex-1 flex justify-center">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        if (window.navigator?.vibrate) {
                                            window.navigator.vibrate(40);
                                        }
                                        if (item.onClick) item.onClick();
                                        else router.push(item.path);
                                    }}
                                    className={`flex flex-col items-center justify-center relative transition-all duration-300 ${isService ? "absolute -top-[22px] left-1/2 -translate-x-1/2" : "w-full py-2.5 rounded-[1.2rem]"} ${isActive && !isService ? "bg-white/10 shadow-inner" : "bg-transparent"}`}
                                >
                                    <div
                                        className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                                            isService
                                                ? "bg-[#C8A96A] text-white w-[60px] h-[60px] shadow-[0_10px_20px_rgba(200,169,106,0.4)]"
                                                : "w-10 h-10"
                                        }`}
                                    >
                                        <item.icon
                                            className={`transition-all duration-500 ${
                                                isService ? "w-6 h-6 text-white" : isActive ? "w-5 h-5 text-white" : "w-[22px] h-[22px] text-white/50"
                                            }`}
                                        />
                                    </div>
                                    {!isService && (
                                        <span
                                            className={`text-[9px] mt-1 font-bold uppercase tracking-widest transition-all duration-300 ${
                                                isActive ? "text-white" : "text-white/50"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isService && (
                                        <motion.div 
                                            layoutId="footerActive"
                                            className="absolute -bottom-0.5 h-1 w-8 rounded-full bg-white/30"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
