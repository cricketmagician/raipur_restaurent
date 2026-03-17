"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Search, 
    ShoppingBag, 
    ChevronRight, 
    Star, 
    Flame, 
    Clock, 
    ChevronLeft,
    HandPlatter,
    Info,
    CheckCircle2,
    X
} from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    useHotelBranding, 
    useSupabaseRequests, 
    addSupabaseRequest, 
    useCart, 
    useSupabaseMenuItems, 
    useMenuCategories, 
    deriveMenuCategories, 
    normalizeCategoryKey, 
    getRoomAccessState 
} from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";
import { CartOverlay } from "@/components/CartOverlay";
import { useAddEffectTrigger } from "@/components/AddEffect";
import { useTheme } from "@/utils/themes";

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { roomNumber: tableNumber, checkedInAt, orderMode } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id);
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);
    const theme = useTheme(branding);

    const [activeCategory, setActiveCategory] = useState("all");
    const [showCart, setShowCart] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    const triggerFly = useAddEffectTrigger();

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);
    
    // Derived Data
    const availableMenuItems = useMemo(
        () => menuItems.filter((item) => item.is_available !== false),
        [menuItems]
    );

    const categories = useMemo(() => {
        const derived = deriveMenuCategories(menuItems);
        return [
            { id: "all", name: "All", icon: "🍱" },
            ...derived.map(cat => ({
                id: normalizeCategoryKey(cat.slug || cat.name),
                name: cat.name,
                icon: cat.icon_emoji || "🍽️"
            }))
        ];
    }, [menuItems]);

    const heroItem = useMemo(() => {
        return availableMenuItems.find(i => i.is_recommended) || availableMenuItems[0];
    }, [availableMenuItems]);

    const mostOrderedItems = useMemo(() => {
        return availableMenuItems.filter(i => i.is_popular).slice(0, 5);
    }, [availableMenuItems]);

    const cartTotal = useMemo(() => {
        return Object.entries(cart).reduce((sum, [id, q]) => {
            const item = availableMenuItems.find(m => m.id === id);
            return sum + ((item?.price || 0) * q);
        }, 0);
    }, [cart, availableMenuItems]);

    const addToCart = (item: any, e?: React.MouseEvent) => {
        if (!item.is_available) {
            setToast({ message: "Sold out", type: "error", isVisible: true });
            return;
        }
        updateQuantity(item.id, (cart[item.id] || 0) + 1);
        if (e && triggerFly) {
            triggerFly(item.id, item.image_url || '', e);
        }
        setToast({ message: `Added ${item.title} to bag`, type: "success", isVisible: true });
    };

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        
        // Simulating friction/confirm if needed, but here we proceed to API
        const { error } = await addSupabaseRequest(branding.id, {
            room: tableNumber,
            type: `Dining Order`,
            notes: Object.entries(cart).map(([id, q]) => {
                const item = availableMenuItems.find(m => m.id === id);
                return `${q}x ${item?.title}`;
            }).join(", "),
            status: "Pending",
            price: cartTotal,
            total: cartTotal,
            items: Object.entries(cart).map(([id, q]) => {
                const item = availableMenuItems.find(m => m.id === id);
                return { id, title: item?.title, quantity: q, price: item?.price, total: (item?.price || 0) * q };
            })
        });

        setIsOrdering(false);
        if (error) {
            setToast({ message: "Order failed", type: "error", isVisible: true });
        } else {
            setToast({ message: "Order placed!", type: "success", isVisible: true });
            clearCart();
            setShowCart(false);
        }
    };

    if (loading || menuLoading) return (
        <div className="min-h-screen bg-[#0F0A08] flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0F0A08] text-[#F5F5DC] selection:bg-accent selection:text-primary pb-32">
            
            {/* 1. TOP BAR */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0F0A08]/95 backdrop-blur-md border-b border-accent/10 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-md mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <span className="text-xl">☰</span>
                        </button>
                        <h1 className="text-2xl font-black tracking-tighter italic text-white">{branding?.name || "Hutgood"}</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[#1A1512] rounded-full p-1 border border-accent/10 text-[10px] font-black uppercase tracking-widest">
                            <button className={`px-3 py-1.5 rounded-full transition-all ${orderMode === 'dine-in' ? 'bg-accent text-primary' : 'text-white/40'}`}>Dine-in</button>
                            <button className={`px-3 py-1.5 rounded-full transition-all ${orderMode === 'takeaway' ? 'bg-accent text-primary' : 'text-white/40'}`}>Takeaway</button>
                        </div>
                        <button onClick={() => setShowCart(true)} className="relative w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary shadow-lg shadow-accent/20">
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 pt-24 space-y-8">
                
                {/* 2. HERO CARD (Zomato Style) */}
                <AnimatePresence mode="wait">
                    {heroItem && (
                        <motion.section 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative rounded-[2.5rem] overflow-hidden bg-[#1A1512] border border-accent/10 group shadow-2xl"
                        >
                            <div className="aspect-[4/5] relative">
                                <img 
                                    src={getDirectImageUrl(heroItem.image_url)} 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    alt={heroItem.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A08] via-transparent to-black/40" />
                                
                                {/* Label */}
                                <div className="absolute top-6 left-6 px-4 py-2 bg-accent/90 backdrop-blur-md rounded-full flex items-center gap-2 shadow-xl">
                                    <Flame className="w-4 h-4 text-primary fill-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Trending</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2">{heroItem.title}</h2>
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Most ordered this evening</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-accent/10">
                                    <span className="text-2xl font-black text-accent">₹{heroItem.price}</span>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => addToCart(heroItem, e as any)}
                                        className="px-8 py-4 bg-accent text-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:brightness-110 transition-all"
                                    >
                                        Add to Bag
                                    </motion.button>
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* 3. QUICK CATEGORY STRIP */}
                <section className="relative overflow-visible">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className="flex flex-col items-center gap-3 shrink-0 group"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                                    activeCategory === cat.id 
                                    ? "bg-accent border-2 border-white scale-110 shadow-xl shadow-accent/20" 
                                    : "bg-[#1A1512] border border-accent/10 grayscale group-hover:grayscale-0 group-hover:bg-[#251D18]"
                                }`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeCategory === cat.id ? 'text-accent' : 'text-white/40'}`}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. MOST ORDERED QUICK-ADD BLOCK */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black italic tracking-tight">Most Ordered</h3>
                        <button className="text-accent text-[10px] font-black uppercase tracking-widest">View All</button>
                    </div>
                    <div className="space-y-4">
                        {mostOrderedItems.map((item) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-4 rounded-3xl bg-[#1A1512] border border-accent/5"
                            >
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                                    <img src={getDirectImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white truncate">{item.title}</h4>
                                    <p className="text-accent font-black text-sm">₹{item.price}</p>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => addToCart(item, e as any)}
                                    className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 5. GOURMET LISTING */}
                <section className="space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-accent/20" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Our Full Menu</h3>
                        <div className="h-[1px] flex-1 bg-accent/20" />
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {availableMenuItems
                            .filter(i => activeCategory === 'all' || normalizeCategoryKey(i.category) === activeCategory)
                            .map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    className="group"
                                    onClick={(e) => addToCart(item, e as any)}
                                >
                                    <div className="aspect-video rounded-[2rem] overflow-hidden mb-5 border border-accent/10 relative">
                                        <img 
                                            src={getDirectImageUrl(item.image_url)} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A08]/80 to-transparent" />
                                        <div className="absolute bottom-4 right-4 bg-accent text-primary px-4 py-2 rounded-xl font-black text-xs">
                                            ₹{item.price}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xl font-black tracking-tight text-white">{item.title}</h4>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-accent fill-accent" />
                                                <span className="text-[10px] font-black text-accent">4.9</span>
                                            </div>
                                        </div>
                                        <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">
                                            {item.description || "Artisanal preparation with premium ingredients."}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </section>
            </main>

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
            />

            <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
}

