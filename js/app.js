// إعدادات السيرفر
const SERVER_URL = "https://node24.lunes.host:3488"; // الرابط الخاص بك
const socket = io(SERVER_URL, { transports: ['websocket'] });

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل الأنيميشن عند السكرول
    initScrollReveal();

    // التعرف على الصفحة الحالية وتشغيل الوظائف المناسبة
    const path = window.location.pathname;
    
    if (document.getElementById('dynamic-menu')) {
        renderMenu();
    }

    if (document.getElementById('admin-orders-list')) {
        initAdminPanel();
    }
});

// إرسال الطلب للسيرفر (للعملاء)
function handleOrder(itemName, price) {
    const table = prompt("برجاء إدخال رقم الطاولة أو الغرفة:");
    
    if (!table || table.trim() === "") {
        alert("يجب إدخال رقم الطاولة لإتمام الطلب");
        return;
    }

    const orderData = {
        item: itemName,
        price: price,
        table: table,
        time: new Date().toLocaleTimeString('ar-EG'),
        timestamp: Date.now()
    };

    // إرسال عبر Socket.io للسيرفر
    socket.emit('send_order', orderData);

    // إظهار رسالة نجاح احترافية
    showToast(`تم إرسال طلب ${itemName} بنجاح`);
}

// إدارة لوحة التحكم (للأدمن)
function initAdminPanel() {
    const list = document.getElementById('admin-orders-list');

    // استقبال الطلبات القديمة عند الدخول
    socket.on('previous_orders', (orders) => {
        list.innerHTML = '';
        orders.forEach(order => addOrderToUI(order));
    });

    // استقبال الطلبات الجديدة لحظياً
    socket.on('new_order_to_admin', (order) => {
        addOrderToUI(order);
        playOrderSound();
    });
}

function addOrderToUI(order) {
    const list = document.getElementById('admin-orders-list');
    const orderElement = document.createElement('div');
    orderElement.className = "bg-zinc-900 border-l-4 border-[#C5A059] p-5 rounded-xl animate__animated animate__fadeInDown flex justify-between items-center mb-4";
    orderElement.innerHTML = `
        <div>
            <div class="flex items-center gap-3">
                <span class="bg-[#C5A059] text-black text-xs font-bold px-2 py-1 rounded">طاولة ${order.table}</span>
                <span class="text-gray-500 text-xs">${order.time}</span>
            </div>
            <h3 class="text-xl font-bold mt-2">${order.item}</h3>
            <p class="text-[#C5A059]">${order.price} EGP</p>
        </div>
        <button onclick="this.parentElement.remove()" class="bg-green-600/20 text-green-500 border border-green-600/30 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition">تم التنفيذ</button>
    `;
    list.prepend(orderElement);
}

// وظائف مساعدة
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 left-5 bg-[#C5A059] text-black px-6 py-3 rounded-full font-bold shadow-2xl animate__animated animate__fadeInUp z-[100]";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function playOrderSound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked"));
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
