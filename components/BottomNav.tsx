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
        <div className={`fixed inset-x-0 bottom-0 z-[100] transition-all duration-500 ${isHidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"} pointer-events-none`}>
            <div className="mx-3 mb-[calc(env(safe-area-inset-bottom)+0.6rem)]">
                <div
                    className="pointer-events-auto flex items-end justify-between rounded-[1.8rem] border px-3 py-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                    style={{
                        backgroundColor: dockTone,
                        borderColor: "rgba(255,255,255,0.10)",
                    }}
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const isService = item.id === 'service';
                        
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => item.onClick ? item.onClick() : router.push(item.path)}
                                className={`flex flex-col items-center justify-center relative transition-all duration-300 flex-1 rounded-[1rem] ${isService ? "-mt-4 py-3.5" : "py-2"} ${isActive ? "bg-white/8" : "bg-transparent"}`}
                            >
                                <div
                                    className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                                        isService
                                            ? "h-12 w-12 bg-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                                            : "h-9 w-9"
                                    }`}
                                >
                                    <item.icon
                                        className={`transition-all duration-300 ${
                                            isService ? "h-[26px] w-[26px]" : "w-5 h-5"
                                        }`}
                                        style={{
                                            color: isActive ? highlightTone : isService ? "#FFF7ED" : "rgba(255,255,255,0.62)",
                                        }}
                                        strokeWidth={isService ? 2.3 : isActive ? 2.4 : 2}
                                    />
                                </div>
                                {!isService && (
                                    <span
                                        className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] transition-colors"
                                        style={{ color: isActive ? highlightTone : "rgba(255,255,255,0.55)" }}
                                    >
                                        {item.label}
                                    </span>
                                )}
                                {isService && (
                                    <span className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/65 transition-colors">
                                        {item.label}
                                    </span>
                                )}
                                
                                {isActive && !isService && (
                                    <motion.div 
                                        layoutId="footerActive"
                                        className="absolute -bottom-0.5 h-1 w-8 rounded-full"
                                        style={{ backgroundColor: highlightTone }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
