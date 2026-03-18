"use client";

import React from "react";
import { Home, Utensils, ClipboardList, Receipt, Bell } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";

export function BottomNav() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const [isHidden, setIsHidden] = React.useState(false);
    const dockTone = theme.id === "FINE_DINE" ? "rgba(18,18,18,0.9)" : "rgba(15,61,46,0.88)";

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
            <div className="mx-3 mb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                <div
                    className="pointer-events-auto flex items-center justify-between rounded-[1.55rem] border px-3 py-2 shadow-[0_22px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
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
                                className={`flex flex-col items-center justify-center relative transition-all duration-300 flex-1 py-2 rounded-[1rem] ${isActive ? "bg-white/10" : "bg-transparent"}`}
                            >
                                <item.icon 
                                    className={`transition-all duration-300 ${
                                        isService ? 'w-6 h-6' : 'w-5 h-5'
                                    } ${
                                        isActive ? '' : 'text-white/55'
                                    }`} 
                                    style={isActive ? { color: theme.accent || "#C8A96A" } : undefined}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {!isService && (
                                    <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-1 transition-colors ${
                                        isActive ? '' : 'text-white/55'
                                    }`} style={isActive ? { color: theme.accent || "#C8A96A" } : undefined}>
                                        {item.label}
                                    </span>
                                )}
                                {isService && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.1em] mt-1 text-white/55 transition-colors">
                                        {item.label}
                                    </span>
                                )}
                                
                                {isActive && !isService && (
                                    <motion.div 
                                        layoutId="footerActive"
                                        className="absolute -bottom-0.5 h-1 w-8 rounded-full"
                                        style={{ backgroundColor: theme.accent || "#C8A96A" }}
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
