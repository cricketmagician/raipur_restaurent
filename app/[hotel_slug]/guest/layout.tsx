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
import { useHotelBranding, useCart, useSupabaseMenuItems, addSupabaseRequest } from "@/utils/store";
import { ServiceHubOverlay } from "@/components/ServiceHubOverlay";
import { CartOverlay } from "@/components/CartOverlay";
import { OrderSuccessOverlay } from "@/components/OrderSuccessOverlay";
import { Toast } from "@/components/Toast";
import { useGuestRoom } from "./GuestAuthWrapper";

import { useTheme } from "@/utils/themes";

function GuestLayoutContent({ children, hotelSlug, branding, theme, isDashboard, pathname }: { 
    children: React.ReactNode; 
    hotelSlug: string; 
    branding: any; 
    theme: any; 
    isDashboard: boolean;
    pathname: string;
}) {
    const { cartCount } = useCart(branding?.id);
    const { roomNumber: tableNumber, orderMode } = useGuestRoom();
    
    const [showServiceHub, setShowServiceHub] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    const { menuItems } = useSupabaseMenuItems(branding?.id);
    const { cart, updateQuantity, clearCart } = useCart(branding?.id);

    const cartTotal = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = menuItems.find(m => m.id === id);
        return sum + ((item?.price || 0) * (q as number));
    }, 0);

    const handleOrder = async (details: { name: string; phone: string; table: string; mode: string }) => {
        if (!branding?.id) return;
        setIsOrdering(true);
        
        const cartItemsData = Object.entries(cart).map(([id, q]) => {
            const item = menuItems.find(m => m.id === id);
            return { id, title: item?.title || 'Unknown', quantity: q, price: item?.price || 0, total: (item?.price || 0) * (q as number) };
        });

        const { error } = await addSupabaseRequest(branding.id, {
            room: details.table || tableNumber || 'Unknown',
            type: details.mode === 'takeaway' ? "Takeaway Order" : "Dining Order",
            notes: `Guest: ${details.name} (${details.phone}) | items: ` + cartItemsData.map(item => `${item.title} x${item.quantity}`).join(", "),
            total: cartTotal,
            price: cartTotal,
            items: cartItemsData
        });

        setIsOrdering(false);
        if (error) {
            setToast({ message: `Order Failed: ${error.message}`, type: "error", isVisible: true });
        } else {
            setShowCart(false);
            setShowSuccess(true);
            clearCart();
            setTimeout(() => setShowSuccess(false), 5000);
        }
    };

    useEffect(() => {
        const handleOpenService = () => setShowServiceHub(true);
        const handleOpenCart = () => setShowCart(true);
        const handleShowToast = (e: any) => {
            const { message, type } = e.detail;
            setToast({ message, type: type || 'success', isVisible: true });
        };
        window.addEventListener("guest_open_service_hub", handleOpenService);
        window.addEventListener("open_cart", handleOpenCart);
        window.addEventListener("guest_show_toast", handleShowToast);
        return () => {
            window.removeEventListener("guest_open_service_hub", handleOpenService);
            window.removeEventListener("open_cart", handleOpenCart);
            window.removeEventListener("guest_show_toast", handleShowToast);
        };
    }, []);

    return (
        <>
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

            <CartOverlay 
                isOpen={showCart} 
                onClose={() => setShowCart(false)}
                cart={cart}
                updateQuantity={updateQuantity}
                cartTotal={cartTotal}
                isOrdering={isOrdering}
                onOrder={handleOrder}
                hotelId={branding?.id}
                menuItems={menuItems}
                defaultTable={tableNumber}
                defaultMode={orderMode}
            />

            <OrderSuccessOverlay 
                isVisible={showSuccess}
                onClose={() => setShowSuccess(false)}
            />
        </>
    );
}

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
                <GuestLayoutContent 
                    hotelSlug={hotelSlug} 
                    branding={branding} 
                    theme={theme} 
                    isDashboard={isDashboard}
                    pathname={pathname}
                >
                    {children}
                </GuestLayoutContent>
            </GuestAuthWrapper>
        </div>
    );
}

