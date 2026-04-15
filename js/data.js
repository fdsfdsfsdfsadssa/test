const MENU_DATA = {
    categories: [
        {
            id: "hot",
            name: "مشروبات ساخنة",
            items: [
                { id: 1, name: "اسبريسو", price: 40, image: "☕" },
                { id: 2, name: "لاتيه", price: 60, image: "🥛" },
                { id: 3, name: "قهوة تركي", price: 35, image: "☕" }
            ]
        },
        {
            id: "cold",
            name: "مشروبات باردة",
            items: [
                { id: 4, name: "سبانش لاتيه", price: 75, image: "🧊" },
                { id: 5, name: "موهيتو بلو", price: 65, image: "🍹" },
                { id: 6, name: "ريد بول ميكس", price: 90, image: "⚡" }
            ]
        },
        {
            id: "snacks",
            name: "سناكس",
            items: [
                { id: 7, name: "فشار كراميل", price: 40, image: "🍿" },
                { id: 8, name: "ناشوز بالجبنة", price: 55, image: "🧀" },
                { id: 9, name: "كلوب ساندوتش", price: 85, image: "🥪" }
            ]
        }
    ]
};

// جعل البيانات متاحة لبقية الملفات
window.MENU_DATA = MENU_DATA;
