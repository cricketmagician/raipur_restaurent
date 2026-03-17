export type CategoryTheme = {
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
        gradient: "from-[#FDFCFB] to-[#E2D1C3]",
        accent: "#3E2723",
        emotion: "discovery",
        textColor: "#3E2723"
    },
    coffee: {
        id: "coffee",
        gradient: "from-[#3E2723] to-[#1A0F0E]",
        accent: "#C8A27C",
        emotion: "comfort",
        textColor: "#FFF8F2",
        effect: "none"
    },
    burgers: {
        id: "burgers",
        gradient: "from-[#3E2723] to-[#795548]",
        accent: "#FFC107",
        emotion: "satisfaction",
        textColor: "#FFF8F2"
    },
    pizzas: {
        id: "pizzas",
        gradient: "from-[#8B0000] to-[#FF6B35]",
        accent: "#FFD700",
        texture: "oven-grain",
        effect: "shine",
        emotion: "sharing",
        textColor: "#FFF8F2"
    },
    fries: {
        id: "fries",
        gradient: "from-[#F4A261] to-[#E76F51]",
        accent: "#3E2723",
        emotion: "fun",
        textColor: "#3E2723"
    },
    desserts: {
        id: "desserts",
        gradient: "from-[#6D4C41] to-[#F8BBD0]",
        accent: "#FF4081",
        effect: "glow",
        emotion: "indulgence",
        textColor: "#3E2723"
    },
    drinks: {
        id: "drinks",
        gradient: "from-[#2196F3] to-[#00BCD4]",
        accent: "#E3F2FD",
        effect: "condensation",
        emotion: "refreshment",
        textColor: "#FFFFFF"
    },
    sides: {
        id: "sides",
        gradient: "from-[#F59E0B] to-[#D97706]",
        accent: "#3E2723",
        emotion: "extra",
        textColor: "#3E2723"
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
