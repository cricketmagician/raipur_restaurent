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
// ... existing CategoryTheme code ...
    id: string;
    gradient: string;
    accent: string;
    texture?: string;
    effect?: 'shine' | 'glow' | 'condensation' | 'none';
    emotion: string;
    textColor: string;
};

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
    all: {
        id: "all",
        gradient: "from-[#FDFBF7] to-[#EADBC8]",
        accent: "#3C2A21",
        emotion: "discovery",
        textColor: "#3C2A21"
    },
    coffee: {
        id: "coffee",
        gradient: "from-[#3C2A21] to-[#3C2A21]",
        accent: "#EADBC8",
        emotion: "comfort",
        textColor: "#FFFFFF",
        effect: "none"
    },
    burgers: {
        id: "burgers",
        gradient: "from-[#FDFBF7] to-[#FDFBF7]",
        accent: "#3C2A21",
        emotion: "satisfaction",
        textColor: "#3C2A21"
    },
    pizzas: {
        id: "pizzas",
        gradient: "from-[#FDFBF7] to-[#FDFBF7]",
        accent: "#2D1F18",
        texture: "none",
        effect: "none",
        emotion: "sharing",
        textColor: "#3C2A21"
    },
    fries: {
        id: "fries",
        gradient: "from-[#EADBC8] to-[#EADBC8]",
        accent: "#3C2A21",
        emotion: "fun",
        textColor: "#3C2A21"
    },
    desserts: {
        id: "desserts",
        gradient: "from-[#FDFBF7] to-[#FDFBF7]",
        accent: "#3C2A21",
        effect: "none",
        emotion: "indulgence",
        textColor: "#3C2A21"
    },
    drinks: {
        id: "drinks",
        gradient: "from-[#EADBC8] to-[#EADBC8]",
        accent: "#3C2A21",
        effect: "none",
        emotion: "refreshment",
        textColor: "#3C2A21"
    },
    sides: {
        id: "sides",
        gradient: "from-[#FDFBF7] to-[#FDFBF7]",
        accent: "#3C2A21",
        emotion: "extra",
        textColor: "#3C2A21"
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
