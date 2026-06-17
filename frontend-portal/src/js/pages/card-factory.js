// ==========================================
// 卡片工厂 - 页面逻辑
// ==========================================

import { Toast } from "../utils/request.js";
import CardStore from "../utils/cardStore.js";

// 页面状态
const state = {
  chartType: "line",
  editingCardId: null,
  config: {
    title: "数据分析图表",
    dataSource: "demo",
    refreshRate: 0,
    primaryColor: "#1E9FFF",
    showLegend: true,
    showLabel: false,
    smoothLine: true,
    clickAction: "none",
    showTooltip: true,
  },
  chartInstance: null,
  demoData: {
    line: {
      categories: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      series: [
        { name: "访问量", data: [820, 932, 901, 934, 1290, 1330, 1320] },
        { name: "订单量", data: [320, 432, 401, 534, 690, 730, 620] },
      ],
    },
    bar: {
      categories: ["1月", "2月", "3月", "4月", "5月", "6月"],
      series: [
        { name: "销售额", data: [120, 200, 150, 80, 70, 110] },
        { name: "利润", data: [60, 100, 75, 40, 35, 55] },
      ],
    },
    pie: [
      { name: "技术部", value: 35 },
      { name: "销售部", value: 25 },
      { name: "运营部", value: 20 },
      { name: "财务部", value: 12 },
      { name: "其他", value: 8 },
    ],
    area: {
      categories: [
        "00:00",
        "04:00",
        "08:00",
        "12:00",
        "16:00",
        "20:00",
        "24:00",
      ],
      series: [
        { name: "CPU使用率", data: [30, 25, 45, 80, 65, 50, 35] },
        { name: "内存使用率", data: [50, 48, 55, 70, 68, 60, 52] },
      ],
    },
    radar: {
      indicators: [
        { name: "销售", max: 100 },
        { name: "管理", max: 100 },
        { name: "技术", max: 100 },
        { name: "客服", max: 100 },
        { name: "研发", max: 100 },
        { name: "市场", max: 100 },
      ],
      series: [
        { name: "预算", data: [80, 90, 70, 85, 75, 88] },
        { name: "实际", data: [70, 85, 80, 78, 82, 75] },
      ],
    },
    gauge: {
      value: 72.5,
      name: "完成率",
    },
  },
};

// 初始化页面
function initPage() {
  console.log("[CardFactory] 初始化卡片工厂...");

  bindEvents();
  initChart();

  // 检查是否为编辑模式
  const urlParams = new URLSearchParams(window.location.search);
  const cardId = urlParams.get("cardId");
  if (cardId) {
    loadCardForEdit(cardId);
  }

  updateDataTable();
  updateConfigCode();

  console.log("[CardFactory] 初始化完成");
}

// 加载卡片进行编辑
function loadCardForEdit(cardId) {
  const card = CardStore.getCardById(cardId);
  if (!card) {
    Toast.error("卡片不存在或已被删除");
    return;
  }

  state.editingCardId = cardId;
  state.chartType = card.chartType || "line";
  state.config.title = card.title || "数据分析图表";
  state.config.dataSource = card.config?.dataSource || "demo";
  state.config.refreshRate = card.config?.refreshRate || 0;
  state.config.primaryColor = card.config?.colors?.[0] || "#1E9FFF";
  state.config.showLegend = card.config?.showLegend ?? true;
  state.config.showLabel = card.config?.showLabel ?? false;
  state.config.smoothLine = card.config?.smoothLine ?? true;
  state.config.clickAction = card.config?.clickAction || "none";
  state.config.showTooltip = card.config?.showTooltip ?? true;

  // 更新 UI
  document.getElementById("cardTitle").value = state.config.title;
  document.getElementById("previewTitle").textContent = state.config.title;
  document.getElementById("dataSource").value = state.config.dataSource;
  document.getElementById("refreshRate").value = state.config.refreshRate;

  // 更新图表类型选中状态
  document.querySelectorAll(".chart-type-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.type === state.chartType) {
      item.classList.add("active");
    }
  });

  // 更新颜色选中状态
  document.querySelectorAll(".color-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.color === state.config.primaryColor) {
      item.classList.add("active");
    }
  });

  // 更新开关状态（需要 layui form render）
  setTimeout(() => {
    const showLegend = document.getElementById("showLegend");
    const showLabel = document.getElementById("showLabel");
    const smoothLine = document.getElementById("smoothLine");
    const showTooltip = document.getElementById("showTooltip");

    if (showLegend) showLegend.checked = state.config.showLegend;
    if (showLabel) showLabel.checked = state.config.showLabel;
    if (smoothLine) smoothLine.checked = state.config.smoothLine;
    if (showTooltip) showTooltip.checked = state.config.showTooltip;

    layui.form.render("checkbox");
  }, 0);

  // 更新按钮文字
  const saveBtn = document.getElementById("saveCard");
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="layui-icon layui-icon-ok"></i> 保存修改';
  }

  // 刷新图表和数据
  updateChart();
  updateDataTable();
  updateConfigCode();

  Toast.info("已加载卡片，可进行编辑");
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

  // 图表类型选择
  document.querySelectorAll(".chart-type-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".chart-type-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      state.chartType = item.dataset.type;
      updateChart();
      updateDataTable();
      updateConfigCode();
    });
  });

  // 卡片标题
  document.getElementById("cardTitle").addEventListener("input", (e) => {
    state.config.title = e.target.value;
    document.getElementById("previewTitle").textContent = e.target.value;
    updateConfigCode();
  });

  // 数据源
  document.getElementById("dataSource").addEventListener("change", (e) => {
    state.config.dataSource = e.target.value;
    if (e.target.value !== "demo") {
      Toast.info("真实数据源接入功能开发中，当前使用示例数据");
    }
    updateChart();
    updateConfigCode();
  });

  // 刷新频率
  document.getElementById("refreshRate").addEventListener("change", (e) => {
    state.config.refreshRate = parseInt(e.target.value);
    if (e.target.value !== "0") {
      Toast.info("自动刷新功能开发中...");
    }
    updateConfigCode();
  });

  // 颜色选择
  document.querySelectorAll(".color-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".color-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      state.config.primaryColor = item.dataset.color;
      updateChart();
      updateConfigCode();
    });
  });

  // 点击事件
  document.getElementById("clickAction").addEventListener("change", (e) => {
    state.config.clickAction = e.target.value;
    if (e.target.value !== "none") {
      Toast.info("图表交互功能开发中...");
    }
    updateConfigCode();
  });

  // 刷新预览
  document.getElementById("refreshPreview").addEventListener("click", () => {
    updateChart();
    Toast.success("图表已刷新");
  });

  // 保存卡片
  document.getElementById("saveCard").addEventListener("click", saveCard);

  // 添加到工作台
  document
    .getElementById("addToWorkspace")
    .addEventListener("click", addToWorkspace);

  // 复制配置
  document.getElementById("copyConfig").addEventListener("click", copyConfig);

  // 尺寸控制
  document.querySelectorAll(".size-controls button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".size-controls button")
        .forEach((b) => b.classList.remove("layui-btn-normal"));
      btn.classList.add("layui-btn-normal");

      const size = btn.dataset.size;
      const sizeMap = {
        small: { width: 300, height: 200 },
        medium: { width: 400, height: 300 },
        large: { width: 600, height: 400 },
      };

      const previewChart = document.getElementById("previewChart");
      previewChart.style.height = sizeMap[size].height + "px";
      document.querySelector(".size-info strong").textContent =
        `${sizeMap[size].width} x ${sizeMap[size].height}`;

      state.chartInstance?.resize();
    });
  });
}

// 初始化图表
function initChart() {
  const container = document.getElementById("previewChart");
  state.chartInstance = echarts.init(container);
  updateChart();

  window.addEventListener("resize", () => {
    state.chartInstance?.resize();
  });
}

// 更新图表
function updateChart() {
  const option = getChartOption();
  state.chartInstance.setOption(option, true);
}

// 获取图表配置
function getChartOption() {
  const { chartType, config, demoData } = state;
  const color = config.primaryColor;
  const colors = [color, "#5FB878", "#FFB800", "#FF5722", "#9c27b0"];

  let option = {
    color: colors,
    tooltip: {
      show: config.showTooltip,
      trigger: chartType === "pie" ? "item" : "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e6e6e6",
      borderWidth: 1,
      textStyle: { color: "#333" },
    },
  };

  switch (chartType) {
    case "line":
      option = {
        ...option,
        legend: {
          show: config.showLegend,
          data: demoData.line.series.map((s) => s.name),
          bottom: 0,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: config.showLegend ? "15%" : "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: demoData.line.categories,
          axisLine: { lineStyle: { color: "#e6e6e6" } },
          axisLabel: { color: "#999" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999" },
        },
        series: demoData.line.series.map((s, i) => ({
          name: s.name,
          type: "line",
          smooth: config.smoothLine,
          data: s.data,
          symbol: "circle",
          symbolSize: 6,
          label: {
            show: config.showLabel,
            position: "top",
          },
          itemStyle: { color: colors[i] },
        })),
      };
      break;

    case "bar":
      option = {
        ...option,
        legend: {
          show: config.showLegend,
          data: demoData.bar.series.map((s) => s.name),
          bottom: 0,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: config.showLegend ? "15%" : "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: demoData.bar.categories,
          axisLine: { lineStyle: { color: "#e6e6e6" } },
          axisLabel: { color: "#999" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999" },
        },
        series: demoData.bar.series.map((s, i) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          barWidth: "30%",
          label: {
            show: config.showLabel,
            position: "top",
          },
          itemStyle: {
            color: colors[i],
            borderRadius: [4, 4, 0, 0],
          },
        })),
      };
      break;

    case "pie":
      option = {
        ...option,
        legend: {
          show: config.showLegend,
          orient: "vertical",
          right: 10,
          top: "center",
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            center: config.showLegend ? ["40%", "50%"] : ["50%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: config.showLabel,
              formatter: "{b}: {d}%",
            },
            emphasis: {
              label: { show: true, fontWeight: "bold" },
            },
            data: demoData.pie,
            itemStyle: {
              borderRadius: 4,
              borderColor: "#fff",
              borderWidth: 2,
            },
          },
        ],
      };
      break;

    case "area":
      option = {
        ...option,
        legend: {
          show: config.showLegend,
          data: demoData.area.series.map((s) => s.name),
          bottom: 0,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: config.showLegend ? "15%" : "10%",
          top: "10%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: demoData.area.categories,
          axisLine: { lineStyle: { color: "#e6e6e6" } },
          axisLabel: { color: "#999" },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0" } },
          axisLabel: { color: "#999", formatter: "{value}%" },
        },
        series: demoData.area.series.map((s, i) => ({
          name: s.name,
          type: "line",
          smooth: config.smoothLine,
          data: s.data,
          areaStyle: { opacity: 0.3 },
          label: {
            show: config.showLabel,
            position: "top",
          },
          itemStyle: { color: colors[i] },
        })),
      };
      break;

    case "radar":
      option = {
        ...option,
        legend: {
          show: config.showLegend,
          data: demoData.radar.series.map((s) => s.name),
          bottom: 0,
        },
        radar: {
          indicator: demoData.radar.indicators,
          shape: "polygon",
          splitNumber: 4,
          axisName: { color: "#666" },
          splitLine: { lineStyle: { color: "#e6e6e6" } },
          splitArea: { show: true, areaStyle: { color: ["#fff", "#f5f5f5"] } },
        },
        series: [
          {
            type: "radar",
            data: demoData.radar.series.map((s, i) => ({
              name: s.name,
              value: s.data,
              areaStyle: { opacity: 0.2 },
              lineStyle: { color: colors[i] },
              itemStyle: { color: colors[i] },
            })),
          },
        ],
      };
      break;

    case "gauge":
      option = {
        ...option,
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
              itemStyle: { color: color },
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
              color: color,
              fontSize: 24,
              offsetCenter: [0, "20%"],
            },
            title: {
              show: true,
              offsetCenter: [0, "40%"],
              color: "#666",
            },
            data: [
              {
                value: demoData.gauge.value,
                name: demoData.gauge.name,
              },
            ],
          },
        ],
      };
      break;
  }

  return option;
}

// 更新数据表格
function updateDataTable() {
  const { chartType, demoData } = state;
  const tbody = document.getElementById("dataTableBody");
  let html = "";

  switch (chartType) {
    case "line":
    case "bar":
    case "area":
      const data = demoData[chartType];
      data.categories.forEach((cat, i) => {
        html += `<tr><td>${cat}</td><td>${data.series[0].data[i]}</td></tr>`;
      });
      break;

    case "pie":
      demoData.pie.forEach((item) => {
        html += `<tr><td>${item.name}</td><td>${item.value}</td></tr>`;
      });
      break;

    case "radar":
      demoData.radar.indicators.forEach((ind, i) => {
        html += `<tr><td>${ind.name}</td><td>${demoData.radar.series[0].data[i]}</td></tr>`;
      });
      break;

    case "gauge":
      html = `<tr><td>${demoData.gauge.name}</td><td>${demoData.gauge.value}%</td></tr>`;
      break;
  }

  tbody.innerHTML = html;
}

// 更新配置代码
function updateConfigCode() {
  const { chartType, config } = state;
  const configObj = {
    type: chartType,
    title: config.title,
    dataSource: config.dataSource,
    refreshRate: config.refreshRate,
    style: {
      primaryColor: config.primaryColor,
      showLegend: config.showLegend,
      showLabel: config.showLabel,
      smoothLine: config.smoothLine,
    },
    interaction: {
      clickAction: config.clickAction,
      showTooltip: config.showTooltip,
    },
  };

  document.getElementById("configCode").textContent = JSON.stringify(
    configObj,
    null,
    2,
  );
}

// 根据图表类型获取默认数据源
function getDefaultDataSource(chartType) {
  if (chartType === "pie") {
    return "dept_distribution";
  } else if (["bar", "line", "area"].includes(chartType)) {
    return "monthly_stats";
  } else if (chartType === "todo" || chartType === "list") {
    return "todo_list";
  }
  return "dept_distribution";
}

// 保存卡片
function saveCard() {
  const dataSource = state.config.dataSource === "demo"
    ? getDefaultDataSource(state.chartType)
    : state.config.dataSource;

  if (state.editingCardId) {
    // 编辑模式：更新现有卡片
    const updatedCard = {
      title: state.config.title,
      chartType: state.chartType,
      config: {
        dataSource,
        colors: [
          state.config.primaryColor,
          "#5FB878",
          "#FFB800",
          "#FF5722",
          "#9c27b0",
        ],
        showLegend: state.config.showLegend,
        showLabel: state.config.showLabel,
        smoothLine: state.config.smoothLine,
        showTooltip: state.config.showTooltip,
        refreshRate: state.config.refreshRate,
        clickAction: state.config.clickAction,
      },
      updateTime: new Date().toISOString(),
    };

    const result = CardStore.updateCard(state.editingCardId, updatedCard);
    if (result) {
      CardStore.notify();
      Toast.success("卡片已更新，返回首页即可查看效果");
    } else {
      Toast.error("保存失败，请重试");
    }
  } else {
    // 新建模式：直接添加到工作台
    const newCard = {
      id: CardStore.generateCardId(),
      type: "chart",
      chartType: state.chartType,
      title: state.config.title,
      config: {
        dataSource,
        colors: [
          state.config.primaryColor,
          "#5FB878",
          "#FFB800",
          "#FF5722",
          "#9c27b0",
        ],
        showLegend: state.config.showLegend,
        showLabel: state.config.showLabel,
        smoothLine: state.config.smoothLine,
        showTooltip: state.config.showTooltip,
        refreshRate: state.config.refreshRate,
        clickAction: state.config.clickAction,
      },
      createTime: new Date().toISOString(),
    };

    CardStore.addCard(newCard);
    CardStore.notify();
    Toast.success("卡片已保存到工作台");
  }
}

// 添加到工作台
function addToWorkspace() {
  if (state.editingCardId) {
    // 编辑模式下直接提示已在工作台
    layui.layer.confirm(
      "卡片已在工作台中，是否返回首页查看？",
      {
        btn: ["去查看", "继续编辑"],
        icon: 1,
      },
      () => {
        window.location.href = "../index.html";
      },
    );
    return;
  }

  const dataSource = state.config.dataSource === "demo"
    ? getDefaultDataSource(state.chartType)
    : state.config.dataSource;

  const newCard = {
    id: CardStore.generateCardId(),
    type: "chart",
    chartType: state.chartType,
    title: state.config.title,
    config: {
      dataSource,
      colors: [
        state.config.primaryColor,
        "#5FB878",
        "#FFB800",
        "#FF5722",
        "#9c27b0",
      ],
      showLegend: state.config.showLegend,
      showLabel: state.config.showLabel,
      smoothLine: state.config.smoothLine,
      showTooltip: state.config.showTooltip,
      refreshRate: state.config.refreshRate,
      clickAction: state.config.clickAction,
    },
    createTime: new Date().toISOString(),
  };

  CardStore.addCard(newCard);
  CardStore.notify();

  layui.layer.confirm(
    "卡片已添加到工作台，是否立即查看？",
    {
      btn: ["去查看", "继续配置"],
      icon: 1,
    },
    () => {
      window.location.href = "../index.html";
    },
  );
}

// 复制配置
function copyConfig() {
  const code = document.getElementById("configCode").textContent;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      Toast.success("配置已复制到剪贴板");
    });
  } else {
    // 降级方案
    const textarea = document.createElement("textarea");
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    Toast.success("配置已复制到剪贴板");
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  layui.use(["layer", "form"], () => {
    // 初始化开关组件
    layui.form.render("checkbox");

    // 监听开关变化
    layui.form.on("switch", (data) => {
      const id = data.elem.id;
      const checked = data.elem.checked;

      switch (id) {
        case "showLegend":
          state.config.showLegend = checked;
          break;
        case "showLabel":
          state.config.showLabel = checked;
          break;
        case "smoothLine":
          state.config.smoothLine = checked;
          break;
        case "showTooltip":
          state.config.showTooltip = checked;
          break;
      }

      updateChart();
      updateConfigCode();
    });

    initPage();
  });
});
