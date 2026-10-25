/* ===== 校园环保网 - 用户认证模块 ===== */
const AUTH_KEY = "campus_eco_users";
const SESSION_KEY = "campus_eco_session";

// 学院列表
const COLLEGES = [
    "计算机学院",
    "金融学院",
    "法学院",
    "文学院",
    "外国语学院",
    "会计学院",
    "社会审计学院",
    "工程审计学院",
    "统计与数据科学学院",
    "数学学院",
    "商学院",
    "经济学院",
    "国家审计学院",
    "国家安全学院",
    "国际学院",
    "内部审计学院"
];

// ===== 活动报名 =====
const SIGNUPS_KEY = "campus_eco_signups";

function getSignups() {
    const data = localStorage.getItem(SIGNUPS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveSignups(list) {
    localStorage.setItem(SIGNUPS_KEY, JSON.stringify(list));
}

// 用户报名活动
function signupActivity(userId, username, activityId, activityTitle) {
    const signups = getSignups();
    // 检查是否已报名
    if (signups.some(s => s.userId === userId && s.activityId === activityId)) {
        return { success: false, message: "你已报名该活动" };
    }
    signups.push({
        id: Date.now(),
        userId, username, activityId, activityTitle,
        status: "pending",
        createdAt: new Date().toISOString()
    });
    saveSignups(signups);
    return { success: true, message: "报名成功，等待管理员审核" };
}

// 获取某用户的报名记录
function getUserSignups(userId) {
    return getSignups().filter(s => s.userId === userId);
}

// 获取某活动的报名列表
function getActivitySignups(activityId) {
    return getSignups().filter(s => s.activityId === activityId);
}

// 审核报名
function reviewSignup(signupId, status) {
    const signups = getSignups();
    const idx = signups.findIndex(s => s.id === signupId);
    if (idx === -1) return { success: false, message: "报名记录不存在" };
    signups[idx].status = status;
    signups[idx].reviewedAt = new Date().toISOString();
    saveSignups(signups);
    return { success: true, message: status === "approved" ? "已通过报名" : "已拒绝报名" };
}

function getUsers() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

// 初始化管理员账号（仅首次运行时创建）
function initAdmin() {
    const users = getUsers();
    if (!users.some(u => u.username === "admin")) {
        users.push({
            id: 1,
            username: "admin",
            email: "admin@campus.edu",
            password: btoa("admin123"),
            role: "admin",
            studentId: "00000000",
            className: "管理员",
            college: "学校环保办公室",
            createdAt: new Date().toISOString()
        });
        saveUsers(users);
    }
}

// 注册
function registerUser(username, email, password, studentId, className, college) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return { success: false, message: "该用户名已被注册" };
    }
    if (users.some(u => u.email === email)) {
        return { success: false, message: "该邮箱已被注册" };
    }
    if (users.some(u => u.studentId === studentId)) {
        return { success: false, message: "该学号已被注册" };
    }
    users.push({
        id: Date.now(),
        username,
        email,
        password: btoa(password),
        role: "user",
        studentId,
        className,
        college,
        createdAt: new Date().toISOString()
    });
    saveUsers(users);
    return { success: true, message: "注册成功！" };
}

// 登录
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return { success: false, message: "用户不存在" };
    if (user.password !== btoa(password)) return { success: false, message: "密码错误" };

    const session = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
        studentId: user.studentId || "",
        className: user.className || "",
        college: user.college || ""
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
}

function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

function updateCurrentUser(updates) {
    const session = getCurrentUser();
    if (!session) return null;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return null;
    if (updates.password) users[idx].password = btoa(updates.password);
    if (updates.email) { users[idx].email = updates.email; session.email = updates.email; }
    if (updates.className) { users[idx].className = updates.className; session.className = updates.className; }
    if (updates.college) { users[idx].college = updates.college; session.college = updates.college; }
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

// 按学院聚合减碳量（用于学院排名）
function getCollegeRanking() {
    const users = getUsers().filter(u => u.role !== "admin");
    const ecoData = getAllEcoData();
    const collegeMap = {};

    users.forEach(u => {
        const college = u.college;
        if (!college) return;
        const data = ecoData[u.id];
        const carbon = data ? data.totalCarbonGrams : 0;
        if (!collegeMap[college]) collegeMap[college] = { name: college, kg: 0, users: 0 };
        collegeMap[college].kg += carbon;
        collegeMap[college].users++;
    });

    // 只保留有减碳记录的学院
    const ranking = Object.values(collegeMap)
        .filter(c => c.kg > 0)
        .sort((a, b) => b.kg - a.kg);

    return ranking;
}

// 更新导航栏登录状态
function updateNavAuth() {
    const user = getCurrentUser();
    const navUser = document.getElementById("navUser");
    if (!navUser) return;

    // 管理员显示审核中心入口
    const adminLink = document.getElementById("adminNavLink");
    if (user && user.role === "admin") {
        if (!adminLink) {
            const navLinks = document.querySelector(".nav-links");
            if (navLinks) {
                const li = document.createElement("li");
                li.id = "adminNavLink";
                li.innerHTML = '<a href="admin.html">审核中心</a>';
                navLinks.appendChild(li);
            }
        }
    } else if (adminLink) {
        adminLink.remove();
    }

    if (user) {
        const initial = user.username.charAt(0).toUpperCase();
        const adminBadge = user.role === "admin" ? '<span style="background:#f59e0b;color:#fff;font-size:10px;padding:1px 6px;border-radius:4px;margin-left:4px;">管理员</span>' : '';
        navUser.innerHTML = `
            <div class="user-info" onclick="location.href='profile.html'">
                <div class="avatar">${initial}</div>
                <span style="font-size:14px;font-weight:500;">${user.username}${adminBadge}</span>
            </div>
            <button class="btn btn-outline" onclick="handleLogout()">退出</button>
        `;
    } else {
        navUser.innerHTML = `
            <a href="login.html" class="btn btn-outline">登录</a>
            <a href="register.html" class="btn btn-primary">注册</a>
        `;
    }
}

function handleLogout() {
    logoutUser();
    showToast("已退出登录", "success");
    setTimeout(() => { window.location.href = "index.html"; }, 600);
}

// 页面加载时初始化管理员并更新导航
document.addEventListener("DOMContentLoaded", () => {
    initAdmin();
    updateNavAuth();
});
