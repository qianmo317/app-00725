// ==========================================
// 请求工具类 - 封装 Mock API 调用
// ==========================================

import MockAPI from "../mock/index.js";

// Toast 提示
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "info", duration = 3000) {
    this.init();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconMap = {
      success: "layui-icon-ok-circle",
      error: "layui-icon-close-fill",
      warning: "layui-icon-about",
      info: "layui-icon-about",
    };

    toast.innerHTML = `<i class="layui-icon ${iconMap[type]}"></i><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOutRight 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(message) {
    this.show(message, "success");
  },
  error(message) {
    this.show(message, "error");
  },
  warning(message) {
    this.show(message, "warning");
  },
  info(message) {
    this.show(message, "info");
  },
};

// 添加动画样式
const style = document.createElement("style");
style.textContent = `
    @keyframes slideOutRight {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Loading 状态管理
const Loading = {
  show(target) {
    if (typeof target === "string") {
      target = document.querySelector(target);
    }
    if (!target) return;

    const mask = document.createElement("div");
    mask.className = "loading-mask";
    mask.innerHTML = '<div class="loading-spinner"></div>';
    target.style.position = "relative";
    target.appendChild(mask);
    return mask;
  },

  hide(mask) {
    if (mask && mask.parentNode) {
      mask.remove();
    }
  },
};

// API 请求封装
const request = {
  // 用户相关
  async getUserInfo() {
    try {
      const res = await MockAPI.getUserInfo();
      return res.data;
    } catch (error) {
      Toast.error("获取用户信息失败");
      throw error;
    }
  },

  async updateUserPreferences(preferences) {
    try {
      const res = await MockAPI.updateUserPreferences(preferences);
      Toast.success("设置已保存");
      return res.data;
    } catch (error) {
      Toast.error("保存设置失败");
      throw error;
    }
  },

  // 仪表盘
  async getDashboardKPI() {
    try {
      const res = await MockAPI.getDashboardKPI();
      return res.data;
    } catch (error) {
      Toast.error("获取KPI数据失败");
      throw error;
    }
  },

  async getDashboardTrend(period) {
    try {
      const res = await MockAPI.getDashboardTrend(period);
      return res.data;
    } catch (error) {
      Toast.error("获取趋势数据失败");
      throw error;
    }
  },

  async getTimeline() {
    try {
      const res = await MockAPI.getTimeline();
      return res.data;
    } catch (error) {
      Toast.error("获取时间轴数据失败");
      throw error;
    }
  },

  // 通知公告
  async getNotices(params) {
    try {
      const res = await MockAPI.getNotices(params);
      return res.data;
    } catch (error) {
      Toast.error("获取通知列表失败");
      throw error;
    }
  },

  async getNoticeDetail(id) {
    try {
      const res = await MockAPI.getNoticeDetail(id);
      return res.data;
    } catch (error) {
      Toast.error("获取通知详情失败");
      throw error;
    }
  },

  // 快捷入口
  async getShortcuts() {
    try {
      const res = await MockAPI.getShortcuts();
      return res.data;
    } catch (error) {
      Toast.error("获取快捷入口失败");
      throw error;
    }
  },

  // 用户卡片
  async getUserCards() {
    try {
      const res = await MockAPI.getUserCards();
      return res.data;
    } catch (error) {
      Toast.error("获取卡片数据失败");
      throw error;
    }
  },

  async saveUserCards(cards) {
    try {
      const res = await MockAPI.saveUserCards(cards);
      Toast.success("布局已保存");
      return res.data;
    } catch (error) {
      Toast.error("保存布局失败");
      throw error;
    }
  },

  async deleteUserCard(cardId) {
    try {
      const res = await MockAPI.deleteUserCard(cardId);
      Toast.success("卡片已删除");
      return res.data;
    } catch (error) {
      Toast.error("删除卡片失败");
      throw error;
    }
  },

  // 卡片模板
  async getCardTemplates(type) {
    try {
      const res = await MockAPI.getCardTemplates(type);
      return res.data;
    } catch (error) {
      Toast.error("获取卡片模板失败");
      throw error;
    }
  },

  // 图表数据
  async getChartData(dataSource) {
    try {
      const res = await MockAPI.getChartData(dataSource);
      return res.data;
    } catch (error) {
      Toast.error("获取图表数据失败");
      throw error;
    }
  },

  // 应用模板
  async getAppTemplates(params) {
    try {
      const res = await MockAPI.getAppTemplates(params);
      return { list: res.data, total: res.total };
    } catch (error) {
      Toast.error("获取应用模板失败");
      throw error;
    }
  },

  async getAppTemplateDetail(id) {
    try {
      const res = await MockAPI.getAppTemplateDetail(id);
      return res.data;
    } catch (error) {
      Toast.error("获取模板详情失败");
      throw error;
    }
  },

  async cloneAppTemplate(id) {
    try {
      const res = await MockAPI.cloneAppTemplate(id);
      Toast.success("模板克隆成功");
      return res.data;
    } catch (error) {
      Toast.error("克隆模板失败");
      throw error;
    }
  },

  async likeAppTemplate(id) {
    try {
      const res = await MockAPI.likeAppTemplate(id);
      return res.data;
    } catch (error) {
      Toast.error("操作失败");
      throw error;
    }
  },

  // 数据源
  async getDataSources() {
    try {
      const res = await MockAPI.getDataSources();
      return res.data;
    } catch (error) {
      Toast.error("获取数据源列表失败");
      throw error;
    }
  },

  async testDataSource(id) {
    try {
      const res = await MockAPI.testDataSource(id);
      Toast.success(`连接成功，延迟: ${res.data.latency}ms`);
      return res.data;
    } catch (error) {
      Toast.error("数据源连接失败");
      throw error;
    }
  },

  // 地图数据
  async getMapData(type) {
    try {
      const res = await MockAPI.getMapData(type);
      return res.data;
    } catch (error) {
      Toast.error("获取地图数据失败");
      throw error;
    }
  },
};

export { Toast, Loading };
export default request;
