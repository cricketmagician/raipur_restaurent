"use client";

import React from "react";
import { Home, Utensils, ClipboardList, Receipt, ShoppingBag, ChevronRight, Bell } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding, useCart } from "@/utils/store";

export function BottomNav() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const [isHidden, setIsHidden] = React.useState(false);

    const { cartCount, cartTotal } = useCart(branding?.id);

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
        <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-500 ${isHidden ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>
            {/* Navigation Hub: Full Width Bottom Bar */}
            <div className="w-full">
                <div 
                    className="bg-[#0F3D2E] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] px-6 py-2 flex items-center justify-between border-t border-white/5"
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const isService = item.id === 'service';
                        
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => item.onClick ? item.onClick() : router.push(item.path)}
                                className={`flex flex-col items-center justify-center relative transition-all duration-300 ${
                                    isService 
                                        ? 'w-16 h-16 bg-[#C8A96A] rounded-full -mt-12 border-4 border-[#F5F1E8] shadow-xl' 
                                        : 'flex-1 py-1'
                                }`}
                            >
                                <item.icon 
                                    className={`${isService ? 'w-7 h-7' : 'w-5 h-5'} transition-all duration-300 ${
                                        isActive || isService ? 'text-white' : 'text-white/40'
                                    }`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {!isService && (
                                    <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-1 transition-colors ${
                                        isActive ? 'text-[#C8A96A]' : 'text-white/40'
                                    }`}>
                                        {item.label}
                                    </span>
                                )}
                                
                                {isActive && !isService && (
                                    <motion.div 
                                        layoutId="footerActive"
                                        className="absolute -bottom-1 w-1 h-1 bg-[#C8A96A] rounded-full"
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
