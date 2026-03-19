export interface DiscoveryMood {
    id: string;
    label: string;
    icon: string;
    image: string;
    description: string;
    guidance: string;
    categoryKeywords: string[];
    itemKeywords: string[];
}

export const DISCOVERY_MOODS: DiscoveryMood[] = [
    {
        id: "light",
        label: "Light",
        icon: "🥗",
        image: "/images/mood_light.png",
        description: "Fresh and easy",
        guidance: "Salads, breakfast plates, coffee and lighter pours.",
        categoryKeywords: ["salad", "breakfast", "coffee", "drink", "juice", "tea", "smoothie", "light"],
        itemKeywords: ["salad", "toast", "fruit", "coffee", "tea", "juice", "smoothie", "light", "fresh"],
    },
    {
        id: "filling",
        label: "Filling",
        icon: "🍔",
        image: "/images/mood_filling.png",
        description: "Hungry right now",
        guidance: "Burgers, pizzas, combos and heavier mains.",
        categoryKeywords: ["burger", "pizza", "combo", "main", "wrap", "pasta", "meal", "rice"],
        itemKeywords: ["burger", "pizza", "combo", "meal", "loaded", "rice", "pasta", "fries", "wrap"],
    },
    {
        id: "sweet",
        label: "Sweet",
        icon: "🍰",
        image: "/images/mood_sweet.png",
        description: "Dessert first",
        guidance: "Cakes, waffles, shakes, bakes and sweet coffee.",
        categoryKeywords: ["dessert", "cake", "sweet", "ice", "waffle", "bakery", "shake"],
        itemKeywords: ["cake", "sweet", "chocolate", "lava", "brownie", "waffle", "shake", "dessert", "cookie"],
    },
    {
        id: "spicy",
        label: "Spicy",
        icon: "🌶️",
        image: "/images/mood_spicy.png",
        description: "Bold flavours",
        guidance: "Peri peri, hot sauces, masala sides and fiery mains.",
        categoryKeywords: ["spicy", "peri", "hot", "masala", "wings", "snack", "starter"],
        itemKeywords: ["spicy", "peri", "hot", "masala", "jalapeno", "schezwan", "fiery", "crispy"],
    },
];

export function getDiscoveryMood(moodId?: string | null) {
    const normalized = moodId?.trim().toLowerCase();
    if (!normalized) return null;

    return DISCOVERY_MOODS.find((mood) => mood.id === normalized) || null;
}

export function categoryMatchesMood(input: string, moodId?: string | null) {
    const mood = getDiscoveryMood(moodId);
    if (!mood) return true;

    const haystack = input.toLowerCase();
    return mood.categoryKeywords.some((keyword) => haystack.includes(keyword));
}

export function textMatchesMood(input: string, moodId?: string | null) {
    const mood = getDiscoveryMood(moodId);
    if (!mood) return true;

    const haystack = input.toLowerCase();
    return [...mood.categoryKeywords, ...mood.itemKeywords].some((keyword) => haystack.includes(keyword));
}
