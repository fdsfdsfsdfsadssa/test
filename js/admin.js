// ============================================================
//  Room Alone — admin.js
// ============================================================

let socket;
let allOrders   = [];
let allBookings = [];
let adminPass   = localStorage.getItem('ra_admin_pass') || CONFIG.ADMIN_PASS;
let isLoggedIn  = false;
let audioCtx;

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

function doLogout() {
    isLoggedIn = false;
    if (socket) socket.disconnect();
    document.getElementById('adminPanel').classList.remove('on');
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminPassInput').value = '';
}

function initAdmin() {
    socket = io(CONFIG.SERVER_URL, { transports: ['websocket','polling'] });
    socket.on('connect', () => showToast('✅ متصل بالسيرفر', 'success', 2000));
    socket.on('disconnect', () => showToast('⚠️ انقطع الاتصال — بيحاول يتصل تاني...', 'error', 4000));

    socket.on('previous_orders', (orders) => {
        orders.forEach(o => { o.type === 'booking' ? pushBooking(o) : pushOrder(o); });
        updateStats();
    });

    socket.on('new_order_to_admin', (data) => {
        playNotif();
        if (data.type === 'booking') {
            pushBooking(data);
            showToast('📅 حجز جديد: ' + data.deviceName, 'info');
        } else {
            pushOrder(data);
            showToast('🛒 طلب جديد من ' + data.tableName, 'success');
        }
        updateStats();
    });

    generateQRCodes();
}

function pushOrder(order) {
    if (allOrders.find(o => o.id === order.id)) return;
    order.status = order.status || 'new';
    allOrders.unshift(order);
    renderOrders();
}

function renderOrders() {
    const el = document.getElementById('ordersList');
    if (allOrders.length === 0) {
        el.innerHTML = '<div class="no-items">لا يوجد طلبات بعد</div>';
        return;
    }
    el.innerHTML = allOrders.map(o => orderCardHTML(o)).join('');
    updateBadge('ordBadge', allOrders.filter(o => o.status === 'new').length);
}

function orderCardHTML(o) {
    const statusMap = {
        new:      { cls:'badge-new',  label:'جديد ✨' },
        preparing:{ cls:'badge-prep', label:'بيتجهز 🍳' },
        done:     { cls:'badge-done', label:'تم ✅' }
    };
    const s = statusMap[o.status] || statusMap.new;
    const itemsHTML = (o.items || []).map(i =>
        `<div class="order-item-row"><span>${i.name} × ${i.qty}</span><span>${i.price * i.qty} ج.م</span></div>`
    ).join('');

    return `
    <div class="order-card ${o.status==='new'?'is-new':''} ${o.status==='done'?'is-done':''}" id="oc_${o.id}">
        <div class="order-card-head">
            <div>
                <span class="order-table-name">📍 ${o.tableName || o.table}</span>
                ${o.orderId ? `<span style="color:var(--text-muted);font-size:.78rem;margin-right:8px;">${o.orderId}</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge ${s.cls}">${s.label}</span>
                <span class="order-time-lbl">${o.timestamp ? formatDateTime(o.timestamp) : ''}</span>
            </div>
        </div>
        <div class="order-items-wrap">
            ${itemsHTML}
            <div class="order-total-row"><span>الإجمالي</span><span>${o.total} ج.م</span></div>
        </div>
        ${o.note ? `<p class="order-note-txt">💬 ${o.note}</p>` : ''}
        <div class="order-actions">
            ${o.status==='new'      ? `<button class="btn btn-sm btn-ghost"   onclick="setOrderStatus(${o.id},'preparing')">🍳 بدأ التجهيز</button>` : ''}
            ${o.status==='preparing'? `<button class="btn btn-sm btn-success" onclick="setOrderStatus(${o.id},'done')">✅ تم التسليم</button>` : ''}
            ${o.status==='done'     ? `<button class="btn btn-sm btn-ghost"   onclick="setOrderStatus(${o.id},'new')">↩️ إعادة</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${o.id})">🗑️</button>
        </div>
    </div>`;
}

function setOrderStatus(id, status) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;
    order.status = status;
    renderOrders();
    updateStats();
}

function deleteOrder(id) {
    allOrders = allOrders.filter(o => o.id !== id);
    renderOrders();
    updateStats();
}

function clearDoneOrders() {
    allOrders = allOrders.filter(o => o.status !== 'done');
    renderOrders();
    updateStats();
    showToast('تم مسح الطلبات المكتملة', 'info');
}

function pushBooking(b) {
    if (allBookings.find(x => x.id === b.id || (x.timestamp === b.timestamp && x.custName === b.custName))) return;
    b.bStatus = b.bStatus || 'pending';
    allBookings.unshift(b);
    renderBookings();
}

function renderBookings() {
    const el = document.getElementById('bookingsList');
    if (allBookings.length === 0) {
        el.innerHTML = '<div class="no-items">لا يوجد حجوزات بعد</div>';
        return;
    }
    el.innerHTML = allBookings.map(b => `
        <div class="order-card" style="border-right-color:#88aaff;">
            <div class="order-card-head">
                <div>
                    <span class="order-table-name">📍 ${b.deviceName}</span>
                    <span class="badge badge-booking" style="margin-right:8px;">${b.deviceType==='ps'?'بلاي ستيشن':'روم نتفليكس'}</span>
                </div>
                <span class="order-time-lbl">${b.timestamp ? formatDateTime(b.timestamp) : ''}</span>
            </div>
            <div class="order-items-wrap">
                <div class="order-item-row"><span>الاسم</span><span>${b.custName}</span></div>
                <div class="order-item-row"><span>الموبايل</span><span dir="ltr">${b.custPhone}</span></div>
                <div class="order-item-row"><span>الوقت</span><span>${b.time}</span></div>
                <div class="order-item-row"><span>المدة</span><span>${b.duration} ساعة</span></div>
                ${b.note ? `<div class="order-item-row"><span>ملاحظات</span><span>${b.note}</span></div>` : ''}
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-success" onclick="confirmBooking(this)">✅ تأكيد</button>
                <button class="btn btn-sm btn-danger"  onclick="this.closest('.order-card').remove()">🗑️ حذف</button>
            </div>
        </div>
    `).join('');
    updateBadge('bkBadge', allBookings.length);
}

function confirmBooking(btn) {
    const card = btn.closest('.order-card');
    card.style.opacity = '.5';
    btn.textContent = '✅ مؤكد';
    btn.disabled    = true;
    showToast('تم تأكيد الحجز', 'success');
}

// ── توليد وتحميل QR الكود الاحترافي ───────────────────────────
function generateQRCodes() {
    const grid    = document.getElementById('qrGrid');
    const siteUrl = CONFIG.SITE_URL;
    grid.innerHTML = '';

    CONFIG.TABLES.forEach(table => {
        const code = getDailyCode(table.id);
        const url  = `${siteUrl}/order.html?t=${table.id}&c=${code}`;

        const card = document.createElement('div');
        card.className = 'qr-card';
        card.innerHTML = `
            <div class="qr-canvas-wrap" id="qr_${table.id}"></div>
            <div class="qr-table-name">${table.icon} ${table.name}</div>
            <div class="qr-code-pill">${code}</div>
            <div class="qr-code-label">الكود الثابت للطاولة</div>
            <button class="btn btn-gold btn-sm mt-16" style="width:100%" onclick="downloadQR('${table.name}', '${url}')">⬇️ تحميل كيو آر للطباعة</button>
        `;
        grid.appendChild(card);

        try {
            new QRCode(document.getElementById('qr_' + table.id), {
                text: url, width: 130, height: 130, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            document.getElementById('qr_' + table.id).innerHTML = `<div style="font-size:.7rem;color:var(--text-muted);padding:8px;">QR غير متاح</div>`;
        }
    });
}

function downloadQR(tableName, url) {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1050;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#C9A052'; ctx.lineWidth = 15; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.lineWidth = 2; ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    const logo = new Image();
    logo.crossOrigin = "Anonymous";
    
    logo.onload = () => {
        const logoWidth = 250;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        ctx.drawImage(logo, (canvas.width - logoWidth) / 2, 80, logoWidth, logoHeight);
        drawTextAndQR(logoHeight + 120);
    };
    
    logo.onerror = () => {
        ctx.textAlign = 'center'; ctx.fillStyle = '#E8C87A'; ctx.font = 'bold 70px Cairo, sans-serif';
        ctx.fillText('ROOM ALONE', canvas.width / 2, 160);
        drawTextAndQR(220);
    };
    
    logo.src = 'assets/logo.png'; 

    function drawTextAndQR(startY) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#F2E8D0'; ctx.font = 'bold 55px Cairo, sans-serif';
        ctx.fillText(tableName, canvas.width / 2, startY + 50);
        
        const tempDiv = document.createElement('div');
        new QRCode(tempDiv, { text: url, width: 440, height: 440, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });

        setTimeout(() => {
            const qrCanvasEl = tempDiv.querySelector('canvas');
            if(qrCanvasEl) {
                const qrY = startY + 120;
                ctx.fillStyle = '#ffffff'; ctx.fillRect(160, qrY - 20, 480, 480);
                ctx.drawImage(qrCanvasEl, 180, qrY, 440, 440);
                ctx.fillStyle = '#A09080'; ctx.font = 'bold 32px Cairo, sans-serif';
                ctx.fillText('امسح الكود لطلب الأكل والمشروبات 📱', canvas.width / 2, qrY + 530);
                
                const link = document.createElement('a');
                link.download = `QR_${tableName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else { alert("حدث خطأ أثناء توليد الصورة."); }
        }, 300);
    }
}

function updateStats() {
    const today   = new Date().toISOString().split('T')[0];
    const todayOrders = allOrders.filter(o => o.timestamp && o.timestamp.startsWith(today));
    const pending     = allOrders.filter(o => o.status === 'new' || o.status === 'preparing');
    const revenue     = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const todayBk     = allBookings.filter(b => b.timestamp && b.timestamp.startsWith(today));

    document.getElementById('statOrders').textContent   = allOrders.length;
    document.getElementById('statPending').textContent  = pending.length;
    document.getElementById('statBookings').textContent = todayBk.length;
    document.getElementById('statRevenue').textContent  = revenue;
}

function updateBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count; el.style.display = count > 0 ? 'inline-block' : 'none';
}

function switchAdminTab(name, btn) {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
}

function changePass() {
    const old = document.getElementById('oldPass').value;
    const nw  = document.getElementById('newPass').value;
    const el  = document.getElementById('passAlert');

    if (old !== adminPass) { el.innerHTML = '<div class="alert alert-error">كلمة السر القديمة غلط</div>'; return; }
    if (nw.length < 6) { el.innerHTML = '<div class="alert alert-error">كلمة السر الجديدة لازم تكون 6 أحرف على الأقل</div>'; return; }
    adminPass = nw; localStorage.setItem('ra_admin_pass', nw);
    el.innerHTML = '<div class="alert alert-success">✅ تم تغيير كلمة السر</div>';
    document.getElementById('oldPass').value = ''; document.getElementById('newPass').value = '';
    setTimeout(() => el.innerHTML = '', 3000);
}

function playNotif() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    } catch(e) {}
}

function testNotif() { playNotif(); showToast('🔔 صوت الإشعار شغال', 'success'); }
