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
    useSpecialOffers,
    useMenuSections,
    useHeroes,
    useSeasonalStories
} from "@/utils/store";
import { CategorySectionHeader } from "@/components/CategorySectionHeader";
import { ChefPicksSnapRail } from "@/components/ChefPicksSnapRail";
import { PopularGrid } from "@/components/PopularGrid";
import { IndulgeSection } from "@/components/IndulgeSection";
import { MinimalMenuItemCard } from "@/components/MinimalMenuItemCard";
import { SeasonalStories } from "@/components/SeasonalStories";
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
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    const triggerFly = useAddEffectTrigger();

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { menuItems, loading: menuLoading } = useSupabaseMenuItems(branding?.id);
    const { sections, loading: sectionsLoading } = useMenuSections(branding?.id);
    const { heroes, loading: heroesLoading } = useHeroes(branding?.id);
    const { stories, loading: storiesLoading } = useSeasonalStories(branding?.id);

    // Derived Data
    const availableMenuItems = useMemo(
        () => menuItems.filter((item) => item.is_available !== false),
        [menuItems]
    );

    const categories = useMemo(() => {
        const derived = deriveMenuCategories(menuItems);
        
        // Merge with official menuCategories from DB to get images/icons
        return [
            { 
                id: "all", 
                name: "All", 
                icon: "🍱", 
                image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=256&auto=format" 
            },
            ...derived.map(cat => {
                const official = menuCategories.find(mc => normalizeCategoryKey(mc.name) === cat.slug);
                return {
                    id: cat.slug,
                    name: cat.name,
                    icon: official?.icon_emoji || cat.icon_emoji || "🍽️",
                    image_url: official?.image_url || undefined
                };
            })
        ];
    }, [menuItems, menuCategories]);

    const heroItems = useMemo(() => {
        const activeHeroes = (heroes || []).filter(h => h.is_active);
        if (activeHeroes.length > 0) return activeHeroes;
        return [{ image_url: branding?.heroImage || availableMenuItems[0]?.image_url }];
    }, [heroes, branding, availableMenuItems]);

    React.useEffect(() => {
        if (heroItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroItems.length]);

    const mostOrderedItems = useMemo(() => {
        return availableMenuItems.filter(i => i.is_popular).slice(0, 5);
    }, [availableMenuItems]);

    const cartTotal = useMemo(() => {
        return Object.entries(cart).reduce((sum, [id, q]) => {
            const item = availableMenuItems.find(m => m.id === id);
            return sum + ((item?.price || 0) * (q as number));
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
                return { id, title: item?.title, quantity: q, price: item?.price, total: (item?.price || 0) * (q as number) };
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
        <div className="min-h-screen bg-[#F5F1E8] text-[#0F3D2E] selection:bg-[#C8A96A] selection:text-white pb-32 font-sans overflow-x-hidden">
            
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

            {/* 2. MINIMAL AUTO-CAROUSEL HERO */}
            <section className="relative h-[60vh] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentHeroIndex}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img 
                            src={getDirectImageUrl(heroItems[currentHeroIndex]?.image_url)} 
                            className="w-full h-full object-cover"
                            alt="Restaurant Ad"
                        />
                    </motion.div>
                </AnimatePresence>
                
                {/* Subtle Gradient for readability of overlay elements if any */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Progress Indicators */}
                {heroItems.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {heroItems.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1 rounded-full transition-all duration-500 ${idx === currentHeroIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 3. SEASONAL STORIES (REPLACES CATEGORIES) */}
            <SeasonalStories 
                stories={stories} 
                loading={storiesLoading}
                onStoryClick={(story) => {
                    if (story.menu_item_id) {
                        const item = availableMenuItems.find(i => i.id === story.menu_item_id);
                        if (item) setSelectedProduct(item);
                    }
                }}
            />

            <main className="max-w-md mx-auto px-6 space-y-12 pt-12 relative z-10">
                {activeCategory === 'all' && mostOrderedItems.length > 0 && (
                    <section className="space-y-6">
                        <h3 className="text-2xl font-black italic tracking-tight text-[#0F3D2E]">Chef's Handcrafted Picks</h3>
                        <ChefPicksSnapRail 
                            items={mostOrderedItems} 
                            cart={cart} 
                            onAdd={(item) => addToCart(item)}
                            onRemove={(item) => removeFromCart(item)}
                        />
                    </section>
                )}

                {/* DYNAMIC SECTIONS ENGINE */}
                {sections?.map((section) => {
                    const sectionItems = availableMenuItems.filter(item => {
                        if (section.type === 'category') {
                             return normalizeCategoryKey(item.category) === normalizeCategoryKey(section.category_id || "");
                        }
                        if (section.type === 'bestseller') {
                            return item.is_popular;
                        }
                        if (section.type === 'tag') {
                            return section.tags?.some(tag => item.tags?.includes(tag));
                        }
                        if (section.type === 'upsell') {
                            return item.is_popular; // Placeholder
                        }
                        return false;
                    }).slice(0, section.rules?.limit || 10);

                    if (sectionItems.length === 0 && section.type !== 'static') return null;

                    return (
                        <section 
                            key={section.id} 
                            id={section.id}
                            ref={(el) => { sectionRefs.current[section.id] = el as HTMLDivElement; }}
                            className="space-y-6"
                        >
                            {section.type === 'static' ? (
                                <div className="flex items-center gap-6 py-4">
                                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0F3D2E]/40">{section.title}</h4>
                                    <div className="h-[1px] flex-1 bg-[#0F3D2E]/10" />
                                </div>
                            ) : section.rules?.layout === 'snap' ? (
                                <>
                                     <h3 className="text-2xl font-black italic tracking-tight text-[#0F3D2E]">{section.title}</h3>
                                     <ChefPicksSnapRail 
                                        items={sectionItems} cart={cart} 
                                        onAdd={(item) => addToCart(item)}
                                        onRemove={(item) => removeFromCart(item)}
                                    />
                                </>
                            ) : section.type === 'bestseller' ? (
                                <>
                                    <h3 className="text-2xl font-black italic tracking-tight text-[#0F3D2E]">{section.title}</h3>
                                    <PopularGrid items={sectionItems} onAdd={(item) => addToCart(item)} />
                                </>
                            ) : section.type === 'tag' ? (
                                <IndulgeSection items={sectionItems} onAdd={(item) => addToCart(item)} title={section.title} />
                            ) : (
                                <>
                                    <CategorySectionHeader 
                                        name={section.title} 
                                        tagline={section.rules?.tagline || "Freshly prepared."} 
                                        imageUrl={section.rules?.image_url} 
                                    />
                                    <div className="space-y-4">
                                        {sectionItems.map((item) => (
                                            <MinimalMenuItemCard 
                                                key={item.id} 
                                                item={item} 
                                                quantity={cart[item.id] || 0} 
                                                onAdd={() => addToCart(item)} 
                                                onRemove={() => removeFromCart(item)} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </section>
                    );
                })}

                {/* Search / Filtered View (Fallback or Manual Search) */}
                {searchQuery && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-black italic tracking-tight text-[#0F3D2E]">Search Results</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-12">
                            {filteredItems.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    className="flex items-center gap-6 group cursor-pointer"
                                    onClick={() => setSelectedProduct(item)}
                                >
                                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border border-black/5 relative shrink-0">
                                        <img src={getDirectImageUrl(item.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-lg font-black italic tracking-tighter text-[#0F3D2E]">{item.title}</h5>
                                            <span className="text-[#C8A96A] font-black text-sm px-2">₹{item.price}</span>
                                        </div>
                                        <p className="text-[#0F3D2E]/60 text-[11px] leading-relaxed line-clamp-2 italic font-medium">
                                            {item.description}
                                        </p>
                                        <div className="pt-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); addToCart(item, e as any); }}
                                                className="px-6 py-2.5 bg-[#C8A96A] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Default Category View if no sections configured or "All" selected */}
                {(!sections || sections.length === 0 || activeCategory !== 'all') && (
                    <div className="space-y-16">
                         {categories.filter(c => c.id !== "all" && (activeCategory === 'all' || activeCategory === c.id)).map((cat: any) => (
                            <section key={cat.id} id={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el as HTMLDivElement; }} className="space-y-6">
                                <CategorySectionHeader name={cat.name} tagline={cat.tagline || "Freshly prepared."} imageUrl={cat.imageUrl} />
                                <div className="space-y-4">
                                    {availableMenuItems.filter((item: any) => normalizeCategoryKey(item.category) === cat.id).map((item) => (
                                        <MinimalMenuItemCard 
                                            key={item.id} 
                                            item={item} 
                                            quantity={cart[item.id] || 0} 
                                            onAdd={() => addToCart(item)} 
                                            onRemove={() => removeFromCart(item)} 
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Apple Story Mode: Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[150] bg-[#F5F1E8] flex flex-col overflow-y-auto no-scrollbar"
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
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F1E8] via-transparent to-black/20" />
                        </section>

                        {/* Bottom: The Story */}
                        <section className="px-8 -mt-20 relative z-10 space-y-12 pb-32">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-[#C8A96A] fill-[#C8A96A]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C8A96A]">Signature Masterpiece</span>
                                </div>
                                <h2 className="text-5xl font-black italic tracking-tighter text-[#0F3D2E] leading-none">{selectedProduct.title}</h2>
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-black text-[#0F3D2E]">₹{selectedProduct.price}</span>
                                        <div className="h-6 w-[1px] bg-white/10" />
                                        <div className="flex items-center gap-1">
                                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                            <span className="text-[10px] font-black uppercase text-white/40">450 kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#0F3D2E]/40">The Experience</h3>
                                <p className="text-2xl font-medium italic text-[#0F3D2E]/80 leading-snug">
                                    {selectedProduct.description || "A symphony of textures and flavors, handcrafted with premium ingredients for the ultimate sensory delight."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-white border border-[#0F3D2E]/5 space-y-2">
                                    <Clock className="w-6 h-6 text-[#C8A96A]" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F3D2E]/40">Prep Time</h4>
                                    <p className="text-sm font-black text-[#0F3D2E]">12-15 Mins</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white border border-[#0F3D2E]/5 space-y-2">
                                    <Star className="w-6 h-6 text-[#C8A96A]" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F3D2E]/40">Rating</h4>
                                    <p className="text-sm font-black text-[#0F3D2E]">4.9 / 5.0</p>
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

