document.addEventListener('DOMContentLoaded', () => {
    // 1. بناء المنيو في صفحة menu.html
    const menuContainer = document.getElementById('dynamic-menu');
    if (menuContainer && window.MENU_DATA) {
        renderMenu();
    }

    // 2. أنيميشن عند السكرول (ظهور تدريجي)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

// وظيفة رسم المنيو
function renderMenu() {
    const container = document.getElementById('dynamic-menu');
    const categories = window.MENU_DATA.categories;

    container.innerHTML = categories.map(cat => `
        <div class="mb-16 reveal">
            <h2 class="text-3xl font-bold mb-8 border-r-4 border-[#C5A059] pr-4">${cat.name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${cat.items.map(item => `
                    <div class="menu-card bg-[#0f0f0f] p-6 rounded-2xl flex justify-between items-center group">
                        <div class="flex items-center gap-4">
                            <span class="text-3xl">${item.image}</span>
                            <div>
                                <h3 class="font-bold text-lg group-hover:text-[#C5A059] transition">${item.name}</h3>
                                <p class="text-[#C5A059] font-bold">${item.price} EGP</p>
                            </div>
                        </div>
                        <button onclick="handleOrder('${item.name}', ${item.price})" 
                                class="bg-white/5 hover:bg-[#C5A059] hover:text-black p-3 rounded-full transition duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// وظيفة الطلب (محاكاة)
function handleOrder(itemName, price) {
    const table = prompt("رقم الطاولة أو الغرفة؟");
    if (!table) return;

    const newOrder = {
        id: Date.now(),
        item: itemName,
        price: price,
        table: table,
        time: new Date().toLocaleTimeString('ar-EG'),
        status: 'pending'
    };

    let orders = JSON.parse(localStorage.getItem('room_alone_orders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('room_alone_orders', JSON.stringify(orders));

    // تأثير بصري بسيط للنجاح
    alert(`تم استلام طلبك (${itemName}) جاري التجهيز...`);
}
