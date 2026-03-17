"use client";

import React from "react";
import { Home, Utensils, ClipboardList, Receipt, ShoppingBag, ChevronRight } from "lucide-react";
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
        { id: "bag", label: "Bag", icon: ShoppingBag, path: "#", onClick: () => window.dispatchEvent(new CustomEvent("open_cart")) },
        { id: "status", label: "Orders", icon: ClipboardList, path: `/${hotelSlug}/guest/status` },
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
        <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ${isHidden ? "translate-y-full" : "translate-y-0"}`}>
            {/* Navigation Bar */}
            <div 
                className="w-full px-4 pb-safe pt-2 backdrop-blur-3xl border-t flex items-center justify-around shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                style={{ 
                    backgroundColor: `rgba(255, 255, 255, 0.8)`,
                    borderColor: `${theme.primary}15`,
                    borderRadius: `2rem 2rem 0 0`
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    
                    return (
                        <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => item.onClick ? item.onClick() : router.push(item.path)}
                            className="flex flex-col items-center justify-center py-2 relative group min-w-[64px]"
                        >
                            <div className={`p-1 transition-all duration-300 relative ${
                                isActive 
                                    ? 'scale-110' 
                                    : 'text-slate-400'
                            }`}
                            style={{ color: isActive ? theme.primary : undefined }}>
                                <item.icon 
                                    className={`w-6 h-6 transition-all duration-300 ${isActive ? 'fill-current' : ''}`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                
                                {/* Cart Badge */}
                                {item.id === 'bag' && cartCount > 0 && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-[#00704A] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                    >
                                        {cartCount}
                                    </motion.div>
                                )}

                                {isActive && (
                                    <div 
                                        className="absolute inset-0 blur-xl rounded-full translate-y-2" 
                                        style={{ backgroundColor: `${theme.primary}20` }}
                                    />
                                )}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] mt-1 transition-colors`} style={{ color: isActive ? theme.primary : `rgba(30, 57, 50, 0.4)` }}>
                                {item.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
