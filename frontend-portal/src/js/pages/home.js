// ==========================================
// 首页工作台 - 页面逻辑
// ==========================================

import request, { Toast, Loading } from "../utils/request.js";
import CardStore from "../utils/card-store.js";

// 页面状态
const state = {
  isEditMode: false,
  userCards: [],
  sortableInstance: null,
};

// 初始化页面
async function initPage() {
  console.log("[Home] 初始化首页工作台...");

  // 绑定事件
  bindEvents();

  // 加载数据
  await Promise.all([
    loadKPIData(),
    loadTrendChart(),
    loadTimeline(),
    loadNotices(),
    loadShortcuts(),
    loadUserCards(),
  ]);

  // 初始化拖拽
  initSortable();

  console.log("[Home] 首页初始化完成");
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

    // 点击导航项后关闭菜单
    headerNav.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          headerNav.classList.remove("show");
          mobileMenuBtn.querySelector("i").className =
            "layui-icon layui-icon-spread-left";
        }
      });
    });
  }

  // 导航菜单点击
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const page = item.dataset.page;
      if (page === "home") return;

      const pageMap = {
        "card-factory": "pages/card-factory.html",
        "app-market": "pages/app-market.html",
        designer: "pages/designer.html",
        map: "pages/map.html",
      };

      if (pageMap[page]) {
        window.location.href = pageMap[page];
      }
    });
  });

  // 编辑模式切换
  document
    .getElementById("toggleEditMode")
    .addEventListener("click", toggleEditMode);

  // 添加卡片按钮
  document
    .getElementById("addCardBtn")
    .addEventListener("click", openAddCardModal);

  // 保存布局按钮
  document
    .getElementById("saveLayoutBtn")
    .addEventListener("click", saveLayout);

  // 通知图标点击
  document
    .querySelector(".header-actions .action-item:last-child")
    ?.addEventListener("click", () => {
      Toast.info("消息中心功能开发中...");
    });

  // 用户下拉菜单
  document.getElementById("userDropdown")?.addEventListener("click", () => {
    Toast.info("用户中心功能开发中...");
  });

  // 查看全部通知
  document
    .querySelector(".notice-card .more-link")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      Toast.info("通知公告列表功能开发中...");
    });

  // 关闭弹窗
  document
    .getElementById("closeAddModal")
    .addEventListener("click", closeAddCardModal);

  // 弹窗背景点击关闭
  document.getElementById("addCardModal").addEventListener("click", (e) => {
    if (e.target.id === "addCardModal") {
      closeAddCardModal();
    }
  });

  // 卡片类型切换
  document.querySelectorAll(".card-type-tabs .tab-item").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".card-type-tabs .tab-item")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      loadCardTemplates(tab.dataset.type);
    });
  });

  // 趋势周期切换
  document.getElementById("trendPeriod").addEventListener("change", (e) => {
    loadTrendChart(parseInt(e.target.value));
  });

  // 空白区域点击添加卡片
  document
    .getElementById("emptyPlaceholder")
    ?.addEventListener("click", openAddCardModal);
}

// 加载 KPI 数据
async function loadKPIData() {
  const container = document.getElementById("kpiGrid");
  const loading = Loading.show(container.parentElement);

  try {
    const data = await request.getDashboardKPI();

    container.innerHTML = data
      .map(
        (kpi) => `
            <div class="kpi-item">
                <div class="kpi-value ${kpi.trendType}">${kpi.value}${kpi.unit}</div>
                <div class="kpi-label">${kpi.label}</div>
                <div class="kpi-trend ${kpi.trendType === "up" ? "positive" : "negative"}">
                    <i class="layui-icon layui-icon-${kpi.trendType === "up" ? "up" : "down"}"></i>
                    ${Math.abs(kpi.trend)}%
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("[Home] 加载KPI失败:", error);
  } finally {
    Loading.hide(loading);
  }
}

// 加载趋势图表
async function loadTrendChart(period = 30) {
  const container = document.getElementById("trendChart");
  const loading = Loading.show(container.parentElement);

  try {
    const data = await request.getDashboardTrend(period);

    const chart = echarts.init(container);
    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e6e6e6",
        borderWidth: 1,
        textStyle: { color: "#333" },
      },
      legend: {
        data: data.series.map((s) => s.name),
        bottom: 0,
        textStyle: { color: "#666" },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.dates,
        axisLine: { lineStyle: { color: "#e6e6e6" } },
        axisLabel: { color: "#999" },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#f0f0f0" } },
        axisLabel: { color: "#999" },
      },
      series: data.series.map((s, i) => ({
        name: s.name,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: s.data,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.1,
        },
        itemStyle: {
          color: i === 0 ? "#1E9FFF" : "#5FB878",
        },
      })),
    };

    chart.setOption(option);

    // 响应式
    window.addEventListener("resize", () => chart.resize());
  } catch (error) {
    console.error("[Home] 加载趋势图失败:", error);
  } finally {
    Loading.hide(loading);
  }
}

// 加载时间轴
async function loadTimeline() {
  const container = document.getElementById("transformTimeline");

  try {
    const data = await request.getTimeline();

    container.innerHTML = data
      .map(
        (item) => `
            <div class="timeline-item">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-desc">${item.desc}</div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("[Home] 加载时间轴失败:", error);
  }
}

// 加载通知公告
async function loadNotices() {
  const container = document.getElementById("noticeList");

  try {
    const data = await request.getNotices({ limit: 5 });

    container.innerHTML = data
      .map(
        (notice) => `
            <div class="notice-item" data-id="${notice.id}">
                <span class="notice-tag ${notice.tag}">${notice.tagText}</span>
                <div class="notice-content">
                    <div class="notice-title">${notice.title}</div>
                    <div class="notice-meta">${notice.dept}</div>
                </div>
                <span class="notice-date">${notice.date}</span>
            </div>
        `,
      )
      .join("");

    // 绑定点击事件
    container.querySelectorAll(".notice-item").forEach((item) => {
      item.addEventListener("click", () => {
        showNoticeDetail(item.dataset.id);
      });
    });
  } catch (error) {
    console.error("[Home] 加载通知失败:", error);
  }
}

// 显示通知详情
async function showNoticeDetail(id) {
  try {
    const notice = await request.getNoticeDetail(id);

    layui.layer.open({
      type: 1,
      title: notice.title,
      area: ["600px", "400px"],
      content: `
                <div style="padding: 20px;">
                    <div style="color: #999; margin-bottom: 16px;">
                        <span>${notice.dept}</span>
                        <span style="margin-left: 16px;">${notice.date}</span>
                    </div>
                    <div style="line-height: 1.8; white-space: pre-wrap;">${notice.content}</div>
                </div>
            `,
    });
  } catch (error) {
    console.error("[Home] 获取通知详情失败:", error);
  }
}

// 加载快捷入口
async function loadShortcuts() {
  const container = document.getElementById("shortcutGrid");

  try {
    const data = await request.getShortcuts();

    container.innerHTML = data
      .map(
        (item) => `
            <div class="shortcut-item" data-url="${item.url}">
                <div class="shortcut-icon ${item.color}">
                    <i class="layui-icon ${item.icon}"></i>
                </div>
                <span class="shortcut-name">${item.name}</span>
            </div>
        `,
      )
      .join("");

    // 绑定点击事件
    container.querySelectorAll(".shortcut-item").forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.dataset.url;
        if (url && url !== "#") {
          window.open(url, "_blank");
        } else {
          Toast.info("功能开发中...");
        }
      });
    });
  } catch (error) {
    console.error("[Home] 加载快捷入口失败:", error);
  }
}

// 加载用户卡片
async function loadUserCards() {
  const container = document.getElementById("draggableCards");
  const placeholder = document.getElementById("emptyPlaceholder");

  try {
    const data = await request.getUserCards();
    state.userCards = data;

    if (data.length === 0) {
      placeholder.style.display = "flex";
      return;
    }

    placeholder.style.display = "none";

    container.innerHTML = data.map((card) => renderUserCard(card)).join("");

    // 渲染卡片内容
    data.forEach((card) => {
      renderCardContent(card);
    });
  } catch (error) {
    console.error("[Home] 加载用户卡片失败:", error);
  }
}

// 渲染用户卡片
function renderUserCard(card) {
  return `
        <div class="card draggable-card" data-card-id="${card.id}">
            <div class="card-toolbar">
                <div class="toolbar-btn edit" title="编辑">
                    <i class="layui-icon layui-icon-edit"></i>
                </div>
                <div class="toolbar-btn delete" title="删除">
                    <i class="layui-icon layui-icon-delete"></i>
                </div>
            </div>
            <div class="card-header">
                <h3>${card.title}</h3>
            </div>
            <div class="card-body">
                <div id="card-content-${card.id}" class="card-content-area" style="height: 200px;"></div>
            </div>
        </div>
    `;
}

// 渲染卡片内容
async function renderCardContent(card) {
  const container = document.getElementById(`card-content-${card.id}`);
  if (!container) return;

  try {
    if (card.type === "chart") {
      const data = await request.getChartData(card.config.dataSource);
      renderChart(container, card.chartType, data, card.config);
    } else if (card.type === "list") {
      const data = await request.getChartData(card.config.dataSource);
      renderList(container, data, card.config);
    }
  } catch (error) {
    console.error(`[Home] 渲染卡片 ${card.id} 失败:`, error);
    container.innerHTML =
      '<div class="empty-state"><i class="layui-icon layui-icon-face-cry"></i><p>数据加载失败</p></div>';
  }
}

// 渲染图表
function renderChart(container, chartType, data, config) {
  const chart = echarts.init(container);
  const showLegend = config.showLegend !== false;
  const showLabel = config.showLabel === true;
  const showTooltip = config.showTooltip !== false;
  const smoothLine = config.smoothLine !== false;
  const colors = config.colors || [
    "#1E9FFF",
    "#5FB878",
    "#FFB800",
    "#FF5722",
    "#9c27b0",
  ];
  const primaryColor = config.primaryColor || colors[0];

  const isCategoryData = data && data.categories && data.series;
  const isPieData = Array.isArray(data) && data[0] && data[0].name !== undefined && data[0].value !== undefined;
  const isGaugeData = (data && data.value !== undefined) || (Array.isArray(data) && data[0] && data[0].value !== undefined);

  let option = {
    color: colors,
  };

  switch (chartType) {
    case "pie":
      let pieData = data;
      if (isCategoryData) {
        pieData = data.series[0].data.map((val, idx) => ({
          name: data.categories[idx] || `项${idx + 1}`,
          value: val,
        }));
      } else if (!isPieData) {
        pieData = [
          { name: "暂无数据", value: 1 },
        ];
      }

      option = {
        ...option,
        tooltip: {
          show: showTooltip,
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "#e6e6e6",
          borderWidth: 1,
          textStyle: { color: "#333" },
        },
        legend: {
          show: showLegend,
          orient: "vertical",
          right: 10,
          top: "center",
          textStyle: { color: "#666" },
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: showLegend ? ["40%", "50%"] : ["50%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: showLabel,
              formatter: "{b}: {d}%",
            },
            emphasis: {
              label: { show: true, fontWeight: "bold" },
            },
            data: pieData,
            itemStyle: {
              borderRadius: 4,
              borderColor: "#fff",
              borderWidth: 2,
            },
          },
        ],
      };
      break;

    case "bar":
      let barData = data;
      if (!isCategoryData) {
        if (isPieData) {
          barData = {
            categories: data.map((d) => d.name),
            series: [{ name: "数值", data: data.map((d) => d.value) }],
          };
        } else {
          barData = {
            categories: ["暂无数据"],
            series: [{ name: "数值", data: [0] }],
          };
        }
      }

      option = {
        ...option,
        tooltip: {
          show: showTooltip,
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "#e6e6e6",
          borderWidth: 1,
          textStyle: { color: "#333" },
        },
        legend: {
          show: showLegend,
          data: barData.series.map((s) => s.name),
          bottom: 0,
          textStyle: { color: "#666" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: showLegend ? "15%" : "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: barData.categories,
          axisLine: { lineStyle: { color: "#e6e6e6" } },
          axisLabel: { color: "#999" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999" },
        },
        series: barData.series.map((s, i) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          barWidth: "30%",
          label: {
            show: showLabel,
            position: "top",
          },
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: colors[i % colors.length],
          },
        })),
      };
      break;

    case "line":
    case "area":
      let lineData = data;
      if (!isCategoryData) {
        if (isPieData) {
          lineData = {
            categories: data.map((d) => d.name),
            series: [{ name: "数值", data: data.map((d) => d.value) }],
          };
        } else {
          lineData = {
            categories: ["暂无数据"],
            series: [{ name: "数值", data: [0] }],
          };
        }
      }

      option = {
        ...option,
        tooltip: {
          show: showTooltip,
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "#e6e6e6",
          borderWidth: 1,
          textStyle: { color: "#333" },
        },
        legend: {
          show: showLegend,
          data: lineData.series.map((s) => s.name),
          bottom: 0,
          textStyle: { color: "#666" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: showLegend ? "15%" : "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: lineData.categories,
          axisLine: { lineStyle: { color: "#e6e6e6" } },
          axisLabel: { color: "#999" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999" },
        },
        series: lineData.series.map((s, i) => ({
          name: s.name,
          type: "line",
          smooth: smoothLine,
          data: s.data,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: showLabel,
            position: "top",
          },
          itemStyle: {
            color: colors[i % colors.length],
          },
          areaStyle: chartType === "area" ? { opacity: 0.3 } : null,
        })),
      };
      break;

    case "radar":
      option = {
        ...option,
        tooltip: {
          show: showTooltip,
        },
        legend: {
          show: showLegend,
          data: ["数据指标"],
          bottom: 0,
          textStyle: { color: "#666" },
        },
        radar: {
          indicator: Array.isArray(data)
            ? data.map((d) => ({ name: d.name, max: 100 }))
            : [
                { name: "技术", max: 100 },
                { name: "销售", max: 100 },
                { name: "运营", max: 100 },
                { name: "财务", max: 100 },
                { name: "管理", max: 100 },
              ],
          shape: "polygon",
          splitNumber: 4,
          axisName: { color: "#666" },
          splitLine: { lineStyle: { color: "#e6e6e6" } },
          splitArea: {
            show: true,
            areaStyle: { color: ["#fff", "#f5f5f5"] },
          },
        },
        series: [
          {
            type: "radar",
            data: [
              {
                value: Array.isArray(data)
                  ? data.map((d) => d.value)
                  : [80, 70, 85, 60, 75],
                name: "数据指标",
                areaStyle: { opacity: 0.2 },
                lineStyle: { color: primaryColor },
                itemStyle: { color: primaryColor },
              },
            ],
          },
        ],
      };
      break;

    case "gauge":
      option = {
        ...option,
        tooltip: {
          show: showTooltip,
          formatter: "{b}: {c}%",
        },
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            radius: "90%",
            center: ["50%", "70%"],
            axisLine: {
              lineStyle: {
                width: 20,
                color: [
                  [0.3, "#FF5722"],
                  [0.7, "#FFB800"],
                  [1, "#5FB878"],
                ],
              },
            },
            pointer: {
              itemStyle: { color: primaryColor },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
              color: "#999",
              distance: -30,
              fontSize: 12,
            },
            detail: {
              valueAnimation: true,
              formatter: "{value}%",
              color: primaryColor,
              fontSize: 24,
              offsetCenter: [0, "20%"],
            },
            title: {
              show: true,
              offsetCenter: [0, "40%"],
              color: "#666",
            },
            data: Array.isArray(data)
              ? data
              : [{ value: 75, name: "完成率" }],
          },
        ],
      };
      break;

    default:
      option = {
        ...option,
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: { type: "value" },
        series: [
          {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: "line",
            smooth: true,
          },
        ],
      };
  }

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  container._chartResize = resizeHandler;
}

// 渲染列表
function renderList(container, data, config) {
  const priorityMap = {
    high: { text: "高", class: "danger" },
    medium: { text: "中", class: "warning" },
    low: { text: "低", class: "info" },
  };

  container.innerHTML = `
        <ul class="todo-list" style="list-style: none; padding: 0; margin: 0;">
            ${data
              .slice(0, config.limit || 5)
              .map(
                (item, index) => `
                <li style="display: flex; align-items: center; padding: ${index === 0 ? "0" : "10px"} 0 10px 0; border-bottom: 1px dashed #e6e6e6;">
                    <span style="
                        padding: 2px 8px;
                        font-size: 12px;
                        border-radius: 2px;
                        margin-right: 12px;
                        background: ${item.priority === "high" ? "rgba(255,87,34,0.1)" : item.priority === "medium" ? "rgba(255,184,0,0.1)" : "rgba(30,159,255,0.1)"};
                        color: ${item.priority === "high" ? "#FF5722" : item.priority === "medium" ? "#FFB800" : "#1E9FFF"};
                    ">${priorityMap[item.priority].text}</span>
                    <span style="flex: 1; color: #333;">${item.title}</span>
                    <span style="color: #999; font-size: 12px;">${item.deadline}</span>
                </li>
            `,
              )
              .join("")}
        </ul>
    `;
}

// 初始化拖拽排序
function initSortable() {
  const container = document.getElementById("draggableCards");

  state.sortableInstance = new Sortable(container, {
    animation: 150,
    ghostClass: "ghost",
    dragClass: "dragging",
    handle: ".card-header",
    disabled: false,
    onEnd: (evt) => {
      // 更新卡片顺序
      const cards = Array.from(container.querySelectorAll(".draggable-card"));
      state.userCards = cards
        .map((card) => {
          return state.userCards.find((c) => c.id === card.dataset.cardId);
        })
        .filter(Boolean);
    },
  });

  // 绑定卡片操作事件
  container.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".toolbar-btn.delete");
    const editBtn = e.target.closest(".toolbar-btn.edit");
    const card = e.target.closest(".draggable-card");

    if (deleteBtn && card) {
      deleteCard(card.dataset.cardId);
    } else if (editBtn && card) {
      editCard(card.dataset.cardId);
    }
  });
}

// 切换编辑模式
function toggleEditMode() {
  state.isEditMode = !state.isEditMode;

  const btn = document.getElementById("toggleEditMode");
  const main = document.querySelector(".portal-main");

  if (state.isEditMode) {
    btn.classList.add("active");
    btn.querySelector("span").textContent = "退出编辑";
    main.classList.add("edit-mode");
    state.sortableInstance?.option("disabled", false);
    Toast.info("已进入编辑模式，可拖拽调整卡片位置");
  } else {
    btn.classList.remove("active");
    btn.querySelector("span").textContent = "编辑模式";
    main.classList.remove("edit-mode");
    state.sortableInstance?.option("disabled", true);
  }
}

// 打开添加卡片弹窗
function openAddCardModal() {
  document.getElementById("addCardModal").style.display = "flex";
  loadCardTemplates("chart");
}

// 关闭添加卡片弹窗
function closeAddCardModal() {
  document.getElementById("addCardModal").style.display = "none";
}

// 加载卡片模板
async function loadCardTemplates(type) {
  const container = document.getElementById("cardTemplates");

  try {
    const templates = await request.getCardTemplates(type);

    container.innerHTML = templates
      .map(
        (tpl) => `
            <div class="template-item" data-template-id="${tpl.id}" data-type="${type}">
                <div class="template-preview">
                    <i class="layui-icon ${tpl.icon}"></i>
                </div>
                <div class="template-name">${tpl.name}</div>
                <div class="template-desc">${tpl.desc}</div>
            </div>
        `,
      )
      .join("");

    // 绑定点击事件
    container.querySelectorAll(".template-item").forEach((item) => {
      item.addEventListener("click", () => {
        addCardFromTemplate(item.dataset.templateId, item.dataset.type);
      });
    });
  } catch (error) {
    console.error("[Home] 加载卡片模板失败:", error);
  }
}

// 从模板添加卡片
async function addCardFromTemplate(templateId, type) {
  const chartType = templateId.replace("tpl_", "");

  // 根据图表类型选择合适的数据源
  let dataSource = "dept_distribution";
  if (chartType === "bar" || chartType === "line" || chartType === "area") {
    dataSource = "monthly_stats";
  } else if (type === "list" || chartType === "todo") {
    dataSource = "todo_list";
  }

  const titleMap = {
    line: "趋势分析图",
    bar: "数据对比图",
    pie: "数据分布图",
    area: "累计趋势图",
    radar: "多维分析图",
    gauge: "指标仪表盘",
    todo: "待办事项",
    rank: "排行榜",
    timeline: "时间线",
  };

  const newCard = {
    type: type === "list" ? "list" : "chart",
    chartType: chartType,
    title: titleMap[chartType] || "新建卡片",
    config: {
      dataSource: dataSource,
      colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      showLegend: true,
      showLabel: false,
      showTooltip: true,
      smoothLine: true,
      primaryColor: "#1E9FFF",
      limit: 5,
    },
  };

  const savedCard = CardStore.add(newCard);
  state.userCards.push(savedCard);

  // 重新渲染
  const container = document.getElementById("draggableCards");
  const placeholder = document.getElementById("emptyPlaceholder");

  placeholder.style.display = "none";
  container.insertAdjacentHTML("beforeend", renderUserCard(savedCard));
  renderCardContent(savedCard);

  closeAddCardModal();
  Toast.success("卡片添加成功");
}

// 删除卡片
async function deleteCard(cardId) {
  layui.layer.confirm(
    "确定要删除这个卡片吗？",
    {
      btn: ["确定", "取消"],
      icon: 3,
    },
    async () => {
      try {
        await request.deleteUserCard(cardId);

        // 从DOM移除
        const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
        cardEl?.remove();

        // 从状态移除
        state.userCards = state.userCards.filter((c) => c.id !== cardId);

        // 检查是否为空
        if (state.userCards.length === 0) {
          document.getElementById("emptyPlaceholder").style.display = "flex";
        }

        layui.layer.closeAll();
      } catch (error) {
        console.error("[Home] 删除卡片失败:", error);
      }
    },
  );
}

// 编辑卡片
function editCard(cardId) {
  const card = state.userCards.find((c) => c.id === cardId);
  if (!card) return;

  layui.layer.open({
    type: 1,
    title: "编辑卡片",
    area: ["520px", "460px"],
    content: `
            <div style="padding: 20px;">
                <div class="layui-form-item">
                    <label class="layui-form-label" style="width: 90px; white-space: nowrap;">卡片标题</label>
                    <div class="layui-input-block" style="margin-left: 120px;">
                        <input type="text" id="editCardTitle" value="${card.title}" class="layui-input">
                    </div>
                </div>
                <div class="layui-form-item">
                    <label class="layui-form-label" style="width: 90px; white-space: nowrap;">数据源</label>
                    <div class="layui-input-block" style="margin-left: 120px;">
                        <select id="editCardDataSource" class="layui-input">
                            <option value="dept_distribution" ${card.config.dataSource === "dept_distribution" ? "selected" : ""}>部门分布数据</option>
                            <option value="monthly_stats" ${card.config.dataSource === "monthly_stats" ? "selected" : ""}>月度统计数据</option>
                            <option value="user_behavior" ${card.config.dataSource === "user_behavior" ? "selected" : ""}>用户行为数据</option>
                            <option value="business_kpi" ${card.config.dataSource === "business_kpi" ? "selected" : ""}>业务指标数据</option>
                            <option value="sales_stats" ${card.config.dataSource === "sales_stats" ? "selected" : ""}>销售统计数据</option>
                            <option value="todo_list" ${card.config.dataSource === "todo_list" ? "selected" : ""}>待办事项</option>
                        </select>
                    </div>
                </div>
                <div class="layui-form-item">
                    <label class="layui-form-label" style="width: 90px; white-space: nowrap;">显示图例</label>
                    <div class="layui-input-block" style="margin-left: 120px; padding-top: 8px;">
                        <input type="checkbox" id="editShowLegend" lay-skin="switch" lay-text="是|否" ${card.config.showLegend !== false ? "checked" : ""}>
                    </div>
                </div>
                <div class="layui-form-item">
                    <label class="layui-form-label" style="width: 90px; white-space: nowrap;">显示标签</label>
                    <div class="layui-input-block" style="margin-left: 120px; padding-top: 8px;">
                        <input type="checkbox" id="editShowLabel" lay-skin="switch" lay-text="是|否" ${card.config.showLabel ? "checked" : ""}>
                    </div>
                </div>
                <div class="layui-form-item" style="border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: right; margin-top: 20px;">
                    <a href="javascript:;" id="goFactoryEdit" style="float: left; color: #1E9FFF; line-height: 36px;">
                        <i class="layui-icon layui-icon-edit"></i> 前往卡片工厂高级编辑
                    </a>
                    <button class="layui-btn" id="saveCardEdit">保存</button>
                    <button class="layui-btn layui-btn-primary" onclick="layui.layer.closeAll()">取消</button>
                </div>
            </div>
        `,
    success: () => {
      layui.form.render("checkbox");

      document.getElementById("saveCardEdit").addEventListener("click", () => {
        card.title = document.getElementById("editCardTitle").value;
        card.config.dataSource =
          document.getElementById("editCardDataSource").value;
        card.config.showLegend = document.getElementById("editShowLegend").checked;
        card.config.showLabel = document.getElementById("editShowLabel").checked;

        CardStore.update(cardId, {
          title: card.title,
          config: { ...card.config },
        });

        const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
        cardEl.querySelector(".card-header h3").textContent = card.title;

        renderCardContent(card);

        layui.layer.closeAll();
        Toast.success("卡片已更新");
      });

      document.getElementById("goFactoryEdit").addEventListener("click", () => {
        layui.layer.closeAll();
        Toast.info("正在跳转到卡片工厂...");
        setTimeout(() => {
          window.location.href = `pages/card-factory.html?cardId=${cardId}`;
        }, 300);
      });
    },
  });
}

// 保存布局
async function saveLayout() {
  try {
    await request.saveUserCards(state.userCards);
  } catch (error) {
    console.error("[Home] 保存布局失败:", error);
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  // 等待 layui 加载完成
  layui.use(["layer", "form"], () => {
    initPage();
  });
});
