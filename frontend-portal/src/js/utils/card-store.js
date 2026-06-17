const STORAGE_KEY = "mercury_workspace_cards";

const DEFAULT_CARDS = [
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
];

function _read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("[CardStore] 读取失败:", e);
  }
  return null;
}

function _write(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error("[CardStore] 写入失败:", e);
  }
}

const CardStore = {
  getAll() {
    const cards = _read();
    if (cards) return cards;
    _write(DEFAULT_CARDS);
    return [...DEFAULT_CARDS];
  },

  add(card) {
    const cards = this.getAll();
    cards.push(card);
    _write(cards);
    return cards;
  },

  update(cardId, updates) {
    const cards = this.getAll();
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return cards;
    cards[idx] = { ...cards[idx], ...updates };
    _write(cards);
    return cards;
  },

  remove(cardId) {
    const cards = this.getAll().filter((c) => c.id !== cardId);
    _write(cards);
    return cards;
  },

  saveAll(cards) {
    _write(cards);
    return cards;
  },
};

export default CardStore;
