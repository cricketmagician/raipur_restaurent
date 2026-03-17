export const SHARED_MENU_ITEMS = [
    { 
        id: "m1", 
        category: "burgers", 
        title: "Buttermilk Brined Chicken Burger", 
        description: "24-hour buttermilk brined chicken, hand-breaded and topped with house-made smoky chipotle emulsion and crisp jalapeños.", 
        price: 180, 
        image: "/images/menu/buttermilk_chicken_burger_1773233570467.png", 
        isPopular: true, 
        upsellIds: ["m3", "m7"] 
    },
    { 
        id: "m2", 
        category: "burgers", 
        title: "The Heritage Garden Burger", 
        description: "A hand-crafted botanical patty layered with aged English cheddar, forest arugula, and balsamic reduction.", 
        price: 160, 
        image: "/images/menu/veggie_burger_1773233586101.png", 
        isRecommended: true, 
        upsellIds: ["m4", "m7"] 
    },
    { 
        id: "m3", 
        category: "fries", 
        title: "Truffle & Peri-Peri Batons", 
        description: "Signature thin-cut batons tossed in spicy peri-peri dust, finished with a velvety cheese infusion.", 
        price: 140, 
        image: "/images/menu/loaded_fries_hero_1773232655179.png", 
        isPopular: true 
    },
    { 
        id: "m4", 
        category: "fries", 
        title: "Sea Salt Classic Batons", 
        description: "Hand-cut, twice-fried potatoes finished with a whisper of Maldon sea salt.", 
        price: 90, 
        image: "/images/menu/classic_fries_1773233603370.png" 
    },
    { 
        id: "m5", 
        category: "sides", 
        title: "Artisanal Garlic Brioche", 
        description: "Toasted brioche infused with roasted garlic confit butter and melted fior di latte.", 
        price: 120, 
        image: "/images/menu/garlic_bread_1773233624069.png", 
        isRecommended: true 
    },
    { 
        id: "m6", 
        category: "sides", 
        title: "The Crisp Caesar", 
        description: "Heart of romaine, sourdough croutons, and aged parmesan shavings with a signature dressing.", 
        price: 210, 
        image: "/images/menu/caesar_salad_1773233640332.png" 
    },
    { 
        id: "m7", 
        category: "drinks", 
        title: "Velvet Cloud Coffee", 
        description: "Single-origin cold brew topped with a hand-whipped vanilla cloud foam.", 
        price: 130, 
        image: "/images/menu/cold_coffee_premium_1773233658375.png", 
        isPopular: true 
    },
    { 
        id: "m8", 
        category: "desserts", 
        title: "Signature Molten Ganache", 
        description: "A dark chocolate core that yields to the touch, served with a quenelle of Madagascar vanilla bean gelato.", 
        price: 190, 
        image: "/images/menu/choco_lava_cake_1773233674857.png", 
        isPopular: true 
    },
];

export const SHARED_COMBOS = [
    { id: "monster_combo", title: "Monster Combo Burger", price: 199 },
    { id: "king_size", title: "King Size Platter", price: 299 }
];
