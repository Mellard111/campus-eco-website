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

// 礼品列表（高积分兑换，均需1000积分以上）
const GIFTS = [
    { id: "g1", name: "环保帆布袋", points: 1000, stock: 100, emoji: "👜" },
    { id: "g2", name: "竹纤维笔记本", points: 1200, stock: 80, emoji: "📓" },
    { id: "g3", name: "多肉植物盆栽", points: 1500, stock: 30, emoji: "🪴" },
    { id: "g4", name: "不锈钢水杯", points: 2000, stock: 50, emoji: "🥤" },
    { id: "g5", name: "可降解餐具套装", points: 2500, stock: 40, emoji: "🍴" },
    { id: "g6", name: "环保主题T恤", points: 3000, stock: 20, emoji: "👕" },
    { id: "g7", name: "环保购物车", points: 4000, stock: 10, emoji: "🛒" },
    { id: "g8", name: "太阳能充电宝", points: 6000, stock: 5, emoji: "🔋" },
    { id: "g9", name: "空气净化器", points: 10000, stock: 3, emoji: "💨" },
    { id: "g10", name: "环保大礼包", points: 15000, stock: 2, emoji: "🎁" }
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
    try {
        const data = localStorage.getItem(ECO_DATA_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("环保数据解析失败，已重置：", e);
        return {};
    }
}

// 安全的 localStorage 写入：配额超限时不再静默失败
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.error("localStorage 写入失败：", e);
        return false;
    }
}

function saveAllEcoData(data) {
    return safeSetItem(ECO_DATA_KEY, JSON.stringify(data));
}

// 压缩图片（限制最大边长 + JPEG 质量），避免 base64 撑爆 localStorage
function compressImage(file, maxSide = 900, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const MAX_BYTES = 2 * 1024 * 1024;
        if (!file.type.startsWith("image/")) {
            if (file.size > MAX_BYTES) { reject(new Error("非图片文件不能超过 2MB")); return; }
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error("文件读取失败"));
            reader.readAsDataURL(file);
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxSide || h > maxSide) {
                    const scale = Math.min(maxSide / w, maxSide / h);
                    w = Math.round(w * scale);
                    h = Math.round(h * scale);
                }
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = () => reject(new Error("图片解析失败"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("图片读取失败"));
        reader.readAsDataURL(file);
    });
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
    return saveAllEcoData(all);
}

// 执行打卡（需上传凭证，提交后为待审核状态）
function doCheckin(userId, kind, options = {}) {
    if (!options.proof) {
        return { success: false, message: "请上传打卡凭证（图片或文件）" };
    }

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

    // 检查每日积分上限（预占）
    if (data.todayPoints + points > ECO_RULES.dailyPointCap) {
        points = ECO_RULES.dailyPointCap - data.todayPoints;
        if (points <= 0) {
            return { success: false, message: `今日积分已达上限 ${ECO_RULES.dailyPointCap}` };
        }
    }

    // 记录明细（状态为待审核，积分和减碳暂不加入累计）
    data.entries.unshift({
        id: Date.now(),
        title,
        detail,
        points,
        carbonGrams,
        kind,
        status: "pending",
        proof: options.proof,
        proofName: options.proofName || "凭证",
        createdAt: new Date().toISOString()
    });

    if (!saveUserEcoData(userId, data)) {
        return { success: false, message: "本地存储空间已满，请清理浏览器数据后重试" };
    }

    return {
        success: true,
        message: "打卡凭证已提交，等待管理员审核",
        points,
        carbonGrams,
        data
    };
}

// 审核打卡（仅管理员）
function reviewCheckin(userId, entryId, status) {
    const data = getUserEcoData(userId);
    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) return { success: false, message: "打卡记录不存在" };
    if (entry.status !== "pending") return { success: false, message: "该记录已审核" };

    entry.status = status;
    entry.reviewedAt = new Date().toISOString();

    if (status === "approved") {
        // 审核通过才加积分和减碳
        data.balance += entry.points;
        data.totalCarbonGrams += entry.carbonGrams;
        data.todayPoints += entry.points;

        const today = dayKey(new Date());
        if (data.lastCheckinDate !== today) {
            const yesterday = dayKey(new Date(Date.now() - 86400000));
            data.streak = (data.lastCheckinDate === yesterday) ? data.streak + 1 : 1;
            data.lastCheckinDate = today;
        }
        if (!data.checkedInDates.includes(today)) {
            data.checkedInDates.push(today);
        }
    } else if (status === "rejected") {
        // 拒绝时返还使用次数
        if (entry.kind === "walk") data.usage.walk.usedToday = Math.max(0, data.usage.walk.usedToday - 1);
        else if (entry.kind === "cup") data.usage.cup.usedToday = Math.max(0, data.usage.cup.usedToday - 1);
        else if (entry.kind === "recycle") data.usage.recycle.monthPoints = Math.max(0, data.usage.recycle.monthPoints - entry.points);
    }

    if (!saveUserEcoData(userId, data)) {
        return { success: false, message: "本地存储空间已满，审核结果未能保存" };
    }
    return { success: true, message: status === "approved" ? "已通过，积分已发放" : "已拒绝" };
}

// 获取所有待审核打卡（管理员用）
function getAllPendingCheckins() {
    const all = getAllEcoData();
    const users = getUsers();
    const pending = [];
    for (const userId in all) {
        const data = all[userId];
        const user = users.find(u => u.id === parseInt(userId) || u.id === userId);
        data.entries.filter(e => e.status === "pending").forEach(e => {
            pending.push({
                ...e,
                userId: parseInt(userId),
                username: user ? user.username : "未知用户",
                college: user ? user.college : ""
            });
        });
    }
    return pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    if (!saveUserEcoData(userId, data)) {
        return { success: false, message: "本地存储空间已满，兑换失败" };
    }

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

// ===== 站内分享（环保动态帖子）=====
const POSTS_KEY = "campus_eco_posts";

function getPosts() {
    try {
        const data = localStorage.getItem(POSTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("动态数据解析失败：", e);
        return [];
    }
}

function savePosts(list) {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        console.error("动态数据写入失败（存储已满）：", e);
        return false;
    }
}

function createPost(userId, username, content, image) {
    if (!content.trim()) return { success: false, message: "请输入分享内容" };
    const posts = getPosts();
    posts.unshift({
        id: Date.now(),
        userId, username, content, image: image || "",
        likes: [], comments: [],
        createdAt: new Date().toISOString()
    });
    savePosts(posts);
    return { success: true, message: "发布成功！" };
}

function deletePost(postId, userId) {
    const posts = getPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return { success: false, message: "帖子不存在" };
    if (posts[idx].userId !== userId && !isAdmin()) return { success: false, message: "无权删除" };
    posts.splice(idx, 1);
    savePosts(posts);
    return { success: true, message: "已删除" };
}

function toggleLike(postId, userId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const i = post.likes.indexOf(userId);
    if (i === -1) post.likes.push(userId);
    else post.likes.splice(i, 1);
    savePosts(posts);
    return post.likes.length;
}

function addComment(postId, userId, username, content) {
    if (!content.trim()) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    post.comments.push({ userId, username, content, createdAt: new Date().toISOString() });
    savePosts(posts);
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

// 存储过大时自动清理已审核记录的历史凭证，避免超出 localStorage 配额
function pruneOldProofs(maxChars = 3 * 1024 * 1024) {
    let raw = null;
    try { raw = localStorage.getItem(ECO_DATA_KEY); } catch (e) { return; }
    if (!raw || raw.length <= maxChars) return;
    const all = getAllEcoData();
    let changed = false;
    Object.keys(all).forEach(uid => {
        (all[uid].entries || []).forEach(entry => {
            if (entry.status !== "pending" && entry.proof) {
                entry.proof = "";
                entry.proofName = entry.proofName ? entry.proofName + "（已清理）" : "";
                changed = true;
            }
        });
    });
    if (changed) {
        saveAllEcoData(all);
        console.info("本地存储过大，已清理历史打卡凭证图片");
    }
}

// 全局错误捕获，防止页面崩溃白屏
window.addEventListener("error", function(e) {
    console.error("全局错误:", e.message);
});
window.addEventListener("unhandledrejection", function(e) {
    console.error("未处理的Promise:", e.reason);
});

document.addEventListener("DOMContentLoaded", function() {
    try { pruneOldProofs(); } catch (e) { console.error(e); }
});

// 从 bfcache 恢复时强制重新加载，避免旧页面 DOM 缓存导致内容重复渲染
window.addEventListener("pageshow", function(e) {
    if (e.persisted) {
        location.reload();
    }
});

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
