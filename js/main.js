/* ===== 校园环保网 - 首页与活动页渲染 ===== */

// 重要环保日期
const ECO_DATES = [
    { date: "03-12", name: "中国植树节", emoji: "🌳", desc: "植树造林，绿化祖国，每年3月12日。" },
    { date: "03-21", name: "世界森林日", emoji: "🌲", desc: "提高对森林资源的重视，保护森林生态。" },
    { date: "03-22", name: "世界水日", emoji: "💧", desc: "关注水资源保护，倡导节约用水。" },
    { date: "04-22", name: "世界地球日", emoji: "🌍", desc: "唤起人类爱护地球、保护家园的意识。" },
    { date: "05-31", name: "世界无烟日", emoji: "🚭", desc: "倡导无烟环境，减少空气污染。" },
    { date: "06-05", name: "世界环境日", emoji: "🌿", desc: "联合国设立，促进全球环保意识。" },
    { date: "06-17", name: "世界防治荒漠化日", emoji: "🏜️", desc: "防治土地荒漠化，改善生态环境。" },
    { date: "09-16", name: "国际臭氧层保护日", emoji: "🌤️", desc: "保护臭氧层，减少紫外线伤害。" },
    { date: "10-04", name: "世界动物日", emoji: "🐾", desc: "关爱动物，维护生物多样性。" },
    { date: "12-29", name: "国际生物多样性日", emoji: "🦋", desc: "保护生物多样性，共建地球家园。" }
];

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

// 获取活动列表（从 localStorage 读取，管理员发布）
const ACTIVITIES_KEY = "campus_eco_activities";
function getActivities() {
    let data = null;
    try {
        data = localStorage.getItem(ACTIVITIES_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {
        console.error("活动数据解析失败：", e);
    }
    // 默认活动
    const defaults = [
        { id: "e1", title: "周末旧物交换市集", place: "学生活动中心广场", time: "10/24 14:00", status: "报名中", emoji: "🎪", desc: "带上闲置物品来交换，让旧物焕发新生。" },
        { id: "e2", title: "「光盘行动」志愿者招募", place: "第一食堂", time: "10/25 11:30", status: "候补中", emoji: "🍽️", desc: "监督食堂浪费情况，倡导光盘行动。" },
        { id: "e3", title: "校园垃圾分类知识讲座", place: "图书馆报告厅", time: "10/28 14:00", status: "报名中", emoji: "🗑️", desc: "专家讲解垃圾分类知识，现场互动问答。" },
        { id: "e4", title: "植树节绿化养护活动", place: "校园绿化带", time: "11/02 08:00", status: "报名中", emoji: "🌳", desc: "参与校园花草树木养护，美化学习环境。" }
    ];
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(defaults));
    return defaults;
}

function saveActivities(list) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
}

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
                        ? `<button style="background:none;border:none;color:#fff;cursor:pointer;text-decoration:underline;underline-offset:4px;font-size:14px;" onclick="openCheckin()">完成第一次打卡后可查看你的减碳成果</button>`
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

// ===== 卡片轮播：每 1 秒翻一页，鼠标悬停暂停 =====
const carouselTimers = {};

function initCarousel(id, count, interval = 1000) {
    if (carouselTimers[id]) {
        clearInterval(carouselTimers[id]);
        delete carouselTimers[id];
    }
    const root = document.getElementById(id);
    if (!root || count <= 1) return;
    const track = root.querySelector(".carousel-track");
    const dots = root.querySelectorAll(".carousel-dot");
    if (!track) return;
    let idx = 0;

    function paint() {
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, k) => d.classList.toggle("active", k === idx));
    }
    function stop() {
        if (carouselTimers[id]) {
            clearInterval(carouselTimers[id]);
            delete carouselTimers[id];
        }
    }
    function start() {
        stop();
        carouselTimers[id] = setInterval(() => {
            idx = (idx + 1) % count;
            paint();
        }, interval);
    }

    dots.forEach((d, k) => {
        d.addEventListener("click", () => {
            stop();
            idx = k;
            paint();
            start();
        });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    paint();
    start();
}

function carouselHTML(id, slides) {
    if (!slides || slides.length === 0) return "";
    const dots = slides.map((_, i) => `<span class="carousel-dot ${i === 0 ? "active" : ""}"></span>`).join("");
    const items = slides.map(html => `<div class="carousel-slide">${html}</div>`).join("");
    return `
        <div class="carousel" id="${id}">
            <div class="carousel-viewport">
                <div class="carousel-track">${items}</div>
            </div>
            <div class="carousel-dots">${dots}</div>
        </div>
    `;
}

// 距离下一个纪念日还有几天
function daysUntilDate(dateStr) {
    const parts = dateStr.split("-").map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), parts[0] - 1, parts[1]);
    if (target < today) target = new Date(now.getFullYear() + 1, parts[0] - 1, parts[1]);
    return Math.round((target - today) / 86400000);
}

// 环保咨询：真实机构官网
const ECO_SITES = [
    { name: "中华人民共和国生态环境部", url: "https://www.mee.gov.cn", emoji: "🏛️", tag: "政府机构", desc: "国家生态环境保护主管部门，发布环保政策法规与空气质量信息。" },
    { name: "中国环境网（中国环境报）", url: "https://www.cenews.com.cn", emoji: "📰", tag: "政府机构", desc: "生态环境领域权威媒体，提供环保新闻与政策解读。" },
    { name: "中国环境监测总站", url: "https://www.cnemc.cn", emoji: "💧", tag: "政府机构", desc: "发布全国空气质量、水质等环境监测数据。" },
    { name: "自然资源部", url: "https://www.mnr.gov.cn", emoji: "🗺️", tag: "政府机构", desc: "负责自然资源调查监测与国土空间生态保护修复。" },
    { name: "国家林业和草原局", url: "https://www.forestry.gov.cn", emoji: "🌲", tag: "政府机构", desc: "主管森林、草原、湿地资源保护与生态修复。" },
    { name: "联合国环境规划署（UNEP）", url: "https://www.unep.org/zh-hans", emoji: "🌍", tag: "国际组织", desc: "联合国环境事务牵头机构，发布全球环境评估报告。" },
    { name: "联合国气候变化框架公约（UNFCCC）", url: "https://unfccc.int", emoji: "🌡️", tag: "国际组织", desc: "《巴黎协定》与历届气候大会官方信息平台。" },
    { name: "世界资源研究所（WRI）中国", url: "https://wri.org.cn", emoji: "📊", tag: "国际组织", desc: "提供城市、能源与气候领域研究报告与数据。" },
    { name: "世界自然基金会（WWF）中国", url: "https://www.wwfchina.org", emoji: "🐼", tag: "公益组织", desc: "全球自然保护组织，开展物种保护与气候项目。" },
    { name: "绿色和平（中国）", url: "https://www.greenpeace.org.cn", emoji: "🌱", tag: "公益组织", desc: "关注气候变化、能源转型与生态保护的公益组织。" },
    { name: "中国生物多样性保护与绿色发展基金会", url: "https://www.cbcgdf.org", emoji: "🦋", tag: "公益组织", desc: "专注生物多样性保护与绿色发展的公益基金会。" }
];

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
        });
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
        });
    }

    el.innerHTML = `
        <div class="section-head">
            <h2>低碳打卡</h2>
            <span style="font-size:14px;color:var(--text-muted);">${user ? `今日已获 ${getEcoSummary(user.id).todayPoints} 积分` : ''}</span>
        </div>
        ${hint}
        ${carouselHTML("checkinCarousel", cards)}
    `;
    initCarousel("checkinCarousel", cards.length, 1000);
}

// 渲染活动列表
function renderEventsPreview() {
    const el = document.getElementById("eventsPreview");
    if (!el) return;
    const events = getActivities().slice(0, 4);
    if (events.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>暂无活动</p></div>`;
        return;
    }
    const slides = events.map(e => `
        <div class="event-item" style="cursor:pointer;" onclick="location.href='activities.html'">
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
    `);
    el.innerHTML = carouselHTML("eventsCarousel", slides);
    initCarousel("eventsCarousel", slides.length, 1000);
}

// 渲染学院排行（真实数据）
let currentRange = "week";
function renderRanking() {
    const el = document.getElementById("rankingList");
    if (!el) return;
    const ranking = getCollegeRanking();

    if (ranking.length === 0) {
        el.innerHTML = `<li style="text-align:center;color:var(--text-muted);padding:20px;">暂无减碳记录，完成打卡后即可参与排行 🌱</li>`;
        return;
    }

    const max = ranking[0].kg;
    const rankColors = ["gold", "silver", "bronze"];
    el.innerHTML = ranking.map((r, i) => `
        <li class="ranking-item">
            <span class="rank-num ${rankColors[i] || ''}">${i + 1}</span>
            <div class="rank-body">
                <div class="rank-row">
                    <span class="rank-name">${r.name} <span style="color:var(--text-muted);font-size:12px;font-weight:normal;">(${r.users}人)</span></span>
                    <span class="rank-kg">${formatKg(r.kg)} kg</span>
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

// 渲染环保资讯（含重要环保日期）
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
                <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px;" onclick="event.stopPropagation();shareNews('${item.title}','${item.desc}')">📤 分享</button>
            </div>
        </div>
    `).join("");
}

function shareNews(title, desc) {
    shareText(`🌿 校园环保资讯：${title}\n${desc}\n——来自校园环保网`);
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

// 渲染重要环保日期（卡片翻滚 + 倒计时）
function renderEcoDates() {
    const el = document.getElementById("ecoDatesGrid");
    if (!el) return;

    const slides = ECO_DATES.map(d => {
        const days = daysUntilDate(d.date);
        const isToday = days === 0;
        return `
            <div class="checkin-card" style="min-height:auto;padding:18px;${isToday ? 'border-color:var(--primary);' : ''}">
                <div class="checkin-icon" style="width:40px;height:40px;font-size:20px;background:var(--emerald-100);margin-bottom:10px;">${d.emoji}</div>
                <h3 style="font-size:16px;">${d.name}</h3>
                <p class="desc" style="font-size:13px;">${d.date} · ${d.desc}</p>
                <div class="badges" style="margin-top:10px;align-items:center;gap:8px;">
                    <span class="date-countdown ${isToday ? 'today' : ''}">${isToday ? '🎉 就是今天' : `还有 ${days} 天`}</span>
                    <button class="btn btn-ghost" style="padding:3px 10px;font-size:12px;" onclick="shareEcoDate('${d.name}','${d.date}','${d.desc}')">📤 分享</button>
                </div>
            </div>
        `;
    });
    el.innerHTML = carouselHTML("ecoDatesCarousel", slides);
    initCarousel("ecoDatesCarousel", slides.length, 1000);
}

// 渲染首页环保咨询：机构官网轮播 + 最新资讯
function renderConsult() {
    const siteEl = document.getElementById("consultCarousel");
    if (siteEl) {
        const slides = ECO_SITES.map(s => `
            <div class="checkin-card" style="min-height:auto;padding:18px;">
                <div class="checkin-icon" style="width:40px;height:40px;font-size:20px;background:var(--emerald-100);margin-bottom:10px;">${s.emoji}</div>
                <h3 style="font-size:15px;">${s.name}</h3>
                <p class="desc" style="font-size:12px;">${s.desc}</p>
                <div class="badges" style="margin-top:10px;align-items:center;gap:8px;">
                    <span class="badge-points badge-recycle">${s.tag}</span>
                    <a class="btn btn-outline" style="padding:3px 10px;font-size:12px;" href="${s.url}" target="_blank" rel="noopener noreferrer">访问官网 →</a>
                </div>
            </div>
        `);
        siteEl.innerHTML = carouselHTML("consultSiteCarousel", slides);
        initCarousel("consultSiteCarousel", slides.length, 1000);
    }

    const newsEl = document.getElementById("consultNews");
    if (newsEl) {
        newsEl.innerHTML = ECO_NEWS.slice(0, 4).map(n => `
            <div class="consult-news-item">
                <div style="font-size:22px;">${n.emoji}</div>
                <div class="consult-news-body">
                    <div class="consult-news-title">${n.title}</div>
                    <div class="consult-news-desc">${n.desc}</div>
                </div>
                <button class="btn btn-ghost" style="padding:2px 8px;font-size:11px;" onclick="shareNews('${n.title}','${n.desc}')">📤</button>
            </div>
        `).join("");
    }
}

function shareEcoDate(name, date, desc) {
    shareText(`🌍 ${name}（${date}）：${desc}\n——来自校园环保网`);
}

// 活动页渲染
function renderActivities(filter = "全部") {
    const el = document.getElementById("activityList");
    if (!el) return;
    const events = getActivities();
    const filtered = filter === "全部" ? events : events.filter(e => e.status === filter);
    const user = getCurrentUser();

    if (filtered.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>暂无相关活动</p></div>`;
        return;
    }

    el.innerHTML = filtered.map(e => {
        let signupBtn = "";
        if (user && user.role !== "admin") {
            const mySignup = getSignups().find(s => s.userId === user.id && s.activityId === e.id);
            if (mySignup) {
                const statusText = mySignup.status === "approved" ? "✓ 已通过" : mySignup.status === "rejected" ? "✗ 已拒绝" : "⏳ 审核中";
                const statusColor = mySignup.status === "approved" ? "var(--emerald-700)" : mySignup.status === "rejected" ? "#ef4444" : "#f59e0b";
                signupBtn = `<button class="btn btn-outline" disabled style="color:${statusColor};border-color:${statusColor};cursor:default;">${statusText}</button>`;
            } else {
                signupBtn = `<button class="btn btn-primary" onclick="handleSignup('${e.id}','${e.title.replace(/'/g, "\\'")}')">立即报名</button>`;
            }
        } else if (!user) {
            signupBtn = `<button class="btn btn-primary" onclick="location.href='login.html'">登录报名</button>`;
        }

        // 管理员管理按钮
        const adminBtns = user && user.role === "admin" ? `
            <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px;" onclick="editActivity('${e.id}')">✏️ 编辑</button>
            <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px;color:#ef4444;" onclick="deleteActivity('${e.id}')">🗑️ 删除</button>
        ` : "";

        return `
        <div class="event-item">
            <div class="event-thumb" style="width:100px;height:100px;font-size:44px;">${e.emoji}</div>
            <div class="event-info">
                <div>
                    <h4 style="font-size:16px;">${e.title}</h4>
                    <p class="place">📍 ${e.place}</p>
                    ${e.desc ? `<p style="font-size:13px;color:var(--text-muted);margin-top:4px;">${e.desc}</p>` : ''}
                </div>
                <div class="meta">
                    <span class="time">🕐 ${e.time}</span>
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                        <span class="event-status ${e.status === '报名中' ? 'status-open' : 'status-wait'}">${e.status}</span>
                        ${signupBtn}
                        ${adminBtns}
                        <button class="btn btn-ghost" style="padding:2px 8px;font-size:12px;" onclick="shareActivity('${e.title}','${e.place}','${e.time}')">📤</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

function handleSignup(activityId, activityTitle) {
    const user = getCurrentUser();
    if (!user) { location.href = "login.html"; return; }
    // 打开报名信息弹窗
    document.getElementById("signupActivityId").value = activityId;
    document.getElementById("signupActivityTitle").textContent = activityTitle;
    document.getElementById("signupName").value = user.username;
    document.getElementById("signupClass").value = user.className || "";
    document.getElementById("signupStudentId").value = user.studentId || "";
    document.getElementById("signupModal").classList.add("open");
}

function confirmSignup() {
    const user = getCurrentUser();
    const activityId = document.getElementById("signupActivityId").value;
    const activityTitle = document.getElementById("signupActivityTitle").textContent;
    const realName = document.getElementById("signupName").value.trim();
    const className = document.getElementById("signupClass").value.trim();
    const studentId = document.getElementById("signupStudentId").value.trim();

    if (!realName || !className || !studentId) {
        showToast("请填写姓名、班级和学号");
        return;
    }

    const result = signupActivity(user.id, user.username, activityId, activityTitle, realName, className, studentId);
    showToast(result.message, result.success ? "success" : "");
    if (result.success) {
        document.getElementById("signupModal").classList.remove("open");
        renderActivities();
    }
}

function shareActivity(title, place, time) {
    shareText(`🌿 环保活动：${title}\n📍 地点：${place}\n🕐 时间：${time}\n快来一起参与吧！——来自校园环保网`);
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

    body.innerHTML = formHtml + `
        <div class="form-group" style="margin-top:14px;">
            <label>上传打卡凭证（图片/文件）</label>
            <input type="file" id="ci_proof" accept="image/*,.pdf,.doc,.docx" required>
            <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">需管理员审核通过后才会发放积分</p>
        </div>
    `;
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

    // 读取上传的凭证文件
    const fileInput = document.getElementById("ci_proof");
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast("请上传打卡凭证");
        return;
    }

    const file = fileInput.files[0];
    // 先压缩图片再存 base64，避免撑爆 localStorage
    compressImage(file).then(dataUrl => {
        options.proof = dataUrl;
        options.proofName = file.name;

        const result = doCheckin(user.id, kind, options);
        if (result.success) {
            showToast(result.message, "success");
            closeCheckin();
            renderHeroStats();
            renderCheckinCards();
            fileInput.value = "";
        } else {
            showToast(result.message);
        }
    }).catch(err => {
        showToast(err.message || "文件处理失败，请重试");
    });
}

// 页面加载
document.addEventListener("DOMContentLoaded", () => {
    try { renderHeroStats(); } catch(e) { console.error(e); }
    try { renderCheckinCards(); } catch(e) { console.error(e); }
    try { renderEventsPreview(); } catch(e) { console.error(e); }
    try { renderRanking(); } catch(e) { console.error(e); }
    try { renderNews(); } catch(e) { console.error(e); }
    try { renderEcoDates(); } catch(e) { console.error(e); }
    try { renderConsult(); } catch(e) { console.error(e); }
    try { renderTips(); } catch(e) { console.error(e); }
    try { renderActivities(); } catch(e) { console.error(e); }
});
