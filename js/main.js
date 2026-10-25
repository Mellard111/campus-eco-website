/* ===== 校园环保网 - 首页与活动页渲染 ===== */

// 环保资讯
const ECO_NEWS = [
    { emoji: "🌱", title: "校园垃圾分类新规实施", desc: "学校自本月起全面实施垃圾分类新规，请同学们积极配合。", tag: "校园动态" },
    { emoji: "♻️", title: "旧物回收活动火热进行中", desc: "捐赠旧书、旧衣物可获得环保积分奖励。", tag: "活动通知" },
    { emoji: "🌳", title: "植树节植树报名开启", desc: "一年一度的校园植树节即将到来，开放报名通道。", tag: "志愿活动" },
    { emoji: "💧", title: "节约用水倡议书", desc: "倡议全体师生从身边小事做起，养成节约用水习惯。", tag: "环保倡议" },
    { emoji: "🌍", title: "世界地球日主题活动预告", desc: "包括环保讲座、海报设计大赛等系列活动。", tag: "主题活动" },
    { emoji: "🚲", title: "绿色出行月：骑行打卡", desc: "选择骑行、步行等绿色出行方式，兑换环保纪念品。", tag: "互动活动" }
];

// 环保小贴士
const ECO_TIPS = [
    { title: "随手关灯", desc: "离开教室、宿舍时随手关灯，每节约1度电可减少约0.785公斤碳排放。" },
    { title: "自带水杯", desc: "自带水杯可减少一次性塑料瓶使用，一年可减少上百个塑料瓶垃圾。" },
    { title: "双面打印", desc: "打印材料时尽量双面使用，可节约一半纸张，保护森林资源。" },
    { title: "绿色出行", desc: "短途出行选择步行或骑行，既锻炼身体又减少碳排放。" },
    { title: "光盘行动", desc: "用餐时按需取餐，践行光盘行动，减少食物浪费。" },
    { title: "垃圾分类", desc: "正确分类投放垃圾，让可回收物得到循环利用。" }
];

// 渲染减碳统计 Hero
function renderHeroStats() {
    const el = document.getElementById("heroStats");
    if (!el) return;
    const user = getCurrentUser();

    if (user) {
        const summary = getEcoSummary(user.id);
        const trees = summary.trees;
        el.innerHTML = `
            <div class="blob"></div>
            <div class="hero-inner">
                <div class="hero-left">
                    <p class="label">累计减碳量</p>
                    <div class="hero-value">
                        <h1>${formatKg(summary.totalCarbonGrams)}</h1>
                        <span>kg CO₂</span>
                    </div>
                    ${summary.totalCarbonGrams === 0
                        ? `<button class="hero-trees" style="background:none;border:none;color:#fff;cursor:pointer;text-decoration:underline;underline-offset:4px;font-size:14px;" onclick="openCheckin()">完成第一次打卡后可查看你的减碳成果</button>`
                        : `<p class="hero-trees">✓ 相当于为地球种植了 <strong>${trees}</strong> 棵侧柏</p>`
                    }
                </div>
                <div class="hero-right">
                    <div class="hero-stat-box">
                        <span class="num">${summary.balance}</span>
                        <span class="lbl">当前积分</span>
                    </div>
                    <div class="hero-stat-box">
                        <span class="num">${summary.streak}</span>
                        <span class="lbl">连续打卡</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // 未登录展示默认数据
        el.innerHTML = `
            <div class="blob"></div>
            <div class="hero-inner">
                <div class="hero-left">
                    <p class="label">累计减碳量</p>
                    <div class="hero-value">
                        <h1>--</h1>
                        <span>kg CO₂</span>
                    </div>
                    <p class="hero-trees">登录后查看你的减碳成果 🌱</p>
                </div>
                <div class="hero-right">
                    <div class="hero-stat-box">
                        <span class="num">--</span>
                        <span class="lbl">当前积分</span>
                    </div>
                    <div class="hero-stat-box">
                        <span class="num">--</span>
                        <span class="lbl">连续打卡</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 渲染打卡卡片
function renderCheckinCards() {
    const el = document.getElementById("checkinCards");
    if (!el) return;
    const user = getCurrentUser();

    let hint = "";
    let cards = "";

    if (user) {
        const summary = getEcoSummary(user.id);
        if (summary.todayPoints === 0) {
            hint = `<button class="checkin-hint" onclick="openCheckin('cup')">今天还没有打卡，去试试自带水杯 →</button>`;
        }

        const kinds = ["walk", "cup", "recycle"];
        cards = kinds.map(kind => {
            const v = KIND_VISUAL[kind];
            const u = summary.usage[kind];
            let badge, status, done;
            if (kind === "walk") {
                badge = `+${ECO_RULES.walk.points} 积分`;
                status = `今日 ${u.usedToday}/${u.dailyLimit}`;
                done = u.usedToday >= u.dailyLimit;
            } else if (kind === "cup") {
                badge = `+${ECO_RULES.cup.points} 积分`;
                status = `今日 ${u.usedToday}/${u.dailyLimit}`;
                done = u.usedToday >= u.dailyLimit;
            } else {
                badge = "按重计分";
                status = `上限 ${u.monthCap}/月`;
                done = u.monthPoints >= u.monthCap;
            }
            return `
                <button class="checkin-card" onclick="openCheckin('${kind}')">
                    <div class="checkin-icon" style="background:${v.iconBox}">${v.icon}</div>
                    <h3>${KIND_LABEL[kind]}</h3>
                    <p class="desc">${v.desc}</p>
                    <div class="badges">
                        <span class="badge-points ${v.badge}">${badge}</span>
                        <span class="checkin-status">${status}</span>
                        ${done ? '<span class="checkin-done">✓ 已完成</span>' : ''}
                    </div>
                </button>
            `;
        }).join("");
    } else {
        hint = `<button class="checkin-hint" onclick="location.href='login.html'">登录后即可参与低碳打卡 →</button>`;
        const kinds = ["walk", "cup", "recycle"];
        cards = kinds.map(kind => {
            const v = KIND_VISUAL[kind];
            const badge = kind === "walk" ? `+${ECO_RULES.walk.points} 积分` : kind === "cup" ? `+${ECO_RULES.cup.points} 积分` : "按重计分";
            return `
                <button class="checkin-card" onclick="location.href='login.html'">
                    <div class="checkin-icon" style="background:${v.iconBox}">${v.icon}</div>
                    <h3>${KIND_LABEL[kind]}</h3>
                    <p class="desc">${v.desc}</p>
                    <div class="badges">
                        <span class="badge-points ${v.badge}">${badge}</span>
                    </div>
                </button>
            `;
        }).join("");
    }

    el.innerHTML = `
        <div class="section-head">
            <h2>低碳打卡</h2>
            <span style="font-size:14px;color:var(--text-muted);">${user ? `今日已获 ${getEcoSummary(user.id).todayPoints} 积分` : ''}</span>
        </div>
        ${hint}
        <div class="checkin-grid">${cards}</div>
    `;
}

// 渲染活动列表
function renderEventsPreview() {
    const el = document.getElementById("eventsPreview");
    if (!el) return;
    el.innerHTML = EVENTS.slice(0, 4).map(e => `
        <div class="event-item" onclick="showToast('活动报名即将上线')">
            <div class="event-thumb">${e.emoji}</div>
            <div class="event-info">
                <div>
                    <h4>${e.title}</h4>
                    <p class="place">📍 ${e.place}</p>
                </div>
                <div class="meta">
                    <span class="time">🕐 ${e.time}</span>
                    <span class="event-status ${e.status === '报名中' ? 'status-open' : 'status-wait'}">${e.status}</span>
                </div>
            </div>
        </div>
    `).join("");
}

// 渲染礼品预览
function renderGiftPreview() {
    const el = document.getElementById("giftPreview");
    if (!el) return;
    el.innerHTML = GIFTS.slice(0, 4).map(g => `
        <div class="gift-card" onclick="location.href='shop.html'">
            <div class="gift-img">${g.emoji}</div>
            <div class="gift-body">
                <h4>${g.name}</h4>
                <div class="points">${g.points} 积分</div>
                <div class="stock">库存 ${g.stock}</div>
            </div>
        </div>
    `).join("");
}

// 渲染学院排行
let currentRange = "week";
function renderRanking() {
    const el = document.getElementById("rankingList");
    if (!el) return;
    const rows = COLLEGE_RANKING[currentRange];
    const max = rows[0].kg;
    const rankColors = ["gold", "silver", "bronze"];
    el.innerHTML = rows.map((r, i) => `
        <li class="ranking-item">
            <span class="rank-num ${rankColors[i] || ''}">${i + 1}</span>
            <div class="rank-body">
                <div class="rank-row">
                    <span class="rank-name">${r.name}</span>
                    <span class="rank-kg">${r.kg.toLocaleString()} kg</span>
                </div>
                <div class="rank-bar">
                    <div class="rank-bar-fill" style="width:${Math.round((r.kg / max) * 92)}%"></div>
                </div>
            </div>
        </li>
    `).join("");
}

function switchRange(range) {
    currentRange = range;
    document.querySelectorAll(".range-tab").forEach(t => {
        t.classList.toggle("active", t.textContent === (range === "week" ? "本周" : "学期"));
    });
    renderRanking();
}

// 渲染环保资讯
function renderNews() {
    const el = document.getElementById("newsGrid");
    if (!el) return;
    el.innerHTML = ECO_NEWS.map(item => `
        <div class="checkin-card" style="cursor:default;">
            <div class="checkin-icon" style="background:var(--emerald-100)">${item.emoji}</div>
            <h3>${item.title}</h3>
            <p class="desc">${item.desc}</p>
            <div class="badges">
                <span class="badge-points badge-recycle">${item.tag}</span>
            </div>
        </div>
    `).join("");
}

// 渲染环保贴士
function renderTips() {
    const el = document.getElementById("tipsList");
    if (!el) return;
    el.innerHTML = ECO_TIPS.map((t, i) => `
        <div style="background:var(--card);border-left:4px solid var(--primary);padding:16px 20px;border-radius:10px;margin-bottom:12px;box-shadow:var(--shadow-sm);">
            <h4 style="color:var(--emerald-700);margin-bottom:4px;">💡 小贴士 ${i + 1}：${t.title}</h4>
            <p style="color:var(--text-muted);font-size:14px;">${t.desc}</p>
        </div>
    `).join("");
}

// 活动页渲染
function renderActivities(filter = "全部") {
    const el = document.getElementById("activityList");
    if (!el) return;
    const filtered = filter === "全部" ? EVENTS : EVENTS.filter(e => e.status === filter);
    if (filtered.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>暂无相关活动</p></div>`;
        return;
    }
    el.innerHTML = filtered.map(e => `
        <div class="event-item" onclick="showToast('活动报名即将上线')">
            <div class="event-thumb" style="width:100px;height:100px;font-size:44px;">${e.emoji}</div>
            <div class="event-info">
                <div>
                    <h4 style="font-size:16px;">${e.title}</h4>
                    <p class="place">📍 ${e.place}</p>
                </div>
                <div class="meta">
                    <span class="time">🕐 ${e.time}</span>
                    <span class="event-status ${e.status === '报名中' ? 'status-open' : 'status-wait'}">${e.status}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function filterActivities(status) {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.textContent === status));
    renderActivities(status);
}

// 打卡弹窗
function openCheckin(kind) {
    const user = getCurrentUser();
    if (!user) {
        showToast("请先登录");
        setTimeout(() => location.href = "login.html", 800);
        return;
    }
    const modal = document.getElementById("checkinModal");
    const body = document.getElementById("checkinModalBody");
    const title = KIND_LABEL[kind];
    const v = KIND_VISUAL[kind];

    let formHtml = "";
    if (kind === "walk") {
        formHtml = `
            <div class="form-group">
                <label>选择站点</label>
                <select id="ci_station" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;">
                    ${STATIONS.map(s => `<option value="${s.id}">${s.name}（${s.distanceKm} km）</option>`).join("")}
                </select>
            </div>
            <p style="font-size:13px;color:var(--text-muted);">步行代替校车可减碳约 210g/km，获得 ${ECO_RULES.walk.points} 积分</p>
        `;
    } else if (kind === "cup") {
        formHtml = `
            <p style="font-size:14px;color:var(--text-muted);margin-bottom:12px;">自带水杯，减少一次性塑料使用。</p>
            <p style="font-size:13px;color:var(--text-muted);">可减碳 ${ECO_RULES.cup.carbonGrams}g，获得 ${ECO_RULES.cup.points} 积分</p>
        `;
    } else if (kind === "recycle") {
        formHtml = `
            <div class="form-group">
                <label>回收类别</label>
                <select id="ci_category" style="width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;">
                    ${RECYCLE_CATEGORIES.map(c => `<option value="${c.id}">${c.name}（${c.pointsPerKg} 积分/kg，减碳 ${c.gramsPerKg}g/kg）</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>重量 (kg)</label>
                <input type="number" id="ci_weight" step="0.1" min="0.1" value="1" placeholder="0.1 - 50">
            </div>
        `;
    }

    body.innerHTML = formHtml;
    modal.dataset.kind = kind;
    modal.classList.add("open");
}

function closeCheckin() {
    document.getElementById("checkinModal").classList.remove("open");
}

function confirmCheckin() {
    const user = getCurrentUser();
    const modal = document.getElementById("checkinModal");
    const kind = modal.dataset.kind;
    const options = {};

    if (kind === "walk") {
        options.stationId = document.getElementById("ci_station").value;
    } else if (kind === "recycle") {
        options.categoryId = document.getElementById("ci_category").value;
        options.weightKg = document.getElementById("ci_weight").value;
    }

    const result = doCheckin(user.id, kind, options);
    if (result.success) {
        showToast(result.message, "success");
        closeCheckin();
        renderHeroStats();
        renderCheckinCards();
    } else {
        showToast(result.message);
    }
}

// 页面加载
document.addEventListener("DOMContentLoaded", () => {
    renderHeroStats();
    renderCheckinCards();
    renderEventsPreview();
    renderGiftPreview();
    renderRanking();
    renderNews();
    renderTips();
    renderActivities();
});
