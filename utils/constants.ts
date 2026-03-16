export const SHARED_MENU_ITEMS = [
    { 
        id: "m1", 
        category: "burgers", 
        title: "Crispy Buttermilk Chicken Burger", 
        description: "Ultra-crispy hand-breaded chicken, spicy jalapeños, and smoky chipotle mayo.", 
        price: 180, 
        rating: 4.8,
        reviews: 156,
        image: "/images/menu/buttermilk_chicken_burger_1773233570467.png", 
        isPopular: true, 
        upsellIds: ["m3", "m7"] 
    },
    { 
        id: "m2", 
        category: "burgers", 
        title: "Gourmet Garden Burger", 
        description: "Hand-crafted veggie patty with melted cheddar and fresh arugula.", 
        price: 160, 
        rating: 4.5,
        reviews: 92,
        image: "/images/menu/veggie_burger_1773233586101.png", 
        isRecommended: true, 
        upsellIds: ["m4", "m7"] 
    },
    { 
        id: "m3", 
        category: "fries", 
        title: "Loaded Peri-Peri Fries", 
        description: "Crispy thin-cut fries topped with liquid cheese and jalapeños.", 
        price: 140, 
        rating: 4.9,
        reviews: 210,
        image: "/images/menu/loaded_fries_hero_1773232655179.png", 
        isPopular: true 
    },
    { 
        id: "m4", 
        category: "fries", 
        title: "Golden Classic Fries", 
        description: "Lightly salted, thin-cut fries, served golden brown.", 
        price: 90, 
        rating: 4.4,
        reviews: 320,
        image: "/images/menu/classic_fries_1773233603370.png" 
    },
    { 
        id: "m5", 
        category: "sides", 
        title: "Cheesy Garlic Bread", 
        description: "Toasted brioche slices with garlic butter and mozzarella.", 
        price: 120, 
        rating: 4.7,
        reviews: 110,
        image: "/images/menu/garlic_bread_1773233624069.png", 
        isRecommended: true 
    },
    { 
        id: "m6", 
        category: "sides", 
        title: "Premium Caesar Salad", 
        description: "Crisp romaine, croutons, and parmesan shavings.", 
        price: 210, 
        rating: 4.3,
        reviews: 85,
        image: "/images/menu/caesar_salad_1773233640332.png" 
    },
    { 
        id: "m7", 
        category: "drinks", 
        title: "Iced Whipped Coffee", 
        description: "Velvety smooth cold brew with whipped cream.", 
        price: 130, 
        rating: 4.9,
        reviews: 420,
        image: "/images/menu/cold_coffee_premium_1773233658375.png", 
        isPopular: true 
    },
    { 
        id: "m8", 
        category: "desserts", 
        title: "Molten Lava Cake", 
        description: "Warm chocolate cake with a gooey center and vanilla ice cream.", 
        price: 190, 
        rating: 4.9,
        reviews: 380,
        image: "/images/menu/choco_lava_cake_1773233674857.png", 
        isPopular: true 
    },
];

export const SHARED_COMBOS = [
    { id: "monster_combo", title: "Monster Combo Burger", price: 199 },
    { id: "king_size", title: "King Size Platter", price: 299 }
];
