/* ===== 校园环保网 - 用户认证模块 ===== */
const AUTH_KEY = "campus_eco_users";
const SESSION_KEY = "campus_eco_session";

function getUsers() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

// 注册
function registerUser(username, email, password) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return { success: false, message: "该用户名已被注册" };
    }
    if (users.some(u => u.email === email)) {
        return { success: false, message: "该邮箱已被注册" };
    }
    users.push({
        id: Date.now(),
        username,
        email,
        password: btoa(password),
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

    const session = { id: user.id, username: user.username, email: user.email };
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

function updateCurrentUser(updates) {
    const session = getCurrentUser();
    if (!session) return null;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return null;
    if (updates.password) users[idx].password = btoa(updates.password);
    if (updates.email) { users[idx].email = updates.email; session.email = updates.email; }
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

// 更新导航栏登录状态
function updateNavAuth() {
    const user = getCurrentUser();
    const navUser = document.getElementById("navUser");
    if (!navUser) return;

    if (user) {
        const initial = user.username.charAt(0).toUpperCase();
        navUser.innerHTML = `
            <div class="user-info" onclick="location.href='profile.html'">
                <div class="avatar">${initial}</div>
                <span style="font-size:14px;font-weight:500;">${user.username}</span>
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

document.addEventListener("DOMContentLoaded", updateNavAuth);
