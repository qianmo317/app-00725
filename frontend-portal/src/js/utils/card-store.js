// ==========================================
// 卡片数据共享存储层 - 基于 localStorage 实现卡片工厂与首页工作台数据同步
// ==========================================

const STORAGE_KEY = "portal_user_cards";
const FACTORY_STORAGE_KEY = "portal_factory_cards";

const defaultUserCards = [
  {
    id: "uc001",
    type: "chart",
    chartType: "pie",
    title: "部门数据分布",
    source: "system",
    config: {
      dataSource: "dept_distribution",
      colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      showLegend: true,
      showLabel: false,
      smoothLine: true,
      showTooltip: true,
    },
    createTime: "2025-01-15T10:00:00.000Z",
  },
  {
    id: "uc002",
    type: "chart",
    chartType: "bar",
    title: "月度业务统计",
    source: "system",
    config: {
      dataSource: "monthly_stats",
      colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      showLegend: true,
      showLabel: false,
      smoothLine: true,
      showTooltip: true,
    },
    createTime: "2025-01-16T10:00:00.000Z",
  },
  {
    id: "uc003",
    type: "list",
    chartType: "todo",
    title: "待办事项",
    source: "system",
    config: {
      dataSource: "todo_list",
      limit: 5,
    },
    createTime: "2025-01-17T10:00:00.000Z",
  },
];

function readFromStorage(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error("[CardStore] 读取本地存储失败:", e);
    return defaultValue;
  }
}

function writeToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("[CardStore] 写入本地存储失败:", e);
    return false;
  }
}

function generateId(prefix = "uc") {
  return prefix + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

const CardStore = {
  getUserCards() {
    const cards = readFromStorage(STORAGE_KEY, null);
    if (cards === null) {
      writeToStorage(STORAGE_KEY, defaultUserCards);
      return [...defaultUserCards];
    }
    return cards;
  },

  saveUserCards(cards) {
    return writeToStorage(STORAGE_KEY, cards);
  },

  addUserCard(card) {
    const cards = this.getUserCards();
    const newCard = {
      ...card,
      id: card.id || generateId("uc"),
      createTime: card.createTime || new Date().toISOString(),
    };
    cards.push(newCard);
    this.saveUserCards(cards);
    return newCard;
  },

  updateUserCard(cardId, updates) {
    const cards = this.getUserCards();
    const index = cards.findIndex((c) => c.id === cardId);
    if (index === -1) return null;
    cards[index] = { ...cards[index], ...updates };
    this.saveUserCards(cards);
    return cards[index];
  },

  deleteUserCard(cardId) {
    const cards = this.getUserCards();
    const filtered = cards.filter((c) => c.id !== cardId);
    if (filtered.length === cards.length) return false;
    this.saveUserCards(filtered);
    return true;
  },

  getUserCardById(cardId) {
    const cards = this.getUserCards();
    return cards.find((c) => c.id === cardId) || null;
  },

  getFactoryCards() {
    return readFromStorage(FACTORY_STORAGE_KEY, []);
  },

  saveFactoryCard(cardConfig) {
    const cards = this.getFactoryCards();
    const newCard = {
      ...cardConfig,
      id: cardConfig.id || generateId("fcard"),
      createTime: cardConfig.createTime || new Date().toISOString(),
    };
    cards.push(newCard);
    writeToStorage(FACTORY_STORAGE_KEY, cards);
    return newCard;
  },

  updateFactoryCard(cardId, updates) {
    const cards = this.getFactoryCards();
    const index = cards.findIndex((c) => c.id === cardId);
    if (index === -1) return null;
    cards[index] = { ...cards[index], ...updates };
    writeToStorage(FACTORY_STORAGE_KEY, cards);
    return cards[index];
  },

  deleteFactoryCard(cardId) {
    const cards = this.getFactoryCards();
    const filtered = cards.filter((c) => c.id !== cardId);
    if (filtered.length === cards.length) return false;
    writeToStorage(FACTORY_STORAGE_KEY, filtered);
    return true;
  },

  addFactoryCardToWorkspace(factoryCardId) {
    const factoryCards = this.getFactoryCards();
    const factoryCard = factoryCards.find((c) => c.id === factoryCardId);
    if (!factoryCard) return null;

    const workspaceCard = {
      id: generateId("uc"),
      type: "chart",
      chartType: factoryCard.type || factoryCard.chartType,
      title: factoryCard.title,
      source: "factory",
      factoryCardId: factoryCardId,
      config: {
        dataSource: factoryCard.dataSource || factoryCard.config?.dataSource || "monthly_stats",
        primaryColor: factoryCard.primaryColor || factoryCard.config?.primaryColor || "#1E9FFF",
        colors: factoryCard.colors || factoryCard.config?.colors || [
          "#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0",
        ],
        showLegend: factoryCard.showLegend ?? factoryCard.config?.showLegend ?? true,
        showLabel: factoryCard.showLabel ?? factoryCard.config?.showLabel ?? false,
        smoothLine: factoryCard.smoothLine ?? factoryCard.config?.smoothLine ?? true,
        showTooltip: factoryCard.showTooltip ?? factoryCard.config?.showTooltip ?? true,
        clickAction: factoryCard.clickAction || factoryCard.config?.clickAction || "none",
        refreshRate: factoryCard.refreshRate ?? factoryCard.config?.refreshRate ?? 0,
      },
      createTime: new Date().toISOString(),
    };

    return this.addUserCard(workspaceCard);
  },

  buildWorkspaceCardFromConfig(config) {
    return {
      id: generateId("uc"),
      type: "chart",
      chartType: config.chartType || config.type,
      title: config.title || "新建图表",
      source: "factory",
      config: {
        dataSource: config.dataSource || "monthly_stats",
        primaryColor: config.primaryColor || "#1E9FFF",
        colors: config.colors || [
          config.primaryColor || "#1E9FFF",
          "#5FB878",
          "#FFB800",
          "#FF5722",
          "#9c27b0",
        ],
        showLegend: config.showLegend ?? true,
        showLabel: config.showLabel ?? false,
        smoothLine: config.smoothLine ?? true,
        showTooltip: config.showTooltip ?? true,
        clickAction: config.clickAction || "none",
        refreshRate: config.refreshRate ?? 0,
      },
      createTime: new Date().toISOString(),
    };
  },

  resetToDefault() {
    writeToStorage(STORAGE_KEY, defaultUserCards);
    return [...defaultUserCards];
  },
};

export default CardStore;
