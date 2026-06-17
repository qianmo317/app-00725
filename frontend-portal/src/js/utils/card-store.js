// ==========================================
// 卡片数据存储模块 - 统一管理工作台卡片
// ==========================================

const STORAGE_KEY = "portal_workspace_cards";

const defaultCards = [
  {
    id: "uc001",
    type: "chart",
    chartType: "pie",
    title: "部门数据分布",
    config: {
      dataSource: "dept_distribution",
      colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      showLegend: true,
      showLabel: false,
      showTooltip: true,
      primaryColor: "#1E9FFF",
      smoothLine: true,
    },
  },
  {
    id: "uc002",
    type: "chart",
    chartType: "bar",
    title: "月度业务统计",
    config: {
      dataSource: "monthly_stats",
      colors: ["#1E9FFF", "#5FB878", "#FFB800", "#FF5722", "#9c27b0"],
      showLegend: true,
      showLabel: false,
      showTooltip: true,
      primaryColor: "#1E9FFF",
      smoothLine: true,
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
];

function readCards() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCards));
      return [...defaultCards];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("[CardStore] 读取卡片数据失败:", e);
    return [...defaultCards];
  }
}

function writeCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return true;
  } catch (e) {
    console.error("[CardStore] 保存卡片数据失败:", e);
    return false;
  }
}

const CardStore = {
  getAll() {
    return readCards();
  },

  getById(id) {
    const cards = readCards();
    return cards.find((c) => c.id === id) || null;
  },

  add(card) {
    const cards = readCards();
    const newCard = {
      ...card,
      id: card.id || "uc_" + Date.now(),
      createTime: card.createTime || new Date().toISOString(),
    };
    cards.push(newCard);
    writeCards(cards);
    return newCard;
  },

  update(id, updates) {
    const cards = readCards();
    const index = cards.findIndex((c) => c.id === id);
    if (index === -1) return null;
    cards[index] = { ...cards[index], ...updates };
    writeCards(cards);
    return cards[index];
  },

  remove(id) {
    const cards = readCards();
    const filtered = cards.filter((c) => c.id !== id);
    if (filtered.length === cards.length) return false;
    writeCards(filtered);
    return true;
  },

  saveAll(cards) {
    return writeCards(cards);
  },

  reorder(newOrderIds) {
    const cards = readCards();
    const idMap = new Map(cards.map((c) => [c.id, c]));
    const reordered = newOrderIds
      .map((id) => idMap.get(id))
      .filter(Boolean);
    const remaining = cards.filter((c) => !newOrderIds.includes(c.id));
    writeCards([...reordered, ...remaining]);
  },

  generateId() {
    return "uc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  },
};

export default CardStore;
