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
