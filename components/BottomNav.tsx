"use client";

import React from "react";
import { Home, Utensils, ClipboardList, Receipt } from "lucide-react";
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

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: `/${hotelSlug}/guest/dashboard` },
        { id: "menu", label: "Menu", icon: Utensils, path: `/${hotelSlug}/guest/restaurant` },
        { id: "status", label: "Orders", icon: ClipboardList, path: `/${hotelSlug}/guest/status` },
        { id: "bill", label: "Live Bill", icon: Receipt, path: `/${hotelSlug}/guest/bill` },
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
        <div 
            className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[100] px-4 pb-safe pt-3 backdrop-blur-2xl border-t flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.04)] transition-all duration-300 ${isHidden ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
            style={{ 
                backgroundColor: `${theme.background}CC`,
                borderColor: `${theme.primary}10`,
                borderRadius: `${theme.radius} ${theme.radius} 0 0`
            }}
        >
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => router.push(item.path)}
                        className="flex flex-col items-center justify-center space-y-1.5 relative group min-w-[64px]"
                    >
                        <div className={`p-2 rounded-2xl transition-all duration-300 relative ${
                            isActive 
                                ? 'scale-110' 
                                : 'text-slate-400 opacity-60'
                        } ${item.id === 'menu' ? 'p-2.5 -mt-1' : ''}`}
                        style={{ color: isActive ? theme.primary : undefined }}>
                            <item.icon 
                                className={`transition-all duration-300 ${isActive ? 'fill-current' : ''} ${
                                    item.id === 'menu' ? 'w-7 h-7' : 'w-6 h-6'
                                }`} 
                                strokeWidth={item.id === 'menu' ? (isActive ? 2.5 : 2.2) : (isActive ? 2.5 : 2)}
                            />
                            {isActive && (
                                <div 
                                    className="absolute inset-0 blur-xl rounded-full" 
                                    style={{ backgroundColor: `${theme.primary}1a` }} // 10% opacity
                                />
                            )}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors`} style={{ color: isActive ? theme.primary : `${theme.text}66` }}>
                            {item.label}
                        </span>
                        {isActive && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute -bottom-1 w-1.5 h-1.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]"
                                style={{ backgroundColor: theme.primary }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
