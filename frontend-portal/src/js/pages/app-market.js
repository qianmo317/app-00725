// ==========================================
// 应用广场 - 页面逻辑
// ==========================================

import request, { Toast } from "../utils/request.js";

// 页面状态
const state = {
  apps: [],
  currentApp: null,
  filters: {
    keyword: "",
    sort: "hot",
    category: "all",
  },
  pagination: {
    page: 1,
    pageSize: 9,
    total: 0,
  },
};

// 初始化页面
async function initPage() {
  console.log("[AppMarket] 初始化应用广场...");

  bindEvents();
  await loadApps();

  console.log("[AppMarket] 初始化完成");
}

// 绑定事件
function bindEvents() {
  // 移动端菜单切换
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const headerNav = document.getElementById("headerNav");

  if (mobileMenuBtn && headerNav) {
    mobileMenuBtn.addEventListener("click", () => {
      headerNav.classList.toggle("show");
      const icon = mobileMenuBtn.querySelector("i");
      if (headerNav.classList.contains("show")) {
        icon.className = "layui-icon layui-icon-close";
      } else {
        icon.className = "layui-icon layui-icon-spread-left";
      }
    });
  }

  // 导航菜单
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      // 关闭移动端菜单
      if (window.innerWidth <= 768 && headerNav) {
        headerNav.classList.remove("show");
        if (mobileMenuBtn) {
          mobileMenuBtn.querySelector("i").className =
            "layui-icon layui-icon-spread-left";
        }
      }

      const page = item.dataset.page;
      const pageMap = {
        home: "../index.html",
        "card-factory": "card-factory.html",
        "app-market": "app-market.html",
        designer: "designer.html",
        map: "map.html",
      };
      if (pageMap[page]) {
        window.location.href = pageMap[page];
      }
    });
  });

  // 搜索
  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // 排序切换
  document.querySelectorAll(".filter-tabs .tab-item").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-tabs .tab-item")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const sort = tab.dataset.sort;
      if (sort === "mine") {
        Toast.info("我的应用功能开发中...");
        return;
      }
      state.filters.sort = sort;
      loadApps();
    });
  });

  // 分类切换
  document.querySelectorAll(".category-tags .tag-item").forEach((tag) => {
    tag.addEventListener("click", () => {
      document
        .querySelectorAll(".category-tags .tag-item")
        .forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      state.filters.category = tag.dataset.category;
      loadApps();
    });
  });

  // 发布按钮
  document
    .getElementById("publishBtn")
    .addEventListener("click", openPublishModal);

  // 关闭详情弹窗
  document
    .getElementById("closeDetailModal")
    .addEventListener("click", closeDetailModal);
  document.getElementById("appDetailModal").addEventListener("click", (e) => {
    if (e.target.id === "appDetailModal") closeDetailModal();
  });

  // 克隆和点赞
  document.getElementById("cloneAppBtn").addEventListener("click", handleClone);
  document.getElementById("likeAppBtn").addEventListener("click", handleLike);

  // 发布弹窗
  document
    .getElementById("closePublishModal")
    .addEventListener("click", closePublishModal);
  document
    .getElementById("cancelPublish")
    .addEventListener("click", closePublishModal);
  document
    .getElementById("submitPublish")
    .addEventListener("click", handlePublish);
  document.getElementById("publishModal").addEventListener("click", (e) => {
    if (e.target.id === "publishModal") closePublishModal();
  });
}

// 加载应用列表
async function loadApps() {
  const container = document.getElementById("appGrid");
  const emptyState = document.getElementById("emptyState");

  try {
    const { list, total } = await request.getAppTemplates({
      keyword: state.filters.keyword,
      sort: state.filters.sort,
      category: state.filters.category === "all" ? "" : state.filters.category,
    });

    state.apps = list;
    state.pagination.total = total;

    if (list.length === 0) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    container.innerHTML = list.map((app) => renderAppCard(app)).join("");

    // 绑定卡片点击事件
    container.querySelectorAll(".app-card").forEach((card) => {
      card.addEventListener("click", () => {
        openDetailModal(card.dataset.appId);
      });
    });
  } catch (error) {
    console.error("[AppMarket] 加载应用失败:", error);
  }
}

// 生成头像占位图
function generateAvatar(name, colorIndex) {
  const colors = [
    "#1e9fff",
    "#5fb878",
    "#ffb800",
    "#ff5722",
    "#9c27b0",
    "#00bcd4",
  ];
  const color = colors[colorIndex % colors.length];
  const initial = name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect fill="${color}" width="24" height="24" rx="12"/><text fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold" x="50%" y="50%" text-anchor="middle" dy=".35em">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// 渲染应用卡片
function renderAppCard(app) {
  // 根据应用ID生成不同的头像颜色
  const colorIndex = parseInt(app.id.replace(/\D/g, "")) % 6;
  return `
        <div class="app-card" data-app-id="${app.id}">
            <div class="app-thumbnail">
                <img src="${app.thumbnail}" alt="${app.name}">
            </div>
            <div class="app-content">
                <h3 class="app-title">${app.name}</h3>
                <p class="app-desc">${app.description}</p>
                <div class="app-tags">
                    ${app.tags
                      .slice(0, 3)
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
                <div class="app-meta">
                    <div class="author">
                        <img src="${generateAvatar(app.author, colorIndex)}" alt="avatar">
                        <span>${app.author} · ${app.department}</span>
                    </div>
                    <div class="stats">
                        <span class="stat">
                            <i class="layui-icon layui-icon-file"></i>
                            ${app.cloneCount}
                        </span>
                        <span class="stat">
                            <i class="layui-icon layui-icon-praise"></i>
                            ${app.likeCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 搜索处理
function handleSearch() {
  state.filters.keyword = document.getElementById("searchInput").value.trim();
  loadApps();
}

// 打开详情弹窗
async function openDetailModal(appId) {
  try {
    const app = await request.getAppTemplateDetail(appId);
    state.currentApp = app;

    document.getElementById("detailTitle").textContent = app.name;
    document.getElementById("detailThumbnail").src = app.thumbnail;
    document.getElementById("detailDesc").textContent = app.description;
    document.getElementById("detailAuthor").textContent = app.author;
    document.getElementById("detailDept").textContent = app.department;
    document.getElementById("detailTime").textContent = app.createTime;
    document.getElementById("detailClones").textContent = app.cloneCount;
    document.getElementById("detailLikes").textContent = app.likeCount;
    document.getElementById("detailTags").innerHTML = app.tags
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join("");

    document.getElementById("appDetailModal").style.display = "flex";
  } catch (error) {
    console.error("[AppMarket] 获取应用详情失败:", error);
  }
}

// 关闭详情弹窗
function closeDetailModal() {
  document.getElementById("appDetailModal").style.display = "none";
  state.currentApp = null;
}

// 克隆应用
async function handleClone() {
  if (!state.currentApp) return;

  try {
    await request.cloneAppTemplate(state.currentApp.id);

    // 更新显示
    const cloneCount =
      parseInt(document.getElementById("detailClones").textContent) + 1;
    document.getElementById("detailClones").textContent = cloneCount;

    // 更新列表中的数据
    const app = state.apps.find((a) => a.id === state.currentApp.id);
    if (app) app.cloneCount = cloneCount;

    layui.layer.confirm(
      "应用已克隆到您的工作台，是否立即查看？",
      {
        btn: ["去查看", "继续浏览"],
        icon: 1,
      },
      () => {
        window.location.href = "../index.html";
      },
    );
  } catch (error) {
    console.error("[AppMarket] 克隆失败:", error);
  }
}

// 点赞应用
async function handleLike() {
  if (!state.currentApp) return;

  try {
    const result = await request.likeAppTemplate(state.currentApp.id);

    // 更新显示
    document.getElementById("detailLikes").textContent = result.likeCount;

    // 更新列表中的数据
    const app = state.apps.find((a) => a.id === state.currentApp.id);
    if (app) app.likeCount = result.likeCount;

    Toast.success("点赞成功");
  } catch (error) {
    console.error("[AppMarket] 点赞失败:", error);
  }
}

// 打开发布弹窗
function openPublishModal() {
  document.getElementById("publishModal").style.display = "flex";
  layui.form.render();
}

// 关闭发布弹窗
function closePublishModal() {
  document.getElementById("publishModal").style.display = "none";
  document.getElementById("publishForm").reset();
}

// 发布应用
function handlePublish() {
  const form = document.getElementById("publishForm");
  const formData = new FormData(form);

  const name = formData.get("name");
  const description = formData.get("description");

  if (!name) {
    Toast.warning("请输入应用名称");
    return;
  }

  if (!description) {
    Toast.warning("请输入应用描述");
    return;
  }

  // 生成彩色占位图
  function generateThumbnail(text, colorIndex) {
    const colors = [
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#4facfe", "#00f2fe"],
      ["#43e97b", "#38f9d7"],
      ["#fa709a", "#fee140"],
      ["#a8edea", "#fed6e3"],
    ];
    const [color1, color2] = colors[colorIndex % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect fill="url(#grad)" width="400" height="250"/>
      <text fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24" font-weight="bold" x="50%" y="50%" text-anchor="middle" dy=".35em">${text}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  // 模拟发布 - 使用生成的占位图
  const randomSeed = Date.now();
  const newApp = {
    id: "app" + randomSeed,
    name: name,
    description: description,
    author: "张三",
    department: "数字化转型部",
    thumbnail: generateThumbnail(
      name.substring(0, 4),
      Math.floor(Math.random() * 6),
    ),
    cloneCount: 0,
    likeCount: 0,
    createTime: new Date().toISOString().split("T")[0],
    tags: formData.get("tags")
      ? formData
          .get("tags")
          .split(",")
          .map((t) => t.trim())
      : [],
  };

  state.apps.unshift(newApp);

  // 重新渲染列表
  const container = document.getElementById("appGrid");
  container.innerHTML = state.apps.map((app) => renderAppCard(app)).join("");

  // 重新绑定事件
  container.querySelectorAll(".app-card").forEach((card) => {
    card.addEventListener("click", () => {
      openDetailModal(card.dataset.appId);
    });
  });

  closePublishModal();
  Toast.success("应用发布成功");
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  layui.use(["layer", "form"], () => {
    initPage();
  });
});
