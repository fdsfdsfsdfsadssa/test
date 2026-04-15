// ============================================================
//  Room Alone — config.js
// ============================================================

const CONFIG = {
    // ⚠️ تنبيه: لو رفعت الموقع على GitHub (https)، لازم السيرفر يكون (https) عشان يشتغل
    SERVER_URL: 'http://node24.lunes.host:3488', // غيرها لـ الرابط الجديد لو استخدمت استضافة أخرى
    SITE_URL:   'https://fdsfdsfsdfsadssa.github.io/test', // رابط موقعك
    ADMIN_PASS: 'roomalone2024',

    TABLES: [
        { id: 'PS1',   name: 'بلاي ستيشن 1',    type: 'ps',   icon: '🎮' },
        { id: 'PS2',   name: 'بلاي ستيشن 2',    type: 'ps',   icon: '🎮' },
        { id: 'ROOM1', name: 'روم نتفليكس 1',   type: 'room', icon: '📺' },
        { id: 'T1',    name: 'طاولة كافيه 1',   type: 'cafe', icon: '☕' },
        { id: 'T2',    name: 'طاولة كافيه 2',   type: 'cafe', icon: '☕' },
    ],

    MENU: {
        drinks: [
            { id:'d1', name:'كابتشينو', price:35, desc:'اسبريسو مع حليب مبخر', emoji:'☕' },
            { id:'d8', name:'بيبسي / كوكاكولا', price:15, desc:'مشروب غازي مقاطع', emoji:'🥤' },
        ],
        food: [
            { id:'f1', name:'سندوتش دجاج كرسبي', price:65, desc:'دجاج مقرمش مع صوص خاص', emoji:'🍗' },
            { id:'f3', name:'بيتزا ميني', price:90, desc:'بيتزا بالجبنة', emoji:'🍕' },
        ],
        snacks: [
            { id:'s1', name:'بطاطس مقرمشة', price:20, desc:'حصة كبيرة', emoji:'🍟' },
        ]
    }
};

function getTableById(id) {
    return CONFIG.TABLES.find(t => t.id === id) || null;
}
