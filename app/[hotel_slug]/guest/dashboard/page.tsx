"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Minus,
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
    X,
    Bell,
    Droplets,
    UtensilsCrossed,
    MapPin,
    Home,
    ShoppingBag as CartIcon
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
    getRoomAccessState,
    useSpecialOffers
} from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";
import { CartOverlay } from "@/components/CartOverlay";
import { useAddEffectTrigger } from "@/components/AddEffect";
import { useTheme, getTimeTheme } from "@/utils/themes";

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { roomNumber: tableNumber, checkedInAt, orderMode, switchToDineIn, switchToTakeaway } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { cart, updateQuantity, cartCount, clearCart } = useCart(branding?.id);
    const { offers, loading: offersLoading } = useSpecialOffers(branding?.id);
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);
    const theme = useTheme(branding);
    const timeTheme = getTimeTheme();

    const [activeCategory, setActiveCategory] = useState("all");
    const [showCart, setShowCart] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isOrdering, setIsOrdering] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const triggerFly = useAddEffectTrigger();

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
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
            window.dispatchEvent(new CustomEvent("guest_show_toast", { detail: { message: "Sold out", type: "error" } }));
            return;
        }
        updateQuantity(item.id, (cart[item.id] || 0) + 1);
        if (e && triggerFly) {
            triggerFly(item.id, item.image_url || '', e);
        }
    };

    const removeFromCart = (item: any) => {
        const currentQty = cart[item.id] || 0;
        if (currentQty <= 0) return;
        updateQuantity(item.id, currentQty - 1);
    };

    const handleOrder = async () => {
        if (!branding?.id) return;
        setIsOrdering(true);
        
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
            window.dispatchEvent(new CustomEvent("guest_show_toast", { detail: { message: "Order failed", type: "error" } }));
        } else {
            setOrderSuccess(true);
            clearCart();
            setShowCart(false);
            setTimeout(() => setOrderSuccess(false), 5000);
        }
    };

    const filteredItems = useMemo(() => {
        return availableMenuItems.filter(i => 
            (activeCategory === 'all' || normalizeCategoryKey(i.category) === activeCategory) &&
            (i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             i.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [availableMenuItems, activeCategory, searchQuery]);

    if (loading || menuLoading) return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
            <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="w-10 h-10 border-4 border-[#C8A96A] border-t-transparent rounded-full shadow-lg" 
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#C8A96A] selection:text-white pb-32 font-sans overflow-x-hidden">
            
            {/* Success Animation Overlay */}
            <AnimatePresence>
                {orderSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F3D2E] px-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-center space-y-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-[#C8A96A] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(200,169,106,0.3)]">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black italic text-white tracking-tighter">Handcrafted with Love.</h1>
                                <p className="text-[#C8A96A] text-sm font-black uppercase tracking-[0.3em]">Order Placed Successfully</p>
                            </div>
                            <p className="text-white/40 text-xs italic font-medium leading-relaxed">"Your journey of flavors begins now. Sit back and enjoy the anticipation."</p>
                            <button onClick={() => setOrderSuccess(false)} className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] pt-8">Close</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. CINEMATIC HERO (Entry Experience) */}
            <section className="relative h-[90vh] w-full overflow-hidden">
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0"
                >
                    <img 
                        src={getDirectImageUrl(branding?.heroImage || heroItem?.image_url)} 
                        className="w-full h-full object-cover"
                        alt="Hero background"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D2E]/40 via-transparent to-[#0A0A0A]" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-white text-lg font-bold tracking-widest uppercase opacity-80">{timeTheme.greeting}</h2>
                        <h1 className="text-white text-5xl font-black italic tracking-tighter leading-[0.9] drop-shadow-2xl">
                            {timeTheme.subtext.split('.')[0]}
                        </h1>
                        <p className="text-white/80 text-sm font-medium italic opacity-60">"You deserve something amazing today."</p>
                        
                        <div className="pt-8">
                            <motion.button 
                                whileTap={{ scale: 0.96 }}
                                className="bg-white/20 border border-white/40 px-8 py-4 rounded-full text-white text-xs font-black uppercase tracking-[0.3em] shadow-2xl"
                                onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                            >
                                Explore Menu →
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <main className="max-w-md mx-auto relative z-10 -mt-20 pb-32">
                
                {/* 4. LIQUID CATEGORY NAV (Floating Pills) */}
                <section className="sticky top-[80px] z-50 mb-12">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 py-4">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 shrink-0 shadow-lg ${
                                    activeCategory === cat.id 
                                    ? "bg-[#C8A96A] text-white scale-105 shadow-[#C8A96A]/20" 
                                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                                {activeCategory === cat.id && (
                                    <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 5. CHEF'S PICKS (Instagram Reel Cards) */}
                <section className="px-6 space-y-8 mb-16">
                    <div className="flex items-center justify-between">
                        <h4 className="text-2xl font-black italic tracking-tight text-white">Chef's Picks</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]">For You</span>
                    </div>
                    
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6">
                        {mostOrderedItems.map((item) => (
                            <motion.div 
                                key={item.id}
                                whileHover={{ y: -10 }}
                                className="min-w-[80%] aspect-[3/4] rounded-[2.5rem] overflow-hidden relative shadow-2xl group border border-black/5 cursor-pointer"
                                onClick={() => setSelectedProduct(item)}
                            >
                                <img src={getDirectImageUrl(item.image_url)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={item.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                                
                                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-[2px] bg-[#C8A96A]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Recommended</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter leading-tight">{item.title}</h3>
                                    <p className="text-white/60 text-[11px] font-medium leading-relaxed italic opacity-80">"Rich. Creamy. Unforgettable."</p>
                                    <div className="pt-4 flex items-center justify-between">
                                        <span className="text-xl font-black text-white">₹{item.price}</span>
                                        <div className="flex items-center gap-2">
                                            {cart[item.id] > 0 ? (
                                                <div className="flex items-center gap-3 bg-white/20 border border-white/20 rounded-full p-1 shadow-lg">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item); }} 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-black text-white min-w-[1rem] text-center">{cart[item.id]}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); addToCart(item, e as any); }} 
                                                        className="w-8 h-8 rounded-full bg-[#C8A96A] text-white shadow-md hover:scale-105 active:scale-95"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); addToCart(item, e as any); }}
                                                    className="bg-[#C8A96A] px-5 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 6. FULL MENU = "CONTENT CARDS" (Apple Style) */}
                <section className="px-6 space-y-12">
                    <div className="flex items-center gap-6">
                                <div className="h-[1px] flex-1 bg-white/5" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Explore Journey</h4>
                                <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {filteredItems.map((item) => (
                            <motion.div 
                                key={item.id}
                                layout
                                className="flex items-center gap-6 group cursor-pointer"
                                onClick={() => setSelectedProduct(item)}
                            >
                                {/* Left: High-impact Image */}
                                <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border border-black/5 relative shrink-0">
                                    <img src={getDirectImageUrl(item.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                </div>
                                
                                {/* Right: Product Story */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-lg font-black italic tracking-tighter text-white">{item.title}</h5>
                                        <span className="text-[#C8A96A] font-black text-sm px-2">₹{item.price}</span>
                                    </div>
                                    <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2 italic font-medium">
                                        {item.description || "Handcrafted with premium ingredients and curated balance."}
                                    </p>
                                    
                                    <div className="pt-2">
                                        <AnimatePresence mode="wait">
                                            {cart[item.id] > 0 ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center gap-4 bg-white/10 rounded-full p-1 border border-white/10 shadow-lg w-fit"
                                                >
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeFromCart(item); }} 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xs font-black min-w-[1rem] text-center">{cart[item.id]}</span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); addToCart(item, e as any); }} 
                                                        className="w-8 h-8 rounded-full bg-[#C8A96A] text-white shadow-md"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); addToCart(item, e as any); }}
                                                    className="px-6 py-2.5 bg-[#C8A96A] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    + Add to Bag
                                                </button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Apple Story Mode: Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[150] bg-[#0A0A0A] flex flex-col overflow-y-auto no-scrollbar"
                        >
                        {/* Header: Absolute Close */}
                        <div className="fixed top-0 left-0 right-0 z-[160] p-8 flex justify-end">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedProduct(null)}
                                className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white"
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                        </div>

                        {/* Top: Massive Visuals */}
                        <section className="relative h-[60vh] w-full shrink-0">
                            <img 
                                src={getDirectImageUrl(selectedProduct.image_url)} 
                                className="w-full h-full object-cover" 
                                alt={selectedProduct.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/20" />
                        </section>

                        {/* Bottom: The Story */}
                        <section className="px-8 -mt-20 relative z-10 space-y-12 pb-32">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-[#C8A96A] fill-[#C8A96A]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Signature Masterpiece</span>
                                </div>
                                <h2 className="text-5xl font-black italic tracking-tighter text-white leading-none">{selectedProduct.title}</h2>
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-black text-white">₹{selectedProduct.price}</span>
                                        <div className="h-6 w-[1px] bg-white/10" />
                                        <div className="flex items-center gap-1">
                                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                            <span className="text-[10px] font-black uppercase text-white/40">450 kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">The Experience</h3>
                                <p className="text-2xl font-medium italic text-white/80 leading-snug">
                                    {selectedProduct.description || "A symphony of textures and flavors, handcrafted with premium ingredients for the ultimate sensory delight."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-2">
                                    <Clock className="w-6 h-6 text-[#C8A96A]" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Prep Time</h4>
                                    <p className="text-sm font-black text-white">12-15 Mins</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-2">
                                    <Star className="w-6 h-6 text-[#C8A96A]" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Rating</h4>
                                    <p className="text-sm font-black text-white">4.9 / 5.0</p>
                                </div>
                            </div>

                            {/* Floating Action Bar */}
                            <div className="fixed bottom-10 left-8 right-8 z-[160]">
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-[#0F3D2E] rounded-[2.5rem] p-4 flex items-center justify-between shadow-2xl"
                                >
                                    <div className="flex items-center gap-4 bg-white/10 rounded-full p-1 border border-white/10 ml-2">
                                        <button 
                                            onClick={() => removeFromCart(selectedProduct)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-80 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="text-lg font-black text-white min-w-[1.5rem] text-center">{cart[selectedProduct.id] || 0}</span>
                                        <button 
                                            onClick={(e) => addToCart(selectedProduct, e as any)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-80 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (!cart[selectedProduct.id]) addToCart(selectedProduct);
                                            setSelectedProduct(null);
                                        }}
                                        className="bg-[#C8A96A] text-white px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl flex-1 ml-4"
                                    >
                                        {cart[selectedProduct.id] > 0 ? "Done" : "Add to Journey"}
                                    </button>
                                </motion.div>
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

