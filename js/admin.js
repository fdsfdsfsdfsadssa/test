// ============================================================
//  Room Alone — admin.js (النسخة الاحترافية المطورة)
// ============================================================

let socket;
let allOrders   = [];
let allBookings = [];
let adminPass   = localStorage.getItem('ra_admin_pass') || CONFIG.ADMIN_PASS;
let isLoggedIn  = false;
let audioCtx;

// 1. الدخول (Login)
function doLogin() {
    const val = document.getElementById('adminPassInput').value;
    if (val === adminPass) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').classList.add('on');
        isLoggedIn = true;
        initAdmin();
    } else {
        document.getElementById('loginAlert').innerHTML = '<div class="alert alert-error">❌ كلمة السر غلط</div>';
        setTimeout(() => document.getElementById('loginAlert').innerHTML = '', 3000);
    }
}

// 2. التهيئة والاتصال بالسيرفر (Initialization)
function initAdmin() {
    // الاتصال بالسيرفر
    socket = io(CONFIG.SERVER_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
        showToast('✅ متصل بالسيرفر لحظياً', 'success');
    });

    // استقبال الطلبات القديمة عند فتح الصفحة
    socket.on('previous_orders', (data) => {
        allOrders = data.filter(i => i.type === 'order');
        allBookings = data.filter(i => i.type === 'booking');
        renderAll();
    });

    // استقبال أي طلب جديد يصل الآن
    socket.on('new_order_to_admin', (data) => {
        playNotif(); // تشغيل صوت التنبيه
        showToast(`🔔 طلب جديد من: ${data.tableName || data.deviceName}`, 'info');
        
        if (data.type === 'booking') {
            allBookings.unshift(data);
        } else {
            allOrders.unshift(data);
        }
        renderAll();
    });
}

// 3. عرض البيانات (Rendering)
function renderAll() {
    renderOrders();
    renderBookings();
    generateQRCodes(); // تحديث الـ QR Codes
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    if (allOrders.length === 0) {
        container.innerHTML = '<div class="no-items">لا يوجد طلبات حالياً</div>';
        return;
    }

    container.innerHTML = allOrders.map(order => `
        <div class="card animate-on-scroll visible">
            <div class="flex-between mb-8">
                <span class="text-gold">📦 طلب ${order.orderId}</span>
                <span class="text-muted" style="font-size:0.8rem">${new Date(order.timestamp).toLocaleTimeString('ar-EG')}</span>
            </div>
            <div style="font-weight:bold; margin-bottom:8px;">📍 ${order.tableName}</div>
            <div class="order-items-list">
                ${order.items.map(i => `<div>- ${i.name} (x${i.qty})</div>`).join('')}
            </div>
            <div class="flex-between mt-16 pt-8" style="border-top:1px solid var(--gold-border)">
                <span>الإجمالي: <strong class="text-gold">${order.total} ج.م</strong></span>
                <button class="btn btn-outline btn-sm" onclick="removeOrder('${order.id}')">إكمال الطلب</button>
            </div>
            ${order.note ? `<div class="mt-8 text-muted" style="font-size:0.85rem">📝 ${order.note}</div>` : ''}
        </div>
    `).join('');
}

function renderBookings() {
    const container = document.getElementById('bookingsList');
    if (allBookings.length === 0) {
        container.innerHTML = '<div class="no-items">لا يوجد حجوزات حالياً</div>';
        return;
    }

    container.innerHTML = allBookings.map(b => `
        <div class="card animate-on-scroll visible" style="border-right: 4px solid var(--gold)">
            <div class="flex-between mb-8">
                <span style="color:var(--green)">📅 حجز جديد</span>
                <span class="text-muted" style="font-size:0.8rem">${new Date(b.timestamp).toLocaleTimeString('ar-EG')}</span>
            </div>
            <div style="font-weight:bold;">👤 ${b.custName}</div>
            <div class="text-gold mb-8">📞 ${b.custPhone}</div>
            <div class="mb-8">🎮 المكان: <strong>${b.deviceName}</strong></div>
            <div class="mb-8">⏰ الوقت: ${b.time} (لمدة ${b.duration} ساعة)</div>
            <button class="btn btn-gold btn-sm w-full mt-8" onclick="removeBooking('${b.id}')">تأكيد ومسح</button>
        </div>
    `).join('');
}

// 4. نظام الـ QR Code الاحترافي (الكارت)
function generateQRCodes() {
    const grid = document.getElementById('qrGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const logoImg = new Image();
    logoImg.src = 'assets/logo.png'; // تأكد من وجود اللوجو في هذا المسار

    logoImg.onload = () => {
        CONFIG.TABLES.forEach(table => {
            const url = `${CONFIG.SITE_URL}/order.html?t=${table.id}`;
            
            const cardWrap = document.createElement('div');
            cardWrap.className = 'qr-card-container';
            cardWrap.innerHTML = `
                <div id="qr_hidden_${table.id}" style="display:none;"></div>
                <canvas id="canvas_${table.id}" width="400" height="550" class="qr-canvas-preview"></canvas>
                <button class="btn btn-gold btn-sm w-full mt-8" onclick="downloadQR('${table.id}', '${table.name}')">📥 تحميل كارت ${table.name}</button>
            `;
            grid.appendChild(cardWrap);

            // توليد الـ QR Code (مخفي للاستخدام في الرسم)
            new QRCode(document.getElementById(`qr_hidden_${table.id}`), {
                text: url, width: 260, height: 260, colorDark: "#000000", colorLight: "#ffffff"
            });

            // رسم الكارت على الكانفاس
            setTimeout(() => {
                const qrImg = document.querySelector(`#qr_hidden_${table.id} img`);
                const canvas = document.getElementById(`canvas_${table.id}`);
                const ctx = canvas.getContext('2d');

                // 1. الخلفية
                ctx.fillStyle = '#0c0c0c';
                ctx.fillRect(0, 0, 400, 550);

                // 2. إطار ذهبي
                ctx.strokeStyle = '#C9A052';
                ctx.lineWidth = 8;
                ctx.strokeRect(15, 15, 370, 520);

                // 3. رسم اللوجو (في المنتصف العلوي)
                ctx.drawImage(logoImg, 140, 40, 120, 120);

                // 4. نصوص الكارت
                ctx.fillStyle = '#E8C87A';
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px Cairo';
                ctx.fillText('Room Alone Gaming Cafe', 200, 190);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '18px Cairo';
                ctx.fillText('امسح الكود لطلب مشروباتك وأكلك', 200, 225);

                // 5. رسم الـ QR Code بخلفية بيضاء
                if (qrImg && qrImg.src) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(65, 250, 270, 270);
                    const q = new Image();
                    q.src = qrImg.src;
                    q.onload = () => ctx.drawImage(q, 70, 255, 260, 260);
                }

                // 6. اسم الطاولة في الأسفل
                ctx.fillStyle = '#C9A052';
                ctx.font = 'bold 30px Cairo';
                ctx.fillText(`📍 ${table.name}`, 200, 510);

            }, 600);
        });
    };
}

function downloadQR(id, name) {
    const canvas = document.getElementById(`canvas_${id}`);
    const link = document.createElement('a');
    link.download = `QR_RoomAlone_${name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// 5. وظائف الإدارة
function removeOrder(id) {
    allOrders = allOrders.filter(o => o.id != id);
    renderOrders();
    showToast('تم إكمال الطلب بنجاح');
}

function removeBooking(id) {
    allBookings = allBookings.filter(b => b.id != id);
    renderBookings();
    showToast('تم تأكيد الحجز');
}

function playNotif() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Do
    osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.2); // Mi
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// تبديل الأقسام في لوحة التحكم
function showSection(id, btn) {
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}
