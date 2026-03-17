export type GuestTheme = {
    id: 'CAFE' | 'FINE_DINE';
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    fontSans: string;
    fontSerif: string;
    radius: string;
    animation: 'smooth' | 'snappy' | 'elegant';
};

export const GUEST_THEMES: Record<GuestTheme['id'], GuestTheme> = {
    CAFE: {
        id: 'CAFE',
        primary: "#3C2A21", // Dark Coffee Bean
        secondary: "#EADBC8", // Warm Cream/Beige
        accent: "#8B4513", // Saddle Brown (Rich wood/coffee)
        background: "#FDFBF7", // Ultra-warm parchment
        surface: "#FFFFFF",
        text: "#3C2A21",
        textMuted: "#6B7280",
        fontSans: "Inter, sans-serif",
        fontSerif: "Playfair Display, serif",
        radius: "2.5rem",
        animation: 'smooth'
    },
    FINE_DINE: {
        id: 'FINE_DINE',
        primary: "#C5A059", // Gold
        secondary: "#1A1A1A", // Dark
        accent: "#8B6F39",
        background: "#0A0A0A", // Luxury DARK background
        surface: "#1A1A1A",
        text: "#F5F5F5", // Light text for dark background
        textMuted: "#9CA3AF",
        fontSans: "Montserrat, sans-serif",
        fontSerif: "Cormorant Garamond, serif",
        radius: "0.5rem", // Sharp but slightly softened
        animation: 'elegant'
    }
};

export function getTheme(id?: string): GuestTheme {
    const themeId = (id?.toUpperCase() as GuestTheme['id']) || 'CAFE';
    return GUEST_THEMES[themeId] || GUEST_THEMES.CAFE;
}

/**
 * Hook to get the current guest theme based on hotel branding
 */
export function useTheme(branding?: { guestTheme?: string, primaryColor?: string, accentColor?: string }) {
    const theme = getTheme(branding?.guestTheme);
    
    // Override with custom branding colors if provided
    // Special check: If CAFE is selected but color is legacy blue, force coffee brown
    const isLegacyBlue = branding?.primaryColor === "#2563eb" || branding?.primaryColor === "#00704A";
    
    return {
        ...theme,
        primary: (isLegacyBlue && theme.id === 'CAFE') ? theme.primary : (branding?.primaryColor || theme.primary),
        accent: branding?.accentColor || theme.accent,
    };
}

export type CategoryTheme = {
    id: string;
    gradient: string;
    accent: string;
    texture?: string;
    effect?: 'shine' | 'glow' | 'condensation' | 'none';
    emotion: string;
    textColor: string;
    tagline: string;
    image: string;
};

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
    all: {
        id: "all",
        gradient: "from-[#FDFBF7] to-[#EADBC8]",
        accent: "#3C2A21",
        emotion: "discovery",
        textColor: "#3C2A21",
        tagline: "Explore our full collection",
        image: "/images/categories/all.png"
    },
    coffee: {
        id: "coffee",
        gradient: "linear-gradient(135deg, #3C2A21 0%, #1A120B 100%)",
        accent: "#EADBC8",
        emotion: "comfort",
        textColor: "#FFFFFF",
        effect: "none",
        tagline: "Warm, aromatic & handcrafted",
        image: "/images/categories/coffee.png"
    },
    burgers: {
        id: "burgers",
        gradient: "linear-gradient(135deg, #2D1F18 0%, #000000 100%)",
        accent: "#F59E0B",
        emotion: "satisfaction",
        textColor: "#FFFFFF",
        tagline: "Juicy, bold & heavy shadows",
        image: "/images/categories/burgers.png"
    },
    pizzas: {
        id: "pizzas",
        gradient: "linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)",
        accent: "#FBBF24",
        texture: "none",
        effect: "none",
        emotion: "sharing",
        textColor: "#FFFFFF",
        tagline: "Cheesy, oven-fresh & irresistible",
        image: "/images/categories/pizzas.png"
    },
    fries: {
        id: "fries",
        gradient: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
        accent: "#3C2A21",
        emotion: "fun",
        textColor: "#3C2A21",
        tagline: "Crispy, golden & perfectly salted",
        image: "/images/categories/fries.png"
    },
    desserts: {
        id: "desserts",
        gradient: "linear-gradient(135deg, #FCE7F3 0%, #F9A8D4 100%)",
        accent: "#BE185D",
        effect: "glow",
        emotion: "indulgence",
        textColor: "#831843",
        tagline: "Sweet, soft & heavenly",
        image: "/images/categories/desserts.png"
    },
    drinks: {
        id: "drinks",
        gradient: "linear-gradient(135deg, #E0F2FE 0%, #7DD3FC 100%)",
        accent: "#0369A1",
        effect: "condensation",
        emotion: "refreshment",
        textColor: "#0C4A6E",
        tagline: "Chilled, bubbly & revitalizing",
        image: "/images/categories/drinks.png"
    },
    sides: {
        id: "sides",
        gradient: "from-[#FDFBF7] to-[#EADBC8]",
        accent: "#3C2A21",
        emotion: "extra",
        textColor: "#3C2A21",
        tagline: "The perfect companions",
        image: "/images/categories/sides.png"
    }
};

export type TimeTheme = {
    vibe: 'morning' | 'evening';
    greeting: string;
    subtext: string;
    primaryCategory: string;
};

export const TIME_THEMES: Record<'morning' | 'evening', TimeTheme> = {
    morning: {
        vibe: 'morning',
        greeting: "Good Morning ☀️",
        subtext: "Freshly brewed coffee and breakfast awaits.",
        primaryCategory: "coffee"
    },
    evening: {
        vibe: 'evening',
        greeting: "Good Evening ☕",
        subtext: "What are you craving for dinner tonight?",
        primaryCategory: "burgers"
    }
};

export function getTimeTheme(): TimeTheme {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 16) {
        return TIME_THEMES.morning;
    }
    return TIME_THEMES.evening;
}
