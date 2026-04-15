// ============================================================
//  Room Alone — booking.js
// ============================================================

let socket;
let selectedType    = 'ps';
let selectedDevice  = null;
let selectedTime    = null;

const TIME_SLOTS = [
    '12:00 م','1:00 م','2:00 م','3:00 م','4:00 م',
    '5:00 م','6:00 م','7:00 م','8:00 م','9:00 م','10:00 م','11:00 م'
];

const PRICES = { ps: 50, room: 60 }; // per hour

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    socket = io(CONFIG.SERVER_URL, { transports: ['websocket','polling'] });

    // pre-select type from URL ?type=ps / ?type=room
    const urlType = new URLSearchParams(location.search).get('type');
    if (urlType === 'room') {
        setType('room', document.querySelectorAll('.menu-tab')[1]);
    } else {
        renderDevices('ps');
        renderTimes();
    }
});

// ── Type switcher ─────────────────────────────────────────────
function setType(type, btn) {
    selectedType   = type;
    selectedDevice = null;
    document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderDevices(type);
    renderTimes();
    updateSummary();
}

// ── Device cards ──────────────────────────────────────────────
function renderDevices(type) {
    const tables  = CONFIG.TABLES.filter(t => t.type === type);
    const grid    = document.getElementById('deviceGrid');
    grid.innerHTML = tables.map(t => `
        <div class="device-card" id="dev_${t.id}" onclick="selectDevice('${t.id}','${t.name}',this)">
            <div class="device-icon">${t.icon}</div>
            <div class="device-name">${t.name}</div>
            <div class="device-status status-free">متاح ✓</div>
        </div>
    `).join('');
}

function selectDevice(id, name, el) {
    if (el.classList.contains('busy')) return;
    document.querySelectorAll('.device-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedDevice = { id, name };
    updateSummary();
}

// ── Time slots ────────────────────────────────────────────────
function renderTimes() {
    const grid = document.getElementById('timeGrid');
    grid.innerHTML = TIME_SLOTS.map(t => `
        <div class="time-slot" onclick="selectTime('${t}',this)">${t}</div>
    `).join('');
    selectedTime = null;
}

function selectTime(t, el) {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    selectedTime = t;
    updateSummary();
}

// ── Summary ───────────────────────────────────────────────────
function updateSummary() {
    const dur   = parseInt(document.getElementById('durSelect')?.value || 1);
    const name  = document.getElementById('custName')?.value || '—';
    const price = PRICES[selectedType] * dur;

    document.getElementById('sumType').textContent   = selectedType === 'ps' ? 'بلاي ستيشن' : 'روم نتفليكس';
    document.getElementById('sumDevice').textContent = selectedDevice?.name  || '—';
    document.getElementById('sumTime').textContent   = selectedTime          || '—';
    document.getElementById('sumDur').textContent    = dur === 1 ? 'ساعة' : dur + ' ساعات';
    document.getElementById('sumName').textContent   = name || '—';
}

// ── Submit ────────────────────────────────────────────────────
function submitBooking() {
    const name  = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const dur   = parseInt(document.getElementById('durSelect').value);
    const note  = document.getElementById('custNote').value.trim();
    const alertEl = document.getElementById('bookingAlert');

    // Validate
    if (!selectedDevice) { showAlert(alertEl, 'اختار الجهاز أو الروم الأول', 'error'); return; }
    if (!selectedTime)   { showAlert(alertEl, 'اختار وقت البداية', 'error');           return; }
    if (!name)           { showAlert(alertEl, 'اكتب اسمك', 'error');                   return; }
    if (!phone)          { showAlert(alertEl, 'اكتب رقم موبايلك', 'error');            return; }

    const bookingData = {
        type:       'booking',
        deviceId:   selectedDevice.id,
        deviceName: selectedDevice.name,
        deviceType: selectedType,
        time:       selectedTime,
        duration:   dur,
        custName:   name,
        custPhone:  phone,
        note,
        timestamp:  new Date().toISOString()
    };

    socket.emit('send_order', bookingData);

    // Show confirm
    document.querySelector('.booking-grid').style.display = 'none';
    document.querySelector('.menu-tabs').style.display    = 'none';
    document.querySelector('.section-header').style.display = 'none';
    document.getElementById('bookingConfirm').classList.remove('hidden');
    showToast('تم إرسال طلب الحجز!', 'success');
}

function showAlert(el, msg, type) {
    el.innerHTML = `<div class="alert alert-${type}">⚠️ ${msg}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 3500);
}
