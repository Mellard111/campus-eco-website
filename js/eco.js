/* ===== 校园环保网 - 环保规则与减碳计算模块 ===== */

// 环保规则配置
const ECO_RULES = {
    dailyPointCap: 30,
    monthlyRedeemLimit: 3,
    kgPerTree: 5.3,           // 每棵侧柏每年吸收 5.3 kg CO₂
    walkGramsPerKm: 210,      // 步行每公里减碳 210g
    walk: { points: 10, dailyLimit: 2, carbonGrams: 0 },     // 碳按距离算
    cup:  { points: 2,  dailyLimit: 1, carbonGrams: 60 },    // 自带水杯减碳 60g
    recycle: { monthCap: 200, minKg: 0.1, maxKg: 50 }
};

// 打卡类型标签
const KIND_LABEL = {
    walk: "步行代替校车",
    cup: "自带水杯",
    recycle: "旧物回收"
};

// 打卡类型视觉配置
const KIND_VISUAL = {
    walk: {
        icon: "🚶",
        iconBox: "#dbeafe",
        badge: "badge-walk",
        desc: "记录绿色出行足迹"
    },
    cup: {
        icon: "🥤",
        iconBox: "#fef3c7",
        badge: "badge-cup",
        desc: "减少一次性塑料使用"
    },
    recycle: {
        icon: "♻️",
        iconBox: "#dcfce7",
        badge: "badge-recycle",
        desc: "旧物循环利用"
    }
};

// 站点配置（步行打卡）
const STATIONS = [
    { id: "north-gate", name: "北门校车站", distanceKm: 1 },
    { id: "dorm-east", name: "东区宿舍站", distanceKm: 0.8 },
    { id: "library", name: "图书馆站", distanceKm: 1.5 }
];

// 回收分类
const RECYCLE_CATEGORIES = [
    { id: "clothes", name: "旧衣物", pointsPerKg: 20, gramsPerKg: 3600 },
    { id: "books", name: "书籍", pointsPerKg: 8, gramsPerKg: 1100 },
    { id: "electronics", name: "电子产品", pointsPerKg: 30, gramsPerKg: 5000 }
];

// 礼品列表
const GIFTS = [
    { id: "g1", name: "环保帆布袋", points: 50, stock: 100, emoji: "👜" },
    { id: "g2", name: "不锈钢水杯", points: 120, stock: 50, emoji: "🥤" },
    { id: "g3", name: "多肉植物盆栽", points: 80, stock: 30, emoji: "🪴" },
    { id: "g4", name: "竹纤维笔记本", points: 60, stock: 80, emoji: "📓" },
    { id: "g5", name: "环保主题T恤", points: 200, stock: 20, emoji: "👕" },
    { id: "g6", name: "可降解餐具套装", points: 150, stock: 40, emoji: "🍴" },
    { id: "g7", name: "种子盲盒", points: 30, stock: 200, emoji: "🌱" },
    { id: "g8", name: "太阳能充电宝", points: 500, stock: 5, emoji: "🔋" }
];

// 学院排行数据
const COLLEGE_RANKING = {
    week: [
        { name: "环境科学与工程学院", kg: 1240 },
        { name: "计算机学院", kg: 1080 },
        { name: "经济管理学院", kg: 950 },
        { name: "外国语学院", kg: 760 }
    ],
    term: [
        { name: "计算机学院", kg: 15600 },
        { name: "环境科学与工程学院", kg: 14980 },
        { name: "经济管理学院", kg: 12400 },
        { name: "建筑学院", kg: 9800 }
    ]
};

// 活动列表
const EVENTS = [
    { id: "e1", title: "周末旧物交换市集", place: "学生活动中心广场", time: "10/24 14:00", status: "报名中", emoji: "🎪" },
    { id: "e2", title: "「光盘行动」志愿者招募", place: "第一食堂", time: "10/25 11:30", status: "候补中", emoji: "🍽️" },
    { id: "e3", title: "校园垃圾分类知识讲座", place: "图书馆报告厅", time: "10/28 14:00", status: "报名中", emoji: "🗑️" },
    { id: "e4", title: "植树节绿化养护活动", place: "校园绿化带", time: "11/02 08:00", status: "报名中", emoji: "🌳" }
];

// 格式化 kg
function formatKg(grams) {
    return (grams / 1000).toFixed(1);
}

// 计算相当于多少棵树
function treesFromGrams(grams) {
    return Math.round((grams / 1000 / ECO_RULES.kgPerTree) * 10) / 10;
}

// 格式化日期
function formatDateTime(iso) {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 生成近 N 天的日期 key (YYYY-MM-DD)
function dayKey(d) {
    const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return local.toISOString().slice(0, 10);
}

function lastDays(count) {
    const now = new Date();
    return Array.from({ length: count }, (_, i) =>
        dayKey(new Date(now.getTime() - (count - 1 - i) * 86400000))
    );
}

// ===== 用户环保数据存储（基于 auth 模块） =====
// 存储键名
const ECO_DATA_KEY = "campus_eco_data";

// 获取所有用户的环保数据
function getAllEcoData() {
    const data = localStorage.getItem(ECO_DATA_KEY);
    return data ? JSON.parse(data) : {};
}

function saveAllEcoData(data) {
    localStorage.setItem(ECO_DATA_KEY, JSON.stringify(data));
}

// 获取当前用户的环保数据
function getUserEcoData(userId) {
    const all = getAllEcoData();
    if (!all[userId]) {
        all[userId] = {
            balance: 0,
            totalCarbonGrams: 0,
            streak: 0,
            lastCheckinDate: null,
            checkedInDates: [],
            todayPoints: 0,
            todayDate: null,
            usage: {
                walk: { usedToday: 0, dailyLimit: ECO_RULES.walk.dailyLimit },
                cup: { usedToday: 0, dailyLimit: ECO_RULES.cup.dailyLimit },
                recycle: { monthPoints: 0, monthCap: ECO_RULES.recycle.monthCap }
            },
            entries: [],
            redeemCount: 0,
            redeemMonth: null
        };
        saveAllEcoData(all);
    }
    const data = all[userId];
    // 重置每日数据
    const today = dayKey(new Date());
    if (data.todayDate !== today) {
        data.todayPoints = 0;
        data.todayDate = today;
        data.usage.walk.usedToday = 0;
        data.usage.cup.usedToday = 0;
        saveAllEcoData(all);
    }
    // 重置每月兑换
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    if (data.redeemMonth !== monthKey) {
        data.redeemCount = 0;
        data.redeemMonth = monthKey;
        saveAllEcoData(all);
    }
    return data;
}

function saveUserEcoData(userId, data) {
    const all = getAllEcoData();
    all[userId] = data;
    saveAllEcoData(all);
}

// 执行打卡
function doCheckin(userId, kind, options = {}) {
    const data = getUserEcoData(userId);
    const today = dayKey(new Date());

    let points = 0;
    let carbonGrams = 0;
    let title = "";
    let detail = "";

    if (kind === "walk") {
        const station = STATIONS.find(s => s.id === options.stationId);
        if (!station) return { success: false, message: "请选择站点" };
        if (data.usage.walk.usedToday >= ECO_RULES.walk.dailyLimit) {
            return { success: false, message: "今日步行打卡已达上限" };
        }
        points = ECO_RULES.walk.points;
        carbonGrams = Math.round(station.distanceKm * ECO_RULES.walkGramsPerKm);
        title = `${KIND_LABEL.walk} - ${station.name}`;
        detail = `${station.distanceKm} km · 减碳 ${carbonGrams}g`;
        data.usage.walk.usedToday++;
    } else if (kind === "cup") {
        if (data.usage.cup.usedToday >= ECO_RULES.cup.dailyLimit) {
            return { success: false, message: "今日自带水杯打卡已达上限" };
        }
        points = ECO_RULES.cup.points;
        carbonGrams = ECO_RULES.cup.carbonGrams;
        title = KIND_LABEL.cup;
        detail = `减碳 ${carbonGrams}g`;
        data.usage.cup.usedToday++;
    } else if (kind === "recycle") {
        const cat = RECYCLE_CATEGORIES.find(c => c.id === options.categoryId);
        if (!cat) return { success: false, message: "请选择回收类别" };
        const kg = parseFloat(options.weightKg);
        if (!kg || kg < ECO_RULES.recycle.minKg) {
            return { success: false, message: `回收重量至少 ${ECO_RULES.recycle.minKg} kg` };
        }
        if (kg > ECO_RULES.recycle.maxKg) {
            return { success: false, message: `单次回收不超过 ${ECO_RULES.recycle.maxKg} kg` };
        }
        if (data.usage.recycle.monthPoints >= ECO_RULES.recycle.monthCap) {
            return { success: false, message: "本月回收积分已达上限" };
        }
        points = Math.round(kg * cat.pointsPerKg);
        carbonGrams = Math.round(kg * cat.gramsPerKg);
        title = `${KIND_LABEL.recycle} - ${cat.name}`;
        detail = `${kg} kg · 减碳 ${carbonGrams}g`;
        data.usage.recycle.monthPoints += points;
    }

    // 检查每日积分上限
    if (data.todayPoints + points > ECO_RULES.dailyPointCap) {
        points = ECO_RULES.dailyPointCap - data.todayPoints;
        if (points <= 0) {
            return { success: false, message: `今日积分已达上限 ${ECO_RULES.dailyPointCap}` };
        }
    }

    // 更新数据
    data.balance += points;
    data.totalCarbonGrams += carbonGrams;
    data.todayPoints += points;

    // 连续打卡
    if (data.lastCheckinDate !== today) {
        const yesterday = dayKey(new Date(Date.now() - 86400000));
        if (data.lastCheckinDate === yesterday) {
            data.streak++;
        } else {
            data.streak = 1;
        }
        data.lastCheckinDate = today;
    }
    if (!data.checkedInDates.includes(today)) {
        data.checkedInDates.push(today);
    }

    // 记录明细
    data.entries.unshift({
        id: Date.now(),
        title,
        detail,
        points,
        carbonGrams,
        kind,
        createdAt: new Date().toISOString()
    });

    saveUserEcoData(userId, data);

    return {
        success: true,
        message: `打卡成功！获得 ${points} 积分，减碳 ${carbonGrams}g`,
        points,
        carbonGrams,
        data
    };
}

// 兑换礼品
function redeemGift(userId, giftId) {
    const data = getUserEcoData(userId);
    const gift = GIFTS.find(g => g.id === giftId);
    if (!gift) return { success: false, message: "礼品不存在" };
    if (gift.stock <= 0) return { success: false, message: "礼品已兑完" };
    if (data.balance < gift.points) return { success: false, message: "积分不足" };
    if (data.redeemCount >= ECO_RULES.monthlyRedeemLimit) {
        return { success: false, message: `本月已达兑换上限 ${ECO_RULES.monthlyRedeemLimit} 件` };
    }

    data.balance -= gift.points;
    data.redeemCount++;
    const code = "ECO" + Math.random().toString(36).slice(2, 8).toUpperCase();
    data.entries.unshift({
        id: Date.now(),
        title: `兑换：${gift.name}`,
        detail: `领取码 ${code}（7天内有效）`,
        points: -gift.points,
        kind: "redeem",
        createdAt: new Date().toISOString()
    });

    gift.stock--;
    saveUserEcoData(userId, data);

    return {
        success: true,
        message: `兑换成功！领取码：${code}`,
        code,
        data
    };
}

// 获取用户环保概览
function getEcoSummary(userId) {
    const data = getUserEcoData(userId);
    return {
        balance: data.balance,
        totalCarbonGrams: data.totalCarbonGrams,
        streak: data.streak,
        todayPoints: data.todayPoints,
        dailyPointCap: ECO_RULES.dailyPointCap,
        trees: treesFromGrams(data.totalCarbonGrams),
        usage: data.usage,
        redeemCount: data.redeemCount,
        monthlyRedeemLimit: ECO_RULES.monthlyRedeemLimit
    };
}

// 获取近30天减碳趋势
function getCarbonTrend(userId) {
    const data = getUserEcoData(userId);
    const days = lastDays(30);
    const trend = days.map(date => {
        const dayGrams = data.entries
            .filter(e => dayKey(new Date(e.createdAt)) === date && e.carbonGrams)
            .reduce((sum, e) => sum + (e.carbonGrams || 0), 0);
        return { date, grams: dayGrams };
    });
    const totalGrams = trend.reduce((s, d) => s + d.grams, 0);
    const last30Grams = totalGrams;

    // 按类型统计
    const byKindMap = {};
    data.entries.forEach(e => {
        if (!e.carbonGrams) return;
        if (!byKindMap[e.kind]) byKindMap[e.kind] = { grams: 0, count: 0 };
        byKindMap[e.kind].grams += e.carbonGrams;
        byKindMap[e.kind].count++;
    });
    const byKind = Object.entries(byKindMap).map(([kind, v]) => ({ kind, ...v }));

    return { totalGrams: data.totalCarbonGrams, last30Grams, trend, byKind };
}

// 分享文本（优先使用系统分享，否则复制到剪贴板）
function shareText(text) {
    if (navigator.share) {
        navigator.share({ title: "校园环保网", text: text }).catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("已复制到剪贴板，快去分享吧！", "success");
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand("copy");
        showToast("已复制到剪贴板，快去分享吧！", "success");
    } catch (e) {
        showToast("分享内容：" + text);
    }
    document.body.removeChild(ta);
}

// Toast 提示
function showToast(message, type = "") {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = "toast show " + type;
    setTimeout(() => toast.classList.remove("show"), 2600);
}
