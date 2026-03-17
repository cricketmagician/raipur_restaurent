export type GuestTheme = {
    id: 'CAFE' | 'FAST_FOOD' | 'FINE_DINE';
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
        primary: "#00704A", // Starbucks Green
        secondary: "#D4E9E2",
        accent: "#006241",
        background: "#F2F0EB",
        surface: "#FFFFFF",
        text: "#1E3932",
        textMuted: "#6B7280",
        fontSans: "Inter, sans-serif",
        fontSerif: "Playfair Display, serif",
        radius: "2.5rem",
        animation: 'smooth'
    },
    FAST_FOOD: {
        id: 'FAST_FOOD',
        primary: "#E31837", // McDonald's Style Red
        secondary: "#FFBC0D", // Yellow
        accent: "#C41230",
        background: "#F8F8F8",
        surface: "#FFFFFF",
        text: "#1A1A1A",
        textMuted: "#4B5563",
        fontSans: "Saira, sans-serif",
        fontSerif: "Saira, sans-serif", // Fast food rarely uses serif
        radius: "1rem",
        animation: 'snappy'
    },
    FINE_DINE: {
        id: 'FINE_DINE',
        primary: "#1A1A1A", // Elegant Black
        secondary: "#C5A059", // Gold
        accent: "#8B6F39",
        background: "#FCFAF7",
        surface: "#FFFFFF",
        text: "#1A1A1A",
        textMuted: "#9CA3AF",
        fontSans: "Montserrat, sans-serif",
        fontSerif: "Cormorant Garamond, serif",
        radius: "0rem", // Minimalist/Square
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
    return {
        ...theme,
        primary: branding?.primaryColor || theme.primary,
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
        gradient: "from-[#F2F0EB] to-[#D4E9E2]",
        accent: "#00704A",
        emotion: "discovery",
        textColor: "#00704A"
    },
    coffee: {
        id: "coffee",
        gradient: "from-[#1E3932] to-[#1E3932]",
        accent: "#D4E9E2",
        emotion: "comfort",
        textColor: "#FFFFFF",
        effect: "none"
    },
    burgers: {
        id: "burgers",
        gradient: "from-[#F2F0EB] to-[#F2F0EB]",
        accent: "#00704A",
        emotion: "satisfaction",
        textColor: "#1E3932"
    },
    pizzas: {
        id: "pizzas",
        gradient: "from-[#F2F0EB] to-[#F2F0EB]",
        accent: "#006241",
        texture: "none",
        effect: "none",
        emotion: "sharing",
        textColor: "#1E3932"
    },
    fries: {
        id: "fries",
        gradient: "from-[#D4E9E2] to-[#D4E9E2]",
        accent: "#1E3932",
        emotion: "fun",
        textColor: "#1E3932"
    },
    desserts: {
        id: "desserts",
        gradient: "from-[#F2F0EB] to-[#F2F0EB]",
        accent: "#00704A",
        effect: "none",
        emotion: "indulgence",
        textColor: "#1E3932"
    },
    drinks: {
        id: "drinks",
        gradient: "from-[#D4E9E2] to-[#D4E9E2]",
        accent: "#00704A",
        effect: "none",
        emotion: "refreshment",
        textColor: "#1E3932"
    },
    sides: {
        id: "sides",
        gradient: "from-[#F2F0EB] to-[#F2F0EB]",
        accent: "#00704A",
        emotion: "extra",
        textColor: "#1E3932"
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
