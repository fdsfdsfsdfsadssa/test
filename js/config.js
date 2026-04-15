// ============================================================
//  Room Alone — config.js
//  ⚠️ غيّر SITE_URL بعد ما تنشر على GitHub Pages
// ============================================================

const CONFIG = {
    SERVER_URL: 'http://node24.lunes.host:3488', // ⚠️ يفضل لاحقاً رفعه على استضافة تدعم https مثل Render
    SITE_URL:   'https://fdsfdsfsdfsadssaE.github.io/test', // ← غيّر ده لرابط موقعك
    SECRET:     'RoomAlone_Secret_RA2024_X9',
    ADMIN_PASS: '1',

    TABLES: [
        { id: 'PS1',   name: 'بلاي ستيشن 1',    type: 'ps',   icon: '🎮' },
        { id: 'PS2',   name: 'بلاي ستيشن 2',    type: 'ps',   icon: '🎮' },
        { id: 'PS3',   name: 'بلاي ستيشن 3',    type: 'ps',   icon: '🎮' },
        { id: 'PS4',   name: 'بلاي ستيشن 4',    type: 'ps',   icon: '🎮' },
        { id: 'ROOM1', name: 'روم نتفليكس 1',   type: 'room', icon: '📺' },
        { id: 'ROOM2', name: 'روم نتفليكس 2',   type: 'room', icon: '📺' },
        { id: 'T1',    name: 'طاولة كافيه 1',   type: 'cafe', icon: '☕' },
        { id: 'T2',    name: 'طاولة كافيه 2',   type: 'cafe', icon: '☕' },
        { id: 'T3',    name: 'طاولة كافيه 3',   type: 'cafe', icon: '☕' },
        { id: 'T4',    name: 'طاولة كافيه 4',   type: 'cafe', icon: '☕' },
        { id: 'T5',    name: 'طاولة كافيه 5',   type: 'cafe', icon: '☕' },
    ],

    MENU: {
        drinks: [
            { id:'d1', name:'كابتشينو',          price:35, desc:'اسبريسو مع حليب مبخر',        emoji:'☕' },
            { id:'d2', name:'لاتيه',             price:40, desc:'اسبريسو ناعم مع حليب',         emoji:'🥛' },
            { id:'d3', name:'موكا',              price:45, desc:'لاتيه مع شوكولاتة',            emoji:'🍫' },
            { id:'d4', name:'شيكولاتة ساخنة',   price:40, desc:'كريمية فاخرة',                 emoji:'🍵' },
            { id:'d5', name:'عصير برتقال طازج', price:30, desc:'برتقال طازج 100٪',             emoji:'🍊' },
            { id:'d6', name:'عصير مانجو',        price:35, desc:'مانجو طازجة',                  emoji:'🥭' },
            { id:'d7', name:'ريد بول',           price:45, desc:'مشروب طاقة',                   emoji:'⚡' },
            { id:'d8', name:'بيبسي / كوكاكولا', price:15, desc:'مشروب غازي',                   emoji:'🥤' },
            { id:'d9', name:'مياه معدنية',       price:10, desc:'',                             emoji:'💧' },
        ],
        food: [
            { id:'f1', name:'سندوتش دجاج كرسبي', price:65, desc:'دجاج مقرمش مع صوص خاص',   emoji:'🍗' },
            { id:'f2', name:'سندوتش لحمة',        price:75, desc:'لحمة مشوية مع خضار',       emoji:'🥩' },
            { id:'f3', name:'بيتزا ميني',          price:90, desc:'بيتزا بالجبنة',            emoji:'🍕' },
            { id:'f4', name:'توست بالجبنة',        price:45, desc:'توست محمر مع جبنة مشكلة', emoji:'🧀' },
            { id:'f5', name:'ناجتس دجاج',          price:55, desc:'6 قطع مع صوص',            emoji:'🍘' },
        ],
        snacks: [
            { id:'s1', name:'بطاطس مقرمشة', price:20, desc:'حصة كبيرة',       emoji:'🍟' },
            { id:'s2', name:'بوشيبس',       price:15, desc:'أكياس متنوعة',     emoji:'🥨' },
            { id:'s3', name:'شوكولاتة',     price:20, desc:'تشكيلة شوكولاتة',  emoji:'🍫' },
            { id:'s4', name:'كوكيز',        price:25, desc:'3 قطع',            emoji:'🍪' },
            { id:'s5', name:'دونات',        price:30, desc:'دونات طازجة',       emoji:'🍩' },
        ]
    }
};

// ── Fixed 4-digit code per table (لا يتغير أبداً) ──────────────────
function getDailyCode(tableId) {
    const raw   = tableId + CONFIG.SECRET;
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = Math.imul(hash, 33) ^ raw.charCodeAt(i);
    }
    return (Math.abs(hash) % 9000) + 1000; // always 4 digits
}

function validateTableAccess(tableId, code) {
    return parseInt(code) === getDailyCode(tableId);
}

function getTableById(id) {
    return CONFIG.TABLES.find(t => t.id === id) || null;
}

function getTableTypeLabel(type) {
    return { ps:'بلاي ستيشن', room:'روم نتفليكس', cafe:'كافيه' }[type] || type;
}
