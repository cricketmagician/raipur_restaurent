"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MenuCard } from "@/components/MenuCard";
import { CheckCircle, Search, Sparkles, TrendingUp, Gift } from "lucide-react";
import { addSupabaseRequest, useHotelBranding, useCart, useSupabaseMenuItems, useMenuCategories, deriveMenuCategories, normalizeCategoryKey, formatCategoryName, useGuestLoyalty, saveGuestLoyaltySession, addLoyaltyPoints, type MenuItem } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { CartOverlay } from "@/components/CartOverlay";
import { CATEGORY_THEMES, useTheme } from "@/utils/themes";
import { CategoryDiscoveryGrid } from "@/components/CategoryDiscoveryGrid";
import { CategoryHeroHeader } from "@/components/CategoryHeroHeader";
import { ChefRecommendCard } from "@/components/ChefRecommendCard";
import { CategoryScroll } from "@/components/CategoryScroll";
import { LoyaltySignIn } from "@/components/LoyaltySignIn";
import { InlineUpsellRail } from "@/components/InlineUpsellRail";

const MOCK_FOOD_ITEMS = [
    {
        id: "mock_p1",
        title: "Margherita Supreme",
        description: "Fresh buffalo mozzarella, basil leaves, and slow-roasted tomato sauce.",
        price: 349,
        category: "pizzas",
        image_url: "/images/food/margherita_pizza.png",
        is_recommended: true,
        is_popular: true
    },
    {
        id: "mock_b1",
        title: "Double Beast Burger",
        description: "Two prime beef patties, three slices of cheddar, and caramelized onions.",
        price: 499,
        category: "burgers",
        image_url: "/images/food/cheese_burger.png",
        is_recommended: true,
        is_popular: true
    },
    {
        id: "mock_c1",
        title: "Artisan Cappuccino",
        description: "Rich espresso blend with perfectly micro-foamed milk.",
        price: 189,
        category: "coffee",
        image_url: "/images/food/cappuccino.png",
        is_recommended: true,
        is_popular: false
    },
    {
        id: "mock_p2",
        title: "Farm Fresh Pizza",
        description: "Bell peppers, onions, mushrooms, and sweet corn on a classic crust.",
        price: 299,
        category: "pizzas",
        image_url: "/images/food/margherita_pizza.png",
        is_recommended: false,
        is_popular: false
    },
    {
        id: "mock_b2",
        title: "Tex-Mex Burger",
        description: "Spicy chicken patty, jalapeños, and avocado lime mayo.",
        price: 389,
        category: "burgers",
        image_url: "/images/food/cheese_burger.png",
        is_recommended: false,
        is_popular: true
    },
    {
        id: "mock_c2",
        title: "Hazelnut Latte",
        description: "Roasted hazelnut flavor with silky steamed milk.",
        price: 219,
        category: "coffee",
        image_url: "/images/food/cappuccino.png",
        is_recommended: false,
        is_popular: false
    },
    {
        id: "mock_d1",
        title: "Molten Lava Mystery",
        description: "Warm chocolate cake with a gooey center and fresh berries.",
        price: 249,
        category: "desserts",
        image_url: "/images/food/chocolate_cake.png",
        is_recommended: true,
        is_popular: true
    },
    {
        id: "mock_combo1",
        title: "Luxury Pizza Deal",
        description: "Any classic pizza + 1 Fries + 1 Coke. Perfect for couples.",
        price: 599,
        category: "combos",
        image_url: "/images/food/margherita_pizza.png",
        is_recommended: false,
        is_popular: false,
        is_combo: true
    }
];

const CONTEXTUAL_UPSELL_RULES = [
    {
        matchKeywords: ["pizza", "pizzas"],
        title: "Complete your pizza order",
        subtitle: "Garlic breads, loaded fries, dips and drinks usually convert best after a pizza add.",
        targetKeywords: ["sides", "fries", "drinks", "beverages", "dip", "dips", "garlic", "bread"],
    },
    {
        matchKeywords: ["burger", "burgers"],
        title: "Make it a burger combo",
        subtitle: "Fries, shakes and crispy sides are the fastest add-ons once a burger hits the bag.",
        targetKeywords: ["fries", "sides", "drinks", "beverages", "shake", "dessert"],
    },
];

const buildSearchText = (item: Pick<MenuItem, "category" | "title">) =>
    `${normalizeCategoryKey(item.category)} ${normalizeCategoryKey(item.title)}`;

const resolveUpsellRule = (item: Pick<MenuItem, "category" | "title">) => {
    const haystack = buildSearchText(item);
    return CONTEXTUAL_UPSELL_RULES.find((rule) =>
        rule.matchKeywords.some((keyword) => haystack.includes(normalizeCategoryKey(keyword)))
    ) || null;
};

const matchesUpsellKeywords = (item: Pick<MenuItem, "category" | "title">, keywords: string[]) => {
    const haystack = buildSearchText(item);
    return keywords.some((keyword) => haystack.includes(normalizeCategoryKey(keyword)));
};

const buildInlineUpsellContent = (anchorItem: MenuItem, items: MenuItem[]) => {
    const explicitItems = (anchorItem.upsell_items || [])
        .map((upsellId) => items.find((item) => item.id === upsellId))
        .filter((item): item is MenuItem => Boolean(item) && item.id !== anchorItem.id && item.is_available !== false);

    const rule = resolveUpsellRule(anchorItem);
    const seen = new Set(explicitItems.map((item) => item.id));

    const fallbackItems = rule
        ? items
            .filter((item) =>
                item.id !== anchorItem.id &&
                item.is_available !== false &&
                !seen.has(item.id) &&
                !item.is_combo &&
                matchesUpsellKeywords(item, rule.targetKeywords)
            )
            .sort((left, right) => Number(right.is_popular) - Number(left.is_popular) || left.price - right.price)
        : [];

    const suggestions = [...explicitItems, ...fallbackItems].slice(0, 6);

    if (!suggestions.length) {
        return null;
    }

    const exploreCategory = suggestions[0]?.category ? normalizeCategoryKey(suggestions[0].category) : null;

    return {
        title: rule?.title || `Complete your ${formatCategoryName(anchorItem.category).toLowerCase()} order`,
        subtitle: rule?.subtitle || "Guests usually add a side or a quick drink with this pick.",
        exploreCategory,
        items: suggestions,
    };
};

export default function RestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { categories: menuCategories } = useMenuCategories(branding?.id);
    const { roomNumber, orderMode } = useGuestRoom();
    const { cart, updateQuantity, clearCart } = useCart(branding?.id);
    const theme = useTheme(branding);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

    // View State: 'discovery' or 'detail'
    const [view, setView] = useState<'discovery' | 'detail'>('discovery');
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Refs for auto-scroll
    const recommendSectionRef = useRef<HTMLDivElement>(null);

    // Upsell State
    const [inlineUpsellAnchorId, setInlineUpsellAnchorId] = useState<string | null>(null);
    const [loyaltyProfile, setLoyaltyProfile] = useState<{ phone: string; name: string; lastVisitAt?: string | null } | null>(() => {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(`guest_loyalty_${hotelSlug}`);
        return stored ? JSON.parse(stored) : null;
    });
    const { loyalty: realLoyalty } = useGuestLoyalty(branding?.id, loyaltyProfile?.phone || null);

    const { menuItems } = useSupabaseMenuItems(branding?.id);

    // Use mock data if no items in DB (for visual testing)
    const effectiveItems = menuItems.length > 0 ? menuItems : MOCK_FOOD_ITEMS;
    const availableItems = useMemo(
        () => effectiveItems.filter((item: any) => item.is_available !== false),
        [effectiveItems]
    );
    const categoryRecords = menuCategories.filter((category) => category.is_active !== false).length > 0
        ? menuCategories.filter((category) => category.is_active !== false)
        : deriveMenuCategories(effectiveItems as any);
    const categories = [
        { id: "all", name: "All", icon: "🍱", tagline: "Explore the full menu" },
        ...categoryRecords.map((category) => ({
            id: normalizeCategoryKey(category.slug || category.name),
            name: category.name,
            icon: category.icon_emoji || "🍽️",
            imageUrl: category.image_url,
            tagline: category.description,
        })),
    ];

    // Handle initial navigation or deep linking
    useEffect(() => {
        const cat = searchParams.get('cat');
        if (cat) {
            if (cat === 'all') {
                setActiveCategory('all');
                setView('discovery');
            } else {
                setActiveCategory(cat);
                setView('detail');
            }
        } else {
            setView('discovery');
        }
    }, [searchParams]);

    // Auto-scroll when category changes
    useEffect(() => {
        if (view === 'detail' && recommendSectionRef.current) {
            recommendSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [view, activeCategory]);

    const handleCategoryClick = (id: string) => {
        if (id === 'all') {
            setActiveCategory('all');
            setView('discovery');
            return;
        }
        setActiveCategory(id);
        setView('detail');
    };

    const currentCategoryTheme = CATEGORY_THEMES[activeCategory] || CATEGORY_THEMES.all;
    const activeCategoryRecord = categoryRecords.find((category) => normalizeCategoryKey(category.slug || category.name) === activeCategory);
    
    // Filtering Logic
    const filteredItems = (activeCategory === "all"
        ? availableItems
        : availableItems.filter(i => normalizeCategoryKey(i.category) === activeCategory));
    
    const recommendedItems = filteredItems.filter(i => i.is_recommended);
    const comboItems = filteredItems.filter(i => i.is_combo && !i.is_recommended);
    const popularItems = filteredItems.filter(i => i.is_popular && !i.is_recommended && !i.is_combo);
    const normalItems = filteredItems.filter(i => !i.is_recommended && !i.is_popular && !i.is_combo);

    const inlineUpsellAnchorItem = useMemo(
        () => availableItems.find((item) => item.id === inlineUpsellAnchorId) || null,
        [availableItems, inlineUpsellAnchorId]
    );
    const inlineUpsellContent = useMemo(
        () => (inlineUpsellAnchorItem ? buildInlineUpsellContent(inlineUpsellAnchorItem as MenuItem, availableItems as MenuItem[]) : null),
        [inlineUpsellAnchorItem, availableItems]
    );
    const shouldShowInlineUpsell = Boolean(
        inlineUpsellAnchorItem &&
        inlineUpsellContent &&
        cart[inlineUpsellAnchorItem.id] > 0
    );

    useEffect(() => {
        if (inlineUpsellAnchorId && !cart[inlineUpsellAnchorId]) {
            setInlineUpsellAnchorId(null);
        }
    }, [cart, inlineUpsellAnchorId]);

    const addToCart = (item: any, isUpsell = false) => {
        if (item.is_available === false) return;
        const currentQty = cart[item.id] || 0;
        updateQuantity(item.id, currentQty + 1);

        if (isUpsell) {
            return;
        }

        if (buildInlineUpsellContent(item as MenuItem, availableItems as MenuItem[])) {
            setInlineUpsellAnchorId(item.id);
        }
    };

    const cartItems = Object.entries(cart).map(([id, q]) => {
        const item = effectiveItems.find(m => m.id === id);
        if (!item) return null;
        return { ...item, quantity: q };
    }).filter((item): item is (typeof effectiveItems[0] & { quantity: number }) => item !== null);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

    const renderInlineUpsellSection = (anchorId: string) => {
        if (!shouldShowInlineUpsell || inlineUpsellAnchorId !== anchorId || !inlineUpsellContent) {
            return null;
        }

        return (
            <InlineUpsellRail
                title={inlineUpsellContent.title}
                subtitle={inlineUpsellContent.subtitle}
                items={inlineUpsellContent.items}
                cart={cart}
                onAdd={(upsellItem) => addToCart(upsellItem, true)}
                onRemove={(upsellItem) => updateQuantity(upsellItem.id, Math.max(0, (cart[upsellItem.id] || 0) - 1))}
                browseLabel={inlineUpsellContent.exploreCategory ? `Open ${formatCategoryName(inlineUpsellContent.exploreCategory)}` : undefined}
                onBrowse={inlineUpsellContent.exploreCategory ? () => handleCategoryClick(inlineUpsellContent.exploreCategory as string) : undefined}
            />
        );
    };

    useEffect(() => {
        if (!menuItems.length) return;

        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        soldOutIds.forEach((id) => updateQuantity(id, 0));
    }, [menuItems, cart, updateQuantity]);

    const handleLoyaltySignIn = async (phone: string, name: string) => {
        const profile = { phone, name, lastVisitAt: new Date().toISOString() };
        localStorage.setItem(`guest_loyalty_${hotelSlug}`, JSON.stringify(profile));
        setLoyaltyProfile(profile);

        if (branding?.id) {
            await saveGuestLoyaltySession(branding.id, phone, name, { lastVisitAt: profile.lastVisitAt });
        }
    };

    const handleOrder = async () => {
        if (!branding?.id) return;
        const soldOutIds = Object.keys(cart).filter((id) =>
            menuItems.some((item) => item.id === id && item.is_available === false)
        );

        if (soldOutIds.length > 0) {
            soldOutIds.forEach((id) => updateQuantity(id, 0));
            alert("Some sold out items were removed from your bag. Please review your cart and place the order again.");
            return;
        }

        if (orderMode === "takeaway" && !loyaltyProfile) {
            setIsLoyaltyOpen(true);
            return;
        }

        if (loyaltyProfile?.phone) {
            const now = new Date().toISOString();
            await saveGuestLoyaltySession(branding.id, loyaltyProfile.phone, loyaltyProfile.name, {
                lastVisitAt: loyaltyProfile.lastVisitAt || now,
                lastOrderAt: now,
                lastOrderMode: orderMode,
            });
            if (cartTotal > 0) {
                await addLoyaltyPoints(branding.id, loyaltyProfile.phone, Math.floor(cartTotal / 10));
            }
        }

        setIsOrdering(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const cartItemsData = Object.entries(cart)
            .map(([id, q]) => {
                const item = effectiveItems.find(m => m.id === id);
                return {
                    id,
                    title: item?.title || 'Unknown Item',
                    quantity: q,
                    price: item?.price || 0,
                    total: (item?.price || 0) * q
                };
            });

        const cartItemsString = cartItemsData.map(item => `${item.title} x${item.quantity}`).join(", ");

        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber || 'Unknown',
            type: "Dining Order",
            notes: cartItemsString,
            total: cartTotal,
            price: cartTotal,
            items: cartItemsData
        });

        setIsOrdering(false);

        if (error) {
            alert(`Order Failed: ${error.message || 'Please try again.'}`);
        } else {
            setOrderComplete(true);
            clearCart();
            setShowCart(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-20 text-center px-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/5 mx-auto">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black italic mb-2 tracking-tight" style={{ color: theme.primary }}>Order Received!</h2>
                    <p className="text-slate-400 font-medium italic mb-12">“Chef is starting your meal right now.”</p>
                    <button 
                        onClick={() => router.push(`/${hotelSlug}/guest/status`)} 
                        className="w-full py-6 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all border shadow-sm"
                        style={{ backgroundColor: `${theme.primary}05`, color: theme.primary, borderColor: `${theme.primary}10`, borderRadius: theme.radius }}
                    >
                        View Order Progress
                    </button>
                    <button 
                        onClick={() => { setOrderComplete(false); setView('discovery'); }}
                        className="w-full mt-4 py-6 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                        style={{ color: theme.primary }}
                    >
                        Order More
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div 
            className="pb-40 pt-10 min-h-screen w-full max-w-[500px] mx-auto overflow-x-hidden transition-colors duration-500"
            style={{ backgroundColor: theme.background, fontFamily: theme.fontSans, color: theme.text }}
        >
            <div className="relative z-10">
                {/* Top Categories Scroll - requested by user */}
                <CategoryScroll 
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryClick}
                />

                <AnimatePresence mode="wait">
                    {view === 'discovery' ? (
                        <motion.div
                            key="discovery-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <header className="mb-10 mt-8">
                                <h1 className="text-3xl font-black tracking-tighter mb-8" style={{ color: theme.primary }}>Menu</h1>
                                <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" style={{ color: theme.primary }} />
                                    <input 
                                        type="text" 
                                        placeholder="Find something handcrafted..." 
                                        className="w-full border rounded-full py-6 pl-16 pr-6 shadow-xl focus:outline-none transition-all font-bold text-sm uppercase tracking-widest"
                                        style={{ borderRadius: theme.radius, backgroundColor: theme.surface, borderColor: `${theme.primary}10` }}
                                    />
                                </div>
                            </header>

                            <CategoryDiscoveryGrid 
                                categories={categories.filter(c => c.id !== 'all')} 
                                onCategoryClick={handleCategoryClick}
                                activeCategory={activeCategory}
                                theme={theme}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <CategoryHeroHeader 
                                name={activeCategoryRecord?.name || formatCategoryName(activeCategory)} 
                                tagline={activeCategoryRecord?.description || currentCategoryTheme.tagline}
                                theme={theme}
                                onBack={() => setView('discovery')}
                            />

                            {/* Chef Recommends Section */}
                            {recommendedItems.length > 0 && (
                                <section ref={recommendSectionRef} className="space-y-6">
                                    <div className="flex items-center space-x-3 px-1">
                                        <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                            Chef Recommends
                                        </h3>
                                    </div>
                                    <div className="flex space-x-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6">
                                        {recommendedItems.map(item => (
                                            <ChefRecommendCard 
                                                key={item.id} 
                                                item={item} 
                                                onAdd={() => addToCart(item)}
                                                onRemove={() => updateQuantity(item.id, (cart[item.id] || 0) - 1)}
                                                onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                                theme={theme}
                                                quantity={cart[item.id] || 0}
                                            />
                                        ))}
                                    </div>
                                    {inlineUpsellAnchorId && recommendedItems.some((item) => item.id === inlineUpsellAnchorId) && renderInlineUpsellSection(inlineUpsellAnchorId)}
                                </section>
                            )}

                            {/* Combo Deals Section */}
                            {comboItems.length > 0 && (
                                <section className="space-y-8">
                                    <div className="flex items-center space-x-3 px-1">
                                        <Gift className="w-4 h-4 text-purple-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                            Combo Deals
                                        </h3>
                                    </div>
                                    <div className="space-y-12">
                                        {comboItems.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <MenuCard
                                                    id={item.id}
                                                    title={item.title}
                                                    description={item.description || ""}
                                                    price={item.price}
                                                    image={item.image_url}
                                                    isPopular={item.is_popular}
                                                    isRecommended={item.is_recommended}
                                                    theme={CATEGORY_THEMES[normalizeCategoryKey(item.category)] || CATEGORY_THEMES.all}
                                                    onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                                    quantity={cart[item.id] || 0}
                                                    onAdd={() => addToCart(item)}
                                                    onRemove={() => updateQuantity(item.id, (cart[item.id] || 0) - 1)}
                                                />
                                                {renderInlineUpsellSection(item.id)}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Best Sellers Section */}
                            {popularItems.length > 0 && (
                                <section className="space-y-8">
                                    <div className="flex items-center space-x-3 px-1">
                                        <TrendingUp className="w-4 h-4 text-orange-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                            Best Sellers
                                        </h3>
                                    </div>
                                    <div className="space-y-12">
                                        {popularItems.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <MenuCard
                                                    id={item.id}
                                                    title={item.title}
                                                    description={item.description || ""}
                                                    price={item.price}
                                                    image={item.image_url}
                                                    isPopular={item.is_popular}
                                                    isRecommended={item.is_recommended}
                                                    theme={CATEGORY_THEMES[normalizeCategoryKey(item.category)] || CATEGORY_THEMES.all}
                                                    onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                                    quantity={cart[item.id] || 0}
                                                    onAdd={() => addToCart(item)}
                                                    onRemove={() => updateQuantity(item.id, (cart[item.id] || 0) - 1)}
                                                />
                                                {renderInlineUpsellSection(item.id)}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Full List Section */}
                            <section className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 px-1">
                                    {activeCategory === 'all' ? 'Full Menu' : `Other ${activeCategoryRecord?.name || formatCategoryName(activeCategory)}`}
                                </h3>
                                <div className="space-y-12">
                                    {normalItems.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <MenuCard
                                                id={item.id}
                                                title={item.title}
                                                description={item.description || ""}
                                                price={item.price}
                                                image={item.image_url}
                                                isPopular={item.is_popular}
                                                isRecommended={item.is_recommended}
                                                theme={CATEGORY_THEMES[normalizeCategoryKey(item.category)] || CATEGORY_THEMES.all}
                                                onClick={() => router.push(`/${hotelSlug}/guest/item/${item.id}`)}
                                                quantity={cart[item.id] || 0}
                                                onAdd={() => addToCart(item)}
                                                onRemove={() => updateQuantity(item.id, (cart[item.id] || 0) - 1)}
                                            />
                                            {renderInlineUpsellSection(item.id)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Bag Preview */}
                <AnimatePresence>
                    {cartCount > 0 && !showCart && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[452px] z-[100]"
                        >
                            <button
                                onClick={() => setShowCart(true)}
                                className="w-full text-white p-6 flex items-center justify-between shadow-2xl border border-white/10 active:scale-95 transition-all"
                                style={{ backgroundColor: theme.primary, borderRadius: theme.radius }}
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xs">
                                        {cartCount}
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest">In your bag</span>
                                </div>
                                <span className="text-xl font-black">₹{cartTotal.toFixed(0)}</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                <LoyaltySignIn
                    isOpen={isLoyaltyOpen}
                    onClose={() => setIsLoyaltyOpen(false)}
                    onSignIn={handleLoyaltySignIn}
                    guestName={loyaltyProfile?.name || ""}
                    guestPhone={loyaltyProfile?.phone || ""}
                    lastVisitAt={loyaltyProfile?.lastVisitAt || realLoyalty?.last_visit_at || null}
                />
                <BottomNav />
            </div>
        </div>
    );
}
