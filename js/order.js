// ============================================================
//  Room Alone — order.js
// ============================================================

let socket;
let cart          = [];
let currentTable  = null;
let currentTableName = '';

document.addEventListener('DOMContentLoaded', () => {
    socket = io(CONFIG.SERVER_URL, { transports: ['websocket','polling'] });

    // الدخول المباشر من الـ QR Code
    const params   = new URLSearchParams(location.search);
    const tableId  = params.get('t');

    if (tableId) {
        const table = getTableById(tableId);
        if (table) {
            unlockOrder(tableId); // دخول مباشر بدون كود!
        } else {
            setGateAlert('❌ الباركود غير صحيح، يرجى التأكد.', 'error');
        }
    }
});

function enterManually() {
    const tableId = document.getElementById('tableSelect').value;
    if (!tableId) { setGateAlert('اختار طاولتك الأول', 'error'); return; }
    unlockOrder(tableId);
}

function setGateAlert(msg, type) {
    document.getElementById('gateAlert').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

function unlockOrder(tableId) {
    currentTable     = tableId;
    const tableObj   = getTableById(tableId);
    currentTableName = tableObj ? tableObj.name : tableId;

    document.getElementById('orderGate').classList.add('hidden');
    document.getElementById('orderMain').classList.remove('hidden');
    document.getElementById('tableBadge').textContent = '📍 ' + currentTableName;

    renderOrderMenu('drinks');
}

// ... (باقي دوال الإضافة للسلة renderOrderMenu و addToCart و submitOrder كما هي في الكود القديم لديك) ...

// ── Menu rendering ─────────────────────────────────────────────
function switchOrderTab(category, btn) {
    document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrderMenu(category);
}

function renderOrderMenu(category) {
    const items = CONFIG.MENU[category];
    document.getElementById('orderMenuGrid').innerHTML = items.map(item => `
        <div class="order-menu-item" onclick="addToCart('${item.id}','${escapeQuotes(item.name)}',${item.price})">
            <div class="omi-emoji">${item.emoji}</div>
            <div class="omi-info">
                <div class="omi-name">${item.name}</div>
                ${item.desc ? `<div class="omi-desc">${item.desc}</div>` : ''}
            </div>
            <div class="omi-right">
                <span class="omi-price">${item.price} ج.م</span>
                <button class="add-btn" aria-label="أضف">+</button>
            </div>
        </div>
    `).join('');
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ── Cart ───────────────────────────────────────────────────────
function addToCart(id, name, price) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCartUI();
    showToast(name + ' اتضاف للسلة ✓', 'success', 1800);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const cartEl    = document.getElementById('cartItems');
    const totalRow  = document.getElementById('cartTotalRow');
    const totalVal  = document.getElementById('cartTotalVal');
    const submitBtn = document.getElementById('submitBtn');

    if (cart.length === 0) {
        cartEl.innerHTML   = '<div class="cart-empty">السلة فاضية — أضف حاجة من المنيو</div>';
        totalRow.classList.add('hidden');
        submitBtn.disabled = true;
        return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    cartEl.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span class="cart-item-name">${item.name}</span>
            <div class="qty-ctrl">
                <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
                <span style="min-width:18px;text-align:center;font-weight:700;">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
            </div>
            <span class="cart-item-price">${item.price * item.qty} ج.م</span>
        </div>
    `).join('');

    totalRow.classList.remove('hidden');
    totalVal.textContent = total + ' ج.م';
    submitBtn.disabled   = false;
}

// ── Submit ─────────────────────────────────────────────────────
function submitOrder() {
    if (cart.length === 0) return;

    const note   = document.getElementById('orderNote').value.trim();
    const total  = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const orderId = '#' + Math.floor(1000 + Math.random() * 9000);

    const orderData = {
        type:       'order',
        orderId,
        table:      currentTable,
        tableName:  currentTableName,
        items:      cart.map(i => ({ id:i.id, name:i.name, qty:i.qty, price:i.price })),
        total,
        note,
        timestamp:  new Date().toISOString()
    };

    socket.emit('send_order', orderData);

    // Show confirm screen
    document.getElementById('orderMain').classList.add('hidden');
    document.getElementById('orderConfirm').classList.remove('hidden');
    document.getElementById('confirmOrderId').textContent = orderId;

    cart = [];
    updateCartUI();
}

// ── Order again ────────────────────────────────────────────────
function orderAgain() {
    document.getElementById('orderConfirm').classList.add('hidden');
    document.getElementById('orderMain').classList.remove('hidden');
    renderOrderMenu('drinks');
    document.querySelectorAll('.menu-tab').forEach((b,i) => b.classList.toggle('active', i===0));
    document.getElementById('orderNote').value = '';
}
