const MENU_DATA = {
    categories: [
        {
            name: "المشروبات الساخنة",
            items: [
                { name: "اسبريسو سبيشال", price: 45, icon: "☕" },
                { name: "كابتشينو", price: 65, icon: "☕" },
                { name: "لاتيه دهبي", price: 70, icon: "🥛" }
            ]
        },
        {
            name: "المشروبات الباردة",
            items: [
                { name: "سبانش لاتيه بارد", price: 80, icon: "❄️" },
                { name: "موهيتو بلو لاجون", price: 75, icon: "🍹" },
                { name: "سموذي مانجو", price: 70, icon: "🥭" }
            ]
        },
        {
            name: "المأكولات الخفيفة",
            items: [
                { name: "ناشوز بالجبنة الشيدر", price: 60, icon: "🧀" },
                { name: "فشار عائلي سبيشال", price: 45, icon: "🍿" },
                { name: "كلوب ساندوتش", price: 95, icon: "🥪" }
            ]
        }
    ]
};

function renderMenu() {
    const container = document.getElementById('dynamic-menu');
    if(!container) return;

    container.innerHTML = MENU_DATA.categories.map(cat => `
        <div class="mb-12 reveal">
            <h2 class="text-2xl font-bold mb-6 text-[#C5A059] border-r-4 border-[#C5A059] pr-4">${cat.name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${cat.items.map(item => `
                    <div class="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-[#C5A059]/50 transition-all group">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-xl font-bold group-hover:text-[#C5A059] transition">${item.name}</h3>
                                <p class="text-[#C5A059] font-bold mt-1">${item.price} EGP</p>
                            </div>
                            <button onclick="handleOrder('${item.name}', ${item.price})" class="bg-[#C5A059] text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl hover:scale-110 transition">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}
