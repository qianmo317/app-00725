// ==========================================
// 卡片数据存储 - 卡片工厂与首页工作台共享数据源
// ==========================================

const STORAGE_KEY = "portal_user_cards";

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
      smoothLine: true,
      showTooltip: true,
      refreshRate: 0,
      clickAction: "none",
    },
    createTime: "2025-01-01T00:00:00.000Z",
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
      smoothLine: true,
      showTooltip: true,
      refreshRate: 0,
      clickAction: "none",
    },
    createTime: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "uc003",
    type: "list",
    chartType: "todo",
    title: "待办事项",
    config: {
      dataSource: "todo_list",
      limit: 5,
    },
    createTime: "2025-01-01T00:00:00.000Z",
  },
];

function getCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("[CardStore] 读取卡片数据失败:", e);
  }
  return [...defaultCards];
}

function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    notify({ type: "replace", cards });
    return true;
  } catch (e) {
    console.error("[CardStore] 保存卡片数据失败:", e);
    return false;
  }
}

function addCard(card) {
  const cards = getCards();
  cards.push(card);
  saveCards(cards);
  notify({ type: "add", card });
  return card;
}

function updateCard(cardId, updates) {
  const cards = getCards();
  const index = cards.findIndex((c) => c.id === cardId);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...updates };
    saveCards(cards);
    notify({ type: "update", card: cards[index] });
    return cards[index];
  }
  return null;
}

function deleteCard(cardId) {
  const cards = getCards();
  const cardToDelete = cards.find((c) => c.id === cardId);
  const filtered = cards.filter((c) => c.id !== cardId);
  if (filtered.length !== cards.length) {
    saveCards(filtered);
    notify({ type: "delete", cardId, card: cardToDelete });
    return true;
  }
  return false;
}

function getCardById(cardId) {
  const cards = getCards();
  return cards.find((c) => c.id === cardId) || null;
}

function generateCardId() {
  return "uc" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
}

const listeners = [];

function subscribe(callback) {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

function notify(change) {
  const cards = getCards();
  const changeInfo = change || { type: "unknown" };
  listeners.forEach((cb) => {
    try {
      cb(cards, changeInfo);
    } catch (e) {
      console.error("[CardStore] 监听器执行失败:", e);
    }
  });
}

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    notify({ type: "storage" });
  }
});

const CardStore = {
  getCards,
  saveCards,
  addCard,
  updateCard,
  deleteCard,
  getCardById,
  generateCardId,
  subscribe,
  notify,
  STORAGE_KEY,
};

export default CardStore;
