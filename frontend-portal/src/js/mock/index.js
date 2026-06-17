// ==========================================
// Mock API 服务 - 模拟后端接口
// ==========================================

import CardStore from "../utils/card-store.js";

// 模拟延迟
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 占位图生成函数
const getPlaceholderImg = (width, height, text = "") => {
  // 使用 SVG 生成占位图
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect fill="#e0e0e0" width="${width}" height="${height}"/>
    <text fill="#999" font-family="Arial" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">${text || `${width}x${height}`}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// 生成带文字的彩色占位图
const generateColorfulPlaceholder = (width, height, text, colorIndex = 0) => {
  const colors = [
    ["#667eea", "#764ba2"], // 紫色渐变
    ["#f093fb", "#f5576c"], // 粉红渐变
    ["#4facfe", "#00f2fe"], // 蓝色渐变
    ["#43e97b", "#38f9d7"], // 绿色渐变
    ["#fa709a", "#fee140"], // 橙粉渐变
    ["#a8edea", "#fed6e3"], // 浅色渐变
  ];
  const [color1, color2] = colors[colorIndex % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect fill="url(#grad${colorIndex})" width="${width}" height="${height}"/>
    <text fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24" font-weight="bold" x="50%" y="50%" text-anchor="middle" dy=".35em">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// 生成用户头像占位图
const generateAvatarPlaceholder = (size, name, colorIndex = 0) => {
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect fill="${color}" width="${size}" height="${size}" rx="${size / 2}"/>
    <text fill="#fff" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" x="50%" y="50%" text-anchor="middle" dy=".35em">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

// 模拟数据存储
const mockDB = {
  // 当前用户
  currentUser: {
    id: "user001",
    username: "张三",
    department: "数字化转型部",
    avatar: generateAvatarPlaceholder(100, "张", 0),
    role: "admin",
    preferences: {
      theme: "light",
      defaultWorkspace: "ws001",
    },
  },

  // KPI 数据
  kpiData: [
    {
      id: "kpi1",
      label: "系统接入数",
      value: 22,
      unit: "个",
      trend: 12,
      trendType: "up",
    },
    {
      id: "kpi2",
      label: "日活用户",
      value: 3856,
      unit: "人",
      trend: 8.5,
      trendType: "up",
    },
    {
      id: "kpi3",
      label: "API调用量",
      value: 128.6,
      unit: "万次",
      trend: -2.3,
      trendType: "down",
    },
    {
      id: "kpi4",
      label: "数据资产",
      value: 1.2,
      unit: "TB",
      trend: 15,
      trendType: "up",
    },
  ],

  // 趋势数据
  trendData: {
    dates: [
      "01-01",
      "01-02",
      "01-03",
      "01-04",
      "01-05",
      "01-06",
      "01-07",
      "01-08",
      "01-09",
      "01-10",
      "01-11",
      "01-12",
      "01-13",
      "01-14",
      "01-15",
      "01-16",
      "01-17",
      "01-18",
      "01-19",
      "01-20",
      "01-21",
      "01-22",
      "01-23",
      "01-24",
      "01-25",
      "01-26",
      "01-27",
      "01-28",
      "01-29",
      "01-30",
    ],
    series: [
      {
        name: "访问量",
        data: [
          820, 932, 901, 934, 1290, 1330, 1320, 1450, 1200, 1100, 980, 1050,
          1180, 1250, 1380, 1420, 1500, 1380, 1290, 1350, 1420, 1550, 1680,
          1720, 1800, 1750, 1680, 1590, 1620, 1700,
        ],
      },
      {
        name: "API调用",
        data: [
          620, 732, 701, 734, 1090, 1130, 1120, 1250, 1000, 900, 780, 850, 980,
          1050, 1180, 1220, 1300, 1180, 1090, 1150, 1220, 1350, 1480, 1520,
          1600, 1550, 1480, 1390, 1420, 1500,
        ],
      },
    ],
  },

  // 数字化转型时间轴
  timelineData: [
    {
      date: "2025-01",
      title: "智能平台上线",
      desc: "完成AI能力中台建设，支持智能问答、图像识别等能力",
    },
    {
      date: "2024-10",
      title: "数据中台2.0",
      desc: "升级数据治理能力，实现数据资产全生命周期管理",
    },
    {
      date: "2024-06",
      title: "22个典型应用",
      desc: "完成22个业务场景的数字化应用建设",
    },
    {
      date: "2024-01",
      title: "统一门户规划",
      desc: "启动综合门户网站建设规划，打造数字前台",
    },
  ],

  // 通知公告
  notices: [
    {
      id: "n001",
      title: "关于开展2025年度数字化转型工作的通知",
      tag: "important",
      tagText: "重要",
      date: "2025-01-25",
      dept: "数字化转型部",
    },
    {
      id: "n002",
      title: "数据应用门户系统升级公告",
      tag: "system",
      tagText: "系统",
      date: "2025-01-24",
      dept: "信息技术部",
    },
    {
      id: "n003",
      title: "新版API接口文档发布说明",
      tag: "normal",
      tagText: "通知",
      date: "2025-01-23",
      dept: "技术支持组",
    },
    {
      id: "n004",
      title: "关于规范数据资产使用的管理办法",
      tag: "important",
      tagText: "重要",
      date: "2025-01-22",
      dept: "数据管理部",
    },
    {
      id: "n005",
      title: "本周系统维护时间安排",
      tag: "system",
      tagText: "系统",
      date: "2025-01-21",
      dept: "运维中心",
    },
  ],

  // 快捷入口
  shortcuts: [
    {
      id: "s001",
      name: "数据查询",
      icon: "layui-icon-search",
      color: "blue",
      url: "#",
    },
    {
      id: "s002",
      name: "报表中心",
      icon: "layui-icon-chart",
      color: "green",
      url: "#",
    },
    {
      id: "s003",
      name: "审批流程",
      icon: "layui-icon-ok-circle",
      color: "orange",
      url: "#",
    },
    {
      id: "s004",
      name: "消息中心",
      icon: "layui-icon-notice",
      color: "red",
      url: "#",
    },
    {
      id: "s005",
      name: "知识库",
      icon: "layui-icon-read",
      color: "purple",
      url: "#",
    },
    {
      id: "s006",
      name: "工单系统",
      icon: "layui-icon-form",
      color: "cyan",
      url: "#",
    },
    {
      id: "s007",
      name: "日程管理",
      icon: "layui-icon-date",
      color: "pink",
      url: "#",
    },
    {
      id: "s008",
      name: "系统设置",
      icon: "layui-icon-set",
      color: "teal",
      url: "#",
    },
  ],

  // 用户工作台卡片
  userCards: [
    {
      id: "uc001",
      type: "chart",
      chartType: "pie",
      title: "部门数据分布",
      config: {
        dataSource: "dept_distribution",
        colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      },
    },
    {
      id: "uc002",
      type: "chart",
      chartType: "bar",
      title: "月度业务统计",
      config: {
        dataSource: "monthly_stats",
        xAxis: "month",
        yAxis: "value",
      },
    },
    {
      id: "uc003",
      type: "list",
      title: "待办事项",
      config: {
        dataSource: "todo_list",
        limit: 5,
      },
    },
  ],

  // 卡片模板
  cardTemplates: {
    chart: [
      {
        id: "tpl_line",
        name: "折线图",
        desc: "展示数据趋势变化",
        icon: "layui-icon-chart",
      },
      {
        id: "tpl_bar",
        name: "柱状图",
        desc: "对比不同类别数据",
        icon: "layui-icon-chart-screen",
      },
      {
        id: "tpl_pie",
        name: "饼图",
        desc: "展示数据占比分布",
        icon: "layui-icon-chart",
      },
      {
        id: "tpl_area",
        name: "面积图",
        desc: "展示累计趋势",
        icon: "layui-icon-chart",
      },
      {
        id: "tpl_radar",
        name: "雷达图",
        desc: "多维度数据对比",
        icon: "layui-icon-chart",
      },
      {
        id: "tpl_gauge",
        name: "仪表盘",
        desc: "展示完成度指标",
        icon: "layui-icon-chart",
      },
    ],
    list: [
      {
        id: "tpl_todo",
        name: "待办列表",
        desc: "展示待处理事项",
        icon: "layui-icon-list",
      },
      {
        id: "tpl_rank",
        name: "排行榜",
        desc: "展示排名数据",
        icon: "layui-icon-top",
      },
      {
        id: "tpl_timeline",
        name: "时间线",
        desc: "展示时间序列事件",
        icon: "layui-icon-time",
      },
    ],
    stat: [
      {
        id: "tpl_kpi",
        name: "KPI指标卡",
        desc: "展示核心指标",
        icon: "layui-icon-rate",
      },
      {
        id: "tpl_progress",
        name: "进度卡片",
        desc: "展示完成进度",
        icon: "layui-icon-loading-1",
      },
      {
        id: "tpl_compare",
        name: "对比卡片",
        desc: "同比环比对比",
        icon: "layui-icon-slider",
      },
    ],
    custom: [
      {
        id: "tpl_iframe",
        name: "嵌入页面",
        desc: "嵌入外部页面",
        icon: "layui-icon-website",
      },
      {
        id: "tpl_map",
        name: "地图卡片",
        desc: "展示地理数据",
        icon: "layui-icon-location",
      },
      {
        id: "tpl_text",
        name: "富文本",
        desc: "自定义文本内容",
        icon: "layui-icon-edit",
      },
    ],
  },

  // 应用模板市场
  appTemplates: [
    {
      id: "app001",
      name: "销售数据看板",
      description: "包含销售额、订单量、客户分析等核心指标的综合看板",
      author: "李四",
      department: "销售部",
      thumbnail: generateColorfulPlaceholder(400, 250, "销售看板", 0),
      cloneCount: 128,
      likeCount: 56,
      createTime: "2025-01-20",
      tags: ["销售", "数据分析", "看板"],
    },
    {
      id: "app002",
      name: "运维监控面板",
      description: "服务器状态、API响应时间、错误率等运维指标监控",
      author: "王五",
      department: "运维中心",
      thumbnail: generateColorfulPlaceholder(400, 250, "运维监控", 1),
      cloneCount: 89,
      likeCount: 42,
      createTime: "2025-01-18",
      tags: ["运维", "监控", "告警"],
    },
    {
      id: "app003",
      name: "人力资源仪表盘",
      description: "员工数据、考勤统计、绩效分析等HR数据展示",
      author: "赵六",
      department: "人力资源部",
      thumbnail: generateColorfulPlaceholder(400, 250, "HR仪表盘", 2),
      cloneCount: 67,
      likeCount: 31,
      createTime: "2025-01-15",
      tags: ["HR", "人力资源", "统计"],
    },
    {
      id: "app004",
      name: "财务分析报表",
      description: "收入支出、成本分析、预算执行等财务数据可视化",
      author: "钱七",
      department: "财务部",
      thumbnail: generateColorfulPlaceholder(400, 250, "财务报表", 3),
      cloneCount: 156,
      likeCount: 78,
      createTime: "2025-01-12",
      tags: ["财务", "报表", "分析"],
    },
    {
      id: "app005",
      name: "项目进度追踪",
      description: "项目里程碑、任务完成度、资源分配等项目管理视图",
      author: "孙八",
      department: "项目管理办",
      thumbnail: generateColorfulPlaceholder(400, 250, "项目管理", 4),
      cloneCount: 203,
      likeCount: 95,
      createTime: "2025-01-10",
      tags: ["项目管理", "进度", "甘特图"],
    },
    {
      id: "app006",
      name: "客户服务中心",
      description: "工单统计、客户满意度、响应时效等客服数据展示",
      author: "周九",
      department: "客服中心",
      thumbnail: generateColorfulPlaceholder(400, 250, "客服中心", 5),
      cloneCount: 45,
      likeCount: 23,
      createTime: "2025-01-08",
      tags: ["客服", "工单", "满意度"],
    },
  ],

  // 数据源列表
  dataSources: [
    {
      id: "ds001",
      name: "用户行为数据",
      api: "/api/data/user-behavior",
      method: "GET",
      desc: "用户访问、点击等行为数据",
    },
    {
      id: "ds002",
      name: "业务指标数据",
      api: "/api/data/business-kpi",
      method: "GET",
      desc: "核心业务KPI指标",
    },
    {
      id: "ds003",
      name: "系统监控数据",
      api: "/api/data/system-monitor",
      method: "GET",
      desc: "系统性能监控数据",
    },
    {
      id: "ds004",
      name: "销售统计数据",
      api: "/api/data/sales-stats",
      method: "GET",
      desc: "销售额、订单等统计",
    },
    {
      id: "ds005",
      name: "人员组织数据",
      api: "/api/data/org-structure",
      method: "GET",
      desc: "组织架构、人员信息",
    },
  ],

  // 图表数据
  chartData: {
    dept_distribution: [
      { name: "技术部", value: 35 },
      { name: "销售部", value: 25 },
      { name: "运营部", value: 20 },
      { name: "财务部", value: 12 },
      { name: "其他", value: 8 },
    ],
    monthly_stats: {
      categories: ["1月", "2月", "3月", "4月", "5月", "6月"],
      series: [
        { name: "订单量", data: [120, 132, 101, 134, 90, 230] },
        { name: "销售额", data: [220, 182, 191, 234, 290, 330] },
      ],
    },
    todo_list: [
      {
        id: "t001",
        title: "审批数据接入申请",
        priority: "high",
        deadline: "2025-01-26",
      },
      {
        id: "t002",
        title: "完成月度报表配置",
        priority: "medium",
        deadline: "2025-01-28",
      },
      {
        id: "t003",
        title: "参加系统培训会议",
        priority: "low",
        deadline: "2025-01-30",
      },
      {
        id: "t004",
        title: "更新API文档",
        priority: "medium",
        deadline: "2025-02-01",
      },
      {
        id: "t005",
        title: "优化查询性能",
        priority: "high",
        deadline: "2025-02-03",
      },
    ],
    user_behavior: {
      categories: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      series: [
        { name: "页面浏览", data: [1200, 1500, 1320, 1450, 1680, 2100, 1900] },
        { name: "独立访客", data: [800, 950, 880, 920, 1050, 1300, 1150] },
        { name: "新增用户", data: [120, 150, 135, 145, 168, 210, 190] },
      ],
    },
    business_kpi: {
      categories: ["Q1", "Q2", "Q3", "Q4"],
      series: [
        { name: "营收(万)", data: [3200, 4500, 5200, 6800] },
        { name: "利润(万)", data: [800, 1200, 1500, 2100] },
        { name: "用户数(万)", data: [15, 22, 30, 42] },
      ],
    },
    sales_stats: {
      categories: ["1月", "2月", "3月", "4月", "5月", "6月"],
      series: [
        { name: "线上销售", data: [450, 520, 480, 610, 580, 720] },
        { name: "线下销售", data: [380, 420, 390, 450, 480, 530] },
        { name: "代理渠道", data: [220, 280, 250, 310, 340, 380] },
      ],
    },
  },

  // 地图数据
  mapData: {
    points: [
      { name: "北京总部", lng: 116.407526, lat: 39.90403, value: 1200 },
      { name: "上海分公司", lng: 121.473701, lat: 31.230416, value: 800 },
      { name: "广州分公司", lng: 113.264385, lat: 23.129112, value: 650 },
      { name: "深圳分公司", lng: 114.057868, lat: 22.543099, value: 720 },
      { name: "成都分公司", lng: 104.065735, lat: 30.659462, value: 450 },
      { name: "武汉分公司", lng: 114.298572, lat: 30.584355, value: 380 },
    ],
    regions: [
      { name: "华北区", value: 2500 },
      { name: "华东区", value: 3200 },
      { name: "华南区", value: 2800 },
      { name: "西南区", value: 1500 },
      { name: "华中区", value: 1200 },
    ],
  },
};

// Mock API 实现
const MockAPI = {
  // 用户相关
  async getUserInfo() {
    await delay(200);
    return { code: 200, data: mockDB.currentUser, message: "success" };
  },

  async updateUserPreferences(preferences) {
    await delay(300);
    mockDB.currentUser.preferences = {
      ...mockDB.currentUser.preferences,
      ...preferences,
    };
    return {
      code: 200,
      data: mockDB.currentUser.preferences,
      message: "success",
    };
  },

  // 仪表盘数据
  async getDashboardKPI() {
    await delay(300);
    return { code: 200, data: mockDB.kpiData, message: "success" };
  },

  async getDashboardTrend(period = 30) {
    await delay(400);
    const data = { ...mockDB.trendData };
    data.dates = data.dates.slice(-period);
    data.series = data.series.map((s) => ({
      ...s,
      data: s.data.slice(-period),
    }));
    return { code: 200, data, message: "success" };
  },

  async getTimeline() {
    await delay(200);
    return { code: 200, data: mockDB.timelineData, message: "success" };
  },

  // 通知公告
  async getNotices(params = {}) {
    await delay(250);
    let data = [...mockDB.notices];
    if (params.limit) {
      data = data.slice(0, params.limit);
    }
    return { code: 200, data, message: "success" };
  },

  async getNoticeDetail(id) {
    await delay(200);
    const notice = mockDB.notices.find((n) => n.id === id);
    if (notice) {
      return {
        code: 200,
        data: {
          ...notice,
          content: `这是${notice.title}的详细内容。\n\n包含具体的通知事项和要求说明。`,
        },
        message: "success",
      };
    }
    return { code: 404, data: null, message: "通知不存在" };
  },

  // 快捷入口
  async getShortcuts() {
    await delay(150);
    return { code: 200, data: mockDB.shortcuts, message: "success" };
  },

  // 用户卡片
  async getUserCards() {
    await delay(300);
    const cards = CardStore.getAll();
    return { code: 200, data: cards, message: "success" };
  },

  async saveUserCards(cards) {
    await delay(400);
    CardStore.saveAll(cards);
    return { code: 200, data: cards, message: "success" };
  },

  async deleteUserCard(cardId) {
    await delay(200);
    CardStore.remove(cardId);
    return { code: 200, data: null, message: "success" };
  },

  // 卡片模板
  async getCardTemplates(type = "chart") {
    await delay(200);
    return {
      code: 200,
      data: mockDB.cardTemplates[type] || [],
      message: "success",
    };
  },

  // 图表数据
  async getChartData(dataSource) {
    await delay(350);
    const data = mockDB.chartData[dataSource];
    if (data) {
      return { code: 200, data, message: "success" };
    }
    return { code: 404, data: null, message: "数据源不存在" };
  },

  // 应用模板市场
  async getAppTemplates(params = {}) {
    await delay(400);
    let data = [...mockDB.appTemplates];
    if (params.keyword) {
      data = data.filter(
        (t) =>
          t.name.includes(params.keyword) ||
          t.description.includes(params.keyword) ||
          t.tags.some((tag) => tag.includes(params.keyword)),
      );
    }
    if (params.sort === "hot") {
      data.sort((a, b) => b.cloneCount - a.cloneCount);
    } else if (params.sort === "new") {
      data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }
    return { code: 200, data, total: data.length, message: "success" };
  },

  async getAppTemplateDetail(id) {
    await delay(300);
    const template = mockDB.appTemplates.find((t) => t.id === id);
    if (template) {
      return { code: 200, data: template, message: "success" };
    }
    return { code: 404, data: null, message: "模板不存在" };
  },

  async cloneAppTemplate(id) {
    await delay(500);
    const template = mockDB.appTemplates.find((t) => t.id === id);
    if (template) {
      template.cloneCount++;
      return {
        code: 200,
        data: { cloneId: "clone_" + Date.now() },
        message: "克隆成功",
      };
    }
    return { code: 404, data: null, message: "模板不存在" };
  },

  async likeAppTemplate(id) {
    await delay(200);
    const template = mockDB.appTemplates.find((t) => t.id === id);
    if (template) {
      template.likeCount++;
      return {
        code: 200,
        data: { likeCount: template.likeCount },
        message: "success",
      };
    }
    return { code: 404, data: null, message: "模板不存在" };
  },

  // 数据源
  async getDataSources() {
    await delay(250);
    return { code: 200, data: mockDB.dataSources, message: "success" };
  },

  async testDataSource(id) {
    await delay(800);
    const ds = mockDB.dataSources.find((d) => d.id === id);
    if (ds) {
      return {
        code: 200,
        data: {
          status: "connected",
          latency: Math.floor(Math.random() * 100) + 50,
        },
        message: "连接成功",
      };
    }
    return { code: 404, data: null, message: "数据源不存在" };
  },

  // 地图数据
  async getMapData(type = "points") {
    await delay(300);
    return { code: 200, data: mockDB.mapData[type] || [], message: "success" };
  },
};

// 导出 Mock API
export default MockAPI;
export { mockDB };
